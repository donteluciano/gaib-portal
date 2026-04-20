'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Karla:wght@300;400;500&display=swap');
        
        :root {
          --navy: #0a1628;
          --navy-light: #12243d;
          --cream: #f4f1eb;
          --gold: #BD9468;
          --gold-light: #D4A87A;
          --text-muted: #8a9bb5;
          --white: #ffffff;
        }

        html { scroll-behavior: smooth; }
        body {
          font-family: 'Karla', sans-serif;
          background-color: var(--navy);
          color: var(--cream);
          margin: 0;
          padding: 0;
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: 'var(--navy)', color: 'var(--cream)' }}>
        {/* Navigation */}
        <nav 
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
          style={{
            padding: scrolled ? '14px 20px' : '20px 20px',
            background: scrolled ? 'rgba(10, 22, 40, 0.95)' : 'rgba(10, 22, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(184, 150, 90, 0.1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
            <Link 
              href="/"
              style={{ 
                fontFamily: "'Cormorant Garamond', serif", 
                fontWeight: 400, 
                color: 'var(--cream)',
                fontSize: '18px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              Herald Capital <span style={{ color: 'var(--gold)' }}>Partners</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <Link href="/about" style={{ color: 'var(--gold)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>About</Link>
              <Link href="/services" style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>Services</Link>
              <Link href="/team" style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>Team</Link>
              <Link href="/news" style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>News</Link>
              <Link href="/contact" style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>Contact</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-40 pb-20 px-10 text-center">
          <div className="h-px mb-10 mx-auto" style={{ width: '40px', background: 'var(--gold)' }} />
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '20px' }}>
            About <span style={{ color: 'var(--gold)' }}>Us</span>
          </h1>
          <p className="text-sm tracking-[3px] uppercase" style={{ color: 'var(--text-muted)' }}>Our Story & Philosophy</p>
        </section>

        {/* Content */}
        <section className="py-20 px-10 max-w-4xl mx-auto">
          <div className="mb-16">
            <div className="text-[11px] tracking-[4px] uppercase mb-6" style={{ color: 'var(--gold)', fontWeight: 500 }}>Our Mission</div>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', lineHeight: 1.7, fontWeight: 300 }}>
              Herald Capital Partners was founded with a singular vision: to create value in infrastructure and real estate through disciplined investing, operational expertise, and unwavering alignment with our partners.
            </p>
          </div>

          <div className="mb-16">
            <div className="text-[11px] tracking-[4px] uppercase mb-6" style={{ color: 'var(--gold)', fontWeight: 500 }}>Our Approach</div>
            <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              We pursue special situations where complexity creates opportunity. Our team's technical background enables us to underwrite risks that generalist investors cannot evaluate, allowing us to acquire assets at compelling valuations.
            </p>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Unlike traditional fund managers, we charge zero management fees. Our compensation is tied entirely to performance—we succeed only when our investors succeed. This structure ensures complete alignment of interests from day one.
            </p>
          </div>

          <div className="mb-16">
            <div className="text-[11px] tracking-[4px] uppercase mb-6" style={{ color: 'var(--gold)', fontWeight: 500 }}>Investment Philosophy</div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6" style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.1)' }}>
                <h3 className="text-lg mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>Concentrated Positions</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>We make fewer, higher-conviction investments where our expertise creates measurable value.</p>
              </div>
              <div className="p-6" style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.1)' }}>
                <h3 className="text-lg mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>Long-Term Orientation</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Patient capital allows us to pursue value creation strategies that require time to mature.</p>
              </div>
              <div className="p-6" style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.1)' }}>
                <h3 className="text-lg mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>Proprietary Sourcing</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Our industry relationships and technical expertise unlock off-market opportunities.</p>
              </div>
              <div className="p-6" style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.1)' }}>
                <h3 className="text-lg mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--cream)' }}>Active Management</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>We don't just buy and hold—we actively improve assets through operational excellence.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-10 py-10 flex justify-between items-center" style={{ borderTop: '1px solid rgba(184, 150, 90, 0.08)' }}>
          <div className="text-sm tracking-[2px] uppercase" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-muted)' }}>Herald Capital Partners</div>
          <div className="text-[11px] tracking-[1px]" style={{ color: 'rgba(138, 155, 181, 0.5)' }}>© 2026 Herald Capital Partners LLC. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}
