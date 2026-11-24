# Veri Değişiklikleri Günlüğü

Bu dosya, `public/data/*.json` veri setleri ve grafik mantığı üzerinde yapılan
kayda değer değişiklikleri kaydeder. Kaynak Excel'ler `public/data_admin/`
altındadır ve repoda izlenir (tez verisi hariç, bkz. 2026-11-03).

---

## 2026-11-24 — Müfredat: bozuk AKTS hücreleri düzeltildi, en sık dersler üniversite sayısıyla

- **Sorun:** Kaynak Excel'de 41 AKTS hücresi tarih biçimindeydi: "7.5" ve "6.5" yazılan hücreler
  7 Mayıs / 6 Mayıs tarihine dönmüştü (Excel'de 45784 / 45783 sayısı, hücre biçimi "g.a").
  Excel'de "7.5" görünüyordu ama kodla okununca 45784 geliyordu; JSON'a da AKTS'siz (null) girmişti.
- **Düzeltme:** `public/data_admin/mufredat.xlsx` içinde yalnız bu 41 hücre 7,5 (38 hücre) ve 6,5
  (3 hücre) sayısına çevrildi; başka hücreye dokunulmadı. `public/data/mufredat.json` içinde aynı
  41 kaydın `akts` alanı güncellendi (`scripts/mufredat/akts_guncelle.py`; kayıtların Excel ile
  aynı sırada olduğunu satır satır kontrol eder, yalnız AKTS'yi yazar).
- **En sık dersler (Müfredat sayfası ve İngilizce Figure 6):** artık dersin geçtiği farklı üniversite
  sayılıyor (önce Müfredat sayfası kayıt sayıyordu). Yalnız yazımı farklı adlar birleşiyor:
  büyük/küçük harf, Türkçe karakter (I/İ/ı), noktalama, sondaki 1/I … 4/IV (`lib/dersAdi.ts`).
  Ortalama AKTS yalnız AKTS > 0 kayıtlarla. Kural Drive'daki müfredat analiziyle aynı.
- **Ana sayfa:** "2.450 benzersiz ders" yazım farklarını ayrı ders sayıyordu; aynı kuralla
  "1.918 farklı ders" yapıldı.
- **Doğrulama:** `lib/dersAdi.ts` Node'da çalıştırılıp Drive'daki "Ders sıklığı" tablosuyla
  karşılaştırıldı (3 düzey × 4 konum, ilk 50 ders; ders adı, üniversite, kayıt, ort. AKTS; 508
  kontrol): fark yok. Örnek: Lisans'ta Türk Dili I 77, Atatürk İlkeleri ve İnkılap Tarihi I 74
  üniversite.

---

## 2026-11-22 — Yayın sayfası yenilendi: 2000–2025 InCites verisi, dört veri grubu

- **Eski veri kaldırıldı:** 707 kayıtlık eski `yayinlar.json` (2018–2023, Q sıralamalı makale ve kitap
  bölümleri) ve kaynağı `public/data_admin/yayinlar.xlsx` silindi; Q grafikleri kaldırıldı.
- **Yeni veri:** Elif Hoca'nın `2000-2025.xlsx` dosyasındaki son dört sayfa (InCites): Uİ ESCI dahil
  3.363, Uİ ESCI hariç 2.895, SB ESCI dahil 4.936, SB ESCI hariç 3.179 yayın (toplam 7.240 benzersiz).
  Konu, bölge, konum ve kurum türü kodları "remove duplicate tümü" sayfasından Accession Number ile
  aktarıldı. JSON `scripts/yayin/build_yayinlar.py` ile üretilir; kaynak Excel'ler (InCites
  dışa aktarımı) Drive'da, "Yayın analizi (2000-2025)" klasöründe durur ve repoya konmadı.
- **Kurallar:** sayımlar tüm belge türleriyle; atıf, CNCI ve en çok atıf alan %10 yalnız Article +
  Review ile. Bir yayın her konum, kurum türü, konu ve bölge kategorisinde en fazla bir kez sayılır.
  "-----" ve "—" kodları kodlanmamış sayılır. Ayrıntılar Drive'daki karar notunda.
- **Filtre:** yayınların birden çok kurumu olduğu için yayın sayfası `useFilteredData` yerine
  `lib/yayin.ts` → `filtrele()` kullanır. Üç konumun (iki kurum türünün) hepsi seçiliyken filtre
  uygulanmaz; seçim daraltılınca yalnız seçili kategoride kurumu olan yayınlar kalır. Yıl filtresi
  2000–2025.
- **Doğrulama:** `lib/yayin.ts` fonksiyonları Node'da çalıştırılıp Drive'daki tablolarla
  karşılaştırıldı (dört grup; genel etki, konum, tür, konu, bölge sayıları ve konum/tür/dönem/konu/
  bölge filtreli etki göstergeleri; 460 kontrol): fark yok. Gösterim yuvarlaması numpy ile aynı
  (`yuvarla`), bu yüzden sınır değerlerde de tablolarla aynı sayı görünür.
- **Ana sayfa:** "435 WoS Makale" ve "272 Kitap Bölümü" kartları "7.240 WoS Yayın" ve
  "3.363 Uİ Yayını" ile değiştirildi.

---

## 2026-11-22 — Aynı konu/bölge kodu bir kayıtta bir kez sayılıyor

- **Sorun:** 10 akademisyende aynı kod iki kez yazılmıştı (konu: 3 kişi; bölge: 7 kişi). Site
  bunları iki kez sayıyordu: K13 +2, K12 +1, B16 +4, B3 +2, B4 +1.
- **Düzeltme:** `akademisyenler.json` içinde bu 10 tekrar kaldırıldı (kaynak Excel aynen duruyor).
  Ayrıca `lib/codes.ts` → `uniqueCodes()` eklendi; Akademisyen, Projeler ve İngilizce figürler
  (Figure 3, 4, 9, 10) kodları kayıt başına bir kez sayıyor.
- **Yeni sayılar:** Türkiye (B16) 947 → 943, Batı Avrupa (B3) 459 → 457, Merkez ve Doğu Avrupa (B4)
  290 → 289, Kimlik ve Milliyetçilik (K13) 302 → 300, Politik Ekonomi (K12) 159 → 158.
  Bu hâliyle Pelin Hoca'nın rapordaki bölge yüzdeleri ve Elif Hoca'nın kontrol not defteri
  birebir tutuyor (ör. merkezde Türkiye 84/123 = %68,3; devlet %61,5; vakıf/özel %81,9).
  Proje verisinde tekrar yok; proje sayıları değişmedi.

---

## 2026-11-21 (gece) — Akademisyen konu/bölge kodları büyük harfe çevrildi; kaynak Excel güncellendi

- **Kodlar:** Kaynakta küçük harfle girilmiş 26 konu/bölge kodu (ör. `k17`, `b16`)
  `akademisyenler.json` içinde büyük harfe çevrildi. Türkçe Akademisyen sayfası bunları zaten
  sayıyordu; İngilizce Figure 3 ve 4 ile konu/bölge filtresi saymıyordu. Figure 3/4'te bazı
  çubuklar 1–4 arttı (ör. K17 252 → 256, B16 943 → 947); artık Türkçe sayfa, İngilizce
  figürler, Drive'daki akademisyen analizi ve "akademisyen konu-bolge yuzdeleri" dosyası
  aynı sayıları veriyor. `Export.tsx` de kodları büyük harfe çevirerek sayıyor.
- **Kaynak Excel:** `data_admin/akademisyenler.xlsx`, Elif Hoca'nın güncel listesiyle
  değiştirildi: 1.723'lük eski tablodan 267 tez adı ve 577 tez dili aktarıldı, sadece bölge
  kodu olan 10 kişiye "BÖLGE ÇALIŞIYOR" yazıldı, bir boş satır silindi. Bu alanlar sitede
  kullanılmadığından başka hiçbir sayı değişmedi (1.706 kişi).

---

## 2026-11-21 — Akademisyen listesi: unvanı "MA?" olan kişi çıkarıldı; ünvanlar 5 kategori; 5 projenin konumu

- **Akademisyen (Elif Hoca'nın kararı):** İstanbul Bilgi Üniversitesi AB Enstitüsü'nden
  elle eklenen, öğretim elemanı unvanı olmayan 1 kişi (unvan "MA?") listeden çıkarıldı.
  `akademisyenler.xlsx` Sheet1 satır 408 XML düzeyinde silindi (YEDEK sayfası ve diğer
  hücreler aynı); `akademisyenler.json` 1.707 → 1.706.
  Etki: kadın 663 → 662, yarı merkez 1.124 → 1.123 (%65,8), taşra %24,5 → %24,6, vakıf
  490 → 489. Kişinin konu/bölge kodu ve WoS kaydı yoktu; bu analizler değişmedi.
- **Ünvanlar (Elif Hoca'nın kararı):** Beş kategori: Profesör, Doçent, Dr. Öğr. Üyesi,
  Araştırma Görevlisi, Öğretim Görevlisi. "Diğer" kategorisi kaldırıldı (`UNVAN_ORDER`).
  YÖK'te "... (Unvan:Doçent)" yazan 71 kişi Doçent sayılır (site zaten böyle sayıyordu:
  Doçent 395, Dr. Öğr. Üyesi 472, Öğretim Görevlisi 71).
- **Projeler:** Kaynakta (EK3) konumu "-" olan, çalışma listesinde bulunmayan
  üniversitelerdeki 5 proje (Erasmus+ Adıyaman; Jean Monnet İTÜ ve 3 × Anadolu) sitede
  yanlışlıkla taşra sayılıyordu; `konum: bilinmiyor` yapıldı. Proje Türü × Konum grafiği ve
  İngilizce Figure 8'de taşra 7 → 2 (Erasmus+ 1, Jean Monnet 1); Projeler sayfasına not eklendi.
- Ana sayfadaki "1.707" → "1.706". İngilizce figürlerden yalnızca Figure 1 ve 8 değişti.

---

## 2026-11-11 (öğleden sonra) — Tezlerde boş kalan konum/kurum türü dolduruldu

- **Sorun:** `TEZ_VERISI (YL ve Doktora).xlsx` dosyasında konum (M/YM/T) ve kurum türü,
  tezdeki üniversite adının `m_ym_t.xlsx` listesindeki adla harfi harfine eşleşmesiyle
  atanıyordu (Drive › Yedek › `tez_lookup_analizi.py`). Listede kısaltılmış ("Ardahan",
  "Nevşehir", "Adana alparslan") ya da tezlerde eski adıyla geçen ("Yüzüncü Yıl",
  "Mustafa Kemal", "Muğla", "Niğde", "Namık Kemal", "Bozok", "Gedik", "İstanbul
  Kemerburgaz" → Altınbaş) üniversitelerin tezleri sessizce boş kalıyordu.
- **Çözüm:** `scripts/tez/tez_konum_eslestir.py`. "Üniversitesi" ve "Vakıf" sözcüklerini
  yok sayıyor, kısaltılmış ve eski adlar için açık bir eşleme tablosu kullanıyor, daha önce
  dolu değerleri yeniden hesaplayıp eskisiyle karşılaştırıyor (fark: 0) ve listede olup
  tezle eşleşmeyen ya da listeye benzeyen ama eşleşmeyen adlar için uyarı veriyor (hepsi
  elle kontrol edildi: Gazi, Fatih, Şehir, İTÜ, Gediz, İstanbul Kent, Cerrahpaşa vb. listede yok).
- **Etki:** 107 tez (Uşak'ın 1 tezi bilerek dışarıda, listede kategorisi yok).
  Taşra 1.281 → 1.370, yarı merkez 8.221 → 8.239, bilinmiyor 2.035 → 1.928;
  devlet 8.740 → 8.840, vakıf 3.337 → 3.344. Konu/bölge etiketleri değişmedi.
  Ayrıntı: Çankırı Karatekin 35, Nevşehir HBV 26, Muğla 7, Ardahan 6, Niğde 6,
  Mustafa Kemal 5, FSM Vakıf 5, Yozgat Bozok 4+1, Yüzüncü Yıl 4, Adana ATÜ 3,
  Namık Kemal 3, Gedik 1, Kemerburgaz 1.
- `tezler.json` yeniden üretildi. Drive'da TEZ_VERISI'nin yalnızca bu 214 hücresi
  değişti; tez konu-bölge analizinin raporu ve KONUM tablosu ile "Çıktılar" klasöründeki
  konum/kurum grafikleri yeniden üretildi.

---

## 2026-11-11 — Van Yüzüncü Yıl Üniversitesi: taşra → yarı merkez

- **Karar:** Elif Hoca'nın referans listesi ("m/ym/t", kuruluş yılı ve 2006 öncesi/sonrası
  sütunlu Google E-Tablosu) doğru kaynak kabul edildi. Bu listede Van YYÜ
  "YARI MERKEZ, DEVLET, 1982, 2006 öncesi"; "Üniversite taşra merkez ayrımı" belgesinde de
  *Semi-center › Regional Centres* grubunda. Bu yüzden alt kategori "yarı merkez 1"
  (Akdeniz, Çukurova, İnönü, KTÜ vb. ile aynı grup).
- Tez analizinde kullanılan `m_ym_t.xlsx` bu referansla satır satır karşılaştırıldı: tek fark
  referansta kategorisi boş "Uşak Üniversitesi" satırı (olduğu gibi bırakıldı) ve Beykoz'un
  "VAKIF"/"ÖZEL" yazımı. Akademisyen ve tez verisinde Van zaten yarı merkezdi.
- **Düzeltilen kaynaklar (`public/data_admin/`):** `universiteler.xlsx` Sayfa1 C115–D115;
  `misyon_vizyon.xlsx` Sheet1 B112; `mufredat.xlsx` "ders müfredatları" C4531–C4573 ve
  "ders müfredatı part-3" B1231–B1273; `kontenjanlar.xlsx` Sayfa1 C236. Aynı dosyada
  Adana ATÜ'nün konumu "-" yazılıydı (C3), "taşra" yapıldı (site verisi zaten taşraydı).
  Hücreler XML düzeyinde değiştirildi; pivot, biçim ve diğer hücreler aynı.
- **JSON etkisi:** universiteler taşra 37 → 36, yarı merkez 77 → 78; misyon_vizyon taşra
  37 → 36; mufredat 43 ders taşra → yarı merkez (taşra 1.468 → 1.425); kontenjanlar 5 kayıt
  (2021–2025: 50/50/50/55/40). Kontenjan taşra toplamı 2021 2.340, 2025 1.730 (−%26,1);
  yarı merkez 2021 5.826, 2025 4.696.

---

## 2026-11-03 (öğleden sonra) — Tez sözlüğü düzeltmesi, COST yılları doğrulandı

### Tez sözlüğü: AB / EU / BM (Elif Hoca'nın onayıyla)
- **Sorun:** `scripts/tez/tez_konu_bolge_analizi.py` sözlüğünde "AB ", "EU ", "BM ", "UN "
  sonda boşlukla yazılmıştı. Kod her anahtarın iki yanına boşluk eklediği ve metin tek
  boşluğa indirgendiği için bu dördü hiçbir tezde eşleşmiyordu.
- **Çözüm:** "AB", "EU" (K17 Avrupa Birliği ve B3 Batı Avrupa), "BM" (K10) boşluksuz yazıldı.
  **"UN" çıkarıldı:** Türkçe ekle karışıyor ("Covid-19'un" → "COVID UN"); Birleşmiş Milletler
  zaten "BIRLESMIS MILLETLER" ve "UNITED NATIONS" ile aranıyor.
- **Etki (14.112 tez):** 827 tezin etiketi değişti, hiçbir tez etiket kaybetmedi.
  K17 Avrupa Birliği 2.114 → 2.674 (%15,0 → %18,9), B3 Batı Avrupa 3.008 → 3.496
  (%21,3 → %24,8; Orta Doğu'yu geçip 2. sıra), K10 Uluslararası Örgütler 478 → 589
  (%3,4 → %4,2). Diğer tüm konu/bölgeler aynı.
- `tezler.json` yeniden üretildi; Drive › Analizler › Tez & Akademisyen › Tez konu-bölge
  analizi klasöründeki rapor, 5 grafik ve 2 tablo da aynı kuralla yeniden üretildi.
- Kaynak: `TEZ_VERISI (YL ve Doktora).xlsx` 3 Kasım 10:17 sürümü. 2 Kasım sürümüyle içerik
  birebir aynı (yalnızca boş hücre biçimi farklı), sonuca etkisi yok.

### COST yılları doğrulandı
- İrem'in "Proje Başlangıç Yılı" listesi (150 proje) koddan türetilen yıllarla 150/150 aynı.
  `projeler.json` değişmedi; `public/data_admin/projeler.xlsx` COST sayfasına
  "Proje Başlangıç Yılı" sütunu eklendi, Projeler sayfasındaki "tahmini" notu güncellendi.

---

## 2026-11-03 — Pelin Hoca'nın istekleri: menü, COST yılları, tezler sayfası; etiket düzeltmesi

### 1. Üst menü (ana sayfa linki)
- **Yeni:** `components/SiteNav.tsx`, `app/layout.tsx` içinde filtre çubuğunun üstünde.
  Her sayfada "Ana Sayfa" linki ve tüm bölümlerin linkleri var; aktif sayfa vurgulanır.

### 2. COST projelerinin yılı (`projeler.json`, 150 kayıt)
- **Önce:** 150 COST projesinin `year` alanı `null` (kaynak Excel'de yıl sütunu yok).
- **Sonra:** Yıl, COST aksiyon kodundan türetildi. Kodun ilk iki hanesi açık çağrı yılıdır
  (CA**23**xxx → OC-2023, Mayıs 2024'te onaylandı). Başlangıç yılı = çağrı yılı + 1.
  Dağılım: 2021: 48, 2022: 25, 2023: 41, 2024: 36.
- **Not:** Bu tahmini başlangıç yılıdır; kesin başlangıç tarihleri cost.eu'daki aksiyon
  sayfalarında yazar. Kesin tarih girilirse `projeler.json` doğrudan güncellenebilir.
- Projeler sayfasındaki "Yıllara Göre Proje Sayısı" grafiği artık COST'u da gösteriyor.
- TÜBİTAK 1001 (22), Erasmus+ (7), Jean Monnet (41) yılları zaten tamdı; değişmedi.

### 3. Konu ve bölge etiketleri düzeltildi (`lib/constants.ts`, `sections/Export.tsx`)
- **Sorun:** K/T ve B/R kodlarının sitede gösterilen adları, verinin kodlandığı kod
  kitabıyla uyuşmuyordu. Kanıt (veriyle karşılaştırma):
  - Anahtar kelimesinde "göç/mülteci" geçen 86 akademisyenin 77'si K5'e kodlu → sitede
    K5 "Karşılaştırmalı Siyaset" yazıyordu. Kod kitabında K5 = Uluslararası Göç.
  - "terör" → K8 (sitede "Çevre & Enerji"), "hukuk/insan hakları" → K9 (sitede "Göç &
    Mültecilik"), "Balkan" → B5 (sitede "Güney Avrupa"), "Afrika" → B9/B10.
  - Projeler aynı tabloyu verir: göç → T5, enerji/çevre → T4, barış → T7, dijital → T11.
- **Çözüm:** Etiketler, tez analizinde ve "Analiz Açıklaması" belgesinde kullanılan kod
  kitabına göre yazıldı (K1 Teori … K17 Avrupa Birliği; B1 Kuzey Amerika … B16 Türkiye).
  Kodlar ve sayılar değişmedi, yalnızca adlar.
- **Etkilenen:** Akademisyen, Projeler, Publication Figures sayfaları ve filtre çubuğu.
- **Yapılmadı:** `exported_charts/` ve `exported_svgs/` altındaki eski figürler eski
  etiketleri taşıyor; yeniden üretilmeleri gerekiyor.

### 4. Yeni sayfa: Tezler (`/tezler`, `public/data/tezler.json`)
- **Kaynak:** Drive › Analizler › Tez & Akademisyen › `TEZ_VERISI (YL ve Doktora).xlsx`
  (14.112 tez, 2006–2025; 11.659 YL, 2.452 doktora, 1 sanatta yeterlik). 20 MB ve yazar /
  özet içerdiği için repoya konmadı; siteye yalnızca yıl, tez türü, üniversite, konum,
  kurum türü, konu ve bölge kodları yazıldı.
- **Üretim:** `python scripts/tez/tezler_json_uret.py "<xlsx yolu>"`. Konu/bölge atama
  kuralı `scripts/tez/tez_konu_bolge_analizi.py` ile aynıdır (başlık 10 p, Türkçe özet her
  geçiş 1 p, eşik 3 p); sayılar Drive'daki tez analiz raporuyla birebir aynıdır
  (ör. B16 Türkiye 6.121, K3 Güvenlik 5.218).
- **Bilinmeyenler:** 2.035 tezin üniversitesi kapsam listesiyle eşleşmediği için konum ve
  kurum türü `bilinmiyor`. Kitap bölümlerindeki kural gibi bu tezler konum/kurum
  filtresinden bağımsız olarak her zaman sayılır (`hooks/useFilteredData.ts` kurum türü
  için de güncellendi).
- ~~Bilinen sınırlama: "AB ", "EU ", "BM ", "UN " anahtarları hiç eşleşmiyor.~~ → aynı gün
  düzeltildi, bkz. aşağıdaki "Tez sözlüğü düzeltmesi".
- Ana sayfaya "Tezler" kartı ve KPI eklendi; "Kontenjan & Tezler" kartı "Kontenjan" oldu
  (o sayfada tez verisi yoktu).
- **Filtre:** Yıl filtresi 2006–2025 (20 yıl) için satır kırılımlı hale getirildi; tüm
  yıllar seçilince otomatik sıfırlama, bölüm aralıkları farklı olduğu için kaldırıldı.

---

## 2026-06-24 — Kaynak doğrulama, müfredat yeniden üretimi ve filtre denetimi

### 1. Kaynak doğrulama (provenance)
Her JSON'un ilgili Excel'den geldiği satır sayısı düzeyinde doğrulandı.
7 veri setinden 6'sı Excel ile birebir uyuşuyor; tek bilinçli fark misyon-vizyon.

| JSON | Kaynak Excel → sheet | JSON | Excel | Durum |
|---|---|---|---|---|
| akademisyenler | akademisyenler.xlsx → `Sheet1` | 1.707 | 1.707 | Uyuyor |
| kontenjanlar | kontenjanlar.xlsx → `Sayfa1` (geniş→uzun) | 1.101 | 1.101 | Uyuyor |
| projeler | projeler.xlsx → `COST`+`Tübitak 1001`+`Projeler` | 220 | 220 | Uyuyor |
| universiteler | universiteler.xlsx → `Sayfa1` | 120 | 120 | Uyuyor |
| yayinlar | yayinlar.xlsx → `yayın`(435)+`kitap`(272) | 707 | 707 | Uyuyor |
| mufredat | mufredat.xlsx → `ders müfredatları` | 4.797 | 4.797 | Uyuyor |
| misyon_vizyon | misyon_vizyon.xlsx → `Sheet1` | 117 | 122 | −5 (bilinçli) |

**Not — misyon_vizyon −5:** Excel'de 122 satır var; JSON'da 117. Düşürülen 5
üniversite (Medipol, Ardahan, Hatay Mustafa Kemal, Milli Savunma, Adana
Alparslan Türkeş) çalışmanın 120'lik kapsam listesinde yer almıyor; kapsam-dışı
oldukları için bilinçli olarak dışarıda bırakıldı.

### 2. `mufredat.json` yeniden üretildi (4.828 → 4.797)
- **Önce:** JSON, Excel'deki üç ayrı `ders müfredatı part-1/2/3` sheet'inin
  toplamından (4.828) üretilmişti.
- **Sonra:** Konsolide ve temizlenmiş `ders müfredatları` sheet'inden (4.797)
  yeniden üretildi. Parça sheet'lerdeki 31 fazla satır elendi.
- **Kazanım:** `konum` ve `kurum_turu` alanları %100 normalize edildi
  (eşlenemeyen kayıt 0). Kaynaktaki karışık yazımlar — `TAŞRA`/`Taşra`/`taşra`,
  `Yarı Merkez 1`…`yarı merkez 11` — tek tip kovalara (`merkez`, `yari_merkez`,
  `tasra`) indirgendi.
- **Alan eşlemesi:** `Üniversite adı`→universite, `Dersin adı`→ders_adi,
  `Lisans/YL/Doktora`→seviye, `SİBU/Uİ`→program (`-` → null), `AKTS`→akts,
  `Üniversite kategorisi`→konum, `Devlet/ Vakıf`→kurum_turu.
- **AKTS boşlukları:** 157 kayıtta AKTS sayısal değil (`.` yer tutucu veya
  Excel'in tarihe çevirdiği bozuk girdiler, örn. `2025-05-07`); bunlar `null`
  olarak yazıldı. Bu, kaynak veri kalitesi kaynaklı, kurtarılamaz.

### 3. Yayın kitap bölümlerinin kaynağı tamamlandı
- `yayinlar.xlsx`'e `kitap` sheet'i (272 satır) eklendi. Böylece JSON'daki 707
  kayıt (435 makale + 272 kitap bölümü) tam olarak kaynağa karşılık geliyor.
- **Doğrulama:** `kitap` sheet'inde konum sütunu yok; bu yüzden 272 kitap
  bölümünün `konum` değeri `bilinmiyor`. Yani bu durum kaynak veriden gelir,
  dönüşüm hatası değildir.

### 4. Filtre düzeltmesi — `konum=bilinmiyor` her zaman dahil
- **Dosya:** `hooks/useFilteredData.ts`
- **Sorun:** Konum filtresi değiştirildiğinde, üniversite bilgisi olmayan
  (`konum=bilinmiyor`) 272 kitap bölümü sessizce kayboluyordu.
- **Çözüm:** `bilinmiyor` konumlu kayıtlar artık konum filtresinden bağımsız
  olarak her zaman gösteriliyor (konumu bilinmeyen kayıt konuma göre elenemez).

### 5. Grafik mantığı düzeltmesi — Müfredat "Ort. AKTS"
- **Dosya:** `sections/Mufredat.tsx`
- **Sorun:** `En Sık Görülen 20 Ders` grafiğindeki ortalama AKTS, AKTS'si boş
  olan dersleri `0` sayıyor ve ortalamayı yapay olarak düşürüyordu.
- **Çözüm:** Ortalama artık yalnızca AKTS'si dolu kayıtlar üzerinden hesaplanıyor
  (boşlar paydaya katılmıyor). Örnek: "Uluslararası İlişkiler Teorileri" 5.9 → 6.3.

### 6. Ana sayfa istatistik düzeltmeleri
- **Dosya:** `app/page.tsx`
- `4.828 → 4.797` ders kaydı (yeni müfredat kaynağıyla tutarlı; hero metni + kart).
- `418 → 2.450` benzersiz ders (eski sayı hatalıydı; gerçek benzersiz ders adı
  sayısı 2.450).
- (Önceki turda) `117 → 120` üniversite, alt yazı "Uİ / SBUİ bölümleri". 117
  yalnızca vizyon/misyon metni olan üniversite sayısıydı; 120 ise çalışmanın
  toplam kapsamı.

---

## 2026-06-23 — İlk yayın, üniversiteler sayfası ve grafik onarımları
*(commit 43ab8af ve öncesi — özet)*

- **Yeni sayfa:** `/universiteler` — 120 üniversite kategori bazlı (merkez / yarı
  merkez / taşra) açıklamalı listelenir. Kaynak: `universiteler.json`.
- **`universiteler.json`** üretildi (universiteler.xlsx → 120 kayıt).
- **Grafik kenar boşluğu onarımları:** Yarım genişlikteki grid hücrelerinde
  barların görünmemesi sorunu (MisyonVizyon, Akademisyen, Projeler) —
  `YAxis width` ve `margin.left` küçültülerek giderildi.
- **Yıl filtresi:** Aralık seçiciden tek tek yıl butonlarına çevrildi; "Tümü"
  seçeneği eklendi; bölüm bazlı yıl aralıkları tanımlandı (yayın 2018–2023,
  kontenjan 2021–2025, projeler 2021–2024).
- **Cinsiyet null:** Akademisyen cinsiyet grafiğinde `null` artık "Bilinmiyor"
  kategorisinde sayılıyor.

---

## Bilinen veri kalitesi notları (kaynak kaynaklı, hata değil)

- **Akademisyen konu/bölge alanları:** Ham veride `NA`, `KONU ÇALIŞIYOR`,
  `BÖLGE ÇALIŞIYOR`, `Uluslararası İlişkiler alanına girmiyor` gibi yer tutucu
  metinler var. Grafikler yalnızca geçerli kodları (K1–K17, B1–B16) saydığı için
  bunlar doğru şekilde sayım dışı kalır.
- **Projeler — COST yılı yok:** 150 COST projesinin yıl bilgisi kaynakta yok.
  "Yıllara Göre Proje Sayısı" grafiği bu nedenle yalnızca yıllı türleri
  (Erasmus+, TÜBİTAK 1001, Jean Monnet) gösterir.
- **Üniversite isimleri standart değil:** Her veri seti üniversite adını farklı
  yazıyor (kısaltma, BÜYÜK HARF, parantezli şehir, yazım hataları). Bu yüzden
  veri setleri arası canlı isim eşleştirmesi yapılmaz; her kaydın `konum`/
  `kurum_turu` değeri kendi kaynak Excel sütunundan gelir.
- **universiteler.json:** "Hasan Kalyoncu Üniversitesi" listede iki kez yer alır
  (120 satır, 119 benzersiz isim).
