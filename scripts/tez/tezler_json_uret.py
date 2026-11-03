"""
Tezler sayfasının verisini (public/data/tezler.json) üretir.

Kullanım:
    python scripts/tez/tezler_json_uret.py "TEZ_VERISI (YL ve Doktora).xlsx"

Kaynak: Drive › Analizler › Tez & Akademisyen › TEZ_VERISI (YL ve Doktora).xlsx
(20 MB, yazar adı ve özet içerdiği için repoya konmaz.)

Konu (K1–K17) ve bölge (B1–B16) etiketleri, tez konu-bölge analiziyle AYNI
kuralla atanır: tez_konu_bolge_analizi.py içindeki sözlükler ve puanlama
(başlık 10 p, Türkçe özet her geçiş 1 p, eşik 3 p). Böylece site ile Drive'daki
analiz raporu birebir aynı sayıları verir.

Siteye yalnızca analiz için gereken alanlar yazılır (yazar, başlık, özet yok).
"""
import json
import os
import re
import sys

import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tez_konu_bolge_analizi as analiz  # noqa: E402

KONUM = {'MERKEZ': 'merkez', 'YARI MERKEZ': 'yari_merkez', 'TAŞRA': 'tasra'}
KURUM = {'DEVLET': 'devlet', 'ÖZEL': 'vakif', 'VAKIF': 'vakif'}
CIKTI = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'data', 'tezler.json')


def kodlar(etiketler):
    """'K3. Güvenlik' → 'K3'"""
    return [re.match(r'([BK]\d+)', e).group(1) for e in etiketler]


def main(kaynak):
    df = pd.read_excel(kaynak)
    kayitlar = []
    for _, r in df.iterrows():
        kayitlar.append({
            'year': int(r['Yıl']),
            'tez_turu': r['Tez Türü'],
            'universite': r['Üniversite_Temiz'] if pd.notna(r['Üniversite_Temiz']) else None,
            'konum': KONUM.get(r['Konum_Turu'], 'bilinmiyor'),
            'kurum_turu': KURUM.get(r['Kurum_Turu'], 'bilinmiyor'),
            'topic_codes': kodlar(analiz.puanla_ve_etiketle(r['Başlık'], r['ÖzetTR'], analiz.KONU_SOZLUGU)),
            'region_codes': kodlar(analiz.puanla_ve_etiketle(r['Başlık'], r['ÖzetTR'], analiz.BOLGE_SOZLUGU)),
        })
    with open(CIKTI, 'w', encoding='utf-8') as f:
        json.dump(kayitlar, f, ensure_ascii=False, separators=(',', ':'))
    print(f'{len(kayitlar)} tez yazıldı → {os.path.normpath(CIKTI)}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
