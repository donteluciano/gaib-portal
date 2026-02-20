import Link from 'next/link';

export default function InvestorLoginPage() {
  return (
    <div className="min-h-screen bg-navy-dark">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy border-b border-navy-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-white font-serif text-lg tracking-[4px]">
            GAIB CAPITAL PARTNERS
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-muted hover:text-gold transition-colors text-sm tracking-wide">
              Home
            </Link>
            <Link href="/contact" className="text-muted hover:text-gold transition-colors text-sm tracking-wide">
              Contact
            </Link>
            <Link href="/investor-login" className="text-white hover:text-gold transition-colors text-sm tracking-wide">
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

      {/* Content */}
      <div className="pt-32 pb-20 px-6 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-white mb-4">Investor Portal</h1>
            <div className="gold-line w-24 mx-auto" />
          </div>
          
          <div className="bg-navy-card border border-navy rounded-xl p-8 text-center">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-xl font-serif text-white mb-4">Coming Soon</h2>
            <p className="text-muted mb-6">
              The investor portal is currently under development. LP investors will soon be able to access 
              fund documents, performance reports, and capital account statements here.
            </p>
            <p className="text-muted text-sm mb-8">
              For fund materials, please contact us directly.
            </p>
            <Link 
              href="/contact" 
              className="inline-block px-8 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-navy-card">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted text-sm">
            © 2026 Gaib Capital Partners LLC. All rights reserved. Confidential.
          </p>
        </div>
      </footer>
    </div>
  );
}
