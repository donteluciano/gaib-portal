'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV_LINKS } from './content';

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);

  // Stop the page behind the mobile menu from scrolling while it is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#BD9468]/20 bg-[#111D2B]">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          onClick={close}
          className="flex items-center gap-3 text-[#FBF3DA]"
          aria-label="Herald Capital Partners, home"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={30} height={30} className="h-[30px] w-[30px]" />
          <span className="hc-wordmark text-[13px] sm:text-[14px]">
            Herald Capital <span className="text-[#BD9468]">Partners</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`text-[12px] uppercase tracking-[0.18em] transition-colors ${
                  active ? 'text-[#BD9468]' : 'text-[#A9B3C1] hover:text-[#FBF3DA]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/contact" className="hc-btn hc-btn-sm">
            Contact
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="hc-mobile-menu"
          className="-mr-2 flex h-11 w-11 items-center justify-center text-[#FBF3DA] md:hidden"
        >
          <span className="hc-sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="relative block h-3 w-6" aria-hidden="true">
            <span
              className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-200 ${
                open ? 'top-1.5 rotate-45' : 'top-0'
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-6 bg-current transition-transform duration-200 ${
                open ? 'top-1.5 -rotate-45' : 'top-3'
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div
          id="hc-mobile-menu"
          className="h-[calc(100dvh-72px)] overflow-y-auto border-t border-[#BD9468]/20 bg-[#111D2B] md:hidden"
        >
          <nav className="flex flex-col px-6 pb-10 pt-4" aria-label="Main">
            {[...NAV_LINKS, { href: '/contact', label: 'Contact' }].map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={active ? 'page' : undefined}
                  className={`border-b border-[#BD9468]/15 py-5 text-[22px] ${
                    active ? 'text-[#BD9468]' : 'text-[#FBF3DA]'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link href="/contact" onClick={close} className="hc-btn mt-10 w-full">
              Submit a site
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
