"""
Esculpe la criatura (diseno original) en Blender y exporta sus puntos.

Bloqueo con metaballs: se funden entre si, asi que un puñado de esferas y
capsulas da una silueta organica continua en vez de un muñeco de piezas
pegadas. Es como se bloquea un personaje antes de esculpirlo a mano.

    metaballs  ->  malla evaluada  ->  puntos muestreados  ->  creature.bin

Uso:
    blender --background --factory-startup --python 3d/build_creature.py -- [--save]

Salida:
    public/3d/creature.bin     posiciones Int16
    src/data/creature.json     metadatos
"""

import argparse
import json
import os
import struct
import sys

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
BIN_PATH = os.path.join(HERE, "..", "public", "3d", "creature.bin")
META_PATH = os.path.join(HERE, "..", "src", "data", "creature.json")
BLEND_PATH = os.path.join(HERE, "creature.blend")

SCALE = 3.0            # rango de cuantizacion
RESOLUTION = 0.045     # cuanto mas bajo, mas detalle en la malla de metaballs

# --------------------------------------------------------------------------
# El bloqueo. (x, y, z, radio). Blender es Z-up; la criatura mira hacia -Y.
# --------------------------------------------------------------------------

BLOBS = [
    # Cabeza: grande y redonda, la proporcion que la hace simpatica
    (0.00, -0.08, 1.78, 0.40),
    (0.00, -0.34, 1.70, 0.28),   # hocico
    (0.00, -0.50, 1.65, 0.17),   # punta

    # Cuello: fino a proposito, para que la cabeza se despegue del torso
    (0.00, 0.02, 1.44, 0.17),

    # Torso: mas estrecho que antes, si no se traga las extremidades
    (0.00, 0.00, 1.14, 0.34),
    (0.00, -0.08, 0.88, 0.36),   # barriga, algo adelantada
    (0.00, 0.02, 0.64, 0.29),

    # Brazos: mas separados y mas gruesos, o el torso se los come
    (0.42, -0.04, 1.06, 0.17),
    (0.62, -0.12, 0.94, 0.15),
    (0.76, -0.22, 0.82, 0.13),
    (-0.42, -0.04, 1.06, 0.17),
    (-0.62, -0.12, 0.94, 0.15),
    (-0.76, -0.22, 0.82, 0.13),

    # Piernas: gruesas, el peso abajo
    (0.30, 0.00, 0.46, 0.25),
    (0.33, -0.04, 0.22, 0.21),
    (0.35, -0.18, 0.07, 0.18),   # pie
    (-0.30, 0.00, 0.46, 0.25),
    (-0.33, -0.04, 0.22, 0.21),
    (-0.35, -0.18, 0.07, 0.18),

    # Cola: sale bien atras y describe una S hasta levantarse
    (0.00, 0.34, 0.60, 0.22),
    (0.02, 0.66, 0.44, 0.19),
    (0.04, 0.96, 0.34, 0.16),
    (0.06, 1.22, 0.42, 0.13),
    (0.08, 1.40, 0.62, 0.11),
    (0.09, 1.50, 0.84, 0.09),    # aqui ira la llama
]

# Donde nace la llama, para el sistema de particulas de la web
FLAME_ORIGIN = (0.09, 1.53, 0.96)


def wipe_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for block in (bpy.data.meshes, bpy.data.metaballs):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def build_metaball():
    """Las metaballs se funden: de esferas sueltas sale una silueta continua."""
    mball = bpy.data.metaballs.new("criatura")
    mball.resolution = RESOLUTION
    mball.render_resolution = RESOLUTION

    obj = bpy.data.objects.new("criatura", mball)
    bpy.context.scene.collection.objects.link(obj)

    for x, y, z, radius in BLOBS:
        element = mball.elements.new()
        element.co = (x, y, z)
        element.radius = radius
        element.stiffness = 2.0

    return obj


def evaluate(obj):
    """Metaballs -> malla real. Sin evaluar el depsgraph no hay vertices."""
    bpy.context.view_layer.update()
    deps = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(deps)
    return bpy.data.meshes.new_from_object(evaluated, depsgraph=deps)


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
                # Tambien convertido a Y-up
                "flame": [FLAME_ORIGIN[0], FLAME_ORIGIN[2], -FLAME_ORIGIN[1]],
            },
            f, separators=(",", ":"),
        )
    return size


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--save", action="store_true")
    return parser.parse_args(argv)


def main():
    args = parse_args()

    wipe_scene()
    obj = build_metaball()
    mesh = evaluate(obj)

    points = [Vector(v.co) for v in mesh.vertices]
    size = write_binary(points)
    print(f"[ok] {len(points)} puntos -> {round(size / 1024)} KB")

    if args.save:
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
        print(f"[ok] escena guardada en {BLEND_PATH}")


if __name__ == "__main__":
    main()
