"""
Construye la caja de herramientas en Blender y exporta su despiece a JSON.

La web NO carga este archivo ni el .blend: lee `src/data/crate-parts.json`, que
son las medidas de cada pieza. three.js reconstruye la caja con las mismas
primitivas. Asi Blender sigue siendo el taller donde se disena, pero no hay que
traducir nada a mano ni mantener dos fuentes de verdad.

Uso:
    blender --background --factory-startup --python 3d/build_toolbox_crate.py -- [--save]

    --save   Guarda ademas 3d/toolbox-crate.blend

Salida: src/data/crate-parts.json
"""

import argparse
import json
import math
import os
import sys

import bpy
import bmesh

HERE = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(HERE, "..", "src", "data", "crate-parts.json")
BLEND_PATH = os.path.join(HERE, "toolbox-crate.blend")

# --------------------------------------------------------------------------
# Medidas
# --------------------------------------------------------------------------

HALF = 1.46          # media anchura interior
POST = 0.17          # lado del poste de esquina
BOARD = 0.085        # grosor de tabla
HEIGHT = 1.68        # alto del cuerpo
SLATS = 4            # tablas por pared
SLAT_GAP = 0.075     # aire entre tablas

LID_BOARD = 0.075
LID_SLATS = 5
BRACKET = 0.045      # grosor de la escuadra metalica
RIVET_R = 0.035

OUTER = HALF + POST * 0.5

# Cada pieza se acumula aqui: es lo que acaba en el JSON y en three.js.
PARTS = []


def box(size, pos, group, rot=(0.0, 0.0, 0.0)):
    PARTS.append({
        "type": "box",
        "size": [round(v, 4) for v in size],
        "pos": [round(v, 4) for v in pos],
        "rot": [round(v, 4) for v in rot],
        "group": group,
    })


def cyl(radius, height, pos, group, axis="y"):
    PARTS.append({
        "type": "cyl",
        "r": round(radius, 4),
        "h": round(height, 4),
        "pos": [round(v, 4) for v in pos],
        "axis": axis,
        "group": group,
    })


# --------------------------------------------------------------------------
# Piezas
# --------------------------------------------------------------------------

def corner_posts():
    """Cuatro postes verticales: el esqueleto de la caja."""
    for sx in (-1, 1):
        for sz in (-1, 1):
            box(
                size=(POST, HEIGHT, POST),
                pos=(sx * OUTER, HEIGHT / 2, sz * OUTER),
                group="body",
            )


def wall_slats():
    """Tablas horizontales entre postes, con aire entre ellas."""
    span = OUTER * 2 - POST          # largo util entre postes
    usable = HEIGHT - SLAT_GAP * (SLATS + 1)
    slat_h = usable / SLATS

    for i in range(SLATS):
        y = SLAT_GAP * (i + 1) + slat_h * (i + 0.5)

        # Frente y fondo
        for sz in (-1, 1):
            box(
                size=(span, slat_h, BOARD),
                pos=(0, y, sz * (OUTER - POST * 0.5 + BOARD * 0.5)),
                group="body",
            )
        # Laterales
        for sx in (-1, 1):
            box(
                size=(BOARD, slat_h, span),
                pos=(sx * (OUTER - POST * 0.5 + BOARD * 0.5), y, 0),
                group="body",
            )


def floor_slats():
    """Suelo de listones: se ven por dentro cuando la caja se abre."""
    count = 5
    width = (OUTER * 2 - POST) / count
    for i in range(count):
        x = -OUTER + POST * 0.5 + width * (i + 0.5)
        box(
            size=(width * 0.9, BOARD, OUTER * 2 - POST),
            pos=(x, BOARD / 2, 0),
            group="body",
        )


def corner_brackets():
    """Escuadras metalicas arriba y abajo de cada poste, con sus remaches."""
    arm = POST * 2.1
    for sx in (-1, 1):
        for sz in (-1, 1):
            for y in (BOARD * 2.2, HEIGHT - POST * 0.75):
                # Dos alas en angulo recto
                box(
                    size=(arm, BRACKET, POST + BRACKET),
                    pos=(sx * (OUTER - arm / 2 + POST * 0.5), y, sz * (OUTER + BRACKET * 0.5)),
                    group="body",
                )
                box(
                    size=(POST + BRACKET, BRACKET, arm),
                    pos=(sx * (OUTER + BRACKET * 0.5), y, sz * (OUTER - arm / 2 + POST * 0.5)),
                    group="body",
                )
                # Remaches
                cyl(RIVET_R, BRACKET * 1.8,
                    (sx * (OUTER - arm * 0.6), y, sz * (OUTER + BRACKET * 0.6)),
                    group="body", axis="z")
                cyl(RIVET_R, BRACKET * 1.8,
                    (sx * (OUTER + BRACKET * 0.6), y, sz * (OUTER - arm * 0.6)),
                    group="body", axis="x")


def lid():
    """Tapa: marco perimetral + listones. Su origen es la bisagra trasera."""
    # El grupo `lid` se dibuja relativo a la bisagra, en z = -OUTER
    depth = OUTER * 2

    # Marco
    box(size=(OUTER * 2 + POST, LID_BOARD, POST), pos=(0, LID_BOARD / 2, POST / 2), group="lid")
    box(size=(OUTER * 2 + POST, LID_BOARD, POST), pos=(0, LID_BOARD / 2, depth - POST / 2), group="lid")
    box(size=(POST, LID_BOARD, depth), pos=(-OUTER - POST * 0.5 + POST / 2, LID_BOARD / 2, depth / 2), group="lid")
    box(size=(POST, LID_BOARD, depth), pos=(OUTER + POST * 0.5 - POST / 2, LID_BOARD / 2, depth / 2), group="lid")

    # Listones interiores
    inner = depth - POST * 2
    width = inner / LID_SLATS
    for i in range(LID_SLATS):
        z = POST + width * (i + 0.5)
        box(
            size=(OUTER * 2 - POST * 0.4, LID_BOARD * 0.8, width * 0.86),
            pos=(0, LID_BOARD / 2, z),
            group="lid",
        )

    # Refuerzo diagonal: el detalle que la hace leer como caja de embalaje
    box(
        size=(OUTER * 2.6, LID_BOARD * 0.7, POST * 0.8),
        pos=(0, LID_BOARD * 1.1, depth / 2),
        group="lid",
        rot=(0, math.radians(38), 0),
    )


def hinges():
    """Dos bisagras en el borde trasero."""
    for sx in (-1, 1):
        x = sx * OUTER * 0.55
        cyl(0.055, POST * 1.9, (x, HEIGHT, -OUTER), group="body", axis="x")
        # Palas
        box(size=(POST * 1.5, BRACKET, POST * 1.4),
            pos=(x, HEIGHT - BRACKET, -OUTER + POST * 0.6), group="body")


def latch():
    """Cierre delantero: placa, gancho y remaches."""
    z = OUTER + BRACKET * 0.5
    box(size=(POST * 2.2, POST * 1.1, BRACKET), pos=(0, HEIGHT - POST * 0.7, z), group="body")
    cyl(0.05, POST * 0.9, (0, HEIGHT - POST * 0.7, z + BRACKET), group="body", axis="z")
    for sx in (-1, 1):
        cyl(RIVET_R, BRACKET * 1.6, (sx * POST * 0.8, HEIGHT - POST * 0.7, z + BRACKET * 0.6),
            group="body", axis="z")


def build():
    corner_posts()
    wall_slats()
    floor_slats()
    corner_brackets()
    hinges()
    latch()
    lid()


# --------------------------------------------------------------------------
# Blender
# --------------------------------------------------------------------------

def wipe_scene():
    """Sin bpy.ops: funciona en background y dentro del addon MCP por igual."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)


def _link(name, mesh, location, rotation, scale=(1.0, 1.0, 1.0)):
    obj = bpy.data.objects.new(name, mesh)
    obj.location = location
    obj.rotation_euler = rotation
    obj.scale = scale
    bpy.context.scene.collection.objects.link(obj)
    return obj


def _cube_mesh(name):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bm.to_mesh(mesh)
    bm.free()
    return mesh


def _cyl_mesh(name, radius, depth, segments=16):
    mesh = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=False, segments=segments,
        radius1=radius, radius2=radius, depth=depth,
    )
    bm.to_mesh(mesh)
    bm.free()
    return mesh


def to_blender():
    """Vuelca PARTS a la escena. Blender es Z-up; PARTS esta en Y-up (three.js)."""
    lid_offset = (0.0, HEIGHT, -OUTER)

    for i, part in enumerate(PARTS):
        px, py, pz = part["pos"]
        if part["group"] == "lid":
            px += lid_offset[0]
            py += lid_offset[1]
            pz += lid_offset[2]

        # Y-up -> Z-up
        location = (px, pz, py)
        name = f"{part['group']}_{i:03d}"

        if part["type"] == "box":
            sx, sy, sz = part["size"]
            rx, ry, rz = part["rot"]
            _link(name, _cube_mesh(name), location, (rx, rz, ry), (sx, sz, sy))
        else:
            axis = part["axis"]
            rot = {"y": (0, 0, 0), "x": (0, math.pi / 2, 0), "z": (math.pi / 2, 0, 0)}[axis]
            _link(name, _cyl_mesh(name, part["r"], part["h"]), location, rot)


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    parser = argparse.ArgumentParser()
    parser.add_argument("--save", action="store_true")
    return parser.parse_args(argv)


def main():
    args = parse_args()

    build()

    os.makedirs(os.path.dirname(JSON_PATH), exist_ok=True)
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump({"height": HEIGHT, "outer": OUTER, "parts": PARTS}, f, separators=(",", ":"))
    print(f"[ok] {len(PARTS)} piezas en {os.path.normpath(JSON_PATH)}")

    wipe_scene()
    to_blender()

    if args.save:
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
        print(f"[ok] escena guardada en {BLEND_PATH}")


if __name__ == "__main__":
    main()
