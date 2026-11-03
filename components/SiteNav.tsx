'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Her sayfada görünen üst menü: sol başta ana sayfa linki, yanında bölüm linkleri.
// Bölüm listesi ana sayfadaki kartlarla aynı sırayı izler.
export const SITE_SECTIONS = [
  { href: '/akademisyen',   label: 'Akademisyen' },
  { href: '/yayin',         label: 'Yayın' },
  { href: '/kontenjan',     label: 'Kontenjan' },
  { href: '/tezler',        label: 'Tezler' },
  { href: '/mufredat',      label: 'Müfredat' },
  { href: '/projeler',      label: 'Projeler' },
  { href: '/misyon-vizyon', label: 'Vizyon & Misyon' },
  { href: '/universiteler', label: 'Üniversiteler' },
  { href: '/export',        label: 'Figures (EN)' },
];

export default function SiteNav() {
  const pathname = usePathname();
  const onHome = pathname === '/';

  return (
    <nav aria-label="Site menüsü" className="bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-screen-xl mx-auto px-4 h-12 flex items-center gap-4">
        <Link
          href="/"
          aria-current={onHome ? 'page' : undefined}
          className={`shrink-0 flex items-center gap-2 text-sm font-semibold transition-colors
            ${onHome ? 'text-teal-400' : 'text-slate-200 hover:text-teal-400'}`}
        >
          <span aria-hidden>⌂</span>
          <span>Ana Sayfa</span>
        </Link>
        <span className="h-5 w-px bg-slate-700 shrink-0" aria-hidden />
        <ul className="flex items-center gap-1 overflow-x-auto whitespace-nowrap min-w-0 [scrollbar-width:none]">
          {SITE_SECTIONS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`block px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                    ${active
                      ? 'bg-slate-800 text-teal-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
