"""
Esculpe la criatura (diseno original) en Blender y exporta sus puntos.

Dos tecnicas, cada una en lo suyo:

- **Metaballs** para las masas blandas: cabeza, torso, extremidades, cola. Se
  funden entre si, asi que dan una silueta organica continua.
- **Conos** para lo puntiagudo: cuernos, cresta dorsal, garras. Las metaballs
  no saben hacer puntas; siempre redondean.

Lo puntiagudo es justo lo que hace que se lea como dragon y no como muñeco.

Luego se muestrea la superficie de TODO por area, para que la nube de puntos
tenga densidad uniforme sin importar de que malla venga cada trozo.

    metaballs + conos  ->  muestreo por area  ->  creature.bin

Uso:
    blender --background --factory-startup --python 3d/build_creature.py -- [--save]
"""

import argparse
import json
import math
import os
import random
import struct
import sys

import bpy
import bmesh
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
BIN_PATH = os.path.join(HERE, "..", "public", "3d", "creature.bin")
META_PATH = os.path.join(HERE, "..", "src", "data", "creature.json")
BLEND_PATH = os.path.join(HERE, "creature.blend")

SCALE = 3.0
RESOLUTION = 0.04
THRESHOLD = 0.35     # por debajo del defecto: si no, las masas pequenas no
                     # llegan a generar superficie y brazos y cola desaparecen
TARGET_POINTS = 14000
SEED = 7

# --------------------------------------------------------------------------
# Masas blandas. (x, y, z, radio). Blender es Z-up; la criatura mira hacia -Y.
# --------------------------------------------------------------------------

BLOBS = [
    # Craneo: mas plano y alargado que redondo, con mandibula marcada
    (0.00, -0.14, 2.32, 0.26),
    (0.00, -0.34, 2.28, 0.22),
    (0.00, -0.52, 2.22, 0.17),
    (0.00, -0.66, 2.17, 0.12),
    (0.00, -0.44, 2.10, 0.14),   # mandibula

    # Cuello largo en S: es lo que da porte de dragon en vez de muñeco
    (0.00, 0.02, 2.14, 0.15),
    (0.00, 0.12, 1.96, 0.15),
    (0.00, 0.14, 1.78, 0.16),
    (0.00, 0.08, 1.60, 0.17),

    # Torso: mas estrecho arriba, pecho ancho, cintura
    (0.00, 0.00, 1.42, 0.28),
    (0.00, -0.08, 1.18, 0.32),   # pecho
    (0.00, -0.06, 0.94, 0.30),
    (0.00, 0.04, 0.70, 0.27),    # cintura

    # Brazos
    (0.32, -0.10, 1.20, 0.14),
    (0.50, -0.22, 1.04, 0.12),
    (0.62, -0.32, 0.92, 0.10),
    (-0.32, -0.10, 1.20, 0.14),
    (-0.50, -0.22, 1.04, 0.12),
    (-0.62, -0.32, 0.92, 0.10),

    # Piernas: muslo grueso, pierna que afina, pie plano
    (0.28, 0.04, 0.54, 0.26),
    (0.30, -0.02, 0.30, 0.20),
    (0.32, -0.22, 0.09, 0.17),
    (-0.28, 0.04, 0.54, 0.26),
    (-0.30, -0.02, 0.30, 0.20),
    (-0.32, -0.22, 0.09, 0.17),

    # Cola: el paso entre masas debe ser MENOR que el radio o salen cuentas
    (0.00, 0.28, 0.62, 0.24),
    (0.01, 0.44, 0.54, 0.22),
    (0.02, 0.60, 0.47, 0.20),
    (0.03, 0.76, 0.42, 0.18),
    (0.04, 0.92, 0.40, 0.16),
    (0.05, 1.06, 0.42, 0.14),
    (0.06, 1.18, 0.50, 0.12),
    (0.07, 1.28, 0.62, 0.10),
    (0.08, 1.34, 0.76, 0.085),
]

FLAME_ORIGIN = (0.08, 1.38, 0.88)

# --------------------------------------------------------------------------
# Piezas puntiagudas: (base_xyz, alto, radio_base, rotacion_euler)
# --------------------------------------------------------------------------

def spike_list():
    spikes = []

    # Cuernos: dos, hacia atras y afuera
    for sx in (-1, 1):
        spikes.append(((sx * 0.13, 0.06, 2.44), 0.44, 0.065,
                       (math.radians(-42), 0.0, math.radians(sx * -20))))

    # Cresta dorsal: se deriva de las propias masas del lomo y la cola, con un
    # desplazamiento hacia fuera. Colocada a ojo quedaba dentro del cuerpo.
    spine = [
        (0.00, 0.14, 1.78, 0.16),   # cuello alto
        (0.00, 0.08, 1.60, 0.17),   # cuello bajo
        (0.00, 0.00, 1.42, 0.28),   # cruz
        (0.00, 0.04, 0.70, 0.27),   # cadera
    ] + [b for b in BLOBS if b[1] >= 0.28]   # toda la cola

    for i, (x, y, z, radius) in enumerate(spine):
        # Hacia arriba y atras, sobre la piel
        base = (x, y + radius * 0.35, z + radius * 0.88)
        height = max(0.09, radius * 0.85 - i * 0.012)
        spikes.append((base, height, height * 0.36,
                       (math.radians(-32), 0.0, 0.0)))

    # Garras: tres por pie
    for sx in (-1, 1):
        for i, dx in enumerate((-0.11, 0.0, 0.11)):
            spikes.append(((sx * 0.32 + dx, -0.36, 0.07), 0.14, 0.035,
                           (math.radians(-78), 0.0, 0.0)))

    return spikes


# --------------------------------------------------------------------------
# Alas: la pieza que mas cambia la silueta
# --------------------------------------------------------------------------

# Perfil del ala en su propio plano (u = envergadura, v = cuerda).
# El borde de salida festoneado es lo que la hace leer como ala de dragon y no
# como una hoja.
WING_OUTLINE = [
    (0.00, 0.00),    # hombro
    (0.30, 0.62),    # codo
    (0.70, 1.16),    # muñeca
    (1.44, 1.04),    # dedo 1
    (1.02, 0.58),    # valle
    (1.30, 0.16),    # dedo 2
    (0.88, -0.10),   # valle
    (1.00, -0.56),   # dedo 3
    (0.56, -0.44),   # valle
    (0.22, -0.52),   # anclaje bajo
]

WING_ROOT = (0.24, 0.22, 1.42)   # donde nace, en el lomo
WING_SWEEP = math.radians(34)    # cuanto se echa hacia atras
WING_TILT = math.radians(14)     # cuanto se abre hacia arriba


def wing_mesh(name, side):
    """
    Membrana plana. No hace falta darle grosor: como la vamos a muestrear
    como puntos, una superficie de una cara ya reparte particulas.
    """
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()

    verts = []
    for u, v in WING_OUTLINE:
        # El perfil vive en X-Z; el barrido lo echa hacia atras en Y
        x = side * u
        y = u * math.sin(WING_SWEEP)
        z = v + u * math.sin(WING_TILT)
        verts.append(bm.verts.new((x, y, z)))

    face = bm.faces.new(verts if side > 0 else list(reversed(verts)))
    bmesh.ops.triangulate(bm, faces=[face])
    bm.to_mesh(mesh)
    bm.free()
    return mesh


def build_wings():
    objects = []
    for side in (-1, 1):
        name = f"ala_{'d' if side > 0 else 'i'}"
        obj = bpy.data.objects.new(name, wing_mesh(name, side))
        obj.location = (side * WING_ROOT[0], WING_ROOT[1], WING_ROOT[2])
        bpy.context.scene.collection.objects.link(obj)
        objects.append(obj)

        # Nervaduras: los huesos del ala, sobre el borde de ataque y los dedos
        for i, (u, v) in enumerate(WING_OUTLINE[1:4], start=1):
            prev = WING_OUTLINE[i - 1]
            start = Vector((side * prev[0], prev[0] * math.sin(WING_SWEEP),
                            prev[1] + prev[0] * math.sin(WING_TILT)))
            end = Vector((side * u, u * math.sin(WING_SWEEP),
                          v + u * math.sin(WING_TILT)))
            direction = end - start
            length = direction.length
            if length < 1e-4:
                continue

            bone = bpy.data.objects.new(
                f"{name}_hueso_{i}", cone_mesh(f"{name}_hueso_{i}", length, 0.035)
            )
            bone.location = (side * WING_ROOT[0] + start.x,
                             WING_ROOT[1] + start.y,
                             WING_ROOT[2] + start.z)
            bone.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
            bpy.context.scene.collection.objects.link(bone)
            objects.append(bone)

    return objects


# --------------------------------------------------------------------------
# Blender
# --------------------------------------------------------------------------

def wipe_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for block in (bpy.data.meshes, bpy.data.metaballs):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def build_body():
    mball = bpy.data.metaballs.new("cuerpo")
    mball.resolution = RESOLUTION
    mball.render_resolution = RESOLUTION
    mball.threshold = THRESHOLD

    obj = bpy.data.objects.new("cuerpo", mball)
    bpy.context.scene.collection.objects.link(obj)

    for x, y, z, radius in BLOBS:
        element = mball.elements.new()
        element.co = (x, y, z)
        element.radius = radius
        element.stiffness = 2.0

    return obj


def cone_mesh(name, height, radius, segments=12):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=True, segments=segments,
        radius1=radius, radius2=0.0, depth=height,
    )
    # El origen al pie del cono, no al centro: asi se apoya en la piel
    bmesh.ops.translate(bm, verts=bm.verts, vec=(0.0, 0.0, height / 2))
    bm.to_mesh(mesh)
    bm.free()
    return mesh


def build_spikes():
    objects = []
    for i, (base, height, radius, rot) in enumerate(spike_list()):
        mesh = cone_mesh(f"punta_{i:02d}", height, radius)
        obj = bpy.data.objects.new(f"punta_{i:02d}", mesh)
        obj.location = base
        obj.rotation_euler = Euler(rot, "XYZ")
        bpy.context.scene.collection.objects.link(obj)
        objects.append(obj)
    return objects


def evaluated_mesh(obj):
    deps = bpy.context.evaluated_depsgraph_get()
    return bpy.data.meshes.new_from_object(obj.evaluated_get(deps), depsgraph=deps)


def sample_surface(meshes_and_matrices, total):
    """
    Reparte `total` puntos sobre TODAS las superficies, proporcional al area.

    Sin esto la nube saldria con la densidad de cada malla: mucha en el cuerpo
    (metaball, miles de caras) y casi ninguna en los cuernos (un cono, 12 caras).
    """
    random.seed(SEED)
    triangles = []
    total_area = 0.0

    for mesh, matrix in meshes_and_matrices:
        mesh.calc_loop_triangles()
        for tri in mesh.loop_triangles:
            a, b, c = (matrix @ mesh.vertices[i].co for i in tri.vertices)
            area = (b - a).cross(c - a).length * 0.5
            if area <= 0:
                continue
            triangles.append((a, b, c, area))
            total_area += area

    points = []
    for a, b, c, area in triangles:
        count = area / total_area * total
        n = int(count) + (1 if random.random() < (count % 1.0) else 0)
        for _ in range(n):
            u, v = random.random(), random.random()
            if u + v > 1.0:
                u, v = 1.0 - u, 1.0 - v
            points.append(a + (b - a) * u + (c - a) * v)

    return points


def write_binary(points):
    os.makedirs(os.path.dirname(BIN_PATH), exist_ok=True)
    with open(BIN_PATH, "wb") as f:
        buffer = bytearray()
        for p in points:
            for axis in (p.x, p.z, -p.y):        # Z-up -> Y-up
                q = int(max(-1.0, min(1.0, axis / SCALE)) * 32767)
                buffer += struct.pack("<h", q)
        f.write(buffer)

    size = os.path.getsize(BIN_PATH)
    os.makedirs(os.path.dirname(META_PATH), exist_ok=True)
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {
                "count": len(points),
                "scale": SCALE,
                "file": "/3d/creature.bin",
                "flame": [FLAME_ORIGIN[0], FLAME_ORIGIN[2], -FLAME_ORIGIN[1]],
            },
            f, separators=(",", ":"),
        )
    return size


def build_all():
    wipe_scene()
    body = build_body()
    parts = build_spikes() + build_wings()
    bpy.context.view_layer.update()

    surfaces = [(evaluated_mesh(body), body.matrix_world)]
    for obj in parts:
        surfaces.append((evaluated_mesh(obj), obj.matrix_world))

    return sample_surface(surfaces, TARGET_POINTS)


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--save", action="store_true")
    return parser.parse_args(argv)


def main():
    args = parse_args()
    points = build_all()
    size = write_binary(points)
    print(f"[ok] {len(points)} puntos -> {round(size / 1024)} KB")

    if args.save:
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
        print(f"[ok] escena guardada en {BLEND_PATH}")


if __name__ == "__main__":
    main()
