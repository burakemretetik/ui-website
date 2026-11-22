"""public/data/yayinlar.json üretir (yayın analizi 2000–2025, dört InCites grubu).

Kullanım: python3 scripts/yayin/build_yayinlar.py <2000-2025.xlsx> public/data/yayinlar.json

Yayının sabit bilgileri (başlık, dergi, yıl, belge türü, kodlar, işbirliği türü) bir kez yazılır;
grup başına yalnız grubun kendi InCites değerleri tutulur: [yayın sırası, Times Cited, CNCI, Percentile].
Kodlar ve normalleştirme yayin_analiz.py ile aynıdır (Drive'daki analizle birebir).
"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pandas as pd
import yayin_analiz as Y

src, out = sys.argv[1], sys.argv[2]
G = Y.yukle(src)
KONUM = {'merkez': 'merkez', 'yarı merkez': 'yari_merkez', 'taşra': 'tasra', 'yurt dışı': 'yurt_disi'}
TUR = {'devlet': 'devlet', 'vakıf': 'vakif', 'yurt dışı': 'yurt_disi'}

allp = pd.concat([g for g in G.values()]).drop_duplicates('wos').sort_values(['year', 'wos']).reset_index(drop=True)
journals = sorted(allp['source'].dropna().astype(str).unique())
doctypes = list(allp['doc_type'].value_counts().index)
collabs = list(allp['collab'].value_counts().index)
jx = {j: i for i, j in enumerate(journals)}; dx = {d: i for i, d in enumerate(doctypes)}; cx = {c: i for i, c in enumerate(collabs)}
idx = {w: i for i, w in enumerate(allp['wos'])}

pubs = []
for r in allp.itertuples(index=False):
    p = {'t': str(r.title), 'j': jx.get(str(r.source), -1), 'y': int(r.year) if pd.notna(r.year) else None,
         'd': dx[r.doc_type], 'c': cx[r.collab]}
    if r.konum: p['k'] = [KONUM[k] for k in r.konum]
    if r.tur: p['u'] = [TUR[k] for k in r.tur]
    if r.konu: p['tc'] = r.konu
    if r.bolge: p['rc'] = r.bolge
    pubs.append(p)

def val(v, nd):
    return None if pd.isna(v) else (int(v) if nd == 0 else round(float(v), nd))

groups = {}
for _, k, label in Y.GROUPS:
    groups[k] = [[idx[r.wos], val(r.tc, 0), val(r.cnci, 12), val(r.pct, 2)] for r in G[k].itertuples(index=False)]

data = {
    'meta': {
        'kaynak': "InCites dışa aktarımı (Elif Hoca, 2000-2025.xlsx); kodlar 'remove duplicate tümü' sayfasından Accession Number ile aktarıldı.",
        'tarih': '2026-11-22',
        'gruplar': [{'id': k, 'ad': label} for _, k, label in Y.GROUPS],
        'etki_belge_turleri': list(Y.RESEARCH),
    },
    'dergiler': journals, 'belge_turleri': doctypes, 'isbirligi': collabs,
    'yayinlar': pubs, 'gruplar': groups,
}
with open(out, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
print(len(pubs), 'yayın;', {k: len(v) for k, v in groups.items()}, ';', round(os.path.getsize(out) / 1e6, 2), 'MB')
