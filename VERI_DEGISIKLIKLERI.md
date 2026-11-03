# Veri Değişiklikleri Günlüğü

Bu dosya, `public/data/*.json` veri setleri ve grafik mantığı üzerinde yapılan
kayda değer değişiklikleri kaydeder. Kaynak Excel'ler `public/data_admin/`
altındadır ve repoda izlenir (tez verisi hariç, bkz. 2026-11-03).

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
