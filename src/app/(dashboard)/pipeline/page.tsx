'use client';

import Link from 'next/link';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

// Will be replaced with Supabase data
const mockSites = [
  { id: '1', name: 'Site Alpha', city: 'Springfield', state: 'OH', stage: 3, mw: 50, riskScore: 2, exitValue: 45000000, timeline: '12 months', lastUpdated: '2026-02-15' },
  { id: '2', name: 'Site Beta', city: 'Toledo', state: 'OH', stage: 2, mw: 35, riskScore: 3, exitValue: 32000000, timeline: '14 months', lastUpdated: '2026-02-18' },
  { id: '3', name: 'Site Gamma', city: 'Columbus', state: 'OH', stage: 4, mw: 75, riskScore: 1, exitValue: 68000000, timeline: '10 months', lastUpdated: '2026-02-19' },
  { id: '4', name: 'Site Delta', city: 'Cincinnati', state: 'OH', stage: 1, mw: 40, riskScore: 4, exitValue: 36000000, timeline: '18 months', lastUpdated: '2026-02-20' },
  { id: '5', name: 'Site Epsilon', city: 'Dayton', state: 'OH', stage: 5, mw: 45, riskScore: 2, exitValue: 41000000, timeline: '8 months', lastUpdated: '2026-02-14' },
];

function formatCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function getRiskColor(score: number) {
  if (score <= 2) return 'bg-success';
  if (score <= 3) return 'bg-warning';
  return 'bg-danger';
}

function getStageColor(stage: number) {
  const colors = ['bg-gray-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-gold', 'bg-gold-light', 'bg-success'];
  return colors[stage - 1] || 'bg-gray-500';
}

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-white">Pipeline</h1>
          <p className="text-gray-400 mt-1">All sites in evaluation pipeline</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-navy-card text-white px-4 py-2 rounded-lg hover:bg-navy transition-colors border border-navy-light">
            <FunnelIcon className="w-5 h-5" />
            Filter
          </button>
          <Link
            href="/sites/new"
            className="flex items-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gold-light transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            New Site
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-navy-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Location</th>
                <th>Stage</th>
                <th>MW Est.</th>
                <th>Risk</th>
                <th>Exit Value</th>
                <th>Timeline</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {mockSites.map((site) => (
                <tr key={site.id}>
                  <td>
                    <Link href={`/sites/${site.id}`} className="text-gold hover:text-gold-light font-medium">
                      {site.name}
                    </Link>
                  </td>
                  <td className="text-gray-300">{site.city}, {site.state}</td>
                  <td>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStageColor(site.stage)} text-white`}>
                      Stage {site.stage}
                    </span>
                  </td>
                  <td className="text-white">{site.mw} MW</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(site.riskScore)}`} />
                      <span className="text-gray-300 text-sm">{site.riskScore}</span>
                    </div>
                  </td>
                  <td className="text-white font-medium">{formatCurrency(site.exitValue)}</td>
                  <td className="text-gray-300">{site.timeline}</td>
                  <td className="text-gray-400 text-sm">{site.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
