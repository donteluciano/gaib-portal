'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function InvestorLoginPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-navy">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy" style={{ borderBottom: '1px solid rgba(184, 150, 90, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-10 py-4 flex items-center justify-between">
          <Link 
            href="/" 
            className="text-white font-serif text-sm tracking-[6px]"
          >
            GAIB CAPITAL PARTNERS
          </Link>
          <div className="flex items-center gap-8 text-xs tracking-[2px]">
            <Link href="/#contact" className="text-[#999999] hover:text-gold transition-colors duration-300">
              Contact
            </Link>
            <Link href="/investor-login" className="text-white hover:text-gold transition-colors duration-300">
              Investor Login
            </Link>
            <Link href="/login" className="text-[#999999] hover:text-gold transition-colors duration-300">
              Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h1 
          className={`font-serif text-white text-2xl tracking-[6px] font-normal transition-opacity duration-[1500ms] ease-in-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          INVESTOR PORTAL
        </h1>

        <div 
          className={`h-[2px] bg-gold my-6 transition-all duration-1000 ease-in-out ${
            loaded ? 'w-16 opacity-100' : 'w-0 opacity-0'
          }`}
          style={{ transitionDelay: '600ms' }}
        />

        <div 
          className={`max-w-md transition-opacity duration-[1500ms] ease-in-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '900ms' }}
        >
          <p className="font-serif text-[#999999] text-[15px] leading-[1.8] mb-8">
            The investor portal is currently under development. For fund materials or account information, please contact us directly.
          </p>
          <a 
            href="mailto:info@gaibcapitalpartners.com" 
            className="font-serif text-gold text-sm tracking-[2px] hover:text-gold-light transition-colors duration-300"
          >
            info@gaibcapitalpartners.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 px-6">
        <p className="font-sans text-[10px] text-[#666666] tracking-[1px]">
          © 2026 Gaib Capital Partners LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
