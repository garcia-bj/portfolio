"""
Genera el modulo del stack y renderiza la secuencia que se scrubbea en la web.

El objeto ES el contenido: una capa por categoria de `src/components/sections/
Stack.tsx`. El frame 1 esta ensamblado y el ultimo, despiezado.

Uso:
    blender --background --factory-startup --python 3d/build_stack_module.py -- [--test] [--frames N] [--res W H]

    --test   Un solo frame a baja resolucion, para iterar rapido.

Salida: 3d/exports/module_0001.webp ...
"""

import argparse
import math
import os
import sys

import bpy
from mathutils import Vector

# --------------------------------------------------------------------------
# Parametros
# --------------------------------------------------------------------------

# Una capa por categoria del stack. El color solo se usa para la etiqueta del
# render de depuracion; el trazo final es monocromo.
LAYERS = [
    # Los radios NO decrecen en linea: si lo hacen, la silueta se lee como una
    # tarta escalonada. Alternando anchos se lee como un barril de instrumento.
    {"id": "frontend", "kind": "disc", "radius": 1.58, "height": 0.18},
    {"id": "backend", "kind": "knurl", "radius": 1.26, "height": 0.34},
    {"id": "database", "kind": "ring", "radius": 1.46, "height": 0.20},
    {"id": "ai", "kind": "bolts", "radius": 1.18, "height": 0.30},
    {"id": "agentic", "kind": "knurl", "radius": 1.38, "height": 0.38},
    {"id": "devops", "kind": "ring", "radius": 1.12, "height": 0.18},
    {"id": "meta", "kind": "disc", "radius": 1.30, "height": 0.22},
    {"id": "tools", "kind": "bolts", "radius": 1.52, "height": 0.28},
]

GAP_ASSEMBLED = 0.06   # separacion entre capas al inicio
GAP_EXPLODED = 0.50    # separacion al final
SPIN_DEGREES = 150     # giro total del conjunto durante la secuencia

LINE_COLOR = (0.35, 0.90, 0.82)   # verde petroleo claro
LINE_THICKNESS = 1.5

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "exports")
BLEND_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stack-module.blend")


# --------------------------------------------------------------------------
# Utilidades de escena
# --------------------------------------------------------------------------

def wipe_scene():
    """Escena vacia: borra objetos, mallas y materiales heredados."""
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.cameras, bpy.data.lights):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def invisible_material():
    """
    Material sin superficie visible: solo queremos las lineas de Freestyle.
    EEVEE Next renombro el control de mezcla, asi que probamos ambos nombres.
    """
    mat = bpy.data.materials.new("Invisible")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Alpha"].default_value = 0.0

    if hasattr(mat, "surface_render_method"):        # Blender 4.2+
        mat.surface_render_method = "BLENDED"
    elif hasattr(mat, "blend_method"):               # Blender <= 4.1
        mat.blend_method = "BLEND"

    return mat


def shade(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


# --------------------------------------------------------------------------
# Piezas
# --------------------------------------------------------------------------

def make_disc(name, radius, height, verts=64):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=height)
    obj = bpy.context.active_object
    obj.name = name
    bevel = obj.modifiers.new("Bevel", "BEVEL")
    bevel.width = min(0.035, height * 0.25)
    bevel.segments = 2
    return obj


def make_ring(name, radius, height):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius,
        minor_radius=height * 0.5,
        major_segments=64,
        minor_segments=12,
    )
    obj = bpy.context.active_object
    obj.name = name
    return obj


def make_knurl(name, radius, height, teeth=28):
    """Disco con dentado perimetral: da una silueta rica en el trazo."""
    base = make_disc(name, radius * 0.92, height, verts=48)

    # El diente se crea desplazado y luego se hornea la transformacion en la
    # malla: el array circular exige que el ORIGEN del objeto este en el centro
    # de giro. Si el origen queda fuera, cada copia acumula la traslacion y las
    # coordenadas divergen hasta el infinito.
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(radius * 0.96, 0.0, 0.0))
    tooth = bpy.context.active_object
    tooth.name = f"{name}_tooth"
    tooth.scale = (radius * 0.10, radius * 0.045, height * 0.42)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    pivot = bpy.context.active_object
    pivot.name = f"{name}_pivot"
    pivot.rotation_euler[2] = math.radians(360.0 / teeth)

    array = tooth.modifiers.new("Teeth", "ARRAY")
    array.count = teeth
    array.use_relative_offset = False
    array.use_object_offset = True
    array.offset_object = pivot

    tooth.parent = base
    pivot.parent = base
    return base


def make_bolts(name, radius, height, count=8):
    """Placa con una corona de tornillos: lectura mecanica clara."""
    base = make_disc(name, radius, height, verts=56)

    for i in range(count):
        angle = (2 * math.pi / count) * i
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=12,
            radius=height * 0.24,
            depth=height * 1.5,
            location=(math.cos(angle) * radius * 0.68, math.sin(angle) * radius * 0.68, 0.0),
        )
        bolt = bpy.context.active_object
        bolt.name = f"{name}_bolt_{i:02d}"
        bolt.parent = base

    return base


BUILDERS = {
    "disc": make_disc,
    "ring": make_ring,
    "knurl": make_knurl,
    "bolts": make_bolts,
}


# --------------------------------------------------------------------------
# Montaje y animacion
# --------------------------------------------------------------------------

def iter_fcurves(action):
    """
    Recorre las curvas de una Action.

    Blender 5 sustituyo `action.fcurves` por el sistema de slots
    (`layers -> strips -> channelbags -> fcurves`). Soportamos ambos.
    """
    legacy = getattr(action, "fcurves", None)
    if legacy is not None:
        yield from legacy
        return

    for layer in action.layers:
        for strip in layer.strips:
            for bag in getattr(strip, "channelbags", []):
                yield from bag.fcurves


def build_module(frames):
    mat = invisible_material()

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    rig = bpy.context.active_object
    rig.name = "ModuleRig"

    total_height = sum(l["height"] for l in LAYERS)
    z_cursor = -total_height / 2.0

    for index, layer in enumerate(LAYERS):
        builder = BUILDERS[layer["kind"]]
        obj = builder(f"L{index:02d}_{layer['id']}", layer["radius"], layer["height"])
        obj.parent = rig

        # Posicion ensamblada y despiezada. Las capas de arriba viajan mas lejos
        # para que el despiece se lea en abanico.
        z_assembled = z_cursor + layer["height"] / 2.0
        z_exploded = z_assembled + (index - len(LAYERS) / 2.0) * GAP_EXPLODED
        z_cursor += layer["height"] + GAP_ASSEMBLED

        obj.location.z = z_assembled
        obj.keyframe_insert("location", frame=1)
        obj.location.z = z_exploded
        obj.keyframe_insert("location", frame=frames)

        for piece in [obj, *obj.children]:
            if piece.type == "MESH":
                shade(piece, mat)

    # Giro continuo del conjunto
    rig.rotation_euler = (math.radians(18), 0.0, math.radians(-20))
    rig.keyframe_insert("rotation_euler", frame=1)
    rig.rotation_euler = (math.radians(18), 0.0, math.radians(-20 + SPIN_DEGREES))
    rig.keyframe_insert("rotation_euler", frame=frames)

    # Interpolacion suave en toda la animacion
    for obj in bpy.data.objects:
        if obj.animation_data and obj.animation_data.action:
            for fcurve in iter_fcurves(obj.animation_data.action):
                for kp in fcurve.keyframe_points:
                    kp.interpolation = "BEZIER"
                    kp.easing = "EASE_IN_OUT"

    return rig


def scene_bounds(frames):
    """
    Caja envolvente de toda la animacion, evaluada con modificadores aplicados.
    Muestreamos varios frames porque el objeto se despieza y gira.
    """
    scene = bpy.context.scene
    points = []
    samples = {1, max(1, frames // 3), max(1, 2 * frames // 3), frames}

    for frame in sorted(samples):
        scene.frame_set(frame)
        deps = bpy.context.evaluated_depsgraph_get()
        for obj in scene.objects:
            if obj.type != "MESH" or obj.hide_render:
                continue
            evaluated = obj.evaluated_get(deps)
            matrix = evaluated.matrix_world
            for corner in evaluated.bound_box:
                points.append(matrix @ Vector(corner))

    finite = [p for p in points if all(abs(v) < 1e4 for v in p)]
    if len(finite) != len(points):
        raise RuntimeError(
            f"geometria degenerada: {len(points) - len(finite)} vertices fuera de rango. "
            "Revisa los modificadores Array (el origen debe estar en el centro de giro)."
        )
    points = finite

    lo = Vector((min(p[i] for p in points) for i in range(3)))
    hi = Vector((max(p[i] for p in points) for i in range(3)))
    center = (lo + hi) / 2.0
    radius = max((p - center).length for p in points)
    return center, radius


def setup_camera(frames, margin=1.06):
    """Camara en tres cuartos que encuadra sola, mire como mire el objeto."""
    center, radius = scene_bounds(frames)

    bpy.ops.object.camera_add()
    cam = bpy.context.active_object
    cam.name = "Cam"
    cam.data.lens = 85          # teleobjetivo: menos deformacion, mas plano tecnico

    fov = 2.0 * math.atan(cam.data.sensor_width / (2.0 * cam.data.lens))
    distance = (radius / math.tan(fov / 2.0)) * margin

    direction = Vector((0.42, -1.0, 0.30)).normalized()
    cam.location = center + direction * distance

    # Apuntar siempre al centro real, sin calcular angulos a mano
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=center)
    target = bpy.context.active_object
    target.name = "CamTarget"

    track = cam.constraints.new("TRACK_TO")
    track.target = target
    track.track_axis = "TRACK_NEGATIVE_Z"
    track.up_axis = "UP_Y"

    bpy.context.scene.camera = cam
    print(f"[cam] centro={tuple(round(v, 2) for v in center)} radio={radius:.2f} dist={distance:.2f}")
    return cam


def setup_render(frames, res_x, res_y, transparent=False, quality=80):
    """
    Por defecto renderiza OPACO sobre negro puro.

    Con transparencia, el canal alfa se lleva el 84% del peso del WebP (se
    codifica sin perdida pase lo que pase): 49 KB/frame frente a 25 KB. La web
    lo compone con `mix-blend-mode: screen`, que sobre fondo oscuro vuelve el
    negro invisible y suma las lineas. Mismo resultado visual, la mitad de peso.
    """
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = res_x
    scene.render.resolution_y = res_y
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = transparent
    scene.frame_start = 1
    scene.frame_end = frames

    if not transparent:
        world = bpy.data.worlds.new("Black")
        world.use_nodes = True
        bg = world.node_tree.nodes["Background"]
        bg.inputs[0].default_value = (0.0, 0.0, 0.0, 1.0)
        bg.inputs[1].default_value = 1.0
        scene.world = world

    scene.render.image_settings.file_format = "WEBP"
    scene.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    scene.render.image_settings.quality = quality

    # Solo queremos el trazo
    scene.render.use_freestyle = True
    view_layer = bpy.context.view_layer
    fs = view_layer.freestyle_settings
    fs.crease_angle = math.radians(134)

    lineset = fs.linesets[0] if fs.linesets else fs.linesets.new("LineSet")
    lineset.select_silhouette = True
    lineset.select_crease = True
    lineset.select_border = True

    style = lineset.linestyle
    style.color = LINE_COLOR
    style.thickness = LINE_THICKNESS

    return scene


# --------------------------------------------------------------------------

def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true")
    parser.add_argument("--save", action="store_true",
                        help="Guarda 3d/stack-module.blend con la geometria y no renderiza")
    parser.add_argument("--transparent", action="store_true",
                        help="RGBA en vez de opaco sobre negro (duplica el peso)")
    parser.add_argument("--quality", type=int, default=80)
    parser.add_argument("--frames", type=int, default=60)
    parser.add_argument("--res", type=int, nargs=2, default=[900, 1200])
    return parser.parse_args(argv)


def main():
    args = parse_args()
    frames = 1 if args.test else args.frames
    res_x, res_y = args.res   # el test va a resolucion real: el grosor de linea es en pixeles

    wipe_scene()
    build_module(args.frames)          # la animacion siempre se define completa
    setup_camera(args.frames)
    scene = setup_render(frames, res_x, res_y, transparent=args.transparent, quality=args.quality)

    if args.save:
        # Sin esto el .blend queda como un stub con el cubo por defecto: la
        # geometria vive en este script y se construia solo en memoria.
        scene.frame_set(1)
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
        print(f"[ok] escena guardada en {BLEND_PATH}")
        return

    os.makedirs(OUT_DIR, exist_ok=True)

    if args.test:
        # Frame intermedio: se ve el despiece a medias
        scene.frame_set(max(1, args.frames // 2))
        scene.render.filepath = os.path.join(OUT_DIR, "test")
        bpy.ops.render.render(write_still=True)
        print(f"[ok] prueba en {scene.render.filepath}.webp")
    else:
        scene.render.filepath = os.path.join(OUT_DIR, "module_")
        bpy.ops.render.render(animation=True)
        print(f"[ok] {frames} frames en {OUT_DIR}")


if __name__ == "__main__":
    main()
