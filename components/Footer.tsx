import Link from 'next/link';
import { INSTAGRAM, MAIL, NAV, TIKTOK } from '@/lib/data';

export default function Footer({ dark = false }: { dark?: boolean }) {
  return (
    <footer data-sec={dark ? "" : undefined} className={`footer${dark ? ' footer--dark' : ''}`}>
      <div className="wrap">
        <div className="footer__row label">
          <nav className="footer__links" aria-label="Pie">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </nav>
          <div className="footer__links">
            <a href={INSTAGRAM}>Instagram</a>
            <a href={TIKTOK}>TikTok</a>
            <a href={`mailto:${MAIL}`}>Mail</a>
          </div>
        </div>
        <div className="footer__word" aria-hidden="true">
          Crudo<span>_</span>
        </div>
      </div>
    </footer>
  );
}
