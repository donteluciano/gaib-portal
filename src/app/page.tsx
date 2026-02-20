'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false);
  const [pillarsVisible, setPillarsVisible] = useState(false);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    // Navbar scroll effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Fade-in on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'about') setAboutVisible(true);
            if (entry.target.id === 'pillars') setPillarsVisible(true);
            if (entry.target.id === 'contact-section') setContactVisible(true);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Karla:wght@300;400;500&display=swap');
        
        :root {
          --navy: #0a1628;
          --navy-light: #12243d;
          --cream: #f4f1eb;
          --gold: #b8965a;
          --gold-light: #d4b87c;
          --text-muted: #8a9bb5;
          --white: #ffffff;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Karla', sans-serif;
          background-color: var(--navy);
          color: var(--cream);
          overflow-x: hidden;
          margin: 0;
          padding: 0;
        }

        /* Subtle grain overlay */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1000;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeExpand {
          from {
            opacity: 0;
            width: 0;
          }
          to {
            opacity: 1;
            width: 40px;
          }
        }

        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: 'var(--navy)', color: 'var(--cream)' }}>
        {/* Navigation */}
        <nav 
          className="fixed top-0 left-0 right-0 z-50 transition-all duration-400"
          style={{
            padding: scrolled ? '14px 20px' : '20px 20px',
            background: scrolled ? 'rgba(10, 22, 40, 0.95)' : 'transparent',
            backdropFilter: scrolled ? 'blur(20px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(184, 150, 90, 0.1)' : 'none',
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 'max-content', gap: '20px' }}>
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
                whiteSpace: 'nowrap'
              }}
            >
              Gaib Capital <span style={{ color: 'var(--gold)' }}>Partners</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <a 
                href="#contact" 
                style={{ 
                  color: 'var(--text-muted)', 
                  fontWeight: 400,
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Contact
              </a>
              <Link 
                href="/investor-login" 
                style={{ 
                  color: 'var(--text-muted)', 
                  fontWeight: 400,
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Investor Login
              </Link>
              <Link 
                href="/login" 
                style={{ 
                  color: 'var(--text-muted)', 
                  fontWeight: 400,
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Portal
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section 
          className="h-screen flex flex-col justify-center items-center text-center relative px-10"
          style={{ 
            position: 'relative',
          }}
        >
          {/* Bottom gradient line */}
          <div 
            className="absolute bottom-0 left-[10%] right-[10%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(184, 150, 90, 0.2), transparent)' }}
          />

          {/* Hero accent line */}
          <div 
            className="h-px mb-10"
            style={{ 
              width: '40px', 
              background: 'var(--gold)',
              animation: 'fadeExpand 1.2s ease-out 0.3s both'
            }}
          />

          {/* Title */}
          <h1 
            className="mb-8"
            style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(38px, 5.5vw, 72px)',
              fontWeight: 300,
              letterSpacing: '8px',
              textTransform: 'uppercase',
              lineHeight: 1.15,
              animation: 'fadeUp 1s ease-out 0.5s both'
            }}
          >
            Gaib Capital
            <span 
              className="block"
              style={{ 
                color: 'var(--gold)',
                fontSize: 'clamp(32px, 4.5vw, 60px)',
                letterSpacing: '12px',
                fontWeight: 300
              }}
            >
              Partners
            </span>
          </h1>

          {/* Tagline */}
          <p 
            className="text-sm tracking-[4px] uppercase"
            style={{ 
              color: 'var(--text-muted)',
              fontWeight: 300,
              animation: 'fadeUp 1s ease-out 0.8s both'
            }}
          >
            Private Infrastructure & Real Estate
          </p>

          {/* Scroll indicator */}
          <div 
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ animation: 'fadeUp 1s ease-out 1.2s both' }}
          >
            <span 
              className="text-[10px] tracking-[3px] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Discover
            </span>
            <div 
              className="w-px h-10"
              style={{ 
                background: 'linear-gradient(to bottom, var(--gold), transparent)',
                animation: 'scrollPulse 2s ease-in-out infinite'
              }}
            />
          </div>
        </section>

        {/* About Section */}
        <section 
          id="about"
          className={`fade-in py-[140px] px-[60px] max-w-[900px] mx-auto text-center transition-all duration-800 ${
            aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
          }`}
        >
          <div 
            className="text-[11px] tracking-[4px] uppercase mb-10"
            style={{ color: 'var(--gold)', fontWeight: 500 }}
          >
            Our Firm
          </div>
          <p 
            style={{ 
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(22px, 2.8vw, 32px)',
              lineHeight: 1.7,
              fontWeight: 300,
              color: 'var(--cream)'
            }}
          >
            Gaib Capital Partners is a private investment firm that acquires and develops real estate and infrastructure assets in special situations. We target opportunities where proprietary sourcing, technical expertise, and disciplined execution produce outsized risk-adjusted returns. The firm invests alongside its limited partners with zero management fees and a compensation structure tied entirely to performance.
          </p>
        </section>

        {/* Pillars Section */}
        <section 
          id="pillars"
          className={`fade-in py-20 pb-[140px] px-[60px] max-w-[1100px] mx-auto transition-all duration-800 ${
            pillarsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[60px] mt-20">
            {/* Pillar 1 */}
            <div className="text-center px-5">
              <div className="w-[30px] h-px mx-auto mb-7" style={{ background: 'var(--gold)' }} />
              <h3 
                className="text-[20px] tracking-[3px] uppercase mb-[18px]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: 'var(--cream)' }}
              >
                Capital
              </h3>
              <p 
                className="text-sm leading-[1.8]"
                style={{ color: 'var(--text-muted)', fontWeight: 300 }}
              >
                We deploy capital into concentrated, high-conviction positions where our technical knowledge creates value the broader market has not yet recognized.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="text-center px-5">
              <div className="w-[30px] h-px mx-auto mb-7" style={{ background: 'var(--gold)' }} />
              <h3 
                className="text-[20px] tracking-[3px] uppercase mb-[18px]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: 'var(--cream)' }}
              >
                Discipline
              </h3>
              <p 
                className="text-sm leading-[1.8]"
                style={{ color: 'var(--text-muted)', fontWeight: 300 }}
              >
                Zero management fee. Our compensation is tied entirely to performance. We do not earn carried interest until our investors are paid first.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="text-center px-5">
              <div className="w-[30px] h-px mx-auto mb-7" style={{ background: 'var(--gold)' }} />
              <h3 
                className="text-[20px] tracking-[3px] uppercase mb-[18px]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: 'var(--cream)' }}
              >
                Alignment
              </h3>
              <p 
                className="text-sm leading-[1.8]"
                style={{ color: 'var(--text-muted)', fontWeight: 300 }}
              >
                We invest alongside our partners and share in the same outcomes. Our interests are identical to those of our limited partners.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section 
          id="contact"
          className="relative py-[120px] px-[60px] text-center"
          style={{ background: 'var(--navy-light)' }}
        >
          {/* Top gradient line */}
          <div 
            className="absolute top-0 left-[10%] right-[10%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(184, 150, 90, 0.2), transparent)' }}
          />

          <div 
            id="contact-section"
            className={`fade-in transition-all duration-800 ${
              contactVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[30px]'
            }`}
          >
            <div 
              className="text-[11px] tracking-[4px] uppercase mb-10"
              style={{ color: 'var(--gold)', fontWeight: 500 }}
            >
              Get In Touch
            </div>
            <h2 
              className="mb-5"
              style={{ 
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(28px, 3.5vw, 42px)',
                fontWeight: 300,
                letterSpacing: '5px',
                textTransform: 'uppercase'
              }}
            >
              Contact Us
            </h2>
            <p 
              className="text-sm mb-[50px]"
              style={{ color: 'var(--text-muted)', fontWeight: 300, letterSpacing: '1px' }}
            >
              For inquiries, please reach out below.
            </p>

            {/* Contact Form */}
            <form className="max-w-[520px] mx-auto flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input 
                  type="text" 
                  placeholder="First Name"
                  className="w-full px-5 py-4 text-sm outline-none transition-colors duration-300 focus:border-[var(--gold)]"
                  style={{ 
                    background: 'rgba(244, 241, 235, 0.05)',
                    border: '1px solid rgba(184, 150, 90, 0.15)',
                    color: 'var(--cream)',
                    fontFamily: "'Karla', sans-serif",
                    fontWeight: 300,
                    letterSpacing: '0.5px'
                  }}
                />
                <input 
                  type="text" 
                  placeholder="Last Name"
                  className="w-full px-5 py-4 text-sm outline-none transition-colors duration-300 focus:border-[var(--gold)]"
                  style={{ 
                    background: 'rgba(244, 241, 235, 0.05)',
                    border: '1px solid rgba(184, 150, 90, 0.15)',
                    color: 'var(--cream)',
                    fontFamily: "'Karla', sans-serif",
                    fontWeight: 300,
                    letterSpacing: '0.5px'
                  }}
                />
              </div>
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full px-5 py-4 text-sm outline-none transition-colors duration-300 focus:border-[var(--gold)]"
                style={{ 
                  background: 'rgba(244, 241, 235, 0.05)',
                  border: '1px solid rgba(184, 150, 90, 0.15)',
                  color: 'var(--cream)',
                  fontFamily: "'Karla', sans-serif",
                  fontWeight: 300,
                  letterSpacing: '0.5px'
                }}
              />
              <input 
                type="text" 
                placeholder="Company / Affiliation"
                className="w-full px-5 py-4 text-sm outline-none transition-colors duration-300 focus:border-[var(--gold)]"
                style={{ 
                  background: 'rgba(244, 241, 235, 0.05)',
                  border: '1px solid rgba(184, 150, 90, 0.15)',
                  color: 'var(--cream)',
                  fontFamily: "'Karla', sans-serif",
                  fontWeight: 300,
                  letterSpacing: '0.5px'
                }}
              />
              <textarea 
                placeholder="Message"
                className="w-full px-5 py-4 text-sm outline-none transition-colors duration-300 focus:border-[var(--gold)] resize-none h-[120px]"
                style={{ 
                  background: 'rgba(244, 241, 235, 0.05)',
                  border: '1px solid rgba(184, 150, 90, 0.15)',
                  color: 'var(--cream)',
                  fontFamily: "'Karla', sans-serif",
                  fontWeight: 300,
                  letterSpacing: '0.5px'
                }}
              />
              <button 
                type="submit"
                className="self-center mt-2.5 px-10 py-4 text-xs tracking-[3px] uppercase cursor-pointer transition-all duration-400 hover:bg-[var(--gold)] hover:text-[var(--navy)]"
                style={{ 
                  background: 'transparent',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                  fontFamily: "'Karla', sans-serif"
                }}
              >
                Submit Inquiry
              </button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer 
          className="px-[60px] py-10 flex justify-between items-center"
          style={{ borderTop: '1px solid rgba(184, 150, 90, 0.08)' }}
        >
          <div 
            className="text-sm tracking-[2px] uppercase"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-muted)' }}
          >
            Gaib Capital Partners
          </div>
          <div 
            className="text-[11px] tracking-[1px]"
            style={{ color: 'rgba(138, 155, 181, 0.5)' }}
          >
            © 2026 Gaib Capital Partners LLC. All rights reserved. Confidential. Not an offer to sell securities.
          </div>
        </footer>
      </div>
    </>
  );
}
