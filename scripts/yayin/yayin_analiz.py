"""TÜBİTAK 1001 – Yayın analizi 2000–2025 (dört InCites grubu).

Girdi: Elif Hoca'nın 2000-2025.xlsx dosyası.
1) 'remove duplicate tümü' sayfasındaki kodlar (konu, bölge, kurum konumu, kurum türü)
   Accession Number ile son dört sayfaya aktarılır.
2) Kodlar normalleştirilir (bkz. KARARLAR).
3) Her grup ayrı analiz edilir; atıf göstergeleri her grubun kendi sayfasından alınır.

Kararlar (22.11.2026):
- Sayımlar (yayın, kurum, konu, bölge) tüm belge türleriyle; atıf, CNCI, JNCI ve
  'en çok atıf alan %10' yalnız Article + Review ile (InCites önerisi).
- '-----', '----' (bölge) ve '—' (konu) kodlanmamış sayılır.
- Kurum konumu/türü, konu ve bölge: bir yayın her kategoride en fazla bir kez sayılır.
"""
import re
import numpy as np
import pandas as pd

MASTER_SHEET = 'remove duplicate tümü'
GROUPS = [  # (sayfa adı, kısa kod, etiket)
    ('esci dahil ir', 'ir_esci', 'Uluslararası İlişkiler – ESCI dahil'),
    ('dahil değil ir', 'ir_ssci', 'Uluslararası İlişkiler – ESCI hariç (yalnız SSCI)'),
    ('esci dahil po', 'sb_esci', 'Siyaset Bilimi – ESCI dahil'),
    ('dahil deil po', 'sb_ssci', 'Siyaset Bilimi – ESCI hariç (yalnız SSCI)'),
]
TOPIC = {'K1': 'Teori', 'K2': 'Dış Politika', 'K3': 'Güvenlik', 'K4': 'Çevre ve Enerji', 'K5': 'Uluslararası Göç',
         'K6': 'Toplumsal Cinsiyet', 'K7': 'Barış Çalışmaları', 'K8': 'Terör', 'K9': 'Uluslararası Hukuk',
         'K10': 'Uluslararası Örgütler', 'K11': 'Dijitalleşme ve Medya', 'K12': 'Politik Ekonomi',
         'K13': 'Kimlik ve Milliyetçilik', 'K14': 'Normatif Çalışmalar', 'K15': 'Küreselleşme',
         'K16': 'Yöntem ve Disiplin', 'K17': 'Avrupa Birliği'}
REGION = {'B1': 'Kuzey Amerika', 'B2': 'Güney Amerika', 'B3': 'Batı Avrupa', 'B4': 'Merkez ve Doğu Avrupa',
          'B5': 'Balkanlar', 'B6': 'Asya', 'B7': 'Güney Pasifik', 'B8': 'Orta Doğu', 'B9': 'Kuzey Afrika',
          'B10': 'Güney Afrika', 'B11': 'Avrasya', 'B12': 'Uzak Doğu / Pasifik', 'B13': 'Karayipler',
          'B14': 'Kutuplar', 'B15': 'Rusya', 'B16': 'Türkiye'}
KONUM = ['merkez', 'yarı merkez', 'taşra', 'yurt dışı']
KONUM_LABEL = {'merkez': 'Merkez', 'yarı merkez': 'Yarı merkez', 'taşra': 'Taşra', 'yurt dışı': 'Yurt dışı'}
TUR = ['devlet', 'vakıf', 'yurt dışı']
TUR_LABEL = {'devlet': 'Devlet', 'vakıf': 'Vakıf', 'yurt dışı': 'Yurt dışı'}
PERIODS = ['2000–2004', '2005–2009', '2010–2014', '2015–2019', '2020–2025']
RESEARCH = ('Article', 'Review')  # etki göstergeleri için
ISBIRLIGI = {'Domestic - Single': 'Yurt içi – tek kurum', 'Domestic - Multiple': 'Yurt içi – birden çok kurum',
             'International - Bilateral': 'Uluslararası – iki ülke', 'International - Trilateral': 'Uluslararası – üç ülke',
             'International - Quadrilateral +': 'Uluslararası – dört ve daha çok ülke'}


def tr_upper(s):
    return str(s).replace('i', 'İ').replace('ı', 'I').upper()


def tr_lower(s):
    return str(s).replace('I', 'ı').replace('İ', 'i').lower().strip()


def kodlar(values, kind):
    """Konu (K1–K17) veya bölge (B1–B16) kodlarını çıkarır; 'k2-k3' gibi hücrelerde ikisini de alır."""
    pat = r'K([1-9]|1[0-7])' if kind == 'K' else r'B([1-9]|1[0-6])'
    out = []
    for v in values:
        if v is None or (isinstance(v, float) and np.isnan(v)):
            continue
        for part in re.split(r'[-–,;/ ]+', str(v).strip().upper()):
            if re.fullmatch(pat, part) and part not in out:
                out.append(part)
    return out


def konumlar(values):
    out = []
    for v in values:
        if v is None or (isinstance(v, float) and np.isnan(v)):
            continue
        s = tr_lower(v)
        k = None
        if s in ('yarı merkez', 'yarı merkz', 'yarı metkez'):
            k = 'yarı merkez'
        elif s == 'merkez':
            k = 'merkez'
        elif s == 'taşra':
            k = 'taşra'
        elif 'yurt' in s:
            k = 'yurt dışı'
        if k and k not in out:
            out.append(k)
    return out


def turler(values):
    out = []
    for v in values:
        if v is None or (isinstance(v, float) and np.isnan(v)):
            continue
        s = tr_lower(v)
        k = {'devlet': 'devlet', 'vakıf': 'vakıf', 'özel': 'vakıf'}.get(s)
        if k is None and 'yurt' in s:
            k = 'yurt dışı'
        if k and k not in out:
            out.append(k)
    return out


def donem(y):
    if pd.isna(y):
        return None
    y = int(y)
    if y < 2000 or y > 2025:
        return None
    return PERIODS[min((y - 2000) // 5, 4)]


def num(s):
    return pd.to_numeric(s, errors='coerce')


def yukle(path):
    """Dört grubu kodları aktarılmış ve normalleştirilmiş olarak döndürür."""
    book = pd.read_excel(path, sheet_name=None)
    msheet = next(k for k in book if k.strip() == MASTER_SHEET)
    m = book[msheet].dropna(how='all')
    mc = list(m.columns)
    m = m.assign(_k=m['Accession Number'].astype(str).str.strip().str.upper())
    assert m['_k'].is_unique, 'Kodlama sayfasında tekrar eden Accession Number var'
    code = m.set_index('_k')[mc[25:39]]
    code.columns = ['S1', 'S2', 'S3', 'S4', 'U1', 'U2', 'U3', 'T1', 'T2', 'A1', 'A2', 'A3', 'A4', 'A5']
    groups = {}
    for sheet, kod, label in GROUPS:
        d = book[sheet].dropna(how='all').copy()
        key = d['Accession Number'].astype(str).str.strip().str.upper()
        c = code.reindex(key)
        c.index = d.index
        out = pd.DataFrame({
            'wos': key, 'title': d['Article Title'], 'authors': d['Authors'], 'source': d['Source'],
            'doc_type': d['Document Type'].fillna('Belirtilmemiş').astype(str).str.strip(),
            'year': num(d['Publication Date'].astype(str).str[:4]),
            'tc': num(d['Times Cited']), 'cnci': num(d['Category Normalized Citation Impact']),
            'jnci': num(d['Journal Normalized Citation Impact']), 'pct': num(d['Percentile in Subject Area']),
            'jif': num(d['Journal Impact Factor']), 'collab': d['Collaboration Type'].fillna('Belirtilmemiş').astype(str).str.strip().map(lambda v: ISBIRLIGI.get(v, v)),
            'kodlandi': key.isin(code.index),
        })
        out['donem'] = out['year'].map(donem)
        out['arastirma'] = out['doc_type'].isin(RESEARCH)
        out['top10'] = out['pct'] >= 90
        out['konu'] = [kodlar(r, 'K') for r in c[['S1', 'S2', 'S3', 'S4']].itertuples(index=False)]
        out['bolge'] = [kodlar(r, 'B') for r in c[['A1', 'A2', 'A3', 'A4', 'A5']].itertuples(index=False)]
        out['konum'] = [konumlar(r) for r in c[['U1', 'U2', 'U3']].itertuples(index=False)]
        out['tur'] = [turler(r) for r in c[['T1', 'T2']].itertuples(index=False)]
        out['konum1'] = [konumlar([v])[0] if konumlar([v]) else None for v in c['U1']]
        out['tur1'] = [turler([v])[0] if turler([v]) else None for v in c['T1']]
        groups[kod] = out.reset_index(drop=True)
    return groups


# ── Analiz ──────────────────────────────────────────────────────────────

def etki(df):
    """Article+Review alt kümesi için etki göstergeleri."""
    a = df[df['arastirma']]
    n = len(a)
    if n == 0:
        return {'Makale+derleme': 0}
    return {
        'Makale+derleme': n,
        'Toplam atıf': int(a['tc'].sum()),
        'Ortalama atıf': round(a['tc'].mean(), 2),
        'Medyan atıf': round(a['tc'].median(), 1),
        'Hiç atıf almamış %': round(100 * (a['tc'] == 0).mean(), 1),
        'CNCI ortalama': round(a['cnci'].mean(), 3),
        'CNCI medyan': round(a['cnci'].median(), 3),
        'JNCI ortalama': round(a['jnci'].mean(), 3),
        'En çok atıf alan %10 içinde %': round(100 * a['top10'].mean(), 1),
        'Dergi etki faktörü medyan': round(a['jif'].median(), 2) if a['jif'].notna().any() else None,
    }


def uyelik(df, col, cats, labels=None):
    """Çoklu üyelikli sayım: her yayın her kategoride en fazla bir kez."""
    n = len(df)
    coded = df[col].map(bool)
    rows = []
    for c in cats:
        has = df[col].map(lambda v: c in v)
        rows.append({'Kod': c, 'Ad': (labels or {}).get(c, c), 'Yayın': int(has.sum()),
                     '% (tüm yayınlar)': round(100 * has.sum() / n, 1) if n else None,
                     '% (kodlu yayınlar)': round(100 * has.sum() / coded.sum(), 1) if coded.sum() else None})
    t = pd.DataFrame(rows)
    return t, int(coded.sum()), int(n - coded.sum())


def etki_kirilim(df, col, cats, labels=None):
    rows = []
    for c in cats:
        part = df[df[col].map(lambda v: c in v)]
        rows.append({'Kod': c, 'Ad': (labels or {}).get(c, c), 'Yayın (tüm türler)': len(part), **etki(part)})
    return pd.DataFrame(rows)


def capraz_pay(df, col, cats, by_col, by_cats, labels=None):
    """col kategorilerinin by_col grupları içindeki payı (%), her iki boyutta da çoklu üyelik."""
    rows = []
    for c in cats:
        row = {'Kod': c, 'Ad': (labels or {}).get(c, c)}
        for b in by_cats:
            part = df[df[by_col].map(lambda v: b in v) if isinstance(df[by_col].iloc[0] if len(df) else [], list) else df[by_col] == b]
            coded = part[col].map(bool).sum()
            k = part[col].map(lambda v: c in v).sum()
            row[f'{b} n'] = int(k)
            row[f'{b} %'] = round(100 * k / coded, 1) if coded else None
        rows.append(row)
    return pd.DataFrame(rows)


def analiz(df):
    T = {}
    n = len(df)
    ar = df[df['arastirma']]
    yy = df[df['year'].between(2000, 2025)]
    T['Yıllar'] = (yy.groupby('year').agg(**{'Tüm yayınlar': ('wos', 'size'), 'Makale+derleme': ('arastirma', 'sum')})
                   .reset_index().rename(columns={'year': 'Yıl'}).astype(int))
    dn = df.groupby('donem').agg(**{'Tüm yayınlar': ('wos', 'size'), 'Makale+derleme': ('arastirma', 'sum')}).reindex(PERIODS).reset_index().rename(columns={'donem': 'Dönem'})
    T['Dönemler'] = dn
    bt = df['doc_type'].value_counts().rename_axis('Belge türü').reset_index(name='Yayın')
    bt['%'] = (100 * bt['Yayın'] / n).round(1)
    bt['Etki analizine dahil'] = bt['Belge türü'].isin(RESEARCH).map({True: 'evet', False: 'hayır'})
    T['Belge türleri'] = bt
    src = df.groupby('source').agg(Yayın=('wos', 'size')).sort_values('Yayın', ascending=False).head(25)
    src = src.join(ar.groupby('source').agg(**{'Makale+derleme': ('wos', 'size'), 'CNCI ortalama': ('cnci', 'mean'), 'Ortalama atıf': ('tc', 'mean')}))
    T['Dergiler (ilk 25)'] = src.round(3).reset_index().rename(columns={'source': 'Dergi'})

    kapsam = []
    for col, ad in [('konu', 'Konu (K1–K17)'), ('bolge', 'Bölge (B1–B16)'), ('konum', 'Kurum konumu'), ('tur', 'Kurum türü')]:
        coded = df[col].map(bool)
        kapsam.append({'Kod': ad, 'Kodlu yayın': int(coded.sum()), 'Kodsuz yayın': int((~coded).sum()),
                       'Kodlu %': round(100 * coded.mean(), 1),
                       'Kodlu makale+derleme %': round(100 * ar[col].map(bool).mean(), 1) if len(ar) else None})
    kapsam.append({'Kod': 'Kodlama sayfasında yok', 'Kodlu yayın': None, 'Kodsuz yayın': int((~df['kodlandi']).sum())})
    T['Kod kapsamı'] = pd.DataFrame(kapsam)

    T['Konum'], *_ = uyelik(df, 'konum', KONUM, KONUM_LABEL)
    T['Kurum türü'], *_ = uyelik(df, 'tur', TUR, TUR_LABEL)
    k1 = df[df['konum1'].notna() & df['tur1'].notna()]
    T['İlk kurum konum×tür'] = pd.crosstab(k1['konum1'].map(KONUM_LABEL), k1['tur1'].map(TUR_LABEL), margins=True, margins_name='Toplam').reset_index().rename(columns={'konum1': 'İlk kurumun konumu'})
    T['Konum × dönem'] = capraz_pay(df, 'konum', KONUM, 'donem', PERIODS, KONUM_LABEL)
    tr = df[df['konum'].map(lambda v: any(k in v for k in ('merkez', 'yarı merkez', 'taşra')))]
    yd = tr['konum'].map(lambda v: 'yurt dışı' in v)
    T['Yurt dışı ortaklık'] = pd.DataFrame([{'Türkiye kurumlu yayın': len(tr), 'Yurt dışı kurumla ortak': int(yd.sum()),
                                             'Ortak %': round(100 * yd.mean(), 1) if len(tr) else None}])
    T['Konu'], *_ = uyelik(df, 'konu', list(TOPIC), TOPIC)
    T['Bölge'], *_ = uyelik(df, 'bolge', list(REGION), REGION)
    T['Konu'] = T['Konu'].sort_values('Yayın', ascending=False)
    T['Bölge'] = T['Bölge'].sort_values('Yayın', ascending=False)
    T['Konu × konum'] = capraz_pay(df, 'konu', list(TOPIC), 'konum', KONUM, TOPIC)
    T['Bölge × konum'] = capraz_pay(df, 'bolge', list(REGION), 'konum', KONUM, REGION)
    T['Konu × kurum türü'] = capraz_pay(df, 'konu', list(TOPIC), 'tur', TUR, TOPIC)
    T['Bölge × kurum türü'] = capraz_pay(df, 'bolge', list(REGION), 'tur', TUR, REGION)
    T['Konu × dönem'] = capraz_pay(df, 'konu', list(TOPIC), 'donem', PERIODS, TOPIC)
    T['Bölge × dönem'] = capraz_pay(df, 'bolge', list(REGION), 'donem', PERIODS, REGION)

    T['Etki (genel)'] = pd.DataFrame([{'Grup': 'Tüm makale+derleme', **etki(df)}])
    T['Etki × konum'] = etki_kirilim(df, 'konum', KONUM, KONUM_LABEL)
    T['Etki × kurum türü'] = etki_kirilim(df, 'tur', TUR, TUR_LABEL)
    T['Etki × konu'] = etki_kirilim(df, 'konu', list(TOPIC), TOPIC)
    T['Etki × bölge'] = etki_kirilim(df, 'bolge', list(REGION), REGION)
    T['Etki × dönem'] = pd.DataFrame([{'Dönem': p, 'Yayın (tüm türler)': int((df['donem'] == p).sum()), **etki(df[df['donem'] == p])} for p in PERIODS])
    T['Etki × yıl'] = pd.DataFrame([{'Yıl': y, **etki(df[df['year'] == y])} for y in range(2000, 2026)])
    T['Etki × belge türü (bilgi)'] = pd.DataFrame([{'Belge türü': b, 'Yayın': int((df['doc_type'] == b).sum()),
                                                     'CNCI ortalama': round(df.loc[df['doc_type'] == b, 'cnci'].mean(), 3),
                                                     'Ortalama atıf': round(df.loc[df['doc_type'] == b, 'tc'].mean(), 2)}
                                                    for b in df['doc_type'].value_counts().index])
    cl = df['collab'].value_counts().rename_axis('İşbirliği türü').reset_index(name='Yayın')
    cl['%'] = (100 * cl['Yayın'] / n).round(1)
    cl = cl.merge(pd.DataFrame([{'İşbirliği türü': c, **{k: v for k, v in etki(df[df['collab'] == c]).items() if k in ('Makale+derleme', 'CNCI ortalama', 'CNCI medyan', 'Ortalama atıf')}} for c in cl['İşbirliği türü']]), on='İşbirliği türü')
    T['İşbirliği'] = cl
    top = ar.sort_values(['tc', 'cnci'], ascending=False).head(25)
    T['En çok atıf alan 25'] = pd.DataFrame({'Başlık': top['title'], 'Yazarlar': top['authors'].astype(str).str[:120], 'Dergi': top['source'],
                                             'Yıl': top['year'].astype('Int64'), 'Atıf': top['tc'].astype('Int64'), 'CNCI': top['cnci'].round(2),
                                             'Konum': top['konum'].map(lambda v: ', '.join(KONUM_LABEL[k] for k in v)), 'WoS': top['wos']})
    return T


def ozet(df, label):
    n = len(df)
    e = etki(df)
    k, _, _ = uyelik(df, 'konum', KONUM, KONUM_LABEL)
    t, _, _ = uyelik(df, 'tur', TUR, TUR_LABEL)
    kon, _, _ = uyelik(df, 'konu', list(TOPIC), TOPIC)
    bol, _, _ = uyelik(df, 'bolge', list(REGION), REGION)
    top3 = lambda tb: ', '.join(f"{r.Ad} ({r.Yayın})" for r in tb.sort_values('Yayın', ascending=False).head(3).itertuples())
    yrs = df['year'].dropna()
    return {'Grup': label, 'Yayın (tüm türler)': n, 'Makale+derleme': e.get('Makale+derleme'),
            'Yıl aralığı': f"{int(yrs.min())}–{int(yrs.max())}",
            **{f"{r.Ad} %": r._5 for r in k.itertuples()},
            **{f"{r.Ad} % (tür)": r._5 for r in t.itertuples()},
            'En çok konu': top3(kon), 'En çok bölge': top3(bol),
            **{key: e.get(key) for key in ('Toplam atıf', 'Ortalama atıf', 'Medyan atıf', 'Hiç atıf almamış %', 'CNCI ortalama', 'CNCI medyan', 'JNCI ortalama', 'En çok atıf alan %10 içinde %')}}


# ── Grafikler ───────────────────────────────────────────────────────────
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.transforms

RENK = {'merkez': '#1f4e79', 'yarı merkez': '#2e86c1', 'taşra': '#f39c12', 'yurt dışı': '#7f8c8d',
        'devlet': '#1f4e79', 'vakıf': '#c0392b', 'ana': '#2e86c1', 'ikinci': '#aed6f1'}


def _stil(ax, baslik, alt=None):
    ax.set_title(baslik, fontsize=12, fontweight='bold', loc='left', pad=20 if alt else 8)
    if alt:
        ax.text(0, 1.015, alt, transform=ax.transAxes, fontsize=8.5, color='#555555', va='bottom')
    ax.spines[['top', 'right']].set_visible(False)
    ax.grid(axis='x' if ax.get_xlim()[0] == 0 and False else 'y', alpha=.25)


def grafikler(df, T, label, outdir, onek):
    import os
    os.makedirs(outdir, exist_ok=True)
    dosyalar = []

    def kaydet(fig, ad):
        p = f'{outdir}/{onek}_{ad}.png'
        fig.savefig(p, dpi=150, bbox_inches='tight'); plt.close(fig); dosyalar.append(p)

    # 1 Yıllık yayın
    y = T['Yıllar']
    fig, ax = plt.subplots(figsize=(10, 4.2))
    ax.bar(y['Yıl'], y['Tüm yayınlar'] - y['Makale+derleme'], bottom=y['Makale+derleme'], color=RENK['ikinci'], label='Diğer türler (kitap eleştirisi, editoryal vb.)')
    ax.bar(y['Yıl'], y['Makale+derleme'], color=RENK['ana'], label='Makale + derleme')
    _stil(ax, 'Yıllara göre yayın sayısı', label); ax.legend(frameon=False, fontsize=8.5); ax.set_xlim(1999.3, 2025.7)
    kaydet(fig, '1_yillik_yayin')

    # 2 Konum ve kurum türü (kodlu yayınlar içinde %)
    fig, axs = plt.subplots(1, 2, figsize=(10, 3.8), gridspec_kw={'width_ratios': [4, 3]})
    for ax, tb, keys, ttl in [(axs[0], T['Konum'], KONUM, 'Kurum konumu'), (axs[1], T['Kurum türü'], TUR, 'Kurum türü')]:
        vals = tb['% (kodlu yayınlar)'].fillna(0).tolist()
        bars = ax.bar(tb['Ad'], vals, color=[RENK[k] for k in keys])
        ax.bar_label(bars, labels=[f'%{v:.1f}\n({n})' for v, n in zip(vals, tb['Yayın'])], fontsize=8)
        _stil(ax, ttl); ax.set_ylim(0, max(vals) * 1.25 if max(vals) else 1); ax.set_ylabel('Kodlu yayınlar içinde %')
    fig.suptitle(label + ' – bir yayın birden çok kategoride olabilir', fontsize=8.5, color='#555555', y=0.0)
    kaydet(fig, '2_konum_kurum_turu')

    # 3 Konum × dönem (pay)
    cd = T['Konum × dönem']
    fig, ax = plt.subplots(figsize=(9, 4))
    for _, r in cd.iterrows():
        ax.plot(PERIODS, [r[f'{p} %'] for p in PERIODS], marker='o', color=RENK[r['Kod']], label=r['Ad'], lw=2)
    _stil(ax, 'Kurum konumunun dönemlere göre payı', label + ' – kodlu yayınlar içinde %'); ax.legend(frameon=False, fontsize=8.5, loc='upper left', bbox_to_anchor=(1.01, 1))
    kaydet(fig, '3_konum_donem')

    # 4–5 Konu ve bölge
    for no, key, ttl in [(4, 'Konu', 'Konu dağılımı (K1–K17)'), (5, 'Bölge', 'Bölge dağılımı (B1–B16)')]:
        tb = T[key].sort_values('Yayın')
        tb = tb[tb['Yayın'] > 0]
        fig, ax = plt.subplots(figsize=(9, 0.32 * len(tb) + 1.2))
        bars = ax.barh(tb['Ad'], tb['% (kodlu yayınlar)'], color=RENK['ana'])
        ax.bar_label(bars, labels=[f'%{v:.1f} ({n})' for v, n in zip(tb['% (kodlu yayınlar)'], tb['Yayın'])], fontsize=7.5, padding=2)
        _stil(ax, ttl, label + ' – kodlu yayınlar içinde %'); ax.grid(axis='x', alpha=.25); ax.set_xlim(0, tb['% (kodlu yayınlar)'].max() * 1.2)
        kaydet(fig, f'{no}_{"konu" if key == "Konu" else "bolge"}')

    # 6 CNCI × konum ve kurum türü
    fig, axs = plt.subplots(1, 2, figsize=(10, 3.8), gridspec_kw={'width_ratios': [4, 3]})
    for ax, tb, keys, ttl in [(axs[0], T['Etki × konum'], KONUM, 'CNCI – kurum konumu'), (axs[1], T['Etki × kurum türü'], TUR, 'CNCI – kurum türü')]:
        x = np.arange(len(tb)); w = .38
        b1 = ax.bar(x - w / 2, tb['CNCI ortalama'], w, color=[RENK[k] for k in keys], label='Ortalama')
        b2 = ax.bar(x + w / 2, tb['CNCI medyan'], w, color=[RENK[k] for k in keys], alpha=.45, label='Medyan')
        ax.bar_label(b1, fmt='%.2f', fontsize=7.5); ax.bar_label(b2, fmt='%.2f', fontsize=7.5)
        ax.axhline(1, color='#333', lw=1, ls='--'); ax.text(1.01, 1, 'dünya\nort. = 1', fontsize=7.5, ha='left', va='center', color='#333', transform=matplotlib.transforms.blended_transform_factory(ax.transAxes, ax.transData))
        ax.set_xticks(x, tb['Ad']); _stil(ax, ttl); ax.legend(frameon=False, fontsize=8)
    fig.suptitle(label + ' – yalnız makale ve derleme', fontsize=8.5, color='#555555', y=0.0)
    kaydet(fig, '6_cnci_konum_kurum')

    # 7 CNCI × dönem
    ed = T['Etki × dönem']
    fig, ax = plt.subplots(figsize=(9, 3.8))
    ax.plot(ed['Dönem'], ed['CNCI ortalama'], marker='o', lw=2, color=RENK['ana'], label='CNCI ortalama')
    ax.plot(ed['Dönem'], ed['CNCI medyan'], marker='o', lw=2, color=RENK['ana'], alpha=.45, label='CNCI medyan')
    ax.axhline(1, color='#333', lw=1, ls='--'); ax.text(1.01, 1, 'dünya\nort. = 1', fontsize=7.5, ha='left', va='center', color='#333', transform=matplotlib.transforms.blended_transform_factory(ax.transAxes, ax.transData))
    ax.set_ylim(0, max(1.2, ed['CNCI ortalama'].max() * 1.15))
    _stil(ax, 'CNCI – dönemler', label + ' – yalnız makale ve derleme; son yıllar henüz oturmadı'); ax.legend(frameon=False, fontsize=8.5, loc='lower right')
    kaydet(fig, '7_cnci_donem')

    # 8 İşbirliği
    cl = T['İşbirliği'].sort_values('Yayın')
    fig, ax = plt.subplots(figsize=(9, 3.2))
    bars = ax.barh(cl['İşbirliği türü'], cl['%'], color=RENK['ana'])
    ax.bar_label(bars, labels=[f"%{p:.1f} ({n}) · CNCI {c:.2f}" if pd.notna(c) else f"%{p:.1f} ({n})" for p, n, c in zip(cl['%'], cl['Yayın'], cl['CNCI ortalama'])], fontsize=7.5, padding=2)
    _stil(ax, 'İşbirliği türü', label + ' – yayın payı; CNCI yalnız makale ve derleme'); ax.set_xlim(0, cl['%'].max() * 1.45)
    kaydet(fig, '8_isbirligi')
    return dosyalar


# ── Rapor metni ─────────────────────────────────────────────────────────

def rapor(df, T, label):
    e = T['Etki (genel)'].iloc[0]
    kap = T['Kod kapsamı'].set_index('Kod')
    L = []
    w = L.append
    w(f'YAYIN ANALİZİ 2000–2025 – {tr_upper(label)}')
    w('Hazırlanma: 22.11.2026. Kaynak: Elif Hoca\'nın 2000-2025.xlsx dosyası (InCites dışa aktarımı); kodlar "remove duplicate tümü" sayfasından.')
    w('Kurallar: sayımlar tüm belge türleriyle; atıf/CNCI/JNCI/en iyi %10 yalnız makale+derleme ile. Bir yayın her kategoride en fazla bir kez sayılır (yüzdelerin toplamı 100\'ü geçebilir).')
    w('"-----", "----" ve "—" kodları kodlanmamış sayıldı. Ayrıntılar: KARARLAR notu.')
    w('')
    w('1. GENEL')
    yrs = df['year'].dropna()
    w(f'  Yayın: {len(df)} (makale+derleme {int(df["arastirma"].sum())}), {int(yrs.min())}–{int(yrs.max())}.')
    bt = T['Belge türleri'].head(5)
    w('  Belge türleri: ' + ', '.join(f"{r['Belge türü']} {r['Yayın']} (%{r['%']})" for _, r in bt.iterrows()) + '.')
    dn = T['Dönemler']
    w('  Dönemler: ' + ', '.join(f"{r['Dönem']}: {int(r['Tüm yayınlar']) if pd.notna(r['Tüm yayınlar']) else 0}" for _, r in dn.iterrows()) + '.')
    w('  En çok yayın yapılan dergiler: ' + '; '.join(f"{r['Dergi']} ({r['Yayın']})" for _, r in T['Dergiler (ilk 25)'].head(5).iterrows()) + '.')
    w('')
    w('2. KOD KAPSAMI')
    for k in ['Konu (K1–K17)', 'Bölge (B1–B16)', 'Kurum konumu', 'Kurum türü']:
        r = kap.loc[k]; w(f'  {k}: {int(r["Kodlu yayın"])} kodlu, {int(r["Kodsuz yayın"])} kodsuz (%{r["Kodlu %"]} kodlu).')
    w('')
    w('3. KURUMLAR (kodlu yayınlar içinde %)')
    w('  Konum: ' + ', '.join(f"{r['Ad']} %{r['% (kodlu yayınlar)']} ({r['Yayın']})" for _, r in T['Konum'].iterrows()) + '.')
    w('  Kurum türü: ' + ', '.join(f"{r['Ad']} %{r['% (kodlu yayınlar)']} ({r['Yayın']})" for _, r in T['Kurum türü'].iterrows()) + '.')
    yd = T['Yurt dışı ortaklık'].iloc[0]
    w(f'  Türkiye kurumlu {int(yd["Türkiye kurumlu yayın"])} yayının {int(yd["Yurt dışı kurumla ortak"])} tanesi (%{yd["Ortak %"]}) yurt dışı bir kurumla ortak.')
    cd = T['Konum × dönem'].set_index('Ad')
    w('  Konum payının değişimi (2000–2004 → 2020–2025): ' + ', '.join(f"{a} %{cd.loc[a, '2000–2004 %']} → %{cd.loc[a, '2020–2025 %']}" for a in ['Merkez', 'Yarı merkez', 'Taşra', 'Yurt dışı']) + '.')
    w('')
    w('4. KONU VE BÖLGE (kodlu yayınlar içinde %)')
    w('  İlk 5 konu: ' + ', '.join(f"{r['Ad']} %{r['% (kodlu yayınlar)']} ({r['Yayın']})" for _, r in T['Konu'].head(5).iterrows()) + '.')
    w('  İlk 5 bölge: ' + ', '.join(f"{r['Ad']} %{r['% (kodlu yayınlar)']} ({r['Yayın']})" for _, r in T['Bölge'].head(5).iterrows()) + '.')
    for tbk, cats, lab in [('Konu × konum', 'Konu', 'konu'), ('Bölge × konum', 'Bölge', 'bölge')]:
        tb = T[tbk]
        parts = []
        for k in ['merkez', 'yarı merkez', 'taşra']:
            top = tb.sort_values(f'{k} n', ascending=False).head(3)
            parts.append(f"{KONUM_LABEL[k]}: " + ', '.join(f"{r['Ad']} %{r[f'{k} %']}" for _, r in top.iterrows()))
        w(f'  Konuma göre ilk 3 {lab}: ' + ' | '.join(parts) + '.')
    w('')
    w('5. ETKİ (yalnız makale+derleme)')
    w(f'  {int(e["Makale+derleme"])} yayın, toplam {int(e["Toplam atıf"])} atıf; ortalama {e["Ortalama atıf"]}, medyan {e["Medyan atıf"]}; hiç atıf almamış %{e["Hiç atıf almamış %"]}.')
    w(f'  CNCI ortalama {e["CNCI ortalama"]}, medyan {e["CNCI medyan"]} (1 = dünya ortalaması); JNCI ortalama {e["JNCI ortalama"]}; alanında en çok atıf alan %10 içinde %{e["En çok atıf alan %10 içinde %"]} (beklenen %10).')
    w('  Not: CNCI ortalaması az sayıda çok atıf alan yayından etkilenir; medyan ile birlikte okunmalı.')
    for key, nm in [('Etki × konum', 'Konum'), ('Etki × kurum türü', 'Kurum türü')]:
        w(f'  {nm}: ' + '; '.join(f"{r['Ad']} n={r['Makale+derleme']}, CNCI {r['CNCI ortalama']} (medyan {r['CNCI medyan']}), en iyi %10 %{r['En çok atıf alan %10 içinde %']}" for _, r in T[key].iterrows() if r['Makale+derleme']) + '.')
    w('  Dönemler: ' + '; '.join(f"{r['Dönem']} CNCI {r.get('CNCI ortalama')} (medyan {r.get('CNCI medyan')})" for _, r in T['Etki × dönem'].iterrows()) + '.')
    ek = T['Etki × konu']
    ek = ek[ek['Makale+derleme'] >= 30].sort_values('CNCI ortalama', ascending=False)
    w('  En yüksek CNCI\'lı konular (en az 30 makale): ' + ', '.join(f"{r['Ad']} {r['CNCI ortalama']}" for _, r in ek.head(3).iterrows()) + '; en düşük: ' + ', '.join(f"{r['Ad']} {r['CNCI ortalama']}" for _, r in ek.tail(3).iterrows()) + '.')
    w('')
    w('6. İŞBİRLİĞİ')
    w('  ' + '; '.join(f"{r['İşbirliği türü']} %{r['%']} (CNCI {r['CNCI ortalama']})" for _, r in T['İşbirliği'].iterrows()) + '.')
    w('')
    w('7. EN ÇOK ATIF ALAN 5 YAYIN (makale+derleme)')
    for _, r in T['En çok atıf alan 25'].head(5).iterrows():
        w(f"  {r['Atıf']} atıf – {str(r['Başlık'])[:110]} ({r['Dergi']}, {r['Yıl']}) [{r['Konum'] or 'konum kodu yok'}]")
    return '\n'.join(L) + '\n'


# ── Excel ───────────────────────────────────────────────────────────────
OKU_SATIRLARI = [
    'Bu dosya bir InCites grubunun yayın analizidir (TÜBİTAK 1001, 22.11.2026).',
    'Atıf göstergeleri bu grubun kendi InCites çıktısından; kodlar "remove duplicate tümü" sayfasından Accession Number ile aktarıldı.',
    'Yayın sayıları, kurum, konu ve bölge dağılımları tüm belge türleriyle; atıf, CNCI, JNCI ve "en çok atıf alan %10" yalnız Article + Review ile.',
    'Bir yayın her kategoride en fazla bir kez sayılır; yüzdelerin toplamı 100\'ü geçebilir. "% (kodlu yayınlar)" ilgili kodu olan yayınlar içindeki paydır.',
    '"-----", "----" ve "—" kodları kodlanmamış sayıldı. Küçük harfli kodlar büyük harfe çevrildi; "k2-k3" gibi hücrelerde iki kod da sayıldı.',
    'CNCI: 1 = dünya ortalaması; grup değeri yayınların CNCI ortalamasıdır (InCites). Ortalama birkaç çok atıflı yayından çok etkilendiği için medyan da verildi (bu bizim eklememiz). En çok atıf alan %10 = Percentile in Subject Area ≥ 90.',
    '"İlk kurum konum×tür" tablosu yalnız University 1 ve University type 1 sütunlarını kullanır (diğer sütunların hangi kuruma ait olduğu birebir bilinmiyor).',
    'Dönemler: 2000–2004, 2005–2009, 2010–2014, 2015–2019, 2020–2025. Son yıllarda atıf ve CNCI henüz oturmadı.',
    'Aynı yayının atıf ve CNCI değeri ESCI dahil ve hariç sayfalarda farklı olabilir (InCites filtresine bağlı); gruplar bu yüzden ayrı analiz edildi.',
]


def excel(df, T, label, path):
    with pd.ExcelWriter(path, engine='xlsxwriter') as w:
        wb = w.book
        head = wb.add_format({'bold': True, 'bg_color': '#DCE6F1', 'text_wrap': True, 'valign': 'top', 'border': 1})
        ws = wb.add_worksheet('OKU')
        ws.write(0, 0, f'YAYIN ANALİZİ – {label}', wb.add_format({'bold': True, 'font_size': 13}))
        for i, l in enumerate(OKU_SATIRLARI, start=2): ws.write(i, 0, l)
        ws.write(len(OKU_SATIRLARI) + 3, 0, 'Sayfalar:', wb.add_format({'bold': True}))
        for i, k in enumerate(T, start=len(OKU_SATIRLARI) + 4): ws.write(i, 0, k)
        ws.set_column(0, 0, 140)
        for name, tb in T.items():
            sn = name[:31]
            tb.to_excel(w, sheet_name=sn, index=False)
            s = w.sheets[sn]
            for ci, c in enumerate(tb.columns): s.write(0, ci, str(c), head)
            s.set_row(0, 32); s.set_column(0, len(tb.columns) - 1, 13); s.freeze_panes(1, 0)
            if name in ('En çok atıf alan 25', 'Dergiler (ilk 25)'): s.set_column(0, 0, 60)
            if name.startswith(('Konu', 'Bölge', 'Etki ×')): s.set_column(1, 1, 24)
        veri = pd.DataFrame({
            'Accession Number': df['wos'], 'Başlık': df['title'], 'Dergi': df['source'], 'Belge türü': df['doc_type'], 'Yıl': df['year'].astype('Int64'),
            'Dönem': df['donem'], 'Etki analizinde': df['arastirma'].map({True: 'evet', False: 'hayır'}),
            'Times Cited': df['tc'], 'CNCI': df['cnci'], 'JNCI': df['jnci'], 'Percentile': df['pct'], 'En iyi %10': df['top10'].map({True: 'evet', False: ''}),
            'İşbirliği': df['collab'],
            'Konum (normalleştirilmiş)': df['konum'].map(lambda v: ', '.join(v)), 'Kurum türü (normalleştirilmiş)': df['tur'].map(lambda v: ', '.join(v)),
            'Konu kodları': df['konu'].map(lambda v: ', '.join(v)), 'Bölge kodları': df['bolge'].map(lambda v: ', '.join(v)),
            'Kodlama sayfasında': df['kodlandi'].map({True: 'var', False: 'yok'})})
        veri.to_excel(w, sheet_name='Veri (normalleştirilmiş)', index=False)
        s = w.sheets['Veri (normalleştirilmiş)']
        for ci, c in enumerate(veri.columns): s.write(0, ci, c, head)
        s.set_column(0, len(veri.columns) - 1, 14); s.set_column(1, 1, 50); s.freeze_panes(1, 1); s.autofilter(0, 0, len(veri), len(veri.columns) - 1)


# ── Dört grup karşılaştırması ve ESCI etkisi ───────────────────────────

def karsilastir(G, path):
    lab = {k: l for _, k, l in GROUPS}
    oz = pd.DataFrame([ozet(G[k], lab[k]) for _, k, _ in GROUPS]).set_index('Grup').T.reset_index().rename(columns={'index': 'Gösterge'})
    tabs = {'Özet': oz}
    for key, col, cats, labels in [('Konum', 'konum', KONUM, KONUM_LABEL), ('Kurum türü', 'tur', TUR, TUR_LABEL), ('Konu', 'konu', list(TOPIC), TOPIC), ('Bölge', 'bolge', list(REGION), REGION)]:
        t = pd.DataFrame({'Kod': cats, 'Ad': [labels[c] for c in cats]})
        for _, k, l in GROUPS:
            u, _, _ = uyelik(G[k], col, cats, labels)
            t[f'{l} n'] = u['Yayın'].values; t[f'{l} %'] = u['% (kodlu yayınlar)'].values
        tabs[f'{key} (4 grup)'] = t
    for key, col, cats, labels in [('CNCI × konum', 'konum', KONUM, KONUM_LABEL), ('CNCI × kurum türü', 'tur', TUR, TUR_LABEL), ('CNCI × konu', 'konu', list(TOPIC), TOPIC), ('CNCI × bölge', 'bolge', list(REGION), REGION)]:
        t = pd.DataFrame({'Kod': cats, 'Ad': [labels[c] for c in cats]})
        for _, k, l in GROUPS:
            e = etki_kirilim(G[k], col, cats, labels)
            t[f'{l} n'] = e['Makale+derleme'].values; t[f'{l} CNCI ort.'] = e['CNCI ortalama'].values; t[f'{l} CNCI medyan'] = e['CNCI medyan'].values
        tabs[key] = t
    # ESCI etkisi
    rows = []; ek_list = []
    for alan, dahil, haric in [('Uluslararası İlişkiler', 'ir_esci', 'ir_ssci'), ('Siyaset Bilimi', 'sb_esci', 'sb_ssci')]:
        a, b = G[dahil], G[haric]
        ek = a[~a['wos'].isin(set(b['wos']))]
        ort = a[a['wos'].isin(set(b['wos']))]
        ea, ee, eo = etki(a), etki(ek), etki(ort)
        ku, _, _ = uyelik(ek, 'konum', KONUM, KONUM_LABEL)
        rows.append({'Alan': alan, 'ESCI dahil yayın': len(a), 'ESCI hariç yayın': len(b), 'ESCI ile gelen ek yayın': len(ek),
                     'Ek yayın %': round(100 * len(ek) / len(a), 1), 'Hariçte olup dahilde olmayan': int((~b['wos'].isin(set(a['wos']))).sum()),
                     'Ek yayınlar CNCI ort.': ee.get('CNCI ortalama'), 'Ortak yayınlar CNCI ort.': eo.get('CNCI ortalama'),
                     'Ek yayınlar medyan atıf': ee.get('Medyan atıf'), 'Ortak yayınlar medyan atıf': eo.get('Medyan atıf'),
                     **{f'Ek yayınlarda {r.Ad} %': r._5 for r in ku.itertuples()}})
        e2 = ek.copy(); e2['Alan'] = alan; ek_list.append(e2)
    tabs['ESCI etkisi'] = pd.DataFrame(rows)
    ekdf = pd.concat(ek_list)
    tabs['ESCI ek yayınlar'] = pd.DataFrame({'Alan': ekdf['Alan'], 'Accession Number': ekdf['wos'], 'Başlık': ekdf['title'], 'Dergi': ekdf['source'],
                                             'Belge türü': ekdf['doc_type'], 'Yıl': ekdf['year'].astype('Int64'), 'Atıf': ekdf['tc'], 'CNCI': ekdf['cnci']})
    fark = []
    for alan, dahil, haric in [('Uluslararası İlişkiler', 'ir_esci', 'ir_ssci'), ('Siyaset Bilimi', 'sb_esci', 'sb_ssci')]:
        A = G[dahil].set_index('wos'); B = G[haric].set_index('wos')
        j = A.loc[B.index, ['tc', 'cnci', 'jnci', 'pct', 'doc_type']].join(B[['tc', 'cnci', 'jnci', 'pct']], rsuffix='_h')
        jj = j[j['doc_type'].isin(RESEARCH)]
        ayni = jj[jj['tc'] == jj['tc_h']]
        fark.append({'Alan': alan, 'İki sayfada da olan yayın': len(j),
                     'Atıf sayısı farklı': int((j['tc'] != j['tc_h']).sum()),
                     'ESCI dahil sayfada atıf daha yüksek': int((j['tc'] > j['tc_h']).sum()),
                     'ESCI dahil sayfada atıf daha düşük': int((j['tc'] < j['tc_h']).sum()),
                     'CNCI farklı': int((j['cnci'].round(4) != j['cnci_h'].round(4)).sum()),
                     'Percentile farklı': int((j['pct'].round(2) != j['pct_h'].round(2)).sum()),
                     'Makale+derleme ort. atıf (dahil sayfası)': round(jj['tc'].mean(), 2), 'Makale+derleme ort. atıf (hariç sayfası)': round(jj['tc_h'].mean(), 2),
                     'Makale+derleme CNCI ort. (dahil sayfası)': round(jj['cnci'].mean(), 3), 'Makale+derleme CNCI ort. (hariç sayfası)': round(jj['cnci_h'].mean(), 3),
                     'Atıfı aynı olup CNCI farklı olan': int((ayni['cnci'].round(4) != ayni['cnci_h'].round(4)).sum()),
                     'Yorum': 'Gözlem: ESCI hariç sayfada atıf hiçbir yayında daha yüksek değil; atıfı aynı olan yayınlarda bile CNCI farklı. Muhtemel neden: InCites atıfları ve beklenen atıf tabanını seçili dizinlere göre hesaplıyor (InCites CNCI makalesi bunu açıkça yazmıyor; doğrulanmadı).'})
    tabs['Aynı yayın, iki sayfa'] = pd.DataFrame(fark)
    ir, sb = G['ir_esci'], G['sb_esci']
    ortak = set(ir['wos']) & set(sb['wos'])
    tabs['Uİ–SB örtüşmesi'] = pd.DataFrame([{'Uİ (ESCI dahil)': len(ir), 'SB (ESCI dahil)': len(sb), 'Ortak yayın': len(ortak),
                                             'Ortak yayınlardan CNCI\'ı farklı olan': int((ir.set_index('wos').loc[list(ortak), 'cnci'].round(4) != sb.set_index('wos').loc[list(ortak), 'cnci'].round(4)).sum()),
                                             'Açıklama': 'InCites tek kategori filtresiyle CNCI\'ı o kategoriye göre hesapladığı için aynı yayının CNCI\'ı iki grupta farklı olabilir.'}])
    with pd.ExcelWriter(path, engine='xlsxwriter') as w:
        wb = w.book; head = wb.add_format({'bold': True, 'bg_color': '#DCE6F1', 'text_wrap': True, 'valign': 'top', 'border': 1})
        ws = wb.add_worksheet('OKU')
        ws.write(0, 0, 'YAYIN ANALİZİ 2000–2025 – DÖRT GRUBUN KARŞILAŞTIRMASI', wb.add_format({'bold': True, 'font_size': 13}))
        for i, l in enumerate(OKU_SATIRLARI[1:], start=2): ws.write(i, 0, l)
        ws.write(len(OKU_SATIRLARI) + 2, 0, 'ESCI etkisi: "ESCI ile gelen ek yayın" = ESCI dahil grupta olup ESCI hariç grupta olmayan yayınlar. Ek ve ortak yayınlar aynı (ESCI dahil) sayfadan karşılaştırıldı.')
        ws.write(len(OKU_SATIRLARI) + 3, 0, 'Önemli: aynı yayının atıf, CNCI ve percentile değerleri ESCI dahil ve hariç sayfalarda farklı (bkz. "Aynı yayın, iki sayfa"). Bu yüzden dört grup ayrı analiz edildi; gruplar arası CNCI farkı yalnız yayın kümesinden değil, hesap tabanından da kaynaklanır.')
        ws.set_column(0, 0, 140)
        for name, tb in tabs.items():
            sn = name[:31]; tb.to_excel(w, sheet_name=sn, index=False); s = w.sheets[sn]
            for ci, c in enumerate(tb.columns): s.write(0, ci, str(c), head)
            s.set_row(0, 45); s.set_column(0, len(tb.columns) - 1, 14); s.set_column(0, 0, 30 if name == 'Özet' else 14); s.freeze_panes(1, 1 if name != 'Özet' else 1)
            if name == 'ESCI ek yayınlar': s.set_column(2, 2, 60)
    return tabs
