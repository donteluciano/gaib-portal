import Link from 'next/link';

export default function ContactPage() {
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
            <Link href="/contact" className="text-white hover:text-gold transition-colors text-sm tracking-wide">
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

      {/* Content */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-serif text-white mb-4 text-center">Contact Us</h1>
          <div className="gold-line w-24 mx-auto mb-12" />
          
          <div className="bg-navy-card border border-navy rounded-xl p-8">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-xl font-serif text-white mb-4">General Inquiries</h2>
                <a 
                  href="mailto:info@gaibcapitalpartners.com" 
                  className="text-gold hover:text-gold-light text-lg"
                >
                  info@gaibcapitalpartners.com
                </a>
              </div>

              <div className="border-t border-navy pt-8">
                <h2 className="text-xl font-serif text-white mb-6 text-center">Send a Message</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Email</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-none"
                      placeholder="Your message..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
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
