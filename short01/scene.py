#!/usr/bin/env python3
"""Short 01 — photoreal desk/checkout scene, built and animated in Blender (bpy, Cycles).

    python3 short01/scene.py                 -> short01/build/short01.blend (editable project)

Everything is driven from SHOTS / CUES below (frames on the 30 fps, 1281-frame timeline from
SHORT_01_SCENE_TIMINGS.json). Text never comes from generated imagery: all paper/screen content is
typeset by make_textures.py and mapped onto real geometry here.
"""
import bpy, bmesh, json, math, os, sys
from mathutils import Vector, Euler, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'assets')
TEX = os.path.join(HERE, 'build', 'tex')
LAY = json.load(open(os.path.join(HERE, 'build', 'layout.json')))
FPS, N = 30, 1281
MM = 0.001

# ------------------------------------------------------------------ timeline (frames, 0-based)
CUT = dict(
    s1=0, s2=174, s3=276, s3cal=332, s4=404, s5=511, s6=640, s7=831, s7shop=872, s7cal=968, s8=1058, s9=1162, end=1281,
)
CUE = dict(
    min_paid=8, int_q=80, pen_stop=112, bill=176, min_only=228, slip_in=206,
    shop_print=292, date7=335, pay_in=511, bal49=557, late=715, int_on=766,
    new_print=926, date4=993, invite=1162, phone_wake=1112,
)


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    for mod in ('io_scene_gltf2',):
        try:
            bpy.ops.preferences.addon_enable(module=mod)
        except Exception:
            pass


# ------------------------------------------------------------------ materials
def img(path, colorspace='sRGB'):
    im = bpy.data.images.load(path, check_existing=True)
    im.colorspace_settings.name = colorspace
    return im


def mat_basic(name, color=(0.8, 0.8, 0.8, 1), rough=0.5, metal=0.0, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    b.inputs['Coat Weight'].default_value = coat
    return m


def mat_image(name, path, rough=0.72, emission=0.0, coat=0.0, bump=0.0, sheen=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    t = nt.nodes.new('ShaderNodeTexImage')
    t.image = img(path)
    t.interpolation = 'Cubic'
    t.extension = 'CLIP'
    nt.links.new(t.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = rough
    b.inputs['Coat Weight'].default_value = coat
    b.inputs['Sheen Weight'].default_value = sheen
    if emission:
        nt.links.new(t.outputs['Color'], b.inputs['Emission Color'])
        b.inputs['Emission Strength'].default_value = emission
    if bump:
        nz = nt.nodes.new('ShaderNodeTexNoise')
        nz.inputs['Scale'].default_value = 900.0
        nz.inputs['Detail'].default_value = 6
        bp = nt.nodes.new('ShaderNodeBump')
        bp.inputs['Strength'].default_value = bump
        bp.inputs['Distance'].default_value = 0.0002
        nt.links.new(nz.outputs['Fac'], bp.inputs['Height'])
        nt.links.new(bp.outputs['Normal'], b.inputs['Normal'])
    return m


def mat_pbr(name, base, scale=1.0, rough_path=None, nor_path=None, rough_mul=1.0, tint=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes['Principled BSDF']
    tc = nt.nodes.new('ShaderNodeTexCoord')
    mp = nt.nodes.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (scale, scale, scale)
    nt.links.new(tc.outputs['UV'], mp.inputs['Vector'])
    d = nt.nodes.new('ShaderNodeTexImage')
    d.image = img(base)
    nt.links.new(mp.outputs['Vector'], d.inputs['Vector'])
    col = d.outputs['Color']
    if tint:
        mx = nt.nodes.new('ShaderNodeMix')
        mx.data_type = 'RGBA'
        mx.blend_type = 'MULTIPLY'
        mx.inputs['Factor'].default_value = 1.0
        mx.inputs['B'].default_value = tint
        nt.links.new(col, mx.inputs['A'])
        col = mx.outputs['Result']
    nt.links.new(col, b.inputs['Base Color'])
    if rough_path:
        r = nt.nodes.new('ShaderNodeTexImage')
        r.image = img(rough_path, 'Non-Color')
        nt.links.new(mp.outputs['Vector'], r.inputs['Vector'])
        ml = nt.nodes.new('ShaderNodeMath')
        ml.operation = 'MULTIPLY'
        ml.inputs[1].default_value = rough_mul
        nt.links.new(r.outputs['Color'], ml.inputs[0])
        nt.links.new(ml.outputs[0], b.inputs['Roughness'])
    if nor_path:
        n = nt.nodes.new('ShaderNodeTexImage')
        n.image = img(nor_path, 'Non-Color')
        nt.links.new(mp.outputs['Vector'], n.inputs['Vector'])
        nm = nt.nodes.new('ShaderNodeNormalMap')
        nm.inputs['Strength'].default_value = 0.6
        nt.links.new(n.outputs['Color'], nm.inputs['Color'])
        nt.links.new(nm.outputs['Normal'], b.inputs['Normal'])
    return m


def mat_wipe(name, color, density=0.62, mode='linear'):
    """highlighter ink: tinted transparency (multiplies the paper underneath), revealed by a wipe.
    The wipe position lives on the object as custom property 'p' (0..1), keyed per frame."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    clear = nt.nodes.new('ShaderNodeBsdfTransparent')
    ink = nt.nodes.new('ShaderNodeBsdfTransparent')
    ink.inputs['Color'].default_value = color
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['UV'], sep.inputs['Vector'])
    attr = nt.nodes.new('ShaderNodeAttribute')
    attr.attribute_type = 'OBJECT'
    attr.attribute_name = 'p'
    # mask = smoothstep(u - p) : 1 where u < p
    sub = nt.nodes.new('ShaderNodeMath')
    sub.operation = 'SUBTRACT'
    nt.links.new(attr.outputs['Fac'], sub.inputs[0])
    nt.links.new(sep.outputs['X'], sub.inputs[1])
    mr = nt.nodes.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = -0.004
    mr.inputs['From Max'].default_value = 0.01
    nt.links.new(sub.outputs[0], mr.inputs['Value'])
    # ragged ink edges along v (highlighter streak texture)
    nz = nt.nodes.new('ShaderNodeTexNoise')
    nz.inputs['Scale'].default_value = 60.0
    nz.inputs['Detail'].default_value = 8.0
    edge = nt.nodes.new('ShaderNodeMapRange')
    nt.links.new(sep.outputs['Y'], edge.inputs['Value'])
    vr = nt.nodes.new('ShaderNodeMath')
    vr.operation = 'PINGPONG'
    vr.inputs[1].default_value = 0.5
    nt.links.new(sep.outputs['Y'], vr.inputs[0])
    vmr = nt.nodes.new('ShaderNodeMapRange')
    vmr.inputs['From Min'].default_value = 0.0
    vmr.inputs['From Max'].default_value = 0.09
    nt.links.new(vr.outputs[0], vmr.inputs['Value'])
    streak = nt.nodes.new('ShaderNodeMapRange')
    streak.inputs['To Min'].default_value = density * 0.8
    streak.inputs['To Max'].default_value = density
    nt.links.new(nz.outputs['Fac'], streak.inputs['Value'])
    m1 = nt.nodes.new('ShaderNodeMath')
    m1.operation = 'MULTIPLY'
    nt.links.new(mr.outputs['Result'], m1.inputs[0])
    nt.links.new(vmr.outputs['Result'], m1.inputs[1])
    m2 = nt.nodes.new('ShaderNodeMath')
    m2.operation = 'MULTIPLY'
    nt.links.new(m1.outputs[0], m2.inputs[0])
    nt.links.new(streak.outputs['Result'], m2.inputs[1])
    mix = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(m2.outputs[0], mix.inputs['Fac'])
    nt.links.new(clear.outputs[0], mix.inputs[1])
    nt.links.new(ink.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs['Surface'])
    m.blend_method = 'BLEND' if hasattr(m, 'blend_method') else None
    return m


# ------------------------------------------------------------------ geometry helpers
def link(ob):
    bpy.context.scene.collection.objects.link(ob)
    return ob


def plane(name, w, h, mat=None, cuts=0):
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=max(1, cuts + 1), y_segments=max(1, cuts + 1), size=0.5)
    uv = bm.loops.layers.uv.new('UVMap')
    for f in bm.faces:
        for l in f.loops:
            co = l.vert.co
            l[uv].uv = (co.x + 0.5, co.y + 0.5)
    for v in bm.verts:
        v.co.x *= w
        v.co.y *= h
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    if mat:
        ob.data.materials.append(mat)
    return ob


def rounded_slab(name, w, h, t, r, mat=None, segs=10):
    bm = bmesh.new()
    pts = []
    for cx, cy, a0 in [(w / 2 - r, h / 2 - r, 0), (-w / 2 + r, h / 2 - r, 90), (-w / 2 + r, -h / 2 + r, 180), (w / 2 - r, -h / 2 + r, 270)]:
        for i in range(segs + 1):
            a = math.radians(a0 + 90 * i / segs)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    vs = [bm.verts.new((x, y, 0)) for x, y in pts]
    f = bm.faces.new(vs)
    uv = bm.loops.layers.uv.new('UVMap')
    for l in f.loops:
        l[uv].uv = (l.vert.co.x / w + 0.5, l.vert.co.y / h + 0.5)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in [g for g in ext['geom'] if isinstance(g, bmesh.types.BMVert)]:
        v.co.z -= t
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    if mat:
        ob.data.materials.append(mat)
    for p in ob.data.polygons:
        p.use_smooth = False
    return ob


def box(name, sx, sy, sz, mat=None, bevel=0.0, segs=4):
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    if bevel:
        md = ob.modifiers.new('bevel', 'BEVEL')
        md.width = bevel
        md.segments = segs
        md.limit_method = 'ANGLE'
    if mat:
        ob.data.materials.append(mat)
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


def cylinder(name, r, depth, mat=None, verts=40, r2=None):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=depth)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = link(bpy.data.objects.new(name, me))
    if mat:
        ob.data.materials.append(mat)
    for p in ob.data.polygons:
        p.use_smooth = len(p.vertices) == 4
    return ob


def empty(name, loc=(0, 0, 0)):
    e = link(bpy.data.objects.new(name, None))
    e.location = loc
    return e


def sheet(name, key, loc, rz=0.0, lift=0.0, curl=0.0, wave=0.0006, rough=0.78, cuts=24, texname=None):
    """a printed sheet from layout.json, lying on the desk, top edge toward +Y"""
    L = LAY[key]
    w, h = L['w_mm'] * MM, L['h_mm'] * MM
    m = mat_image('m_' + name, os.path.join(TEX, (texname or key) + '.png'), rough=rough, bump=0.12, sheen=0.15)
    ob = plane(name, w, h, m, cuts)
    ob.location = (loc[0], loc[1], 0.0003 + lift)
    ob.rotation_euler = (0, 0, math.radians(rz))
    if wave:
        tx = bpy.data.textures.new('wave_' + name, 'CLOUDS')
        tx.noise_scale = 0.08
        md = ob.modifiers.new('wave', 'DISPLACE')
        md.texture = tx
        md.strength = wave
        md.mid_level = 0.0
    if curl:
        md = ob.modifiers.new('curl', 'SIMPLE_DEFORM')
        md.deform_method = 'BEND'
        md.angle = math.radians(curl)
        md.deform_axis = 'X'
    md = ob.modifiers.new('solid', 'SOLIDIFY')
    md.thickness = 0.00012
    md.offset = -1
    ob['w'], ob['h'], ob['key'] = w, h, key
    return ob


def on(ob, x_mm, y_mm, z=0.0):
    """world position of a point on a sheet given in mm from its top-left corner"""
    bpy.context.view_layer.update()
    w, h = ob['w'], ob['h']
    p = Vector((x_mm * MM - w / 2, h / 2 - y_mm * MM, z))
    return ob.matrix_world @ p


def mark_center(ob, key, dx=0, dy=0):
    x0, y0, x1, y1 = LAY[ob['key']]['marks'][key]
    return on(ob, (x0 + x1) / 2 + dx, (y0 + y1) / 2 + dy)


# ------------------------------------------------------------------ keyframing helpers
def key_loc(ob, f, loc, interp='BEZIER'):
    ob.location = loc
    ob.keyframe_insert('location', frame=f)
    _interp(ob, interp)


def key_rot(ob, f, rot_deg, interp='BEZIER'):
    ob.rotation_euler = tuple(math.radians(a) for a in rot_deg)
    ob.keyframe_insert('rotation_euler', frame=f)
    _interp(ob, interp)


def key_prop(ob, prop, f, val, interp='BEZIER'):
    ob[prop] = val
    ob.keyframe_insert(f'["{prop}"]', frame=f)
    _interp(ob, interp)


def _interp(ob, interp):
    ad = ob.animation_data
    if ad and ad.action:
        for fc in ad.action.fcurves:
            for kp in fc.keyframe_points:
                if kp.co.x == bpy.context.scene.frame_current or True:
                    pass
            fc.keyframe_points[-1].interpolation = interp


def hold_visible(ob, f0, f1):
    """object renders only within [f0, f1)"""
    for f, v in [(0, True), (f0, False), (f1, True)]:
        ob.hide_render = v
        ob.keyframe_insert('hide_render', frame=f)
    ob.hide_render = False if f0 <= 0 else True


# ------------------------------------------------------------------ world (home window light / two shops)
def world():
    w = bpy.data.worlds.new('World')
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputWorld')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    envs = []
    for i, (h, rot, s) in enumerate([('lythwood_room', 200, 0.9), ('phone_shop', 30, 0.75), ('comfy_cafe', 120, 0.8)]):
        mp = nt.nodes.new('ShaderNodeMapping')
        mp.inputs['Rotation'].default_value = (0, 0, math.radians(rot))
        nt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
        e = nt.nodes.new('ShaderNodeTexEnvironment')
        e.image = img(os.path.join(A, 'hdri', f'{h}_2k.hdr'), 'Linear Rec.709')
        nt.links.new(mp.outputs['Vector'], e.inputs['Vector'])
        bg = nt.nodes.new('ShaderNodeBackground')
        bg.inputs['Strength'].default_value = s
        nt.links.new(e.outputs['Color'], bg.inputs['Color'])
        envs.append(bg)
    m1 = nt.nodes.new('ShaderNodeMixShader')
    m1.name = 'mix_shop1'
    nt.links.new(envs[0].outputs[0], m1.inputs[1])
    nt.links.new(envs[1].outputs[0], m1.inputs[2])
    m2 = nt.nodes.new('ShaderNodeMixShader')
    m2.name = 'mix_shop2'
    nt.links.new(m1.outputs[0], m2.inputs[1])
    nt.links.new(envs[2].outputs[0], m2.inputs[2])
    nt.links.new(m2.outputs[0], out.inputs['Surface'])
    for name, spans in [('mix_shop1', [(CUT['s3'], CUT['s3cal'])]), ('mix_shop2', [(CUT['s7shop'], CUT['s7cal'])])]:
        fac = nt.nodes[name].inputs['Fac']
        for f, v in [(0, 0.0)] + sum([[(a, 1.0), (b, 0.0)] for a, b in spans], []):
            fac.default_value = v
            fac.keyframe_insert('default_value', frame=f)
    for fc in nt.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'CONSTANT'


# ------------------------------------------------------------------ lights
def lights():
    # warm low window sun from the left-back: soft (large angle) for paper contact shadows
    sun = bpy.data.lights.new('window_sun', 'SUN')
    sun.energy = 3.2
    sun.angle = math.radians(6)
    sun.color = (1.0, 0.86, 0.68)
    so = link(bpy.data.objects.new('window_sun', sun))
    so.rotation_euler = Euler((math.radians(52), math.radians(-28), math.radians(-30)))
    # cool skylight bounce from the right
    ar = bpy.data.lights.new('fill', 'AREA')
    ar.energy = 0.0
    fo = link(bpy.data.objects.new('fill', ar))
    return so


# ------------------------------------------------------------------ props
def credit_card(name):
    front = mat_image('m_cardfront_' + name, os.path.join(TEX, 'card_front.png'), rough=0.58, coat=0.25)
    edge = mat_basic('m_cardedge_' + name, (0.03, 0.05, 0.12, 1), 0.5)
    ob = rounded_slab(name, 0.0856, 0.054, 0.00076, 0.0032, front)
    ob.data.materials.append(edge)
    for p in ob.data.polygons:
        p.material_index = 0 if abs(p.normal.z) > 0.9 else 1
    gold = mat_basic('m_chip_' + name, (0.85, 0.66, 0.32, 1), 0.28, 1.0)
    chip = rounded_slab(name + '_chip', 0.011, 0.0088, 0.00012, 0.0012, gold, 4)
    chip.parent = ob
    chip.location = (-0.0856 / 2 + 0.0122 + 0.0055, 0.054 / 2 - 0.0215 - 0.0044, 0.00012)
    # chip contact lines
    dark = mat_basic('m_chipline_' + name, (0.35, 0.25, 0.1, 1), 0.4, 1.0)
    for i, (sx, sy, x, y) in enumerate([(0.011, 0.0003, 0, 0.0015), (0.011, 0.0003, 0, -0.0015), (0.0003, 0.0088, 0.0015, 0)]):
        ln = box(f'{name}_cl{i}', sx, sy, 0.00002, dark)
        ln.parent = chip
        ln.location = (x, y, 0.00013)
    return ob


def pen(name, body=(0.04, 0.07, 0.19, 1), length=0.142, r=0.0048, kind='ball', cap=(1.0, 0.83, 0.3, 1)):
    """pen with its tip at the object origin, body along +Z"""
    root = empty(name)
    bm = mat_basic('m_' + name + '_body', body, 0.32, 0.0, 0.4)
    metal = mat_basic('m_' + name + '_metal', (0.8, 0.8, 0.82, 1), 0.22, 1.0)
    if kind == 'ball':
        cone = cylinder(name + '_cone', 0.0006, 0.016, metal, 32, r2=r * 0.9)
        cone.location = (0, 0, 0.008)
        b = cylinder(name + '_body', r, length - 0.016, bm, 40)
        b.location = (0, 0, 0.016 + (length - 0.016) / 2)
        ring = cylinder(name + '_ring', r * 1.04, 0.003, mat_basic('m_' + name + '_ring', (1.0, 0.83, 0.3, 1), 0.3, 0.6), 40)
        ring.location = (0, 0, 0.05)
        clip = box(name + '_clip', 0.0016, 0.0008, 0.05, metal, 0.0003)
        clip.location = (0, r + 0.0007, length - 0.03)
        parts = [cone, b, ring, clip]
    else:  # chisel highlighter
        felt = mat_basic('m_' + name + '_felt', cap, 0.85)
        tip = box(name + '_tip', 0.0045, 0.0018, 0.008, felt, 0.0004)
        tip.location = (0, 0, 0.004)
        tip.rotation_euler = (0, math.radians(18), 0)
        collar = cylinder(name + '_collar', r * 0.75, 0.01, mat_basic('m_' + name + '_collar', (0.1, 0.1, 0.1, 1), 0.4), 32)
        collar.location = (0, 0, 0.011)
        b = cylinder(name + '_body', r * 1.25, length, mat_basic('m_' + name + '_bdy', body, 0.35, 0.0, 0.3), 6)
        b.location = (0, 0, 0.016 + length / 2)
        endc = cylinder(name + '_end', r * 1.27, 0.03, mat_basic('m_' + name + '_endc', cap, 0.4), 6)
        endc.location = (0, 0, 0.016 + length - 0.015)
        parts = [tip, collar, b, endc]
    for p in parts:
        p.parent = root
    return root


def terminal(name, screen_tex):
    """countertop card terminal standing in a tilted cradle; returns (root, screen material node, slot frame)"""
    root = empty(name)
    plastic = mat_basic('m_' + name + '_body', (0.045, 0.047, 0.052, 1), 0.42, 0.0, 0.15)
    cradle = box(name + '_cradle', 0.09, 0.12, 0.03, mat_basic('m_' + name + '_cradle', (0.025, 0.026, 0.03, 1), 0.5), 0.006)
    cradle.parent = root
    cradle.location = (0, 0.01, 0.015)
    body = empty(name + '_tilt')
    body.parent = root
    body.location = (0, 0.0, 0.078)
    body.rotation_euler = (math.radians(28), 0, 0)
    shell = box(name + '_shell', 0.078, 0.172, 0.034, plastic, 0.009, 6)
    shell.parent = body
    keys = mat_image('m_' + name + '_keys', os.path.join(TEX, 'term_keys.png'), rough=0.45)
    kp = plane(name + '_keypad', 0.064, 0.058, keys)
    kp.parent = body
    kp.location = (0, -0.045, 0.0172)
    scr_m = bpy.data.materials.new('m_' + name + '_screen')
    scr_m.use_nodes = True
    nt = scr_m.node_tree
    b = nt.nodes['Principled BSDF']
    tex_nodes = []
    mix = None
    for i, t in enumerate(screen_tex):
        tn = nt.nodes.new('ShaderNodeTexImage')
        tn.image = img(os.path.join(TEX, t + '.png'))
        tex_nodes.append(tn)
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    mix.name = 'state'
    nt.links.new(tex_nodes[0].outputs['Color'], mix.inputs['A'])
    nt.links.new(tex_nodes[1].outputs['Color'], mix.inputs['B'])
    nt.links.new(mix.outputs['Result'], b.inputs['Base Color'])
    nt.links.new(mix.outputs['Result'], b.inputs['Emission Color'])
    b.inputs['Emission Strength'].default_value = 1.6
    b.inputs['Roughness'].default_value = 0.08
    b.inputs['Coat Weight'].default_value = 1.0
    sc = plane(name + '_screen', 0.056, 0.04, scr_m)
    sc.parent = body
    sc.location = (0, 0.03, 0.0173)
    bezel = plane(name + '_bezel', 0.064, 0.05, mat_basic('m_' + name + '_bezel', (0.01, 0.01, 0.012, 1), 0.15, 0, 1.0))
    bezel.parent = body
    bezel.location = (0, 0.03, 0.01715)
    # printer mouth at the top end
    mouth = box(name + '_mouth', 0.062, 0.004, 0.006, mat_basic('m_' + name + '_mouth', (0.005, 0.005, 0.006, 1), 0.6))
    mouth.parent = body
    mouth.location = (0, 0.0862, 0.006)
    return root, body, mix


def import_gltf(name, loc, rz=0, scale=1.0):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(A, 'models', name, name + '.gltf'))
    new = [o for o in bpy.data.objects if o not in before]
    root = empty(name + '_root', loc)
    for o in new:
        if o.parent is None:
            o.parent = root
    root.rotation_euler = (0, 0, math.radians(rz))
    root.scale = (scale, scale, scale)
    return root


# ------------------------------------------------------------------ cameras
CAMS = []


def camera(name, f0, f1, lens=60, fstop=4.0):
    cd = bpy.data.cameras.new(name)
    cd.lens = lens
    cd.sensor_fit = 'VERTICAL'
    cd.sensor_height = 24.0
    cd.dof.use_dof = True
    cd.dof.aperture_fstop = fstop
    cd.dof.aperture_blades = 7
    ob = link(bpy.data.objects.new(name, cd))
    tgt = empty(name + '_aim')
    foc = empty(name + '_focus')
    c = ob.constraints.new('TRACK_TO')
    c.target = tgt
    c.track_axis = 'TRACK_NEGATIVE_Z'
    c.up_axis = 'UP_Y'
    cd.dof.focus_object = foc
    CAMS.append((f0, f1, ob))
    return ob, tgt, foc


def cam_keys(cam, tgt, foc, keys):
    """keys: (frame, cam_loc, aim_loc, focus_loc or None, lens or None)"""
    for f, cl, al, fl, lens in keys:
        key_loc(cam, f, cl)
        key_loc(tgt, f, al)
        key_loc(foc, f, fl if fl is not None else al)
        if lens:
            cam.data.lens = lens
            cam.data.keyframe_insert('lens', frame=f)


def V(*a):
    return Vector(a)


# ================================================================== build
def build():
    reset()
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = 0, N - 1
    sc.cycles.samples = 64
    sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 3
    sc.cycles.glossy_bounces = 3
    sc.cycles.transmission_bounces = 4
    sc.cycles.transparent_max_bounces = 16
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.blur_glossy = 1.0
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.view_settings.exposure = 0.15
    sc.render.film_transparent = False
    sc.render.image_settings.file_format = 'JPEG'
    sc.render.image_settings.quality = 94
    world()
    lights()

    # ---------------- surfaces
    tx = os.path.join(A, 'tex')
    wood = mat_pbr('m_desk', f'{tx}/wood_table_001_diff_2k.jpg', 1.4, f'{tx}/wood_table_001_rough_2k.jpg', f'{tx}/wood_table_001_nor_gl_2k.jpg', 0.85)
    desk = plane('desk', 2.6, 1.6, wood)
    desk.location = (0.55, 0.15, 0)
    granite = mat_pbr('m_counter1', f'{tx}/granite_tile_diff_2k.jpg', 1.0, f'{tx}/granite_tile_rough_2k.jpg', f'{tx}/granite_tile_nor_gl_2k.jpg', 0.7)
    c1 = plane('counter1', 1.0, 1.0, granite)
    c1.location = (3.0, 0.2, 0)
    oak = mat_pbr('m_counter2', f'{tx}/oak_veneer_01_diff_2k.jpg', 1.6, f'{tx}/oak_veneer_01_rough_2k.jpg', f'{tx}/oak_veneer_01_nor_gl_2k.jpg', 0.8, tint=(0.9, 0.78, 0.66, 1))
    c2 = plane('counter2', 1.0, 1.0, oak)
    c2.location = (4.6, 0.2, 0)

    # ================= SET A (x=0): later statement 12 June + payment slip  [S1, S6]
    stA = sheet('stmt_june', 'stmt_june', (0.0, 0.0), rz=-5)
    slipA = sheet('slip_A', 'pay_slip', (0, 0), rz=-6, lift=0.0006, curl=-2, rough=0.6)
    slipA.location = on(stA, 96, 246, 0.0013)
    penA = pen('penA')
    # pen tip path: enters from lower right, stops just under-left of the interest line
    _r = LAY['stmt_june']['marks']['jun_int']
    p_int = on(stA, 112, _r[3] + 1.2, 0.0004)
    penA.rotation_euler = (math.radians(-52), math.radians(0), math.radians(-38))
    key_loc(penA, 0, p_int + V(0.16, -0.12, 0.06))
    key_loc(penA, CUE['int_q'] + 4, p_int + V(0.16, -0.12, 0.06))
    key_loc(penA, CUE['pen_stop'], p_int + V(0.0, 0.0, 0.0012))
    key_loc(penA, CUE['pen_stop'] + 30, p_int + V(0.0, 0.0, 0.0010))
    # S6: the pen goes, an amber highlighter marks the interest line (separate)
    key_loc(penA, CUT['s2'] - 1, p_int + V(0.0, 0.0, 0.001))
    key_loc(penA, CUT['s2'], p_int + V(0.3, -0.3, 0.2), 'CONSTANT')

    # amber highlight on "Finance charges — interest" row (S6, on కానీ interest ఆగదు)
    x0, y0, x1, y1 = LAY['stmt_june']['marks']['jun_int']
    hlA = plane('hl_int', (x1 - x0 - 2) * MM, 7.8 * MM, mat_wipe('m_hl_int', (1.0, 0.62, 0.08, 1), 0.8))
    hlA.parent = stA
    hlA.location = ((x0 + 1 + (x1 - x0 - 2) / 2) * MM - stA['w'] / 2, stA['h'] / 2 - (y0 + 6.2) * MM, 0.0009)
    hlA.rotation_euler = (0, 0, math.radians(0.6))
    key_prop(hlA, 'p', 0, 0.0)
    key_prop(hlA, 'p', CUE['int_on'] + 4, 0.0)
    key_prop(hlA, 'p', CUE['int_on'] + 30, 1.02)
    hiA = pen('hiA', body=(1.0, 0.62, 0.12, 1), length=0.12, r=0.0062, kind='hi', cap=(1.0, 0.6, 0.12, 1))
    hiA.rotation_euler = (math.radians(-48), 0, math.radians(-34))
    start = on(stA, x0 + 1, y0 + 6.2, 0.0015)
    endp = on(stA, x1 - 1, y0 + 6.2, 0.0015)
    away = start + V(0.25, -0.25, 0.15)
    key_loc(hiA, 0, away, 'CONSTANT')
    key_loc(hiA, CUE['int_on'] - 10, away)
    key_loc(hiA, CUE['int_on'] + 4, start)
    key_loc(hiA, CUE['int_on'] + 30, endp)
    key_loc(hiA, CUE['int_on'] + 52, endp + V(0.1, -0.12, 0.09))

    # ================= SET B (x=0.62): original statement 12 May + slip slides in below its summary  [S2]
    stB = sheet('stmt_may_B', 'stmt_may', (0.62, 0.0), rz=1.5, texname='stmt_may')
    slipB = sheet('slip_B', 'pay_slip', (0.0, 0.0), rz=0, lift=0.0009, curl=-4, rough=0.6)
    rest = on(stB, 150, 168, 0.0)
    key_loc(slipB, 0, rest + V(0.3, -0.05, 0.0012), 'CONSTANT')
    key_loc(slipB, CUE['slip_in'], rest + V(0.24, -0.03, 0.0012))
    key_loc(slipB, CUE['slip_in'] + 14, rest + V(0, 0, 0.0012))
    key_rot(slipB, CUE['slip_in'], (0, 0, -14))
    key_rot(slipB, CUE['slip_in'] + 16, (0, 0, -3))

    # ================= SET C (x=3.0): retail checkout, 7 May  [S3]
    termC, bodyC, mixC = terminal('termC', ['term_idle', 'term_may'])
    termC.location = (3.0, 0.08, 0)
    termC.rotation_euler = (0, 0, math.radians(8))
    mixC.inputs['Factor'].default_value = 0.0
    mixC.inputs['Factor'].keyframe_insert('default_value', frame=0)
    mixC.inputs['Factor'].keyframe_insert('default_value', frame=CUE['shop_print'] - 12)
    mixC.inputs['Factor'].default_value = 1.0
    mixC.inputs['Factor'].keyframe_insert('default_value', frame=CUE['shop_print'] - 9)
    cardC = credit_card('cardC')
    cardC.parent = bodyC
    cardC.location = (0, -0.1088, -0.006)
    cardC.rotation_euler = (0, 0, math.radians(-90))
    rcC = sheet('rcpt_may', 'pos_may', (0, 0), wave=0.0, curl=0, rough=0.55, cuts=30)
    rcC.parent = bodyC
    rcC.rotation_euler = (math.radians(0), 0, 0)
    # the slip feeds out of the printer mouth (+Y of the tilted body)
    hC = rcC['h']
    key_loc(rcC, 0, (0, 0.0862 - hC / 2 + 0.002, 0.004), 'CONSTANT')
    key_loc(rcC, CUE['shop_print'], (0, 0.0862 - hC / 2 + 0.002, 0.004), 'LINEAR')
    key_loc(rcC, CUE['shop_print'] + 30, (0, 0.0862 + hC / 2 - 0.004, 0.004))
    plantC = import_gltf('potted_plant_01', (3.32, 0.42, 0), 30, 1.0)

    # ================= SET F (x=4.6): small shop, 4 June  [S7]
    termF, bodyF, mixF = terminal('termF', ['term_idle', 'term_jun'])
    termF.location = (4.6, 0.08, 0)
    termF.rotation_euler = (0, 0, math.radians(-6))
    mixF.inputs['Factor'].default_value = 0.0
    mixF.inputs['Factor'].keyframe_insert('default_value', frame=0)
    mixF.inputs['Factor'].keyframe_insert('default_value', frame=CUE['new_print'] - 14)
    mixF.inputs['Factor'].default_value = 1.0
    mixF.inputs['Factor'].keyframe_insert('default_value', frame=CUE['new_print'] - 11)
    cardF = credit_card('cardF')
    cardF.parent = bodyF
    cardF.location = (0, -0.1088, -0.006)
    cardF.rotation_euler = (0, 0, math.radians(-90))
    rcF = sheet('rcpt_jun', 'pos_jun', (0, 0), wave=0.0, curl=0, rough=0.55, cuts=30)
    rcF.parent = bodyF
    hF = rcF['h']
    key_loc(rcF, 0, (0, 0.0862 - hF / 2 + 0.002, 0.004), 'CONSTANT')
    key_loc(rcF, CUE['new_print'] - 8, (0, 0.0862 - hF / 2 + 0.002, 0.004), 'LINEAR')
    key_loc(rcF, CUE['new_print'] + 18, (0, 0.0862 + hF / 2 - 0.004, 0.004))
    shelfF = import_gltf('office_notepads', (4.88, 0.34, 0), -20, 1.0)
    plantF = import_gltf('potted_plant_01', (4.3, 0.5, 0), 140, 0.9)

    # ================= SET D (x=1.45): desk planner (May | June) + stickies + highlighters  [S3b–S5, S7b]
    cal = sheet('calendar', 'calendar', (1.45, 0.05), rz=0, wave=0.0004, rough=0.82, cuts=30)
    cells = LAY['calendar']['cells']
    sticky = sheet('sticky_50k', 'sticky_50k', (0, 0), rz=-4, lift=0.0004, wave=0.0002, rough=0.7)
    sticky.location = on(cal, 70, 205 + 30, 0.0006)  # under May, on the desk edge of the planner
    # payment slip and ₹49,000 card arrive under June at 1 June / మిగిలిన బాకీ
    slipD = sheet('slip_D', 'pay_slip', (0, 0), rz=0, lift=0.0008, curl=-3, rough=0.6)
    card49 = sheet('card_49k', 'card_49k', (0, 0), rz=0, lift=0.0014, wave=0.0002, rough=0.75)
    sp = on(cal, 252, 268, 0.0010)
    key_loc(slipD, 0, sp + V(0.0, -0.32, 0), 'CONSTANT')
    key_loc(slipD, CUE['pay_in'] + 2, sp + V(0.0, -0.25, 0))
    key_loc(slipD, CUE['pay_in'] + 18, sp)
    key_rot(slipD, CUE['pay_in'] + 2, (0, 0, 12))
    key_rot(slipD, CUE['pay_in'] + 20, (0, 0, 4))
    cp = on(cal, 332, 264, 0.0016)
    key_loc(card49, 0, cp + V(0.3, -0.06, 0), 'CONSTANT')
    key_loc(card49, CUE['bal49'] - 12, cp + V(0.26, -0.06, 0))
    key_loc(card49, CUE['bal49'] + 4, cp)
    key_rot(card49, CUE['bal49'] - 12, (0, 0, -16))
    key_rot(card49, CUE['bal49'] + 6, (0, 0, -6))

    # highlighter lanes (one stroke per week row)
    def lane(prefix, segs, color, ytop, hgt, density=0.6):
        objs = []
        for i, (a, b, fa, fb) in enumerate(segs):
            ca, cb = cells[a], cells[b]
            x0, x1 = ca[0] + 1.2, cb[2] - 1.2
            y0 = ca[1] + ytop
            ob = plane(f'{prefix}{i}', (x1 - x0) * MM, hgt * MM, mat_wipe(f'm_{prefix}{i}', color, density), 0)
            ob.parent = cal
            ob.location = ((x0 + x1) / 2 * MM - cal['w'] / 2, cal['h'] / 2 - (y0 + hgt / 2) * MM, 0.0005)
            ob.rotation_euler = (0, 0, math.radians(0.5 - i * 0.35))
            key_prop(ob, 'p', 0, 0.0)
            key_prop(ob, 'p', fa, 0.0)
            key_prop(ob, 'p', fb, 1.01)
            objs.append((ob, x0, x1, y0 + hgt / 2, fa, fb))
        return objs

    Y1 = (1.0, 0.70, 0.0, 1)
    A1 = (1.0, 0.38, 0.0, 1)
    d7, s4a = CUE['date7'], CUT['s4']
    yellow = lane('hlY', [
        ('MAY7', 'MAY10', d7, d7 + 48),
        ('MAY11', 'MAY17', s4a + 6, s4a + 30),
        ('MAY18', 'MAY24', s4a + 38, s4a + 62),
        ('MAY25', 'MAY31', s4a + 70, s4a + 96),
        ('JUN1', 'JUN7', CUT['s5'] + 22, CUT['s5'] + 60),
        ('JUN8', 'JUN12', CUT['s5'] + 70, CUT['s5'] + 104),
    ], Y1, 19.5, 6.0, 1.0)
    d4 = CUE['date4']
    amber = lane('hlA', [
        ('JUN4', 'JUN7', d4, d4 + 30),
        ('JUN8', 'JUN12', d4 + 38, d4 + 62),
    ], A1, 12.0, 6.0, 1.0)

    PARK = V(0, 0, 3.0)

    def drive(hi, strokes):
        """pen tip follows each stroke's wipe; lifts between rows; glides out of frame after the last"""
        key_loc(hi, 0, PARK, 'CONSTANT')
        for i, (ob, x0, x1, yc, fa, fb) in enumerate(strokes):
            s, e = on(cal, x0, yc, 0.0008), on(cal, x1, yc, 0.0008)
            if i == 0:
                key_loc(hi, fa - 10, s + V(0.12, -0.16, 0.10), 'BEZIER')
            key_loc(hi, fa - 8 if i else fa - 3, s + V(-0.004, -0.006, 0.010))
            key_loc(hi, fa, s)
            key_loc(hi, fb, e)
            key_loc(hi, fb + 6, e + V(0.006, -0.008, 0.012))
        last = strokes[-1]
        out = on(cal, last[2], last[3]) + V(0.15, -0.2, 0.12)
        key_loc(hi, last[5] + 24, out, 'CONSTANT')
        key_loc(hi, last[5] + 25, PARK, 'CONSTANT')

    hiY = pen('hiY', body=(1.0, 0.85, 0.2, 1), length=0.12, r=0.0062, kind='hi', cap=(1.0, 0.83, 0.25, 1))
    hiY.rotation_euler = (math.radians(-46), 0, math.radians(-30))
    drive(hiY, yellow)
    hiO = pen('hiO', body=(1.0, 0.55, 0.12, 1), length=0.12, r=0.0062, kind='hi', cap=(1.0, 0.55, 0.12, 1))
    hiO.rotation_euler = (math.radians(-46), 0, math.radians(-30))
    drive(hiO, amber)

    # ================= SET E (x=-0.75): home desk — unpaid statement, card, notebook, pen, phone  [S7a, S8, S9]
    stE = sheet('stmt_may_E', 'stmt_may', (-0.75, 0.02), rz=-4, texname='stmt_may')
    cardE = credit_card('cardE')
    # S7a: card lies on the statement; S8: card beside it (it went to the shop and came back)
    key_loc(cardE, 0, on(stE, 150, 200, 0.0012), 'CONSTANT')
    cardE.rotation_euler = (0, 0, math.radians(14))
    key_loc(cardE, CUT['s8'], on(stE, 236, 120, 0.0004) + V(0, 0, -0.0002), 'CONSTANT')
    nbm = mat_image('m_notebook', os.path.join(TEX, 'notebook.png'), rough=0.8, bump=0.1)
    nb = rounded_slab('notebook', 0.148, 0.21, 0.012, 0.004, nbm)
    nb.location = (-0.71, 0.27, 0.012)
    nb.rotation_euler = (0, 0, math.radians(6))
    nb.data.materials.append(mat_basic('m_nb_edge', (0.88, 0.86, 0.8, 1), 0.85))
    for p in nb.data.polygons:
        p.material_index = 0 if p.normal.z > 0.9 else 1
    penE = pen('penE')
    penE.location = (-0.74, 0.25, 0.0185)
    penE.rotation_euler = (math.radians(90), 0, math.radians(112))
    # phone
    glass = bpy.data.materials.new('m_phone_screen')
    glass.use_nodes = True
    nt = glass.node_tree
    b = nt.nodes['Principled BSDF']
    t1 = nt.nodes.new('ShaderNodeTexImage')
    t1.image = img(os.path.join(TEX, 'phone_lock.png'))
    t2 = nt.nodes.new('ShaderNodeTexImage')
    t2.image = img(os.path.join(TEX, 'phone_video.png'))
    mx = nt.nodes.new('ShaderNodeMix')
    mx.data_type = 'RGBA'
    nt.links.new(t1.outputs['Color'], mx.inputs['A'])
    nt.links.new(t2.outputs['Color'], mx.inputs['B'])
    br = nt.nodes.new('ShaderNodeMath')
    br.operation = 'MULTIPLY'
    br.inputs[0].default_value = 0.0
    br.name = 'wake'
    nt.links.new(mx.outputs['Result'], b.inputs['Emission Color'])
    nt.links.new(br.outputs[0], b.inputs['Emission Strength'])
    br.inputs[1].default_value = 1.0
    b.inputs['Base Color'].default_value = (0.004, 0.004, 0.005, 1)
    b.inputs['Roughness'].default_value = 0.04
    b.inputs['Coat Weight'].default_value = 1.0
    for f, v in [(0, 0.0), (CUE['phone_wake'], 0.0), (CUE['phone_wake'] + 5, 1.7)]:
        br.inputs[0].default_value = v
        br.inputs[0].keyframe_insert('default_value', frame=f)
    for f, v in [(0, 0.0), (CUT['s9'], 0.0), (CUT['s9'] + 1, 1.0)]:
        mx.inputs['Factor'].default_value = v
        mx.inputs['Factor'].keyframe_insert('default_value', frame=f)
    for fc in nt.animation_data.action.fcurves:
        for kp in fc.keyframe_points:
            kp.interpolation = 'LINEAR'
    phone_body = rounded_slab('phone', 0.0745, 0.158, 0.0082, 0.0095, mat_basic('m_phone_frame', (0.06, 0.065, 0.075, 1), 0.3, 0.8))
    phone_body.location = (-0.56, 0.235, 0.0082)
    phone_body.rotation_euler = (0, 0, math.radians(-7))
    scr = rounded_slab('phone_screen', 0.070, 0.152, 0.0002, 0.0078, glass)
    scr.parent = phone_body
    scr.location = (0, 0, 0.0002)
    phone_body['scr'] = 1
    glasses = import_gltf('round_spectacles', (-1.0, 0.42, 0), 160, 1.0)

    # ================================================================ cameras / shots
    # S1 — macro on the June statement: slip (near, bottom) vs. the interest line (far, top).
    c, t, f = camera('cam_s1', CUT['s1'], CUT['s2'], lens=36, fstop=1.6)
    intp = mark_center(stA, 'jun_int', 26)
    slp = on(slipA, 37, 50)
    mid1 = intp * 0.5 + slp * 0.5
    eye = mid1 + V(0.02, -0.20, 0.17)
    cam_keys(c, t, f, [
        (0, eye, mid1, intp, None),
        (CUE['min_paid'] + 4, eye, mid1, intp, None),
        (CUE['min_paid'] + 26, eye + V(0, 0.008, -0.006), mid1 + V(0, -0.004, 0), slp, None),
        (CUE['int_q'] - 6, eye + V(0, 0.014, -0.010), mid1 + V(0, -0.006, 0), slp, None),
        (CUE['int_q'] + 14, eye + V(0, 0.022, -0.016), mid1 + V(0, 0.006, 0), intp, None),
        (CUT['s2'] - 1, eye + V(0, 0.045, -0.034), mid1 + V(0, 0.016, 0), intp, None),
    ])
    # S2 — top-down on the May statement summary; slip slides in under it
    c, t, f = camera('cam_s2', CUT['s2'], CUT['s3'], lens=30, fstop=4.0)
    tot = mark_center(stB, 'may_total_box')
    mn = mark_center(stB, 'may_min_box')
    mid = (tot + mn) / 2 + V(0, -0.03, 0)
    cam_keys(c, t, f, [
        (CUT['s2'], tot + V(0.0, -0.13, 0.30), tot + V(0, -0.02, 0), tot, None),
        (CUE['min_only'] - 12, tot + V(0.006, -0.125, 0.29), tot + V(0.006, -0.022, 0), tot, None),
        (CUE['min_only'] + 10, mn + V(-0.01, -0.14, 0.28), mn + V(-0.01, -0.045, 0), mn, None),
        (CUT['s3'] - 1, mn + V(-0.006, -0.135, 0.27), mn + V(-0.006, -0.048, 0), mn + V(0, -0.03, 0), None),
    ])
    # S3a — checkout: terminal approves, the 7 May slip feeds out
    c, t, f = camera('cam_s3a', CUT['s3'], CUT['s3cal'], lens=65, fstop=2.8)
    bpy.context.view_layer.update()
    scr_w = bodyC.matrix_world @ Vector((0, 0.03, 0.017))
    rc_w = bodyC.matrix_world @ Vector((0, 0.12, 0.03))
    cam_keys(c, t, f, [
        (CUT['s3'], scr_w + V(0.05, -0.30, 0.20), scr_w + V(0, 0.02, 0), scr_w, None),
        (CUE['shop_print'] + 6, scr_w + V(0.04, -0.28, 0.21), scr_w + V(0, 0.04, 0.01), scr_w, None),
        (CUT['s3cal'] - 1, scr_w + V(0.03, -0.25, 0.23), rc_w + V(0, -0.02, 0), rc_w, None),
    ])
    # S3b–S4 — the planner: 7 May mark starts on నుంచే, then rows sweep toward 1 June
    c, t, f = camera('cam_s3b', CUT['s3cal'], CUT['s5'], lens=55, fstop=4.0)
    m7 = on(cal, *[(cells['MAY7'][0] + cells['MAY7'][2]) / 2, (cells['MAY7'][1] + cells['MAY7'][3]) / 2])
    m24 = on(cal, (cells['MAY21'][0] + cells['MAY21'][2]) / 2, (cells['MAY21'][1] + cells['MAY21'][3]) / 2)
    cam_keys(c, t, f, [
        (CUT['s3cal'], m7 + V(0.0, -0.20, 0.25), m7, m7, None),
        (CUT['s4'] - 4, m7 + V(-0.005, -0.19, 0.235), m7 + V(0.005, -0.004, 0), m7, None),
        (CUT['s4'] + 40, m24 + V(-0.03, -0.30, 0.36), m24 + V(-0.02, -0.01, 0), m24, None),
        (CUT['s5'] - 1, m24 + V(0.0, -0.32, 0.38), m24 + V(0.01, -0.02, 0), m24, None),
    ])
    # S5 — June: slip lands on 1 June side, ₹49,000 card, highlight continues
    c, t, f = camera('cam_s5', CUT['s5'], CUT['s6'], lens=40, fstop=4.0)
    j1 = on(cal, (cells['JUN8'][0] + cells['JUN12'][2]) / 2, cells['JUN8'][1])
    low = (sp + cp) / 2
    aim = (j1 + low) / 2
    cam_keys(c, t, f, [
        (CUT['s5'], aim + V(0.0, -0.28, 0.40), aim + V(0, 0.01, 0), aim, None),
        (CUE['bal49'], aim + V(0.01, -0.27, 0.38), aim, aim, None),
        (CUT['s6'] - 1, aim + V(0.02, -0.25, 0.35), aim + V(0.005, 0.01, 0), aim, None),
    ])
    # S6 — low macro across the June statement: payment row → late fee ₹0 → interest (rack)
    c, t, f = camera('cam_s6', CUT['s6'], CUT['s7'], lens=30, fstop=2.2)
    rp = mark_center(stA, 'jun_pay', 14)
    rl = mark_center(stA, 'jun_late', 14)
    ri = mark_center(stA, 'jun_int', 14)
    eye6 = rl + V(0.012, -0.205, 0.20)
    cam_keys(c, t, f, [
        (CUT['s6'], eye6 + V(0, -0.01, 0.006), rp, rp, None),
        (CUE['late'] - 30, eye6, (rp + rl) / 2, rl, None),
        (CUE['late'] + 30, eye6 + V(0, 0.01, -0.003), rl + V(0, 0.002, 0), rl, None),
        (CUE['int_on'] + 2, eye6 + V(0, 0.012, -0.004), (rl + ri) / 2, rl, None),
        (CUE['int_on'] + 18, eye6 + V(0, 0.016, -0.006), ri + V(0, 0.004, 0), ri, None),
        (CUT['s7'] - 1, eye6 + V(0, 0.03, -0.01), ri + V(0, 0.004, 0), ri, None),
    ])
    # S7a — the earlier unpaid statement still on the desk, card on it
    c, t, f = camera('cam_s7a', CUT['s7'], CUT['s7shop'], lens=55, fstop=3.2)
    te = mark_center(stE, 'may_total_box')
    ce = on(stE, 150, 200)
    a7 = (te + ce) / 2
    cam_keys(c, t, f, [
        (CUT['s7'], a7 + V(0.03, -0.24, 0.30), a7, te, None),
        (CUT['s7shop'] - 1, a7 + V(0.03, -0.22, 0.27), a7 + V(0, -0.01, 0), ce, None),
    ])
    # S7b — small shop: same card, new receipt dated 4 June
    c, t, f = camera('cam_s7b', CUT['s7shop'], CUT['s7cal'], lens=65, fstop=2.8)
    bpy.context.view_layer.update()
    scr_f = bodyF.matrix_world @ Vector((0, 0.03, 0.017))
    rc_f = bodyF.matrix_world @ Vector((0, 0.13, 0.035))
    cam_keys(c, t, f, [
        (CUT['s7shop'], scr_f + V(-0.05, -0.30, 0.19), scr_f + V(0, -0.01, 0), scr_f + V(0, -0.06, 0), None),
        (CUE['new_print'] - 16, scr_f + V(-0.045, -0.29, 0.20), scr_f, scr_f, None),
        (CUE['new_print'] + 10, scr_f + V(-0.035, -0.26, 0.22), rc_f + V(0, -0.03, 0), rc_f, None),
        (CUT['s7cal'] - 1, scr_f + V(-0.03, -0.24, 0.235), rc_f + V(0, -0.025, 0), rc_f, None),
    ])
    # S7c — planner June: a second, separate mark from 4 June
    c, t, f = camera('cam_s7c', CUT['s7cal'], CUT['s8'], lens=55, fstop=4.5)
    j4 = on(cal, (cells['JUN4'][0] + cells['JUN11'][2]) / 2, (cells['JUN4'][1] + cells['JUN11'][3]) / 2)
    cam_keys(c, t, f, [
        (CUT['s7cal'], j4 + V(0.0, -0.22, 0.28), j4, j4, None),
        (CUT['s8'] - 1, j4 + V(0.0, -0.19, 0.24), j4 + V(0, 0.004, 0), j4, None),
    ])
    # S8 — home desk: card beside the unpaid statement, notebook, phone wakes; one rack focus
    c, t, f = camera('cam_s8', CUT['s8'], CUT['s9'], lens=36, fstop=2.2)
    cardp = on(stE, 236, 120)
    php = phone_body.location.copy()
    a8 = (cardp + php) / 2 + V(-0.075, -0.03, 0)
    cam_keys(c, t, f, [
        (CUT['s8'], a8 + V(0.02, -0.40, 0.42), a8, cardp, None),
        (CUE['phone_wake'] - 14, a8 + V(0.02, -0.375, 0.40), a8, cardp, None),
        (CUE['phone_wake'] + 10, a8 + V(0.02, -0.355, 0.38), a8 + V(0.01, 0.01, 0), php, None),
        (CUT['s9'] - 1, a8 + V(0.02, -0.34, 0.36), a8 + V(0.015, 0.015, 0), php, None),
    ])
    # S9 — phone close-up, slow push, hold
    c, t, f = camera('cam_s9', CUT['s9'], CUT['end'], lens=50, fstop=4.0)
    bpy.context.view_layer.update()
    pw = phone_body.matrix_world @ Vector((0, 0.012, 0.0084))
    up = phone_body.matrix_world.to_3x3() @ Vector((0, 1, 0))
    cam_keys(c, t, f, [
        (CUT['s9'], pw + V(0, 0, 0.30) - up * 0.035, pw, pw, None),
        (CUT['end'] - 30, pw + V(0, 0, 0.255) - up * 0.03, pw, pw, None),
        (CUT['end'] - 1, pw + V(0, 0, 0.250) - up * 0.03, pw, pw, None),
    ])
    # top-down S9 camera: make the image 'up' follow the phone's long axis
    c.constraints[0].up_axis = 'UP_Y'

    # timeline markers bind cameras (also used by the render loop)
    for f0, f1, cam in CAMS:
        m = sc.timeline_markers.new(cam.name, frame=f0)
        m.camera = cam
    sc.camera = CAMS[0][2]
    json.dump([[f0, f1, cam.name] for f0, f1, cam in CAMS], open(os.path.join(HERE, 'build', 'cams.json'), 'w'))
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'build', 'short01.blend'))
    print('saved short01.blend')


if __name__ == '__main__':
    build()
