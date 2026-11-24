"""public/data/mufredat.json içindeki AKTS değerlerini kaynak Excel'den yeniler.

Kullanım: python3 scripts/mufredat/akts_guncelle.py public/data_admin/mufredat.xlsx

JSON kayıtları 'ders müfredatları' sayfasıyla aynı sıradadır (üniversite ve ders adı satır satır
kontrol edilir). Yalnız 'akts' alanı değişir; sayı olmayan hücreler ("." / "-") null olur.
"""
import json, sys
import pandas as pd

JSON = 'public/data/mufredat.json'
src = sys.argv[1]
d = pd.read_excel(src, sheet_name='ders müfredatları')
kayit = json.load(open(JSON, encoding='utf-8'))
assert len(kayit) == len(d), 'satır sayısı farklı'
akts = pd.to_numeric(d['AKTS'], errors='coerce')
assert not (akts > 1000).any(), 'tarihe dönmüş AKTS hücresi var'
degisen = 0
for k, (_, r), a in zip(kayit, d.iterrows(), akts):
    assert k['universite'] == str(r['Üniversite adı']).strip() and k['ders_adi'] == str(r['Dersin adı']).strip(), 'sıra uyuşmuyor'
    yeni = None if pd.isna(a) else float(a)
    if k['akts'] != yeni:
        k['akts'] = yeni; degisen += 1
json.dump(kayit, open(JSON, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'{degisen} kaydın AKTS değeri güncellendi')
