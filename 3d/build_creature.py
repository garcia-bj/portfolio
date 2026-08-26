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
    # Craneo y morro: el morro alargado ya insinua hocico de reptil
    (0.00, -0.10, 1.80, 0.36),
    (0.00, -0.32, 1.72, 0.28),
    (0.00, -0.52, 1.66, 0.20),
    (0.00, -0.66, 1.62, 0.13),
    # Mandibula, un poco por debajo
    (0.00, -0.42, 1.55, 0.17),

    # Cuello
    (0.00, 0.00, 1.48, 0.19),
    (0.00, 0.04, 1.32, 0.22),

    # Torso
    (0.00, 0.00, 1.12, 0.34),
    (0.00, -0.08, 0.86, 0.36),
    (0.00, 0.04, 0.62, 0.30),

    # Brazos: cortos y algo mas gruesos, o el torso se los traga
    (0.38, -0.06, 1.06, 0.19),
    (0.58, -0.16, 0.92, 0.16),
    (0.72, -0.26, 0.80, 0.13),
    (-0.38, -0.06, 1.06, 0.19),
    (-0.58, -0.16, 0.92, 0.16),
    (-0.72, -0.26, 0.80, 0.13),

    # Piernas
    (0.30, 0.02, 0.48, 0.26),
    (0.32, -0.02, 0.24, 0.22),
    (0.34, -0.20, 0.08, 0.19),
    (-0.30, 0.02, 0.48, 0.26),
    (-0.32, -0.02, 0.24, 0.22),
    (-0.34, -0.20, 0.08, 0.19),

    # Cola: el paso debe ser MENOR que el radio, si no salen cuentas de collar
    (0.00, 0.28, 0.58, 0.25),
    (0.01, 0.42, 0.50, 0.23),
    (0.02, 0.56, 0.43, 0.21),
    (0.03, 0.70, 0.38, 0.19),
    (0.04, 0.84, 0.35, 0.17),
    (0.05, 0.98, 0.36, 0.16),
    (0.06, 1.10, 0.41, 0.14),
    (0.07, 1.21, 0.49, 0.12),
    (0.08, 1.30, 0.60, 0.11),
    (0.09, 1.37, 0.72, 0.09),
]

FLAME_ORIGIN = (0.09, 1.41, 0.84)

# --------------------------------------------------------------------------
# Piezas puntiagudas: (base_xyz, alto, radio_base, rotacion_euler)
# --------------------------------------------------------------------------

def spike_list():
    spikes = []

    # Cuernos: dos, hacia atras y afuera
    for sx in (-1, 1):
        spikes.append(((sx * 0.17, 0.06, 1.98), 0.42, 0.075,
                       (math.radians(-38), 0.0, math.radians(sx * -22))))

    # Cresta dorsal: se deriva de las propias masas del lomo y la cola, con un
    # desplazamiento hacia fuera. Colocada a ojo quedaba dentro del cuerpo.
    spine = [
        (0.00, 0.04, 1.32, 0.22),   # cuello
        (0.00, 0.00, 1.12, 0.34),   # torso alto
        (0.00, 0.04, 0.62, 0.30),   # cadera
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
            spikes.append(((sx * 0.34 + dx, -0.34, 0.06), 0.13, 0.035,
                           (math.radians(-78), 0.0, 0.0)))

    return spikes


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
    spikes = build_spikes()
    bpy.context.view_layer.update()

    surfaces = [(evaluated_mesh(body), body.matrix_world)]
    for obj in spikes:
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
