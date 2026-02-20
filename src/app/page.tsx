import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy border-b border-navy-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-serif text-lg tracking-[4px]">
            GAIB CAPITAL PARTNERS
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-white hover:text-gold transition-colors text-sm tracking-wide">
              Home
            </Link>
            <Link href="/contact" className="text-muted hover:text-gold transition-colors text-sm tracking-wide">
              Contact
            </Link>
            <Link href="/investor-login" className="text-muted hover:text-gold transition-colors text-sm tracking-wide">
              Investor Login
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 rounded transition-colors text-sm tracking-wide"
            >
              Portal
            </Link>
          </div>
        </div>
        <div className="gold-line" />
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif text-white tracking-wide leading-tight">
            GAIB CAPITAL<br />PARTNERS
          </h1>
          <div className="gold-line w-32 mx-auto mt-8" />
          <p className="text-gold text-xl mt-8 tracking-wider">
            Power & Data Infrastructure Investment
          </p>
          <p className="text-muted text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            We acquire and develop industrial sites for data center infrastructure.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-6 bg-navy">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-serif text-white mb-8 text-center">About the Firm</h2>
          <div className="space-y-6 text-muted leading-relaxed">
            <p>
              Gaib Capital Partners specializes in the acquisition and development of industrial sites 
              positioned for data center infrastructure deployment. We identify undervalued properties 
              with access to critical utilities—power, gas, water, and fiber—and systematically de-risk 
              them for institutional exit.
            </p>
            <p>
              Our team brings deep expertise in power infrastructure, site development, and capital markets. 
              We work closely with utilities, municipalities, and engineering partners to transform raw 
              industrial sites into shovel-ready data center campuses.
            </p>
            <p>
              Backed by institutional capital, we pursue a disciplined, stage-gated investment process 
              designed to maximize risk-adjusted returns while maintaining strict capital efficiency.
            </p>
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif text-white mb-12 text-center">Investment Focus</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-navy-card border border-navy rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-white mb-3">Power Infrastructure</h3>
              <p className="text-muted text-sm">
                Access to high-capacity transmission and gas pipelines for reliable power generation.
              </p>
            </div>
            <div className="bg-navy-card border border-navy rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-white mb-3">Site Development</h3>
              <p className="text-muted text-sm">
                Industrial land with entitlements, environmental clearance, and infrastructure readiness.
              </p>
            </div>
            <div className="bg-navy-card border border-navy rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                </svg>
              </div>
              <h3 className="text-xl font-serif text-white mb-3">Institutional Exit</h3>
              <p className="text-muted text-sm">
                De-risked, shovel-ready sites marketed to hyperscalers and data center developers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-navy">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-serif text-white mb-6">Contact</h2>
          <p className="text-muted mb-8">
            For inquiries regarding investment opportunities or partnerships.
          </p>
          <a 
            href="mailto:info@gaibcapitalpartners.com" 
            className="text-gold hover:text-gold-light text-lg"
          >
            info@gaibcapitalpartners.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-navy-card">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted text-sm">
              © 2026 Gaib Capital Partners LLC. All rights reserved.
            </p>
            <p className="text-muted text-sm">
              Confidential. Not an offer to sell securities.
            </p>
          </div>
          <div className="mt-4 text-center">
            <Link href="/privacy" className="text-muted hover:text-gold text-sm">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
