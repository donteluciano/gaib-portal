'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    // Initial load animation
    setTimeout(() => setLoaded(true), 100);

    // Intersection observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'about') setAboutVisible(true);
            if (entry.target.id === 'contact') setContactVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const aboutEl = document.getElementById('about');
    const contactEl = document.getElementById('contact');
    if (aboutEl) observer.observe(aboutEl);
    if (contactEl) observer.observe(contactEl);

    return () => observer.disconnect();
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
            <Link href="#contact" className="text-[#999999] hover:text-gold transition-colors duration-300">
              Contact
            </Link>
            <Link href="/investor-login" className="text-[#999999] hover:text-gold transition-colors duration-300">
              Investor Login
            </Link>
            <Link href="/login" className="text-[#999999] hover:text-gold transition-colors duration-300">
              Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero - Centered */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Firm Name */}
        <h1 
          className={`font-serif text-white text-4xl md:text-[40px] tracking-[8px] font-normal transition-opacity duration-[1500ms] ease-in-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          GAIB CAPITAL PARTNERS
        </h1>

        {/* Gold Line */}
        <div 
          className={`h-[3px] bg-gold my-6 transition-all duration-1000 ease-in-out ${
            loaded ? 'w-20 opacity-100' : 'w-0 opacity-0'
          }`}
          style={{ transitionDelay: '1000ms' }}
        />

        {/* Subtitle */}
        <p 
          className={`font-serif text-[#999999] text-base tracking-[4px] italic transition-opacity duration-[1500ms] ease-in-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transitionDelay: '1500ms' }}
        >
          Principal Investment Firm
        </p>
      </section>

      {/* About - One Paragraph */}
      <section 
        id="about" 
        className={`max-w-[600px] mx-auto px-6 py-24 text-center transition-opacity duration-[1500ms] ease-in-out ${
          aboutVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="font-serif text-[#999999] text-[15px] leading-[1.8]">
          Gaib Capital Partners is a private investment firm focused on infrastructure and real estate. 
          We pursue special situations where proprietary sourcing and technical expertise produce 
          asymmetric risk-adjusted returns for our investors.
        </p>
      </section>

      {/* Contact */}
      <section 
        id="contact" 
        className={`text-center py-16 transition-opacity duration-[1500ms] ease-in-out ${
          contactVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-20 h-[1px] bg-gold/30 mx-auto mb-8" />
        <a 
          href="mailto:info@gaibcapitalpartners.com" 
          className="font-serif text-gold text-sm tracking-[2px] hover:text-gold-light transition-colors duration-300"
        >
          info@gaibcapitalpartners.com
        </a>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 px-6">
        <p className="font-sans text-[10px] text-[#666666] tracking-[1px]">
          © 2026 Gaib Capital Partners LLC. All rights reserved.
        </p>
        <p className="font-sans text-[10px] text-[#666666] tracking-[1px] mt-1">
          Confidential. Not an offer to sell securities.
        </p>
      </footer>
    </div>
  );
}
