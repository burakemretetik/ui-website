# Veri Değişiklikleri Günlüğü

Bu dosya, `public/data/*.json` veri setleri ve grafik mantığı üzerinde yapılan
kayda değer değişiklikleri kaydeder. Kaynak Excel'ler `public/data_admin/`
altındadır ve gitignore'ludur (repoya dahil edilmez, yalnızca yereldedir).

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
