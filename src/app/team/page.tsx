'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';

// Team data - Donte always first, partners shuffle weekly
const managingPartner = { name: 'Donte Bronaugh', title: 'Managing Partner' };
const partners = [
  { name: 'Benjamin Cobb', title: 'Partner' },
  { name: 'Daniel Hodinott', title: 'Partner' },
  { name: 'Lemar Boone', title: 'Partner' },
  { name: 'Sean Thomas', title: 'Partner' },
];

// Shuffle based on week number so order changes weekly
function getWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.floor(diff / oneWeek);
}

function shuffleWithSeed(array: typeof partners, seed: number) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor((seed * (i + 1)) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Use week number to rotate the array
  const rotations = seed % shuffled.length;
  return [...shuffled.slice(rotations), ...shuffled.slice(0, rotations)];
}

export default function TeamPage() {
  const [scrolled, setScrolled] = useState(false);
  
  const shuffledPartners = useMemo(() => {
    const week = getWeekNumber();
    return shuffleWithSeed(partners, week);
  }, []);

  // Donte first, then shuffled partners
  const team = [managingPartner, ...shuffledPartners];

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
        <section className="pt-40 pb-16 px-10 text-center">
          <div className="h-px mb-10 mx-auto" style={{ width: '40px', background: 'var(--gold)' }} />
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, letterSpacing: '6px', textTransform: 'uppercase', marginBottom: '20px' }}>
            Our <span style={{ color: 'var(--gold)' }}>Team</span>
          </h1>
        </section>

        {/* Team Grid - 3 on top, 2 on bottom */}
        <section className="py-10 px-10 max-w-5xl mx-auto">
          {/* Top row - 3 members */}
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            {team.slice(0, 3).map((member) => (
              <div key={member.name} className="text-center">
                <div 
                  className="w-40 h-40 mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.15)' }}
                >
                  <span className="text-3xl" style={{ color: 'var(--gold)', opacity: 0.3 }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg tracking-[2px] uppercase mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {member.name}
                </h3>
                <p className="text-xs tracking-[2px] uppercase" style={{ color: 'var(--gold)' }}>
                  {member.title}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom row - 2 members, centered */}
          <div className="flex justify-center gap-10">
            {team.slice(3, 5).map((member) => (
              <div key={member.name} className="text-center" style={{ width: '200px' }}>
                <div 
                  className="w-40 h-40 mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'var(--navy-light)', border: '1px solid rgba(184, 150, 90, 0.15)' }}
                >
                  <span className="text-3xl" style={{ color: 'var(--gold)', opacity: 0.3 }}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg tracking-[2px] uppercase mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {member.name}
                </h3>
                <p className="text-xs tracking-[2px] uppercase" style={{ color: 'var(--gold)' }}>
                  {member.title}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Spacer */}
        <div className="py-20"></div>

        {/* Footer */}
        <footer className="px-10 py-10 flex justify-between items-center" style={{ borderTop: '1px solid rgba(184, 150, 90, 0.08)' }}>
          <div className="text-sm tracking-[2px] uppercase" style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-muted)' }}>Herald Capital Partners</div>
          <div className="text-[11px] tracking-[1px]" style={{ color: 'rgba(138, 155, 181, 0.5)' }}>© 2026 Herald Capital Partners LLC. All rights reserved.</div>
        </footer>
      </div>
    </>
  );
}
