"""
Prepara la version SOLIDA del dragon: malla decimada + colores por vertice.

Es el contraste del experimento. Mismo modelo, misma paleta, otra tecnica:

    nube de puntos  ->  159 KB, sin superficie, sin sombras
    malla solida    ->  ~400 KB, con silueta, sombreado y oclusion

No lleva textura ni UVs: el color va como atributo de vertice, igual que en la
nube. Por eso tampoco hace falta Draco — sin texturas el .glb ya sale ligero.

Uso:
    blender <importado.blend> --background --python 3d/build_dragon_solid.py
"""

import os

import bpy
from mathutils import Vector

HERE = os.path.dirname(os.path.abspath(__file__))
GLB_PATH = os.path.join(HERE, "..", "public", "3d", "dragon-solid.glb")

TARGET_TRIS = 20000
TARGET_HEIGHT = 2.6

PALETTE = {
    "roca": (0.28, 0.34, 0.38, 1.0),
    "ala": (0.16, 0.72, 0.68, 1.0),
    "vientre": (0.92, 0.82, 0.55, 1.0),
    "cuerpo": (0.95, 0.48, 0.16, 1.0),
}


def zone_color(p, lo, hi):
    """Las mismas reglas que la nube de puntos, para poder comparar de verdad."""
    height = hi.z - lo.z
    half_x = max(abs(lo.x), abs(hi.x))
    t = (p.z - lo.z) / height if height else 0.0

    if t < 0.2:
        return PALETTE["roca"]
    if abs(p.x) > half_x * 0.44 and t > 0.42:
        return PALETTE["ala"]
    if p.y < -0.08 and 0.3 < t < 0.78:
        return PALETTE["vientre"]
    return PALETTE["cuerpo"]


def decimate(obj):
    """243.000 triangulos son absurdos para la web. A ese tamano nadie nota 20.000."""
    tris = len(obj.data.loop_triangles) or len(obj.data.polygons)
    if tris <= TARGET_TRIS:
        return

    modifier = obj.modifiers.new("decimar", "DECIMATE")
    modifier.ratio = TARGET_TRIS / tris

    deps = bpy.context.evaluated_depsgraph_get()
    reduced = bpy.data.meshes.new_from_object(obj.evaluated_get(deps), depsgraph=deps)
    obj.modifiers.remove(modifier)

    old = obj.data
    obj.data = reduced
    bpy.data.meshes.remove(old)


def normalize(obj):
    """Centra, apoya en el suelo y escala a la misma altura que la nube."""
    coords = [obj.matrix_world @ v.co for v in obj.data.vertices]
    lo = Vector((min(c.x for c in coords), min(c.y for c in coords), min(c.z for c in coords)))
    hi = Vector((max(c.x for c in coords), max(c.y for c in coords), max(c.z for c in coords)))
    height = hi.z - lo.z
    factor = TARGET_HEIGHT / height if height else 1.0
    center = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))

    for v in obj.data.vertices:
        v.co = (v.co - center) * factor

    obj.matrix_world.identity()


def paint(obj):
    """Color por vertice: no necesita UVs, que es justo lo que no trae el modelo."""
    mesh = obj.data
    coords = [v.co for v in mesh.vertices]
    lo = Vector((min(c.x for c in coords), min(c.y for c in coords), min(c.z for c in coords)))
    hi = Vector((max(c.x for c in coords), max(c.y for c in coords), max(c.z for c in coords)))

    layer = mesh.color_attributes.get("Color")
    if layer is None:
        layer = mesh.color_attributes.new(name="Color", type="FLOAT_COLOR", domain="POINT")

    for i, v in enumerate(mesh.vertices):
        layer.data[i].color = zone_color(v.co, lo, hi)

    mesh.color_attributes.active_color = layer


def material(obj):
    """Un material minimo que lee el color de vertice: el exportador lo necesita."""
    mat = bpy.data.materials.new("dragon")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links

    # Por tipo y no por nombre: en Blender en español el nodo se llama distinto
    bsdf = next((n for n in nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        bsdf = nodes.new("ShaderNodeBsdfPrincipled")
        output = next((n for n in nodes if n.type == "OUTPUT_MATERIAL"), None)
        if output:
            links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
    attribute = nodes.new("ShaderNodeVertexColor")
    attribute.layer_name = "Color"
    links.new(attribute.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.62

    obj.data.materials.clear()
    obj.data.materials.append(mat)


def main():
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    if not meshes:
        raise SystemExit("no hay malla en la escena")

    obj = meshes[0]
    obj.data.calc_loop_triangles()

    decimate(obj)
    normalize(obj)
    paint(obj)
    material(obj)

    # El exportador glTF lee `context.active_object`, que en el contexto del
    # addon MCP no existe si nadie lo ha fijado.
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)

    os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=GLB_PATH,
        export_format="GLB",
        use_selection=False,
        export_apply=True,
        export_vertex_color="ACTIVE",
        export_normals=True,
        export_texcoords=False,     # no hay UVs y no las necesitamos
        export_materials="EXPORT",
        export_yup=True,            # three.js es Y-up
        # Sin Draco salen 2 MB: los colores por vertice viajan en float y no
        # hay reuso de vertices. Comprimido baja a una fraccion.
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_draco_position_quantization=12,
        export_draco_normal_quantization=8,
        export_draco_color_quantization=8,
    )

    size = os.path.getsize(GLB_PATH)
    print(f"[ok] {len(obj.data.polygons)} caras -> {round(size / 1024)} KB")


if __name__ == "__main__":
    main()
