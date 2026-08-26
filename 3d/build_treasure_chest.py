"""
Construye un cofre pirata en Blender y exporta su despiece a JSON.

La web NO carga este archivo ni el .blend: lee `src/data/chest-parts.json`, que
son las medidas de cada pieza mas su material. three.js reconstruye el cofre con
las mismas primitivas. Blender es el taller; el JSON es la lista de piezas.

Uso:
    blender --background --factory-startup --python 3d/build_treasure_chest.py -- [--save]

    --save   Guarda ademas 3d/treasure-chest.blend

Salida: src/data/chest-parts.json
"""

import argparse
import json
import math
import os
import sys

import bpy
import bmesh

HERE = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(HERE, "..", "src", "data", "chest-parts.json")
BLEND_PATH = os.path.join(HERE, "treasure-chest.blend")

# --------------------------------------------------------------------------
# Medidas
# --------------------------------------------------------------------------

W = 1.75             # media anchura (eje X)
D = 1.15             # media profundidad (eje Z)
BODY_H = 1.15        # alto del cuerpo
PLANK = 0.085        # grosor de tabla

STAVES = 11          # duelas de la tapa abovedada
BAND = 0.05          # grosor del fleje de hierro
BAND_W = 0.17        # ancho del fleje
STUD_R = 0.038       # radio del remache

FOOT = 0.16
LID_R = D           # la tapa es media boveda: radio = media profundidad

# Posiciones X de los tres flejes que recorren cuerpo y tapa
BAND_X = (-W * 0.6, 0.0, W * 0.6)

PARTS = []


def box(size, pos, group, material, rot=(0.0, 0.0, 0.0)):
    PARTS.append({
        "type": "box",
        "size": [round(v, 4) for v in size],
        "pos": [round(v, 4) for v in pos],
        "rot": [round(v, 4) for v in rot],
        "group": group,
        "mat": material,
    })


def cyl(radius, height, pos, group, material, axis="y", rot=None):
    part = {
        "type": "cyl",
        "r": round(radius, 4),
        "h": round(height, 4),
        "pos": [round(v, 4) for v in pos],
        "axis": axis,
        "group": group,
        "mat": material,
    }
    if rot:
        part["rot"] = [round(v, 4) for v in rot]
    PARTS.append(part)


# --------------------------------------------------------------------------
# Cuerpo
# --------------------------------------------------------------------------

def body_planks():
    """Tablas verticales en los cuatro costados."""
    count = 7
    plank_w = (W * 2) / count
    for i in range(count):
        x = -W + plank_w * (i + 0.5)
        for sz in (-1, 1):
            box(
                size=(plank_w * 0.94, BODY_H, PLANK),
                pos=(x, BODY_H / 2, sz * (D - PLANK / 2)),
                group="body", material="wood",
            )

    side_count = 5
    side_w = (D * 2) / side_count
    for i in range(side_count):
        z = -D + side_w * (i + 0.5)
        for sx in (-1, 1):
            box(
                size=(PLANK, BODY_H, side_w * 0.94),
                pos=(sx * (W - PLANK / 2), BODY_H / 2, z),
                group="body", material="wood",
            )

    # Suelo
    box(size=(W * 2, PLANK, D * 2), pos=(0, PLANK / 2, 0), group="body", material="wood")


def body_bands():
    """Flejes verticales: suben por el frente, cruzan la base y bajan por detras."""
    for x in BAND_X:
        for sz in (-1, 1):
            box(
                size=(BAND_W, BODY_H, BAND),
                pos=(x, BODY_H / 2, sz * (D + BAND / 2)),
                group="body", material="iron",
            )
            # Remaches
            for y in (BODY_H * 0.22, BODY_H * 0.78):
                cyl(STUD_R, BAND * 1.8, (x, y, sz * (D + BAND)),
                    group="body", material="brass", axis="z")


def body_rim():
    """Ceja superior: el borde donde apoya la tapa."""
    box(size=(W * 2 + BAND, BAND_W, BAND), pos=(0, BODY_H, D + BAND / 2), group="body", material="iron")
    box(size=(W * 2 + BAND, BAND_W, BAND), pos=(0, BODY_H, -D - BAND / 2), group="body", material="iron")
    for sx in (-1, 1):
        box(size=(BAND, BAND_W, D * 2), pos=(sx * (W + BAND / 2), BODY_H, 0),
            group="body", material="iron")


def corners():
    """Cantoneras en las cuatro esquinas."""
    arm = 0.34
    for sx in (-1, 1):
        for sz in (-1, 1):
            for y in (FOOT + 0.06, BODY_H - 0.14):
                box(size=(arm, BAND_W * 0.9, BAND),
                    pos=(sx * (W - arm / 2), y, sz * (D + BAND / 2)),
                    group="body", material="iron")
                box(size=(BAND, BAND_W * 0.9, arm),
                    pos=(sx * (W + BAND / 2), y, sz * (D - arm / 2)),
                    group="body", material="iron")


def feet():
    """Cuatro pies: separan el cofre del suelo y lo asientan."""
    for sx in (-1, 1):
        for sz in (-1, 1):
            box(size=(FOOT * 1.6, FOOT, FOOT * 1.6),
                pos=(sx * (W - FOOT * 0.7), -FOOT / 2, sz * (D - FOOT * 0.7)),
                group="body", material="iron")


def lock():
    """Bocallave de laton en el frente, con su remache central."""
    z = D + BAND
    box(size=(0.46, 0.5, BAND), pos=(0, BODY_H - 0.16, z), group="body", material="brass")
    cyl(0.075, BAND * 2.2, (0, BODY_H - 0.2, z + BAND), group="body", material="iron", axis="z")
    for sx in (-1, 1):
        cyl(STUD_R, BAND * 1.6, (sx * 0.17, BODY_H - 0.02, z + BAND * 0.8),
            group="body", material="brass", axis="z")


# --------------------------------------------------------------------------
# Tapa abovedada
# --------------------------------------------------------------------------

def stave_transform(angle):
    """Punto y giro de una duela sobre la boveda, en coordenadas de la bisagra."""
    return (
        (0.0, LID_R * math.sin(angle), LID_R - LID_R * math.cos(angle)),
        (angle - math.pi / 2, 0.0, 0.0),
    )


def lid_staves():
    """Duelas curvadas: la media boveda que hace que sea un cofre y no una caja."""
    arc = math.pi * LID_R / STAVES
    for i in range(STAVES):
        angle = (i + 0.5) / STAVES * math.pi
        pos, rot = stave_transform(angle)
        box(size=(W * 2, PLANK, arc * 0.9), pos=pos, rot=rot,
            group="lid", material="wood")

    # Tapas laterales: cierran la media luna de los extremos
    for sx in (-1, 1):
        for i in range(STAVES):
            angle = (i + 0.5) / STAVES * math.pi
            pos, rot = stave_transform(angle * 0.985)
            box(size=(PLANK, PLANK * 1.6, arc * 0.9),
                pos=(sx * (W - PLANK / 2), pos[1] - PLANK * 0.7, pos[2]),
                rot=rot, group="lid", material="wood")


def lid_bands():
    """Los mismos tres flejes del cuerpo, siguiendo la curva de la tapa."""
    arc = math.pi * LID_R / STAVES
    for x in BAND_X:
        for i in range(STAVES):
            angle = (i + 0.5) / STAVES * math.pi
            pos, rot = stave_transform(angle)
            box(size=(BAND_W, BAND, arc * 0.98),
                pos=(x, pos[1] + PLANK * 0.6, pos[2]),
                rot=rot, group="lid", material="iron")

        # Un remache por fleje, arriba del todo
        pos, rot = stave_transform(math.pi / 2)
        cyl(STUD_R, BAND * 1.8, (x, pos[1] + PLANK, pos[2]),
            group="lid", material="brass", axis="y")


def hasp():
    """El herraje que baja de la tapa y encaja en la bocallave."""
    pos, _ = stave_transform(math.pi * 0.93)
    box(size=(0.3, 0.34, BAND), pos=(0, pos[1] - 0.02, pos[2] + BAND),
        group="lid", material="brass")


def hinges():
    """Dos bisagras en la arista trasera."""
    for sx in (-1, 1):
        x = sx * W * 0.62
        cyl(0.06, 0.34, (x, BODY_H, -D), group="body", material="iron", axis="x")
        box(size=(0.26, BAND, 0.22), pos=(x, BODY_H - BAND, -D + 0.11),
            group="body", material="iron")


def build():
    body_planks()
    body_bands()
    body_rim()
    corners()
    feet()
    lock()
    hinges()
    lid_staves()
    lid_bands()
    hasp()


# --------------------------------------------------------------------------
# Blender
# --------------------------------------------------------------------------

MATERIAL_COLORS = {
    "wood": (0.42, 0.24, 0.11, 1.0),
    "iron": (0.13, 0.15, 0.17, 1.0),
    "brass": (0.68, 0.52, 0.13, 1.0),
}


def wipe_scene():
    """Sin bpy.ops: funciona en background y dentro del addon MCP por igual."""
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    for mesh in list(bpy.data.meshes):
        if mesh.users == 0:
            bpy.data.meshes.remove(mesh)
    for mat in list(bpy.data.materials):
        if mat.users == 0:
            bpy.data.materials.remove(mat)


def get_material(name):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        mat.diffuse_color = MATERIAL_COLORS[name]   # color del viewport solido
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = MATERIAL_COLORS[name]
            bsdf.inputs["Roughness"].default_value = 0.75 if name == "wood" else 0.45
            if name != "wood":
                bsdf.inputs["Metallic"].default_value = 0.85
    return mat


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
    lid_offset = (0.0, BODY_H, -D)

    for i, part in enumerate(PARTS):
        px, py, pz = part["pos"]
        if part["group"] == "lid":
            px += lid_offset[0]
            py += lid_offset[1]
            pz += lid_offset[2]

        location = (px, -pz, py)         # Y-up (three.js) -> Z-up (Blender)
        name = f"{part['group']}_{part['mat']}_{i:03d}"

        if part["type"] == "box":
            sx, sy, sz = part["size"]
            rx, ry, rz = part.get("rot", (0, 0, 0))
            obj = _link(name, _cube_mesh(name), location, (rx, -rz, ry), (sx, sz, sy))
        else:
            axis = part["axis"]
            base = {"y": (0, 0, 0), "x": (0, math.pi / 2, 0), "z": (math.pi / 2, 0, 0)}[axis]
            obj = _link(name, _cyl_mesh(name, part["r"], part["h"]), location, base)

        obj.data.materials.append(get_material(part["mat"]))


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
        json.dump(
            {"height": BODY_H, "halfWidth": W, "halfDepth": D, "parts": PARTS},
            f, separators=(",", ":"),
        )
    print(f"[ok] {len(PARTS)} piezas en {os.path.normpath(JSON_PATH)}")

    wipe_scene()
    to_blender()

    if args.save:
        bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
        print(f"[ok] escena guardada en {BLEND_PATH}")


if __name__ == "__main__":
    main()
