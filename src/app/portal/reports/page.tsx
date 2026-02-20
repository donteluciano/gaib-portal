'use client';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-white">Reports</h1>
        <p className="text-muted mt-1">Generate portfolio summaries and LP reports.</p>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-navy-card border border-navy rounded-xl p-6 hover:border-gold/30 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-white mb-2">Portfolio Summary</h3>
          <p className="text-muted text-sm">Overview of all sites with key metrics, stages, and values.</p>
          <button className="mt-4 text-gold text-sm font-medium hover:text-gold-light">
            Generate →
          </button>
        </div>

        <div className="bg-navy-card border border-navy rounded-xl p-6 hover:border-gold/30 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-white mb-2">LP Update Report</h3>
          <p className="text-muted text-sm">Formatted one-pager per site for investor communications.</p>
          <button className="mt-4 text-gold text-sm font-medium hover:text-gold-light">
            Generate →
          </button>
        </div>

        <div className="bg-navy-card border border-navy rounded-xl p-6 hover:border-gold/30 transition-colors cursor-pointer">
          <div className="w-12 h-12 bg-gold/10 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
            </svg>
          </div>
          <h3 className="text-lg font-serif text-white mb-2">Site Comparison</h3>
          <p className="text-muted text-sm">Side-by-side comparison of 2-4 sites on key metrics.</p>
          <button className="mt-4 text-gold text-sm font-medium hover:text-gold-light">
            Compare →
          </button>
        </div>
      </div>

      {/* Quick Export */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-4">Quick Export</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-navy hover:bg-navy-dark text-white font-medium rounded-lg transition-colors border border-navy-card">
            Export All Sites (CSV)
          </button>
          <button className="px-6 py-3 bg-navy hover:bg-navy-dark text-white font-medium rounded-lg transition-colors border border-navy-card">
            Export Pipeline (PDF)
          </button>
          <button className="px-6 py-3 bg-navy hover:bg-navy-dark text-white font-medium rounded-lg transition-colors border border-navy-card">
            Export Data (JSON)
          </button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-navy border border-gold/20 rounded-xl p-6 text-center">
        <p className="text-gold">
          Full report generation with PDF export and automated LP updates coming soon.
        </p>
      </div>
    </div>
  );
}
