'use client';

// Demo data - will be replaced with Supabase
const pipelineStats = {
  totalSites: 8,
  totalMW: 485,
  totalExitValue: 142500000,
  avgRiskScore: 2.3,
};

const stages = [
  { stage: 1, name: 'Identified', count: 3, color: 'bg-blue-500' },
  { stage: 2, name: 'Gas Confirmed', count: 2, color: 'bg-cyan-500' },
  { stage: 3, name: 'Power Secured', count: 1, color: 'bg-green-500' },
  { stage: 4, name: 'Permits Filed', count: 1, color: 'bg-yellow-500' },
  { stage: 5, name: 'De-risked', count: 0, color: 'bg-orange-500' },
  { stage: 6, name: 'Marketing', count: 1, color: 'bg-purple-500' },
  { stage: 7, name: 'Closed', count: 0, color: 'bg-gold' },
];

const sites = [
  { id: 1, name: 'Site Alpha', location: 'Springfield, OH', stage: 3, mw: 75, riskScore: 2, exitValue: 22500000, lastUpdated: '2 hours ago' },
  { id: 2, name: 'Site Beta', location: 'Columbus, OH', stage: 2, mw: 50, riskScore: 3, exitValue: 15000000, lastUpdated: '1 day ago' },
  { id: 3, name: 'Site Gamma', location: 'Indianapolis, IN', stage: 1, mw: 100, riskScore: 4, exitValue: 30000000, lastUpdated: '2 days ago' },
  { id: 4, name: 'Site Delta', location: 'Louisville, KY', stage: 4, mw: 60, riskScore: 2, exitValue: 18000000, lastUpdated: '3 days ago' },
  { id: 5, name: 'Site Epsilon', location: 'Cincinnati, OH', stage: 6, mw: 120, riskScore: 1, exitValue: 36000000, lastUpdated: '5 days ago' },
  { id: 6, name: 'Site Zeta', location: 'Dayton, OH', stage: 1, mw: 40, riskScore: 3, exitValue: 12000000, lastUpdated: '1 week ago' },
];

const recentActivity = [
  { id: 1, site: 'Site Alpha', action: 'Power agreement signed with AEP', date: '2 hours ago' },
  { id: 2, site: 'Site Beta', action: 'Gas feasibility study completed', date: '1 day ago' },
  { id: 3, site: 'Site Gamma', action: 'Initial site visit scheduled', date: '2 days ago' },
  { id: 4, site: 'Site Delta', action: 'Air permit application submitted', date: '3 days ago' },
  { id: 5, site: 'Site Epsilon', action: 'Buyer LOI received from Vantage', date: '5 days ago' },
];

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

function getRiskColor(score: number): string {
  if (score <= 2) return 'bg-success';
  if (score <= 3) return 'bg-warning';
  return 'bg-danger';
}

function getRiskLabel(score: number): string {
  if (score <= 2) return 'Low';
  if (score <= 3) return 'Medium';
  return 'High';
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-white">Dashboard</h1>
        <p className="text-muted mt-1">Pipeline overview and recent activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-navy-card border border-navy-card rounded-xl p-6">
          <p className="text-muted text-sm">Active Sites</p>
          <p className="text-3xl font-bold text-white mt-2">{pipelineStats.totalSites}</p>
          <p className="text-gold text-sm mt-2">In pipeline</p>
        </div>
        <div className="bg-navy-card border border-navy-card rounded-xl p-6">
          <p className="text-muted text-sm">Total MW Capacity</p>
          <p className="text-3xl font-bold text-white mt-2">{pipelineStats.totalMW} MW</p>
          <p className="text-gold text-sm mt-2">Across all sites</p>
        </div>
        <div className="bg-navy-card border border-navy-card rounded-xl p-6">
          <p className="text-muted text-sm">Est. Exit Value</p>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(pipelineStats.totalExitValue)}</p>
          <p className="text-success text-sm mt-2">Portfolio total</p>
        </div>
        <div className="bg-navy-card border border-navy-card rounded-xl p-6">
          <p className="text-muted text-sm">Avg. Risk Score</p>
          <p className="text-3xl font-bold text-white mt-2">{pipelineStats.avgRiskScore.toFixed(1)}</p>
          <p className="text-success text-sm mt-2">Low risk</p>
        </div>
      </div>

      {/* Stage Funnel */}
      <div className="bg-navy-card border border-navy-card rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">Stage Funnel</h2>
        <div className="flex items-end gap-2 h-32">
          {stages.map((stage) => (
            <div key={stage.stage} className="flex-1 flex flex-col items-center">
              <span className="text-white font-bold text-lg mb-2">{stage.count}</span>
              <div 
                className={`w-full ${stage.color} rounded-t transition-all`}
                style={{ height: `${Math.max(stage.count * 25, 8)}%` }}
              />
              <span className="text-muted text-xs mt-2 text-center">{stage.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Table */}
        <div className="lg:col-span-2 bg-navy-card border border-navy-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif text-white">Active Sites</h2>
            <a href="/portal/pipeline" className="text-gold hover:text-gold-light text-sm font-medium">
              View all →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-navy">
                  <th className="pb-3 text-muted font-medium text-sm">Site</th>
                  <th className="pb-3 text-muted font-medium text-sm">Stage</th>
                  <th className="pb-3 text-muted font-medium text-sm">MW</th>
                  <th className="pb-3 text-muted font-medium text-sm">Risk</th>
                  <th className="pb-3 text-muted font-medium text-sm text-right">Exit Value</th>
                </tr>
              </thead>
              <tbody>
                {sites.slice(0, 5).map((site) => (
                  <tr key={site.id} className="border-b border-navy/50 hover:bg-navy/30 cursor-pointer">
                    <td className="py-3">
                      <p className="text-white font-medium">{site.name}</p>
                      <p className="text-muted text-sm">{site.location}</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-navy text-gold text-xs rounded font-medium">
                        Stage {site.stage}
                      </span>
                    </td>
                    <td className="py-3 text-white">{site.mw}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${getRiskColor(site.riskScore)}`} />
                        <span className="text-muted text-sm">{getRiskLabel(site.riskScore)}</span>
                      </div>
                    </td>
                    <td className="py-3 text-white text-right font-medium">{formatCurrency(site.exitValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-navy-card border border-navy-card rounded-xl p-6">
          <h2 className="text-xl font-serif text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-navy last:border-0 last:pb-0">
                <div className="w-2 h-2 rounded-full bg-gold mt-2" />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.site}</p>
                  <p className="text-muted text-sm mt-1">{activity.action}</p>
                  <p className="text-light-gray text-xs mt-1">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <a
          href="/portal/new-site"
          className="px-6 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors"
        >
          + Add New Site
        </a>
        <a
          href="/portal/reports"
          className="px-6 py-3 bg-navy-card hover:bg-navy text-white font-medium rounded-lg transition-colors border border-navy"
        >
          Generate Report
        </a>
        <a
          href="/portal/leads"
          className="px-6 py-3 bg-navy-card hover:bg-navy text-white font-medium rounded-lg transition-colors border border-navy"
        >
          View Leads
        </a>
      </div>
    </div>
  );
}
