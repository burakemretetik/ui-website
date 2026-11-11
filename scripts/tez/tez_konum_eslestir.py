"""
Tez verisine konum (M/YM/T) ve kurum türü (Devlet/Özel) atar.

Eski tez_lookup_analizi.py'nin yerine geçer. Fark:
  1. Ad karşılaştırmasında "Üniversitesi" ve "Vakıf" sözcükleri yok sayılır
     ("Ardahan Üniversitesi" = listedeki "Ardahan",
      "Fatih Sultan Mehmet Vakıf Üniversitesi" = "Fatih Sultan Mehmet Üniversitesi").
  2. Listede kısaltılmış ya da eski adla geçen üniversiteler için açık bir
     eşleme tablosu var (ESKI_VE_KISA_ADLAR).
  3. Listede olup hiç tezle eşleşmeyen üniversite kalırsa ve eşleşmeyen adlar
     arasında listedekilere benzeyen bir ad varsa UYARI verir.
  4. Daha önce dolu olan konum/kurum değerleri yeniden hesaplanır ve eskisiyle
     karşılaştırılır; fark çıkarsa raporlanır (sessizce değiştirilmez).

Kullanım:
    python tez_konum_eslestir.py "TEZ_VERISI (YL ve Doktora).xlsx" m_ym_t.xlsx
Çıktı: eşleşme raporu (ekrana) + degisen_tezler.csv
"""
import re
import sys
import difflib
import pandas as pd

# Listede (m_ym_t) kısaltılmış ya da tezlerde eski adıyla geçen üniversiteler.
# Anahtar: tezdeki adın normalize hali; değer: m_ym_t "Üniversite" sütunundaki ad.
ESKI_VE_KISA_ADLAR = {
    # listede kısaltılmış adlar
    "ADANA ALPARSLAN TURKES BILIM VE TEKNOLOJI": "Adana alparslan",
    "NEVSEHIR HACI BEKTAS VELI": "Nevşehir",
    "HATAY MUSTAFA KEMAL": "Hatay mustafa kemal",
    "TEKIRDAG NAMIK KEMAL": "Tekirdağ Namık Kemal",
    "KAYSERI ABDULLAH GUL": "Kayseri Abdullah Gül",
    "ABDULLAH GUL": "Kayseri Abdullah Gül",
    "IZMIR KATIP CELEBI": "İzmir Katip Çelebi",
    "IHSAN DOGRAMACI BILKENT": "İhsan Doğramacı Bilkent",
    "ORTA DOGU TEKNIK": "ODTÜ",
    "BANDIRMA ONYEDI EYLUL": "Bandırma 17 Eylül Üni",
    "BURSA TEKNIK": "Bursa Teknik Üni",
    "CANAKKALE ONSEKIZ MART": "Çanakkale 18 Mart Üniversitesi",
    "KUTAHYA DUMLUPINAR": "Kütahya Dumlupınar Ünivrsitesi",
    "BOLU ABANT IZZET BAYSAL": "Bolu Aband İzzet Baysal Üniversitesi",
    "HITIT": "Çorum Hitit Üniversitesi",
    "TURK ALMAN": "Türk- Alman Üniversitesi",
    "ISTANBUL YENI YUZYIL": "Yeni Yüzyıl Üniversitesi",
    "ISTANBUL NISANTASI": "Nişantaşı Üniversitesi",
    "ISTANBUL BEYKENT": "Beykent Üniversitesi",
    "ISTANBUL OKAN": "Okan Üniversitesi",
    "ISTANBUL ESENYURT": "İstanbul Esenyurt Üniversitesi",
    # eski adlar (kurum aynı, adı değişmiş)
    "MUSTAFA KEMAL": "Hatay mustafa kemal",
    "YUZUNCU YIL": "Van Yüzüncü yıl Üniversitesi",
    "MUGLA": "Muğla Sıtkı Koçman Üniversitesi",
    "NIGDE": "Niğde Ömer Halisdemir Üniversitesi",
    "NAMIK KEMAL": "Tekirdağ Namık Kemal",
    "BOZOK": "Yozgat Bozok",
    "GEDIK": "İstanbul Gedik Üniversitesi",
    "ISTANBUL KEMERBURGAZ": "Altınbaş Üniversitesi",
    "ULUDAG": "Bursa Uludağ Üniversitesi",
    "ABANT IZZET BAYSAL": "Bolu Aband İzzet Baysal Üniversitesi",
    "DUMLUPINAR": "Kütahya Dumlupınar Ünivrsitesi",
    "ATATURK": "Erzurum Atatürk Üniversitesi",
    "ADNAN MENDERES": "Aydın Adnan Menderes Üniversitesi",
    "CELAL BAYAR": "Manisa Celal Bayar Üniversitesi",
    "AHI EVRAN": "Kırşehir Ahi Evran",
    "YILDIRIM BEYAZIT": "Ankara Yıldırım Beyazıt Üniversitesi",
    "GAZIOSMANPASA": "Tokat Gaziosmanpaşa Üniversitesi",
    "OSMANGAZI": "Eskişehir OsmanGazi üniversitesi",
    "SUTCU IMAM": "Kahramanmaraş Sütçü İmam Üniversitesi",
    "KARATEKIN": "Çankırı Karatekin",
    "KARAMANOGLU MEHMETBEY": "Karamanoğlu Mehmet Bey Üniversitesi",
}

ATLANAN_SOZCUKLER = {"UNIVERSITESI", "UNIVERSITE", "UNI", "UNIVRSITESI", "VAKIF"}
TR = str.maketrans("ÇĞİÖŞÜÂÎÛçğıöşüâîû", "CGIOSUAIUcgiosuaiu")


def normalize(ad):
    """Büyük harf, Türkçe harfler ASCII, yalnız harf/rakam, atlanan sözcükler hariç."""
    if ad is None or (isinstance(ad, float) and pd.isna(ad)):
        return ""
    s = str(ad).replace("i̇", "i").translate(TR).upper()
    s = s.replace("17", " ONYEDI ").replace("18", " ONSEKIZ ")
    kelimeler = re.sub(r"[^A-Z0-9]+", " ", s).split()
    return " ".join(k for k in kelimeler if k not in ATLANAN_SOZCUKLER)


def main(tez_yolu, liste_yolu):
    tez = pd.read_excel(tez_yolu, dtype=str)
    liste = pd.read_excel(liste_yolu, sheet_name=0, dtype=str)
    liste = liste[liste["Y/M/T"].notna() & (liste["Y/M/T"].str.strip() != "")]

    anahtar = {}  # normalize ad -> (liste adı, konum, kurum)
    for _, r in liste.iterrows():
        k = normalize(r["Üniversite"])
        anahtar[k] = (r["Üniversite"].strip(), r["Y/M/T"].strip(), r["D/Ö"].strip())
    for k, liste_adi in ESKI_VE_KISA_ADLAR.items():
        hedef = [v for v in anahtar.values() if v[0] == liste_adi]
        if not hedef:
            raise SystemExit(f"Eşleme tablosundaki '{liste_adi}' m_ym_t'de yok")
        anahtar.setdefault(normalize(k), hedef[0])

    def bul(row):
        for sutun in ("Üniversite", "Üniversite_Temiz"):
            k = normalize(row.get(sutun))
            if k in anahtar:
                return anahtar[k]
        return (None, None, None)

    sonuc = tez.apply(bul, axis=1, result_type="expand")
    sonuc.columns = ["Liste_Adi", "Konum_Yeni", "Kurum_Yeni"]
    tez = pd.concat([tez, sonuc], axis=1)

    eski_dolu = tez["Konum_Turu"].notna()
    celiski = tez[eski_dolu & ((tez["Konum_Turu"] != tez["Konum_Yeni"]) |
                               (tez["Kurum_Turu"] != tez["Kurum_Yeni"]))]
    yeni = tez[~eski_dolu & tez["Konum_Yeni"].notna()]

    print(f"Toplam tez: {len(tez):,}")
    print(f"Önceden dolu: {eski_dolu.sum():,} | yeni hesapla farklı çıkan: {len(celiski)}")
    if len(celiski):
        print("  UYARI — önceden dolu olup farklı çıkanlar:")
        print(celiski.groupby(["Üniversite", "Konum_Turu", "Konum_Yeni", "Kurum_Turu", "Kurum_Yeni"],
                              dropna=False).size().to_string())
    print(f"Yeni eşleşen (önceden boş): {len(yeni)}")
    print(yeni.groupby(["Üniversite", "Liste_Adi", "Konum_Yeni", "Kurum_Yeni"]).size().to_string())

    # Uyarılar: listede olup hiç tezi olmayan üniversiteler ve listeye benzeyen eşleşmeyen adlar
    eslesen_liste = set(tez["Liste_Adi"].dropna())
    tezsiz = sorted(set(liste["Üniversite"].str.strip()) - eslesen_liste)
    print(f"\nListede olup hiç tezle eşleşmeyen üniversite: {len(tezsiz)}")
    for u in tezsiz:
        print("  -", u)
    kalan = tez[tez["Konum_Yeni"].isna()]["Üniversite"].value_counts()
    liste_anahtarlari = list(anahtar)
    supheli = []
    for ad, n in kalan.items():
        k = normalize(ad)
        yakin = difflib.get_close_matches(k, liste_anahtarlari, n=1, cutoff=0.75)
        icinde = [a for a in liste_anahtarlari if len(a) > 4 and (a in k or k in a)]
        if yakin or icinde:
            supheli.append((ad, n, (yakin or icinde)[0]))
    print(f"\nEşleşmeyen {kalan.sum():,} tez / {len(kalan)} farklı ad. Listeye benzeyenler (elle kontrol):")
    for ad, n, k in supheli:
        print(f"  UYARI: '{ad}' ({n} tez) ~ listedeki '{anahtar[k][0]}'")

    yeni[["Tez No", "Yıl", "Üniversite", "Liste_Adi", "Konum_Yeni", "Kurum_Yeni"]].to_csv(
        "degisen_tezler.csv", index=False)
    return tez


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
