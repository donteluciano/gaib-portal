import Link from 'next/link';
import { CONTACT_EMAIL, LEGAL_NAME, NAV_LINKS } from './content';

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#BD9468]/20 bg-[#111D2B] text-[#FBF3DA]">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="hc-wordmark text-[14px]">
              Herald Capital <span className="text-[#BD9468]">Partners</span>
            </p>
            <p className="hc-muted mt-4 max-w-xs text-[15px] leading-relaxed">
              Predevelopment investment in powered sites for modular AI inference data centers.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3 text-[15px]">
            {[...NAV_LINKS, { href: '/contact', label: 'Contact' }].map((link) => (
              <Link key={link.href} href={link.href} className="hc-muted transition-colors hover:text-[#FBF3DA]">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-3 text-[15px]">
            <a href={`mailto:${CONTACT_EMAIL}`} className="hc-muted break-all transition-colors hover:text-[#FBF3DA]">
              {CONTACT_EMAIL}
            </a>
            <Link href="/investor-login" className="hc-muted transition-colors hover:text-[#FBF3DA]">
              Investor access
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-[#BD9468]/15 pt-8 text-[12px] leading-relaxed text-[#A9B3C1]/80">
          <p>
            &copy; {year} {LEGAL_NAME}. All rights reserved.
          </p>
          <p className="mt-3 max-w-3xl">
            This website is provided for informational purposes only. Nothing on it constitutes an offer to sell,
            or a solicitation of an offer to buy, any security or interest in any fund or investment vehicle.
          </p>
        </div>
      </div>
    </footer>
  );
}
