import Link from 'next/link';
import StatCard from '@/components/StatCard';

export default function HomePage() {
  return (
    <div className="space-y-16">

      {/* Hero */}
      <section className="pt-8 pb-4">
        <div className="max-w-3xl">
          <p className="text-xs font-mono text-teal-500 uppercase tracking-widest mb-3">
            TÜBİTAK · Proje No: 124K418 · TED Üniversitesi
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Türkiye Uluslararası İlişkiler<br />
            <span className="text-teal-400">Akademik Ekosistemi</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Türkiye&apos;deki tüm Uluslararası İlişkiler ve Siyaset Bilimi &amp; Uluslararası
            İlişkiler bölümlerinin akademik haritası. 1.707 akademisyen, 707 yayın,
            4.828 ders kaydı ve 220 proje verisi üzerinden merkez–yarı merkez–taşra
            ekseninde karşılaştırmalı analiz.
          </p>
        </div>
      </section>

      {/* KPI kartları */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard value="1.707" label="Akademisyen" sub="Uİ / SBUİ bölümleri" color="text-teal-400" />
          <StatCard value="435"   label="WoS Makale"  sub="2018–2023" color="text-amber-400" />
          <StatCard value="272"   label="Kitap Bölümü" sub="WoS BKCI-SSH" color="text-amber-400" />
          <StatCard value="4.828" label="Ders Kaydı"  sub="418 benzersiz ders" color="text-violet-400" />
          <StatCard value="220"   label="Proje"       sub="COST · TÜBİTAK · Erasmus+" color="text-rose-400" />
          <StatCard value="117"   label="Üniversite"  sub="Vizyon & misyon analizi" color="text-blue-400" />
        </div>
      </section>

      {/* Bölüm linkleri */}
      <section>
        <h2 className="text-lg font-semibold text-slate-300 mb-5">Analiz Bölümleri</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl p-5 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

const NAV_ITEMS = [
  {
    href: '/akademisyen',
    emoji: '🎓',
    title: 'Akademisyen Haritası',
    desc: 'Cinsiyet, unvan, araştırma konusu ve bölge dağılımı; üniversite kategorisine göre kırılım.',
  },
  {
    href: '/yayin',
    emoji: '📄',
    title: 'Yayın & Bibliyometri',
    desc: 'Q1–Q4 yayın dağılımı, atıf analizi, kitap bölümleri.',
  },
  {
    href: '/kontenjan',
    emoji: '📊',
    title: 'Kontenjan & Tezler',
    desc: '2021–2025 öğrenci kontenjan trendleri, bölüm bazlı karşılaştırma.',
  },
  {
    href: '/mufredat',
    emoji: '📚',
    title: 'Müfredat Analizi',
    desc: 'En yaygın dersler, AKTS ağırlıkları, lisans–yüksek lisans–doktora karşılaştırması.',
  },
  {
    href: '/projeler',
    emoji: '🔬',
    title: 'Projeler',
    desc: 'TÜBİTAK 1001, COST, Jean Monnet, Erasmus+ projeleri; konu ve bölge dağılımı.',
  },
  {
    href: '/misyon-vizyon',
    emoji: '🏛️',
    title: 'Vizyon & Misyon',
    desc: 'Devlet–vakıf üniversitelerinin vizyon/misyon kelime analizi ve karşılaştırması.',
  },
];
