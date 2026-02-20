'use client';

import { useState } from 'react';

const sites = [
  { id: 1, name: 'Site Alpha', location: 'Springfield, OH', stage: 3, mw: 75, riskScore: 2, exitValue: 22500000, timeline: '8 months', lastUpdated: '2026-02-18' },
  { id: 2, name: 'Site Beta', location: 'Columbus, OH', stage: 2, mw: 50, riskScore: 3, exitValue: 15000000, timeline: '12 months', lastUpdated: '2026-02-17' },
  { id: 3, name: 'Site Gamma', location: 'Indianapolis, IN', stage: 1, mw: 100, riskScore: 4, exitValue: 30000000, timeline: '18 months', lastUpdated: '2026-02-16' },
  { id: 4, name: 'Site Delta', location: 'Louisville, KY', stage: 4, mw: 60, riskScore: 2, exitValue: 18000000, timeline: '6 months', lastUpdated: '2026-02-15' },
  { id: 5, name: 'Site Epsilon', location: 'Cincinnati, OH', stage: 6, mw: 120, riskScore: 1, exitValue: 36000000, timeline: '2 months', lastUpdated: '2026-02-13' },
  { id: 6, name: 'Site Zeta', location: 'Dayton, OH', stage: 1, mw: 40, riskScore: 3, exitValue: 12000000, timeline: '18 months', lastUpdated: '2026-02-11' },
  { id: 7, name: 'Site Eta', location: 'Toledo, OH', stage: 2, mw: 80, riskScore: 2, exitValue: 24000000, timeline: '14 months', lastUpdated: '2026-02-10' },
  { id: 8, name: 'Site Theta', location: 'Fort Wayne, IN', stage: 1, mw: 55, riskScore: 4, exitValue: 16500000, timeline: '16 months', lastUpdated: '2026-02-08' },
];

const stageNames: Record<number, string> = {
  1: 'Identified',
  2: 'Gas Confirmed',
  3: 'Power Secured',
  4: 'Permits Filed',
  5: 'De-risked',
  6: 'Marketing',
  7: 'Closed',
};

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

function getStageColor(stage: number): string {
  const colors: Record<number, string> = {
    1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    2: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    3: 'bg-green-500/20 text-green-400 border-green-500/30',
    4: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    5: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    6: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    7: 'bg-gold/20 text-gold border-gold/30',
  };
  return colors[stage] || '';
}

export default function PipelinePage() {
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'stage' | 'mw' | 'exitValue'>('stage');

  const filteredSites = sites
    .filter(site => stageFilter === 'all' || site.stage === stageFilter)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stage') return a.stage - b.stage;
      if (sortBy === 'mw') return b.mw - a.mw;
      if (sortBy === 'exitValue') return b.exitValue - a.exitValue;
      return 0;
    });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-white">Pipeline</h1>
          <p className="text-muted mt-1">All sites in the acquisition pipeline.</p>
        </div>
        <a
          href="/portal/new-site"
          className="px-6 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors"
        >
          + Add Site
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-muted text-sm">Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="bg-navy-card border border-navy text-white px-3 py-2 rounded-lg focus:border-gold outline-none"
          >
            <option value="all">All Stages</option>
            {Object.entries(stageNames).map(([num, name]) => (
              <option key={num} value={num}>Stage {num}: {name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted text-sm">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-navy-card border border-navy text-white px-3 py-2 rounded-lg focus:border-gold outline-none"
          >
            <option value="stage">Stage</option>
            <option value="name">Name</option>
            <option value="mw">MW Capacity</option>
            <option value="exitValue">Exit Value</option>
          </select>
        </div>
      </div>

      {/* Pipeline Table */}
      <div className="bg-navy-card border border-navy rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy">
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">Site</th>
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">Stage</th>
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">MW</th>
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">Risk</th>
              <th className="px-6 py-4 text-left text-muted font-medium text-sm">Timeline</th>
              <th className="px-6 py-4 text-right text-muted font-medium text-sm">Exit Value</th>
              <th className="px-6 py-4 text-right text-muted font-medium text-sm">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredSites.map((site) => (
              <tr
                key={site.id}
                className="border-b border-navy/50 hover:bg-navy/30 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <p className="text-white font-medium">{site.name}</p>
                  <p className="text-muted text-sm">{site.location}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStageColor(site.stage)}`}>
                    {site.stage}. {stageNames[site.stage]}
                  </span>
                </td>
                <td className="px-6 py-4 text-white font-medium">{site.mw} MW</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getRiskColor(site.riskScore)}`} />
                    <span className="text-white">{site.riskScore}/5</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-muted">{site.timeline}</td>
                <td className="px-6 py-4 text-right text-gold font-semibold">{formatCurrency(site.exitValue)}</td>
                <td className="px-6 py-4 text-right text-muted text-sm">{site.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-12 bg-navy-card rounded-xl">
          <p className="text-muted">No sites match your filters.</p>
        </div>
      )}
    </div>
  );
}
