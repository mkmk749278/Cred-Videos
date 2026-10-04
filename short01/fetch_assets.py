import json,urllib.request,os
UA={'User-Agent':'Mozilla/5.0 cred-videos-asset-fetch'}
def get(url): return urllib.request.urlopen(urllib.request.Request(url,headers=UA)).read()
def files(a): return json.loads(get(f"https://api.polyhaven.com/files/{a}"))
def dl(url,path):
    os.makedirs(os.path.dirname(path) or '.',exist_ok=True)
    if not os.path.exists(path): open(path,'wb').write(get(url))
    print(path, os.path.getsize(path))
for h in ['lythwood_room','comfy_cafe','phone_shop','hotel_room']:
    f=files(h); dl(f['hdri']['2k']['hdr']['url'],f'hdri/{h}_2k.hdr')
for t in ['wood_table_001','oak_veneer_01','granite_tile','marble_01']:
    f=files(t)
    for k,key in [('Diffuse','diff'),('Rough','rough'),('nor_gl','nor_gl')]:
        if k in f: dl(f[k]['2k']['jpg']['url'],f'tex/{t}_{key}_2k.jpg')
for m in ['office_notepads','stationery_supplies','potted_plant_01','binder_notebook','CashRegister_01','round_spectacles']:
    f=files(m)
    g=f['gltf']['1k']['gltf']
    dl(g['url'],f'models/{m}/{m}.gltf')
    for rel,inc in g.get('include',{}).items(): dl(inc['url'],f'models/{m}/{rel}')
