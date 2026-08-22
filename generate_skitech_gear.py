import bpy
import math
from mathutils import Vector

OUTPUT = r"C:\Users\pavel\Desktop\Not Work Projects\Skitech site\skitech-gear.webp"

bpy.ops.wm.read_factory_settings(use_empty=True)

# Build the wheel from real separate machined parts so the windows remain open.
parts = []

def add_ring(name, outer_radius, inner_radius, depth):
    vertices = 128
    points = []
    faces = []
    for z in (-depth / 2, depth / 2):
        for radius in (outer_radius, inner_radius):
            for index in range(vertices):
                angle = math.tau * index / vertices
                points.append((math.cos(angle) * radius, math.sin(angle) * radius, z))
    outer_bottom = 0
    inner_bottom = vertices
    outer_top = vertices * 2
    inner_top = vertices * 3
    for index in range(vertices):
        next_index = (index + 1) % vertices
        faces.extend([
            (outer_bottom + index, outer_bottom + next_index, outer_top + next_index, outer_top + index),
            (inner_bottom + next_index, inner_bottom + index, inner_top + index, inner_top + next_index),
            (outer_top + index, outer_top + next_index, inner_top + next_index, inner_top + index),
            (outer_bottom + next_index, outer_bottom + index, inner_bottom + index, inner_bottom + next_index),
        ])
    mesh = bpy.data.meshes.new(name + " mesh")
    mesh.from_pydata(points, [], faces)
    mesh.update()
    item = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(item)
    parts.append(item)
    return item

add_ring("Outer machined ring", 4.02, 3.18, 0.72)

for index in range(28):
    angle = math.tau * index / 28
    x = math.cos(angle) * 4.28
    y = math.sin(angle) * 4.28
    bpy.ops.mesh.primitive_cube_add(
        size=1,
        location=(x, y, 0),
        rotation=(0, 0, angle),
    )
    tooth = bpy.context.object
    tooth.dimensions = (0.82, 0.62, 0.82)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    parts.append(tooth)

for index in range(5):
    angle = math.tau * index / 5 + 0.18
    bpy.ops.mesh.primitive_cube_add(
        size=1,
        location=(math.cos(angle) * 1.9, math.sin(angle) * 1.9, 0),
        rotation=(0, 0, angle),
    )
    spoke = bpy.context.object
    spoke.dimensions = (3.3, 0.64, 0.62)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    parts.append(spoke)

add_ring("Central hub", 1.35, 0.62, 0.9)

for index in range(5):
    angle = math.tau * index / 5 + 0.18
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32,
        radius=0.17,
        depth=0.94,
        location=(math.cos(angle) * 2.38, math.sin(angle) * 2.38, 0.02),
    )
    bolt = bpy.context.object
    parts.append(bolt)

bpy.context.view_layer.objects.active = parts[0]
for item in bpy.context.selected_objects:
    item.select_set(False)
for item in parts:
    item.select_set(True)
bpy.ops.object.join()
gear = bpy.context.object
gear.name = "SKITECH_GEAR"

bevel = gear.modifiers.new("Machined bevels", "BEVEL")
bevel.width = 0.11
bevel.segments = 4
bevel.limit_method = "ANGLE"
bpy.context.view_layer.objects.active = gear
bpy.ops.object.modifier_apply(modifier=bevel.name)

weighted = gear.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
weighted.keep_sharp = True
bpy.ops.object.modifier_apply(modifier=weighted.name)

# Aged bronze PBR material: color variation, roughness variation, and fine bump.
material = bpy.data.materials.new("Aged industrial bronze")
material.use_nodes = True
nodes = material.node_tree.nodes
links = material.node_tree.links
nodes.clear()
output = nodes.new("ShaderNodeOutputMaterial")
bsdf = nodes.new("ShaderNodeBsdfPrincipled")
bsdf.inputs["Metallic"].default_value = 1.0
bsdf.inputs["Roughness"].default_value = 0.48
bsdf.inputs["IOR"].default_value = 1.45
noise = nodes.new("ShaderNodeTexNoise")
noise.inputs["Scale"].default_value = 7.0
noise.inputs["Detail"].default_value = 5.0
noise.inputs["Roughness"].default_value = 0.72
ramp = nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position = 0.28
ramp.color_ramp.elements[0].color = (0.028, 0.012, 0.004, 1)
ramp.color_ramp.elements[1].position = 0.72
ramp.color_ramp.elements[1].color = (0.34, 0.12, 0.028, 1)
rough_ramp = nodes.new("ShaderNodeValToRGB")
rough_ramp.color_ramp.elements[0].position = 0.25
rough_ramp.color_ramp.elements[0].color = (0.3, 0.3, 0.3, 1)
rough_ramp.color_ramp.elements[1].position = 0.75
rough_ramp.color_ramp.elements[1].color = (0.68, 0.68, 0.68, 1)
bump = nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.16
bump.inputs["Distance"].default_value = 0.08
links.new(noise.outputs["Fac"], ramp.inputs["Fac"])
links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
links.new(noise.outputs["Fac"], rough_ramp.inputs["Fac"])
links.new(rough_ramp.outputs["Color"], bsdf.inputs["Roughness"])
links.new(noise.outputs["Fac"], bump.inputs["Height"])
links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])
links.new(bsdf.outputs["BSDF"], output.inputs["Surface"])
gear.data.materials.append(material)

# Camera and industrial lighting emphasize bevels while retaining deep shadow.
bpy.ops.object.camera_add(location=(0, 0, 11.8), rotation=(0, 0, 0))
camera = bpy.context.object
camera.data.type = "ORTHO"
camera.data.ortho_scale = 11.2
camera.rotation_euler = (0, 0, 0)
# Point the camera down toward the wheel.
camera.rotation_euler = (0, 0, 0)
bpy.context.scene.camera = camera

bpy.ops.object.light_add(type="AREA", location=(-4.5, -4.0, 7.0))
key = bpy.context.object
key.data.energy = 900
key.data.shape = "DISK"
key.data.size = 5.0
key.data.color = (1.0, 0.48, 0.16)
key.rotation_euler = (0.35, 0.0, -0.55)

bpy.ops.object.light_add(type="AREA", location=(5.0, 2.0, 4.0))
rim = bpy.context.object
rim.data.energy = 340
rim.data.size = 4.0
rim.data.color = (0.55, 0.2, 0.06)
rim.rotation_euler = (0.6, 0.0, 2.4)

scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1400
scene.render.resolution_y = 1400
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "8"
scene.render.filepath = OUTPUT
scene.render.film_transparent = True
scene.render.image_settings.color_mode = "RGBA"
scene.world = bpy.data.worlds.new("Industrial black world")
scene.world.color = (0.002, 0.001, 0.0005)
scene.render.film_transparent = True
bpy.ops.wm.save_as_mainfile(filepath=r"C:\Users\pavel\Desktop\Not Work Projects\Skitech site\skitech-gear.blend")
bpy.ops.export_scene.gltf(
    filepath=r"C:\Users\pavel\Desktop\Not Work Projects\Skitech site\skitech-gear.glb",
    export_format="GLB",
    use_selection=True,
)
bpy.ops.render.render(write_still=True)
