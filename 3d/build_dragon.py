"""
Muestrea el dragon importado y exporta sus puntos.

A diferencia de `build_creature.py`, aqui NO se esculpe nada: la malla viene de
fuera (generada en Meshy a partir de una descripcion propia). Este script solo
hace la parte que importa para la web:

    .blend de 12 MB  ->  muestreo por area  ->  dragon.bin (~110 KB)

El `.glb` equivalente pesa 4,4 MB. Al dibujarlo como nube de puntos no hacen
falta ni caras, ni normales, ni UVs, ni texturas.

Uso:
    blender <archivo.blend> --background --python 3d/build_dragon.py
"""

import json
import os
import random
import struct

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
BIN_PATH = os.path.join(HERE, "..", "public", "3d", "dragon.bin")
META_PATH = os.path.join(HERE, "..", "src", "data", "dragon.json")

TARGET_POINTS = 18000
SEED = 11
SCALE = 3.0          # rango de cuantizacion Int16
TARGET_HEIGHT = 2.6  # alto final en unidades de escena


def sample_surface(obj, total):
    """Reparte `total` puntos proporcionalmente al area de cada triangulo."""
    random.seed(SEED)
    deps = bpy.context.evaluated_depsgraph_get()
    mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(deps), depsgraph=deps)
    mesh.calc_loop_triangles()

    matrix = obj.matrix_world
    triangles = []
    total_area = 0.0
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

    bpy.data.meshes.remove(mesh)
    return points


def normalize(points):
    """Centra en X/Z, apoya en el suelo y escala a una altura conocida."""
    lo = Vector((min(p.x for p in points), min(p.y for p in points), min(p.z for p in points)))
    hi = Vector((max(p.x for p in points), max(p.y for p in points), max(p.z for p in points)))
    height = hi.z - lo.z
    factor = TARGET_HEIGHT / height if height else 1.0
    center = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
    return [(p - center) * factor for p in points]


def write_binary(points):
    os.makedirs(os.path.dirname(BIN_PATH), exist_ok=True)
    with open(BIN_PATH, "wb") as f:
        buffer = bytearray()
        for p in points:
            # Z-up (Blender) -> Y-up (three.js)
            for axis in (p.x, p.z, -p.y):
                q = int(max(-1.0, min(1.0, axis / SCALE)) * 32767)
                buffer += struct.pack("<h", q)
        f.write(buffer)

    size = os.path.getsize(BIN_PATH)
    os.makedirs(os.path.dirname(META_PATH), exist_ok=True)
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {"count": len(points), "scale": SCALE, "file": "/3d/dragon.bin",
             "height": TARGET_HEIGHT},
            f, separators=(",", ":"),
        )
    return size


def main():
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        raise SystemExit("no hay malla en la escena")

    points = []
    for obj in meshes:
        points += sample_surface(obj, TARGET_POINTS)

    points = normalize(points)
    size = write_binary(points)
    print(f"[ok] {len(points)} puntos -> {round(size / 1024)} KB")


if __name__ == "__main__":
    main()
