"""
Esculpe el nucleo de IA en Blender y exporta sus puntos a un binario.

Este es el caso que NO se puede reducir a una lista de piezas: la superficie es
ruido esculpido, no cilindros ni tablas. La solucion no es exportar un .glb
—que traeria caras, normales, UVs y texturas que no vamos a usar— sino caer en
la cuenta de que **si lo vamos a dibujar como particulas, solo necesitamos las
posiciones**.

    escultura de 3 formas  ->  ai-core.bin (solo XYZ)  ->  THREE.Points

Las tres formas comparten topologia: todas nacen del mismo icoesfera subdividido
y solo cambia el desplazamiento. Por eso el vertice `i` de una forma corresponde
al vertice `i` de las otras, y morfear entre ellas es interpolar dos arrays.

Uso:
    blender --background --factory-startup --python 3d/build_ai_core.py -- [--save]

Salida:
    public/3d/ai-core.bin     posiciones Int16, las tres formas seguidas
    src/data/ai-core.json     metadatos (conteo, escala)
"""

import argparse
import json
import os
import struct
import sys

import bpy
import bmesh
from mathutils import Vector, noise

HERE = os.path.dirname(os.path.abspath(__file__))
BIN_PATH = os.path.join(HERE, "..", "public", "3d", "ai-core.bin")
META_PATH = os.path.join(HERE, "..", "src", "data", "ai-core.json")
BLEND_PATH = os.path.join(HERE, "ai-core.blend")

# Subdivisiones del icoesfera. Ojo con la numeracion de bmesh: los vertices son
# 10 * 4^(n-1) + 2, asi que 6 -> 10.242, no 5. Ese es el equilibrio entre que la
# forma se lea y que el binario no se dispare.
SUBDIVISIONS = 6

# Cada forma: (semilla, frecuencia base, amplitud, octavas, nombre)
FORMS = [
    {"name": "nucleo", "seed": 3.1, "freq": 1.35, "amp": 0.42, "octaves": 4},
    {"name": "coral", "seed": 17.7, "freq": 3.10, "amp": 0.34, "octaves": 5},
    {"name": "cresta", "seed": 42.3, "freq": 0.85, "amp": 0.52, "octaves": 3},
]

# Las posiciones se guardan cuantizadas a Int16 sobre este rango
SCALE = 2.0


def wipe_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)


def base_sphere():
    """Icoesfera subdividida: la malla de partida de las tres formas."""
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=SUBDIVISIONS, radius=1.0)
    directions = [v.co.normalized() for v in bm.verts]
    faces = [[v.index for v in f.verts] for f in bm.faces]
    bm.free()
    return directions, faces


def displace(direction, form):
    """
    Desplaza un punto de la esfera hacia fuera segun ruido fractal.

    `noise.fractal` suma varias octavas: las bajas dan los lobulos grandes y las
    altas el grano de la superficie. Es lo que hace que se lea como algo
    esculpido y no como una esfera con bultos.
    """
    sample = direction * form["freq"] + Vector((form["seed"], form["seed"] * 0.7, form["seed"] * 1.3))
    n = noise.fractal(sample, 1.0, 2.0, form["octaves"])
    # Un segundo ruido, mas grande y lento, rompe la simetria general
    lobe = noise.noise(direction * 0.6 + Vector((form["seed"] * 2, 0.0, 0.0)))
    radius = 1.0 + n * form["amp"] + lobe * form["amp"] * 0.55
    return direction * radius


def build_forms():
    directions, faces = base_sphere()
    shapes = []
    for form in FORMS:
        shapes.append([displace(d, form) for d in directions])
    return directions, faces, shapes


def write_binary(shapes):
    """Int16 cuantizado: la mitad de bytes que float32, sin diferencia visible."""
    os.makedirs(os.path.dirname(BIN_PATH), exist_ok=True)
    count = len(shapes[0])

    with open(BIN_PATH, "wb") as f:
        for shape in shapes:
            buffer = bytearray()
            for point in shape:
                for axis in (point.x, point.y, point.z):
                    q = int(max(-1.0, min(1.0, axis / SCALE)) * 32767)
                    buffer += struct.pack("<h", q)
            f.write(buffer)

    size = os.path.getsize(BIN_PATH)
    os.makedirs(os.path.dirname(META_PATH), exist_ok=True)
    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(
            {
                "count": count,
                "forms": [form["name"] for form in FORMS],
                "scale": SCALE,
                "file": "/3d/ai-core.bin",
            },
            f, separators=(",", ":"),
        )
    return count, size


def to_blender(faces, shapes):
    """Deja las tres formas en la escena, separadas, para poder verlas y retocarlas."""
    for i, (form, shape) in enumerate(zip(FORMS, shapes)):
        mesh = bpy.data.meshes.new(form["name"])
        mesh.from_pydata([tuple(p) for p in shape], [], faces)
        mesh.update()
        for polygon in mesh.polygons:
            polygon.use_smooth = True

        obj = bpy.data.objects.new(form["name"], mesh)
        obj.location = (i * 3.2 - 3.2, 0.0, 0.0)
        bpy.context.scene.collection.objects.link(obj)


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--save", action="store_true")
    return parser.parse_args(argv)


def main():
    args = parse_args()

    _, faces, shapes = build_forms()
    count, size = write_binary(shapes)
    print(f"[ok] {len(FORMS)} formas x {count} puntos -> {round(size / 1024)} KB")

    wipe_scene()
    to_blender(faces, shapes)

    if args.save:
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
        print(f"[ok] escena guardada en {BLEND_PATH}")


if __name__ == "__main__":
    main()
