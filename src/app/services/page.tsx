'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ServicesPage() {
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
              <Link href="/services" style={{ color: 'var(--gold)', fontWeight: 400, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', textDecoration: 'none' }}>Services</Link>
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
            Our <span style={{ color: 'var(--gold)' }}>Services</span>
          </h1>
          <p className="text-sm tracking-[3px] uppercase" style={{ color: 'var(--text-muted)' }}>Investment Strategies & Capabilities</p>
        </section>

        {/* Services Grid */}
        <section className="py-20 px-10 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            
            {/* Infrastructure */}
            <div className="p-10" style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.15)' }}>
              <div className="w-[30px] h-px mb-6" style={{ background: 'var(--gold)' }} />
              <h3 className="text-2xl tracking-[3px] uppercase mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>Infrastructure</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                We invest in essential infrastructure assets including energy generation, data centers, and logistics facilities. Our technical expertise allows us to identify and execute on complex opportunities that require specialized knowledge.
              </p>
              <ul className="text-sm space-y-2" style={{ color: 'var(--text-muted)' }}>
                <li>• Power Generation & Renewable Energy</li>
                <li>• Data Center Development</li>
                <li>• Industrial & Logistics</li>
                <li>• Utilities & Essential Services</li>
              </ul>
            </div>

            {/* Real Estate */}
            <div className="p-10" style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.15)' }}>
              <div className="w-[30px] h-px mb-6" style={{ background: 'var(--gold)' }} />
              <h3 className="text-2xl tracking-[3px] uppercase mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>Real Estate</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                Our real estate strategy focuses on special situations where operational improvements, repositioning, or development expertise can unlock substantial value. We target markets with strong fundamentals and barriers to entry.
              </p>
              <ul className="text-sm space-y-2" style={{ color: 'var(--text-muted)' }}>
                <li>• Value-Add Acquisitions</li>
                <li>• Ground-Up Development</li>
                <li>• Repositioning & Redevelopment</li>
                <li>• Structured Transactions</li>
              </ul>
            </div>

            {/* Special Situations */}
            <div className="p-10" style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.15)' }}>
              <div className="w-[30px] h-px mb-6" style={{ background: 'var(--gold)' }} />
              <h3 className="text-2xl tracking-[3px] uppercase mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>Special Situations</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                We thrive in complexity. Whether distressed assets, regulatory carve-outs, or operational turnarounds, our team has the expertise to navigate situations that require patience, creativity, and technical skill.
              </p>
              <ul className="text-sm space-y-2" style={{ color: 'var(--text-muted)' }}>
                <li>• Distressed & Turnaround</li>
                <li>• Regulatory Special Situations</li>
                <li>• Corporate Carve-Outs</li>
                <li>• Complex Transactions</li>
              </ul>
            </div>

            {/* Co-Investment */}
            <div className="p-10" style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.15)' }}>
              <div className="w-[30px] h-px mb-6" style={{ background: 'var(--gold)' }} />
              <h3 className="text-2xl tracking-[3px] uppercase mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}>Co-Investment</h3>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
                We offer qualified partners the opportunity to co-invest alongside us in specific transactions. This allows for increased exposure to high-conviction opportunities while maintaining our disciplined approach.
              </p>
              <ul className="text-sm space-y-2" style={{ color: 'var(--text-muted)' }}>
                <li>• Deal-by-Deal Participation</li>
                <li>• Transparent Economics</li>
                <li>• Aligned Interests</li>
                <li>• Institutional Terms</li>
              </ul>
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-10 text-center" style={{ background: 'var(--navy-light)' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 300, marginBottom: '30px' }}>
            Interested in learning more about our investment strategies?
          </p>
          <Link 
            href="/contact"
            className="inline-block px-10 py-4 text-xs tracking-[3px] uppercase transition-all duration-300 hover:bg-[var(--gold)] hover:text-[var(--navy)]"
            style={{ border: '1px solid var(--gold)', color: 'var(--gold)', textDecoration: 'none' }}
          >
            Get In Touch
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
