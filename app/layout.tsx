import type { Metadata } from 'next';
import './globals.css';
import FilterBar from '@/components/FilterBar';

export const metadata: Metadata = {
  title: 'Türkiye Uİ/SBUİ Akademik Haritası',
  description: 'TÜBİTAK 124K418 – TED Üniversitesi. Türkiye\'deki Uluslararası İlişkiler ve Siyaset Bilimi bölümlerinin akademik ekosistemi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <FilterBar />
        <main className="max-w-screen-xl mx-auto px-4 py-10">
          {children}
        </main>
        <footer className="border-t border-slate-800 mt-24 py-8 text-center text-xs text-slate-600">
          TÜBİTAK Proje No: 124K418 · TED Üniversitesi · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
