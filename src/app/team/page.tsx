'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function TeamPage() {
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
            background: 'rgba(10, 22, 40, 0.95)',
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
              <Link href="/about" style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>About</Link>
              <Link href="/strategies" style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>Strategies</Link>
              <Link href="/team" style={{ color: 'var(--gold)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>Team</Link>
              <Link href="/news" style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>News</Link>
              <Link href="/contact" style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>Contact</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-40 pb-20 px-10 text-center">
          <div className="h-px mb-10 mx-auto" style={{ width: '40px', background: 'var(--gold)' }} />
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Our <span style={{ color: 'var(--gold)' }}>Team</span>
          </h1>
          <p className="text-sm tracking-[3px] uppercase" style={{ color: 'var(--text-muted)' }}>Leadership & Experience</p>
        </section>

        {/* Team Intro */}
        <section className="py-10 px-10 max-w-3xl mx-auto text-center">
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', lineHeight: 1.7, fontWeight: 300, color: 'var(--cream)' }}>
            Our team combines decades of experience in infrastructure development, real estate investment, and capital markets. We bring institutional discipline to every investment while maintaining the entrepreneurial mindset necessary to create value.
          </p>
        </section>

        {/* Team Grid */}
        <section className="py-20 px-10 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Team Member Placeholder 1 */}
            <div className="text-center">
              <div 
                className="w-48 h-48 mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.15)' }}
              >
                <span className="text-4xl" style={{ color: 'var(--gold)', opacity: 0.3 }}>+</span>
              </div>
              <h3 className="text-lg tracking-[2px] uppercase mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Managing Partner</h3>
              <p className="text-xs tracking-[2px] uppercase mb-4" style={{ color: 'var(--gold)' }}>Leadership</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Oversees firm strategy, investor relations, and investment committee decisions.
              </p>
            </div>

            {/* Team Member Placeholder 2 */}
            <div className="text-center">
              <div 
                className="w-48 h-48 mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.15)' }}
              >
                <span className="text-4xl" style={{ color: 'var(--gold)', opacity: 0.3 }}>+</span>
              </div>
              <h3 className="text-lg tracking-[2px] uppercase mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Partner, Infrastructure</h3>
              <p className="text-xs tracking-[2px] uppercase mb-4" style={{ color: 'var(--gold)' }}>Investments</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Leads infrastructure deal sourcing, due diligence, and portfolio management.
              </p>
            </div>

            {/* Team Member Placeholder 3 */}
            <div className="text-center">
              <div 
                className="w-48 h-48 mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.15)' }}
              >
                <span className="text-4xl" style={{ color: 'var(--gold)', opacity: 0.3 }}>+</span>
              </div>
              <h3 className="text-lg tracking-[2px] uppercase mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Partner, Real Estate</h3>
              <p className="text-xs tracking-[2px] uppercase mb-4" style={{ color: 'var(--gold)' }}>Investments</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Manages real estate acquisitions, development, and asset management.
              </p>
            </div>

          </div>

          {/* Coming Soon Note */}
          <div className="mt-16 text-center p-8" style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.1)' }}>
            <p className="text-sm tracking-[2px] uppercase mb-2" style={{ color: 'var(--gold)' }}>Team Profiles Coming Soon</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Full team bios and backgrounds will be available shortly. For inquiries, please contact us directly.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-10 text-center" style={{ background: 'var(--navy-light)' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, marginBottom: '30px' }}>
            Interested in joining our team?
          </p>
          <Link 
            href="/contact"
            className="inline-block px-10 py-4 text-xs tracking-[3px] uppercase transition-all duration-300 hover:bg-[var(--gold)] hover:text-[var(--navy)]"
            style={{ border: '1px solid var(--gold)', color: 'var(--gold)', textDecoration: 'none' }}
          >
            Contact Us
          </Link>
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
