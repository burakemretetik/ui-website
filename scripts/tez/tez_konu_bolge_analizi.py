import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import os
import re

# --- AYARLAR ---
# GÜNCELLEME (02.11.2026): Kaynak, Elif Hoca'nın güncel tez verisi
TEZ_VERISI = "TEZ_VERISI (YL ve Doktora).xlsx"
RAPOR_DOSYASI = "konu_bolge_kelime_frekans_analiz_raporu.txt"

# Puanlama Ağırlıkları
PUAN_BASLIK = 10  # Başlıkta geçerse çok önemli
PUAN_OZET = 1     # Özette geçerse destekleyici
ESIK_DEGERI = 3   # Bir tezin bir konuya atanması için gereken min puan

# --- 1. GÜNCELLENMİŞ MASTER BÖLGE SÖZLÜĞÜ ---
# 03.11.2026: "AB ", "EU " → "AB", "EU" (sondaki boşluk eşleşmeyi engelliyordu)
BOLGE_SOZLUGU = {
    "B1. Kuzey Amerika": [
        "ABD", "USA", "AMERIKA BIRLESIK", "BIRLESIK DEVLETLER", "UNITED STATES", 
        "NORTH AMERICA", "BEYAZ SARAY", "PENTAGON", "TRUMP", "OBAMA", "BUSH", 
        "BIDEN", "KANADA", "MEKSIKA", "NAFTA", "USMCA", "FEDERAL", "REPUBLIC"
    ],
    "B2. Güney Amerika": [
        "GUNEY AMERIKA", "LATIN AMERIKA", "LATIN", "BREZILYA", "ARJANTIN", "SILI", 
        "VENEZUELA", "KOLOMBIYA", "MERCOSUR", "AMAZON"
    ],
    "B3. Batı Avrupa": [
        "BATI AVRUPA", "AVRUPA", "AB", "EU", "ALMANYA", "ALMAN", "FRANSA", "FRANSIZ", 
        "INGILTERE", "BIRLESIK KRALLIK", "UK", "ITALYA", "TALYA", "ISPANYA", "SPANYA", 
        "HOLLANDA", "BELCIKA", "LONDRA", "PARIS", "BERLIN", "BREXIT"
    ],
    "B4. Merkez ve Doğu Avrupa": [
        "DOGU AVRUPA", "MERKEZ AVRUPA", "POLONYA", "MACARISTAN", "CEKYA", "UKRAYNA", 
        "ROMANYA", "VISEGRAD", "BALTIK"
    ],
    "B5. Balkanlar": [
        "BALKAN", "BALKANLAR", "YUNANISTAN", "YUNAN", "BULGARISTAN", "SIRBISTAN", 
        "BOSNA", "HERSEK", "ARNAVUTLUK", "KOSOVA", "MAKEDONYA", "YUGOSLAVYA", "TRAKYA"
    ],
    "B6. Asya": [
        "ASYA", "GUNEY ASYA", "HINDISTAN", "PAKISTAN", "AFGANISTAN", "AFGHANISTAN", 
        "BANGLADES", "ENDONEZYA"
    ],
    "B7. Güney Pasifik": [
        "GUNEY PASIFIK", "AVUSTRALYA", "YENI ZELANDA", "OKYANUSYA"
    ],
    "B8. Orta Doğu": [
        "ORTA DOGU", "ORTADOGU", "MIDDLE EAST", "ARAP", "ARAB", "SURIYE", "SYRIA", "ESAD", 
        "IRAK", "IRAQ", "IRAN", "ISRAIL", "ISRAEL", "FILISTIN", "MISIR", "KORFEZ", 
        "SUUDI", "ARABISTAN", "KATAR", "BAE", "YEMEN", "LUBNAN", "HIZBULLAH", 
        "MUSLUMAN KARDESLER", "ARAP BAHARI"
    ],
    "B9. Kuzey Afrika": [
        "KUZEY AFRIKA", "MAGRIB", "LIBYA", "TUNUS", "CEZAYIR", "FAS", "SUDAN"
    ],
    "B10. Güney Afrika": [
        "GUNEY AFRIKA", "AFRIKA", "AFRICA", "SAHRA ALTI", "SAHRA", "NIJERYA", 
        "SOMALI", "ETIYOPYA"
    ],
    "B11. Avrasya": [
        "AVRASYA", "AZERBAYCAN", "AZERBAIJAN", "GURCISTAN", "KAZAKISTAN", "TURKMENISTAN", 
        "KIRGIZISTAN", "OZBEKISTAN", "TURKISTAN", "KAFKASYA", "HAZAR", "DAGLIK KARABAG", 
        "TURK CUMHURIYETLERI", "TURK DUNYASI", "TDT"
    ],
    "B12. Uzak Doğu/Pasifik": [
        "UZAK DOGU", "PASIFIK", "CIN", "CHINA", "JAPONYA", "KORE", "TAYVAN", 
        "ASEAN", "KUSAK YOL", "SOUTH CHINA"
    ],
    "B13. Karayipler": [
        "KARAYIP", "KUBA", "HAITI"
    ],
    "B14. Kutuplar": [
        "KUTUP", "ARKTIK", "ANTARKTIKA"
    ],
    "B15. Rusya": [
        "RUSYA", "RUSSIA", "RUS", "RUSSIAN", "RF", "FEDERASYONU", "MOSKOVA", "KREMLIN", 
        "PUTIN", "SOVYET", "SSCB", "KIRIM"
    ],
    "B16. Türkiye": [
        "TURKIYE", "TURKEY", "TURKISH", "ANKARA", "ISTANBUL", "OSMANLI", 
        "IMPARATORLUGU", "TBMM", "AK PARTI", "AKP", "CHP", "TURGUT OZAL", "ATATURK", 
        "CUMHURBASKANI", "15 TEMMUZ", "KIBRIS", "CYPRUS", "RUM", "EGE", "DOGU AKDENIZ", 
        "MAVI VATAN", "KURT SORUNU", "ANADOLU", "TURK DIS POLITIKASI", "TDP"
    ]
}

# --- 2. GÜNCELLENMİŞ MASTER KONU SÖZLÜĞÜ ---
# 03.11.2026: "AB ", "EU ", "BM " → boşluksuz; "UN " çıkarıldı (Türkçe ekle karışıyordu)
KONU_SOZLUGU = {
    "K1. Teori": [
        "TEORI", "KURAM", "REALIZM", "LIBERAL", "INSAACI", "CONSTRUCTIVISM", "HEGEMONYA", 
        "GUC", "POWER", "DEVLET", "STATE", "SISTEM", "YAPI", "ANARSI", "EGEMENLIK", 
        "MESRUIYET", "REJIM", "NEOLIBERAL", "YUMUSAK GUC", "SOFT POWER", "SERT GUC", 
        "JEOPOLITIK", "NEOKLASIK", "OYUN TEORISI", "SOMURGECILIK", "PARADIGMA"
    ],
    "K2. Dış Politika": [
        "DIS POLITIKA", "FOREIGN POLICY", "DIPLOMASI", "STRATEJI", "ILISKILER", 
        "RELATIONS", "ISBIRLIGI", "COOPERATION", "TUTUM", "KARAR ALMA", "DOKTRIN", 
        "KAMU DIPLOMASISI", "MUZAKERE", "LIDERLIK", "NUFUZ", "HUKUMET"
    ],
    "K3. Güvenlik": [
        "GUVENLIK", "SECURITY", "SAVAS", "WAR", "CATISMA", "CONFLICT", "ASKERI", 
        "MILITARY", "NATO", "SILAH", "NUKLEER", "TEHDIT", "SALDIRI", "SAVUNMA", 
        "ORDU", "ISTIHBARAT", "INTELLIGENCE", "SOGUK SAVAS", "HIBRIT", "ASIMETRIK", 
        "MUCADELE", "RISK", "GUVENLIKLESTIRME"
    ],
    "K4. Çevre ve Enerji": [
        "CEVRE", "IKLIM", "CLIMATE", "ENERJI", "ENERGY", "PETROL", "DOGALGAZ", 
        "GAZ", "BORU HATTI", "HIDROKARBON", "SU SORUNU", "SURDURULEBILIR", 
        "YESIL MUTABAKAT", "PARIS ANLASMASI", "SURDURULEBILIR KALKINMA"
    ],
    "K5. Uluslararası Göç": [
        "GOC", "MIGRATION", "MULTECI", "REFUGEE", "SIGINMACI", "DIASPORA", 
        "DUZENSIZ GOC", "GOCMEN", "SINIR", "ENTEGRASYON"
    ],
    "K6. Toplumsal Cinsiyet": [
        "CINSIYET", "GENDER", "KADIN", "WOMEN", "FEMINIZM", "FEMINIST", 
        "TOPLUMSAL CINSIYET"
    ],
    "K7. Barış Çalışmaları": [
        "BARIS", "PEACE", "CATISMA COZUMU", "ARABULUCULUK", "INSANI YARDIM", 
        "HUMANITARIAN", "ISTIKRAR"
    ],
    "K8. Terör": [
        "TEROR", "TERORIZM", "TERRORISM", "EL KAIDE", "ISID", "PKK", "FETO", 
        "RADIKAL", "SIDDET", "NARKO", "HIZBULLAH"
    ],
    "K9. Uluslararası Hukuk": [
        "HUKUK", "LAW", "INSAN HAKLARI", "HUMAN RIGHTS", "SOZLESME", "ANLASMA", 
        "MAHKEME", "AIHM", "ADALET", "YASAL", "SUC", "SOYKIRIM"
    ],
    "K10. Uluslararası Örgütler": [
        "ORGUT", "ORGANIZATION", "KURULUS", "BIRLESMIS MILLETLER", "BM", 
        "UNITED NATIONS", "KONSEY", "TESKILAT"
    ],
    "K11. Dijitalleşme ve Medya": [
        "DIJITAL", "DIGITAL", "MEDYA", "MEDIA", "SOSYAL MEDYA", "INTERNET", 
        "SIBER", "CYBER", "YAPAY ZEKA", "TEKNOLOJI", "ILETISIM", "HABER", 
        "PROPAGANDA", "UZAY", "BLOKZINCIR", "KRIPTO"
    ],
    "K12. Politik Ekonomi": [
        "EKONOMI", "ECONOMY", "POLITIK EKONOMI", "TICARET", "TRADE", "KALKINMA", 
        "DEVELOPMENT", "FINANS", "SERMAYE", "YATIRIM", "IHRACAT", "GUMRUK", 
        "PIYASA", "ULASIM", "LOJISTIK", "ALTYAPI", "PARA", "TRANSIT"
    ],
    "K13. Kimlik ve Milliyetçilik": [
        "KIMLIK", "IDENTITY", "MILLIYETCILIK", "NATIONALISM", "ETNISITE", "DIN", 
        "RELIGION", "ISLAM", "KULTUR", "CULTURE", "VATANDASLIK", "AZINLIK", 
        "TOPLUM", "TURKLUK"
    ],
    "K14. Normatif Çalışmalar": [
        "DEMOKRASI", "DEMOCRACY", "POPULIZM", "OTORITER", "SIVIL TOPLUM", 
        "CIVIL SOCIETY", "ADALET", "OZGURLUK", "MESRUIYET", "DEGERLER", "NORM", 
        "SECIM", "HALK", "IKTIDAR"
    ],
    "K15. Küreselleşme": [
        "KURESELLESME", "GLOBALIZATION", "KURESEL", "DUNYA DUZENI", "ULUSOTESI"
    ],
    "K16. Yöntem ve Disiplin": [
        "YONTEM", "METODOLOJI", "ANALIZ", "VAKA", "CASE STUDY", "SOYLEM", 
        "DISCOURSE", "NICEL", "NITEL", "COMPARATIVE", "KARSILASTIRMALI", 
        "AMPIRIK", "BILIMSEL"
    ],
    "K17. Avrupa Birliği": [
        "AVRUPA BIRLIGI", "AB", "EU", "EUROPEAN UNION", "BIRLIK", "UNION", 
        "ENTEGRASYON", "UYELIK", "GENISLEME", "MUKTESEBAT", "KOPENHAG", 
        "AVRUPALILASMA", "GUMRUK BIRLIGI", "TOPLULUK"
    ]
}

def temizle_metin(text):
    if pd.isna(text): return ""
    text = str(text).upper()
    tr_map = str.maketrans("ÇĞİÖŞÜ", "CGIOSU")
    text = text.translate(tr_map)
    # Sadece harfler ve boşluklar kalsın
    text = re.sub(r'[^A-Z\s]', ' ', text)
    # Çoklu boşlukları teke indir
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def puanla_ve_etiketle(baslik, ozet, sozluk):
    etiketler = []
    baslik_temiz = temizle_metin(baslik)
    ozet_temiz = temizle_metin(ozet)
    
    for kategori, anahtarlar in sozluk.items():
        puan = 0
        for anahtar in anahtarlar:
            # Boşluklu arama (Space Padding) - "US" kelimesi "ULUS" içinde çıkmasın diye
            anahtar_pad = f" {anahtar} "
            
            # Başlık Kontrolü (Ağırlıklı)
            if anahtar_pad in f" {baslik_temiz} ":
                puan += PUAN_BASLIK
            
            # Özet Kontrolü
            count = f" {ozet_temiz} ".count(anahtar_pad)
            puan += (count * PUAN_OZET)
        
        if puan >= ESIK_DEGERI:
            etiketler.append(kategori)
            
    return etiketler

def main():
    print("🚀 MASTER ANALİZ BAŞLIYOR...")
    print(f"ℹ️  Metodoloji: Ağırlıklı Puanlama (Başlık={PUAN_BASLIK}p, Özet={PUAN_OZET}p, Eşik={ESIK_DEGERI}p)")

    if not os.path.exists(TEZ_VERISI):
        print(f"❌ '{TEZ_VERISI}' bulunamadı. Lütfen dosya adını kontrol et.")
        return

    df = pd.read_excel(TEZ_VERISI)
    
    # Sütun isimlerini güvenli şekilde bul
    col_baslik = 'Başlık' if 'Başlık' in df.columns else df.columns[0]
    col_ozet = 'ÖzetTR' if 'ÖzetTR' in df.columns else df.columns[1]

    print("🏷️  Tezler, 2000 kelimelik master sözlük ile taranıyor...")
    
    # Bölge ve Konu Etiketleme
    df['BOLGELER'] = df.apply(lambda row: puanla_ve_etiketle(row[col_baslik], row[col_ozet], BOLGE_SOZLUGU), axis=1)
    df['KONULAR'] = df.apply(lambda row: puanla_ve_etiketle(row[col_baslik], row[col_ozet], KONU_SOZLUGU), axis=1)

    # --- ANALİZ 1: BÖLGELER (Grafik) ---
    print("📊 Bölgesel dağılım grafiği oluşturuluyor...")
    df_bolge_flat = df.explode('BOLGELER')
    bolge_counts = df_bolge_flat['BOLGELER'].value_counts().reset_index()
    bolge_counts.columns = ['BOLGE', 'TEZ_SAYISI']

    plt.figure(figsize=(14, 8))
    sns.barplot(data=bolge_counts, x='TEZ_SAYISI', y='BOLGE', palette='coolwarm')
    plt.title(f"Master Analiz: Tezlerin Bölgesel Dağılımı (N={len(df)})")
    plt.xlabel("Tez Sayısı")
    plt.ylabel(None)
    # Barların ucuna sayıları yaz
    for index, row in enumerate(bolge_counts.itertuples()):
        plt.text(row.TEZ_SAYISI + 5, index, str(row.TEZ_SAYISI), va='center', fontweight='bold')
    plt.tight_layout()
    plt.savefig("MASTER_GRAFIK_1_BOLGELER.png")

    # --- ANALİZ 2: KONULAR (Grafik) ---
    print("📊 Konu dağılım grafiği oluşturuluyor...")
    df_konu_flat = df.explode('KONULAR')
    konu_counts = df_konu_flat['KONULAR'].value_counts().reset_index()
    konu_counts.columns = ['KONU', 'TEZ_SAYISI']

    plt.figure(figsize=(14, 9))
    sns.barplot(data=konu_counts, x='TEZ_SAYISI', y='KONU', palette='viridis')
    plt.title(f"Master Analiz: Tezlerin Konu Dağılımı (N={len(df)})")
    plt.xlabel("Tez Sayısı")
    plt.ylabel(None)
    for index, row in enumerate(konu_counts.itertuples()):
        plt.text(row.TEZ_SAYISI + 5, index, str(row.TEZ_SAYISI), va='center', fontweight='bold')
    plt.tight_layout()
    plt.savefig("MASTER_GRAFIK_2_KONULAR.png")

    # --- ANALİZ 3: MATRİS (Isı Haritası) ---
    print("🔥 Bölge-Konu Matrisi (Isı Haritası) hazırlanıyor...")
    df_cross = df.explode('BOLGELER').explode('KONULAR')
    df_cross = df_cross.dropna(subset=['BOLGELER', 'KONULAR'])
    
    # Pivot Tablo
    heatmap_data = df_cross.groupby(['BOLGELER', 'KONULAR']).size().unstack(fill_value=0)

    plt.figure(figsize=(20, 12))
    sns.heatmap(heatmap_data, cmap='YlGnBu', annot=False, linewidths=.5)
    plt.title("Master Analiz: Bölge ve Konu İlişkisi Matrisi")
    plt.xlabel("Konular")
    plt.ylabel("Bölgeler")
    plt.xticks(rotation=45, ha='right')
    plt.tight_layout()
    plt.savefig("MASTER_GRAFIK_3_MATRIS.png")

    # --- RAPOR YAZMA ---
    print(f"📝 Sonuçlar rapora dökülüyor: {RAPOR_DOSYASI}")
    with open(RAPOR_DOSYASI, "w", encoding="utf-8") as f:
        f.write("=== MASTER ANALİZ SONUÇLARI ===\n")
        f.write(f"Analiz Tarihi: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}\n")
        f.write(f"Toplam İncelenen Tez: {len(df)}\n\n")
        
        f.write("1. BÖLGE SIRALAMASI\n")
        f.write("-" * 40 + "\n")
        for idx, row in bolge_counts.iterrows():
            yuzde = (row['TEZ_SAYISI'] / len(df)) * 100
            f.write(f"{idx+1}. {row['BOLGE']}: {row['TEZ_SAYISI']} Tez (%{yuzde:.1f})\n")
            
        f.write("\n2. KONU SIRALAMASI\n")
        f.write("-" * 40 + "\n")
        for idx, row in konu_counts.iterrows():
            yuzde = (row['TEZ_SAYISI'] / len(df)) * 100
            f.write(f"{idx+1}. {row['KONU']}: {row['TEZ_SAYISI']} Tez (%{yuzde:.1f})\n")

        f.write("\n3. ANALİZ NOTLARI\n")
        f.write("-" * 40 + "\n")
        f.write("- Sözlük Kapsamı: En sık geçen 2000 kelimenin manuel filtrelenmiş hali.\n")
        f.write("- Temizlik: 'Kriz', 'Parti', 'Türk' (tek başına) gibi gürültü kelimeleri çıkarıldı.\n")
        f.write("- Eklemeler: 'Türk Dünyası', 'Blokzincir', 'Sürdürülebilir Kalkınma' eklendi.\n")
        f.write("- Puanlama: Başlıkta geçen kelimeler 10 kat daha değerli sayıldı.\n")
        f.write("- Düzeltme (03.11.2026): 'AB', 'EU', 'BM' kısaltmaları sözlükte sonda boşlukla yazıldığı için\n"
                "  hiç eşleşmiyordu; düzeltildi. 'UN' çıkarıldı: Türkçe ekle karışıyordu ('Covid-19'un' → 'COVID UN').\n"
                "  Birleşmiş Milletler zaten 'BIRLESMIS MILLETLER' ve 'UNITED NATIONS' ile aranıyor.\n")


    # --- EK ANALİZ (02.11.2026): Merkez / Yarı merkez / Taşra kırılımı ---
    # Güncel veride 'Konum_Turu' sütunu var; eski analizde bu kırılım yoktu.
    # Yukarıdaki etiketleme mantığı aynen kullanılır, sadece gruplara ayrılır.
    if 'Konum_Turu' in df.columns:
        konum_sirasi = ['MERKEZ', 'YARI MERKEZ', 'TAŞRA']
        bilinen = df[df['Konum_Turu'].isin(konum_sirasi)]
        with open(RAPOR_DOSYASI, "a", encoding="utf-8") as f:
            f.write("\n4. EK: MERKEZ / YARI MERKEZ / TAŞRA KIRILIMI (02.11.2026)\n")
            f.write("-" * 40 + "\n")
            f.write(f"Konum bilgisi olan tez: {len(bilinen)} / {len(df)} (bilinmeyen: {len(df)-len(bilinen)})\n")
            for konum in konum_sirasi:
                alt = df[df['Konum_Turu'] == konum]
                n = len(alt)
                f.write(f"\n--- {konum} (N={n}) ---\n")
                for baslik_ad, kol in (("En çok çalışılan 5 bölge", 'BOLGELER'), ("En çok çalışılan 5 konu", 'KONULAR')):
                    sayim = alt.explode(kol)[kol].value_counts().head(5)
                    f.write(f"  {baslik_ad}:\n")
                    for ad, s in sayim.items():
                        f.write(f"    * {ad}: {s} Tez (%{s/n*100:.1f})\n")
        # Konum x Bölge ve Konum x Konu oran tabloları (Excel)
        with pd.ExcelWriter("KONUM_KIRILIMI_TABLOLARI.xlsx") as w:
            for kol, sayfa in (('BOLGELER', 'Bolge x Konum'), ('KONULAR', 'Konu x Konum')):
                t = bilinen.explode(kol).dropna(subset=[kol]).reset_index(drop=True)
                adet = pd.crosstab(t[kol], t['Konum_Turu']).reindex(columns=konum_sirasi, fill_value=0)
                adet = adet.loc[sorted(adet.index, key=lambda k: int(re.match(r'[BK](\d+)', k).group(1)))]
                n_konum = bilinen['Konum_Turu'].value_counts().reindex(konum_sirasi)
                oran = (adet / n_konum * 100).round(1)
                adet.columns = [f"{c} (tez)" for c in adet.columns]
                oran.columns = [f"{c} (%)" for c in oran.columns]
                pd.concat([adet, oran], axis=1).to_excel(w, sheet_name=sayfa)
        print("📎 Ek: Merkez/Taşra kırılımı rapora ve KONUM_KIRILIMI_TABLOLARI.xlsx dosyasına yazıldı.")


    # --- EK ANALİZ 2 (02.11.2026): Yüksek Lisans / Doktora kırılımı ---
    # Elif Hoca'nın isteği: konu ve bölge dağılımı tez türüne göre ayrı.
    # Etiketleme mantığı aynı; gruplar farklı büyüklükte olduğu için YÜZDE ile karşılaştırılır.
    if 'Tez Türü' in df.columns:
        turler = ['Yüksek Lisans', 'Doktora']
        renkler = {'Yüksek Lisans': '#4C72B0', 'Doktora': '#DD8452'}
        df_tur = df[df['Tez Türü'].isin(turler)]
        n_tur = df_tur['Tez Türü'].value_counts().reindex(turler)

        def tur_tablosu(kol):
            t = df_tur.explode(kol).dropna(subset=[kol]).reset_index(drop=True)
            adet = pd.crosstab(t[kol], t['Tez Türü']).reindex(columns=turler, fill_value=0)
            oran = (adet / n_tur * 100).round(1)
            sira = oran.mean(axis=1).sort_values(ascending=False).index
            return adet.loc[sira], oran.loc[sira]

        def tur_grafigi(oran, baslik, dosya):
            import numpy as np
            fig, ax = plt.subplots(figsize=(13, 0.55 * len(oran) + 2))
            y = np.arange(len(oran)); h = 0.4
            for i, tur in enumerate(turler):
                bars = ax.barh(y + (i - 0.5) * h, oran[tur], height=h, color=renkler[tur],
                               label=f"{tur} (N={n_tur[tur]:,})".replace(',', '.'))
                for b, v in zip(bars, oran[tur]):
                    ax.text(b.get_width() + 0.3, b.get_y() + b.get_height() / 2, f"%{v:.1f}",
                            va='center', fontsize=8)
            ax.set_yticks(y); ax.set_yticklabels(oran.index); ax.invert_yaxis()
            ax.set_xlabel("Tezlerin yüzdesi (%) — bir tez birden fazla kategoriye girebilir")
            ax.set_title(baslik)
            ax.legend(loc='lower right')
            ax.set_xlim(0, oran.values.max() * 1.12)
            plt.tight_layout(); plt.savefig(dosya, dpi=110); plt.close()

        b_adet, b_oran = tur_tablosu('BOLGELER')
        k_adet, k_oran = tur_tablosu('KONULAR')
        tur_grafigi(b_oran, "Tezlerin Bölgesel Dağılımı: Yüksek Lisans ve Doktora", "MASTER_GRAFIK_4_BOLGELER_YL_DOKTORA.png")
        tur_grafigi(k_oran, "Tezlerin Konu Dağılımı: Yüksek Lisans ve Doktora", "MASTER_GRAFIK_5_KONULAR_YL_DOKTORA.png")

        with pd.ExcelWriter("TEZ_TURU_KIRILIMI_TABLOLARI.xlsx") as w:
            for adet, oran, sayfa in ((b_adet, b_oran, 'Bolge x Tez Turu'), (k_adet, k_oran, 'Konu x Tez Turu')):
                a = adet.copy(); a.columns = [f"{c} (tez)" for c in a.columns]
                o = oran.copy(); o.columns = [f"{c} (%)" for c in o.columns]
                fark = (oran['Doktora'] - oran['Yüksek Lisans']).round(1).rename('Fark (Dr - YL, puan)')
                pd.concat([a, o, fark], axis=1).to_excel(w, sheet_name=sayfa)

        with open(RAPOR_DOSYASI, "a", encoding="utf-8") as f:
            f.write("\n5. EK: YÜKSEK LİSANS / DOKTORA KIRILIMI (02.11.2026)\n")
            f.write("-" * 40 + "\n")
            f.write(f"Yüksek Lisans: {n_tur['Yüksek Lisans']} tez, Doktora: {n_tur['Doktora']} tez "
                    f"(Sanatta Yeterlik 1 tez hariç). Oranlar her grubun kendi toplamına göredir.\n")
            ort = df_tur.assign(_k=df_tur[col_ozet].astype(str).str.split().str.len()).groupby('Tez Türü')['_k'].mean()
            f.write(f"NOT: Doktora özetleri ortalama {ort['Doktora']:.0f} kelime, YL özetleri {ort['Yüksek Lisans']:.0f} kelime. "
                    "Puanlama özetteki her geçişi saydığı için uzun özetler eşiği daha kolay geçer; "
                    "doktoradaki genel yükseklik kısmen buradan kaynaklanabilir. Sıralamalar ve göreli farklar daha güvenilirdir.\n")
            for ad, oran in (("BÖLGE", b_oran), ("KONU", k_oran)):
                f.write(f"\n--- {ad} (YL % / Doktora % / fark) ---\n")
                for kat, r in oran.iterrows():
                    f.write(f"  {kat}: %{r['Yüksek Lisans']:.1f} / %{r['Doktora']:.1f} / {r['Doktora']-r['Yüksek Lisans']:+.1f}\n")
        print("📎 Ek: YL/Doktora kırılımı (2 grafik + tablo) üretildi.")

    print("\n✅ İŞLEM TAMAMLANDI.")
    print("   👉 Şimdi oluşan 3 PNG grafiğini ve TXT raporunu inceleyebilirsin.")

if __name__ == "__main__":
    main()