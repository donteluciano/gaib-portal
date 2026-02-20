'use client';

const leads = [
  { id: 1, property: 'Former Steel Mill', location: 'Gary, IN', source: 'CoStar', acreage: 45, askingPrice: 2500000, dateAdded: '2026-02-18', status: 'new' },
  { id: 2, property: 'Industrial Complex', location: 'Youngstown, OH', source: 'LoopNet', acreage: 30, askingPrice: 1800000, dateAdded: '2026-02-17', status: 'reviewing' },
  { id: 3, property: 'Manufacturing Plant', location: 'Flint, MI', source: 'Broker', acreage: 55, askingPrice: 3200000, dateAdded: '2026-02-16', status: 'new' },
  { id: 4, property: 'Distribution Center', location: 'Akron, OH', source: 'CoStar', acreage: 20, askingPrice: 1200000, dateAdded: '2026-02-15', status: 'passed' },
  { id: 5, property: 'Power Plant Site', location: 'Evansville, IN', source: 'Direct', acreage: 80, askingPrice: 5000000, dateAdded: '2026-02-14', status: 'reviewing' },
];

function getStatusStyle(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'reviewing': return 'bg-gold/20 text-gold border-gold/30';
    case 'passed': return 'bg-muted/20 text-muted border-muted/30';
    case 'converted': return 'bg-success/20 text-success border-success/30';
    default: return 'bg-navy text-muted';
  }
}

export default function LeadsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-white">Leads</h1>
          <p className="text-muted mt-1">Incoming site opportunities and listings.</p>
        </div>
        <button className="px-6 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors">
          + Add Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-navy-card border border-navy rounded-xl p-5">
          <p className="text-muted text-sm">New Leads</p>
          <p className="text-2xl font-bold text-white mt-1">2</p>
        </div>
        <div className="bg-navy-card border border-navy rounded-xl p-5">
          <p className="text-muted text-sm">Under Review</p>
          <p className="text-2xl font-bold text-gold mt-1">2</p>
        </div>
        <div className="bg-navy-card border border-navy rounded-xl p-5">
          <p className="text-muted text-sm">Converted to Site</p>
          <p className="text-2xl font-bold text-success mt-1">0</p>
        </div>
        <div className="bg-navy-card border border-navy rounded-xl p-5">
          <p className="text-muted text-sm">Passed</p>
          <p className="text-2xl font-bold text-muted mt-1">1</p>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-navy-card border border-navy rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy">
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">Property</th>
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">Source</th>
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">Acreage</th>
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">Asking</th>
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">Status</th>
              <th className="px-6 py-4 text-right text-muted font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-navy/50 hover:bg-navy/30 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{lead.property}</p>
                  <p className="text-muted text-sm">{lead.location}</p>
                </td>
                <td className="px-6 py-4 text-muted">{lead.source}</td>
                <td className="px-6 py-4 text-white">{lead.acreage} acres</td>
                <td className="px-6 py-4 text-white">${(lead.askingPrice / 1000000).toFixed(1)}M</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border capitalize ${getStatusStyle(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gold hover:text-gold-light text-sm font-medium mr-4">
                    Review
                  </button>
                  <button className="text-muted hover:text-white text-sm">
                    Pass
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Integration Note */}
      <div className="bg-navy border border-gold/20 rounded-xl p-6 text-center">
        <p className="text-gold">
          PowerSite Acquisitions integration coming soon — leads will flow in automatically.
        </p>
      </div>
    </div>
  );
}
