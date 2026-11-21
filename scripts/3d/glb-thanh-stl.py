# Biến mô hình GLB có xương của BizOn thành tệp STL để in 3D (21/11/2026): dựng nhân vật ở một khung của một động tác, gộp với đế
# tròn, làm kín lưới bằng remesh voxel, bỏ mảnh rời nhỏ, đưa về milimét (cao 100 mm). Chạy bằng Blender 4.2 không giao diện:
#   blender -b --factory-startup --python scripts/3d/glb-thanh-stl.py -- <vào.glb> <ra.stl> <tên động tác> <số khung>
# Ví dụ: ... -- assets/models/nhan-vat/tu-v3.glb assets/in-3d/tu-v3-10cm.stl Idle 10
# In: ghi kết quả kiểm (số cạnh hở phải bằng 0, một khối). Muốn cỡ khác thì sửa H, BASE_R, BASE_H (mm) và VOX (độ mịn).
import bpy, bmesh, sys, math
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]
src, out, clip, frame = argv[0], argv[1], argv[2], int(argv[3])
H, VOX, BASE_R, BASE_H = 100.0, 0.45, 24.0, 3.0   # mm
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
arm = next(o for o in bpy.context.scene.objects if o.type == 'ARMATURE')
act = bpy.data.actions.get(clip) or next(a for a in bpy.data.actions if clip.lower() in a.name.lower())
arm.animation_data_create(); arm.animation_data.action = act
bpy.context.scene.frame_set(frame)
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]   # bỏ khối cầu hình xương do trình nhập tạo
dg = bpy.context.evaluated_depsgraph_get()
newobjs = []
for o in meshes:
    me = bpy.data.meshes.new_from_object(o.evaluated_get(dg), depsgraph=dg)
    me.transform(o.matrix_world); n = bpy.data.objects.new(o.name + '_tu_the', me); bpy.context.scene.collection.objects.link(n); newobjs.append(n)
for o in list(bpy.context.scene.objects):
    if o not in newobjs: bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.object.select_all(action='DESELECT')
for o in newobjs: o.select_set(True)
bpy.context.view_layer.objects.active = newobjs[0]
if len(newobjs) > 1: bpy.ops.object.join()
ob = bpy.context.view_layer.objects.active
# glTF Y-up đã chuyển sang Z-up khi nhập; đưa về mm, chân chạm z=0
zs = [ (ob.matrix_world @ v.co).z for v in ob.data.vertices ]
s = H / (max(zs) - min(zs)); ob.scale = (s, s, s); bpy.ops.object.transform_apply(scale=True)
bb = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
cx = sum(v.x for v in bb)/8; cy = sum(v.y for v in bb)/8; zmin = min(v.z for v in bb)
ob.location = (-cx, -cy, -zmin + BASE_H - 0.6); bpy.ops.object.transform_apply(location=True)
bpy.ops.mesh.primitive_cylinder_add(vertices=96, radius=BASE_R, depth=BASE_H, location=(0, 0, BASE_H/2))
base = bpy.context.active_object
bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); base.select_set(True); bpy.context.view_layer.objects.active = ob
bpy.ops.object.join()
m = ob.modifiers.new('kin', 'REMESH'); m.mode = 'VOXEL'; m.voxel_size = VOX; m.use_smooth_shade = False
bpy.ops.object.modifier_apply(modifier=m.name)
bm = bmesh.new(); bm.from_mesh(ob.data)
# bỏ mảnh rời nhỏ (sẽ in thành vụn): chỉ giữ khối lớn nhất
comps, seen0 = [], set()
for f in bm.faces:
    if f in seen0: continue
    c, st = [], [f]
    while st:
        g = st.pop()
        if g in seen0: continue
        seen0.add(g); c.append(g); st.extend(l.link_loop_radial_next.face for l in g.loops)
    comps.append(c)
comps.sort(key=len, reverse=True)
bo = [f for c in comps[1:] for f in c]
print('MANH_RO', len(comps) - 1, 'mat', len(bo))
bmesh.ops.delete(bm, geom=bo, context='FACES')
bm.to_mesh(ob.data); bm.faces.ensure_lookup_table(); bm.faces.index_update()
non = [e for e in bm.edges if not e.is_manifold]; parts = 0
seen = set()
for f in bm.faces:
    if f.index in seen: continue
    parts += 1; st = [f]
    while st:
        g = st.pop()
        if g.index in seen: continue
        seen.add(g.index); st.extend(l.link_loop_radial_next.face for l in g.loops)
vol = bm.calc_volume(); dims = ob.dimensions
print('KQ', out.split('/')[-1], 'tam_giac', sum(len(f.verts)-2 for f in bm.faces), 'canh_ho', len(non), 'khoi', parts, 'the_tich_cm3', round(abs(vol)/1000, 1), 'kich_thuoc_mm', [round(d,1) for d in dims])
bm.free()
bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
bpy.ops.wm.stl_export(filepath=out, export_selected_objects=True, ascii_format=False)
