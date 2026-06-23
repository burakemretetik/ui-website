import rawData from '@/public/data/universiteler.json';

type Universite = {
  universite: string;
  tur: string;
  kategori: string;
  kategori_detay: string;
};

const DATA = rawData as Universite[];

const KATEGORI_META: Record<string, { renk: string; bg: string; border: string; aciklama: string }> = {
  'merkez': {
    renk: 'text-teal-400',
    bg: 'bg-teal-950/40',
    border: 'border-teal-700',
    aciklama:
      'Türkiye\'nin akademik hiyerarşisinde en üst katmanda yer alan üniversitelerdir. Köklü araştırma altyapısına, güçlü uluslararası ağlara ve yüksek akademik üretime sahiptirler. Çoğunlukla Ankara ve İstanbul\'da konumlanmaktadırlar.',
  },
  'yarı merkez': {
    renk: 'text-amber-400',
    bg: 'bg-amber-950/30',
    border: 'border-amber-700',
    aciklama:
      'Bölgesel ya da kentsel ölçekte önemli akademik kapasiteye sahip üniversitelerdir. Araştırma çıktısı ve kurumsal prestij açısından merkez üniversitelerinin altında, taşra üniversitelerinin üzerinde konumlanırlar. Dört alt gruba ayrılır.',
  },
  'taşra': {
    renk: 'text-rose-400',
    bg: 'bg-rose-950/30',
    border: 'border-rose-800',
    aciklama:
      'Küçük ve orta ölçekli şehirlerde konumlanmış, genellikle daha yeni kurulmuş ve daha sınırlı araştırma kapasitesine sahip üniversitelerdir. Büyük çoğunluğu devlet üniversitesidir.',
  },
};

const YM_META: Record<string, { etiket: string; aciklama: string }> = {
  'yarı merkez 1': {
    etiket: 'Alt Grup 1',
    aciklama: 'Büyük bölgesel şehirlerde köklü devlet üniversiteleri ve seçkin vakıf üniversiteleri.',
  },
  'yarı merkez 2': {
    etiket: 'Alt Grup 2',
    aciklama: 'Orta ölçekli şehirlerdeki bölgesel devlet üniversiteleri.',
  },
  'yarı merkez 3': {
    etiket: 'Alt Grup 3',
    aciklama: 'Büyük kentlerde yerleşik, köklü ve tanınmış vakıf üniversiteleri ile seçkin devlet üniversiteleri.',
  },
  'yarı merkez 4': {
    etiket: 'Alt Grup 4',
    aciklama: 'Büyük kentlerdeki yeni nesil vakıf üniversiteleri ve bazı yeni devlet üniversiteleri.',
  },
};

function UniversiteChip({ u }: { u: Universite }) {
  const turColor = u.tur === 'devlet' ? 'bg-blue-900/60 text-blue-300 border-blue-700' : 'bg-violet-900/50 text-violet-300 border-violet-700';
  return (
    <div className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <span className="text-sm text-slate-200">{u.universite}</span>
      <span className={`shrink-0 text-xs px-2 py-0.5 rounded border ${turColor}`}>
        {u.tur === 'devlet' ? 'Devlet' : 'Vakıf'}
      </span>
    </div>
  );
}

export default function UniversitelerPage() {
  const merkez     = DATA.filter((u) => u.kategori === 'merkez');
  const yariMerkez = DATA.filter((u) => u.kategori === 'yarı merkez');
  const tasra      = DATA.filter((u) => u.kategori === 'taşra');

  const ymGruplari = ['yarı merkez 1', 'yarı merkez 2', 'yarı merkez 3', 'yarı merkez 4'].map((detay) => ({
    detay,
    liste: yariMerkez.filter((u) => u.kategori_detay === detay).sort((a, b) => a.universite.localeCompare(b.universite, 'tr')),
  }));

  const merkezSorted = [...merkez].sort((a, b) => a.universite.localeCompare(b.universite, 'tr'));
  const tasraSorted  = [...tasra].sort((a, b) => a.universite.localeCompare(b.universite, 'tr'));

  const toplamDevlet = DATA.filter((u) => u.tur === 'devlet').length;
  const toplamVakif  = DATA.filter((u) => u.tur === 'vakıf').length;

  return (
    <div className="space-y-12 max-w-5xl">

      {/* Başlık */}
      <section className="pt-4">
        <p className="text-xs font-mono text-teal-500 uppercase tracking-widest mb-3">
          Çalışma Kapsamı
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-5">
          Çalışma Kapsamındaki Üniversiteler
        </h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-3xl">
          Bu çalışma, Türkiye&apos;deki Uluslararası İlişkiler (Uİ) ve Siyaset Bilimi &amp; Uluslararası İlişkiler
          (SBUİ) lisans programına sahip toplam <span className="text-white font-medium">{DATA.length} üniversiteyi</span> kapsamaktadır.
          Üniversiteler, kurumsal profilleri ve akademik kapasiteleri esas alınarak <span className="text-white font-medium">merkez,
          yarı merkez</span> ve <span className="text-white font-medium">taşra</span> olmak üzere üç ana kategoriye ayrılmıştır.
          Bu kategorizasyon çalışmanın tüm analizlerinde temel kırılım ekseni olarak kullanılmaktadır.
        </p>
      </section>

      {/* Özet istatistikler */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { deger: DATA.length,    etiket: 'Toplam Üniversite', renk: 'text-white' },
          { deger: toplamDevlet,   etiket: 'Devlet',            renk: 'text-blue-400' },
          { deger: toplamVakif,    etiket: 'Vakıf',             renk: 'text-violet-400' },
          { deger: 3,              etiket: 'Kategori',          renk: 'text-teal-400' },
        ].map(({ deger, etiket, renk }) => (
          <div key={etiket} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-3xl font-bold ${renk}`}>{deger}</p>
            <p className="text-xs text-slate-500 mt-1">{etiket}</p>
          </div>
        ))}
      </div>

      {/* ── Merkez ── */}
      <KategoriSection
        baslik="Merkez"
        sayi={merkez.length}
        meta={KATEGORI_META['merkez']}
      >
        <div className="grid sm:grid-cols-2 gap-2">
          {merkezSorted.map((u) => <UniversiteChip key={u.universite} u={u} />)}
        </div>
      </KategoriSection>

      {/* ── Yarı Merkez ── */}
      <KategoriSection
        baslik="Yarı Merkez"
        sayi={yariMerkez.length}
        meta={KATEGORI_META['yarı merkez']}
      >
        <div className="space-y-8">
          {ymGruplari.map(({ detay, liste }) => {
            const meta = YM_META[detay];
            return (
              <div key={detay}>
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">{meta.etiket}</span>
                  <span className="text-xs text-slate-500">— {meta.aciklama}</span>
                  <span className="ml-auto text-xs text-slate-600">{liste.length} üniversite</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {liste.map((u) => <UniversiteChip key={`${u.universite}-${detay}`} u={u} />)}
                </div>
              </div>
            );
          })}
        </div>
      </KategoriSection>

      {/* ── Taşra ── */}
      <KategoriSection
        baslik="Taşra"
        sayi={tasra.length}
        meta={KATEGORI_META['taşra']}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {tasraSorted.map((u) => <UniversiteChip key={u.universite} u={u} />)}
        </div>
      </KategoriSection>

    </div>
  );
}

function KategoriSection({
  baslik,
  sayi,
  meta,
  children,
}: {
  baslik: string;
  sayi: number;
  meta: { renk: string; bg: string; border: string; aciklama: string };
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className={`rounded-xl border ${meta.border} ${meta.bg} p-5 mb-4`}>
        <div className="flex items-center gap-3 mb-2">
          <h2 className={`text-xl font-bold ${meta.renk}`}>{baslik}</h2>
          <span className="text-xs text-slate-500 font-mono">{sayi} üniversite</span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{meta.aciklama}</p>
      </div>
      {children}
    </section>
  );
}
