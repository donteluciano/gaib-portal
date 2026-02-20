'use client';

import { useState } from 'react';
import Link from 'next/link';

const sites = [
  { id: 1, name: 'Site Alpha', location: 'Springfield, OH', stage: 3, mw: 75, risk: 2, exitValue: 22500000, timeline: '8 months', updated: '2026-02-18' },
  { id: 2, name: 'Site Beta', location: 'Columbus, OH', stage: 2, mw: 50, risk: 3, exitValue: 15000000, timeline: '12 months', updated: '2026-02-17' },
  { id: 3, name: 'Site Gamma', location: 'Indianapolis, IN', stage: 1, mw: 100, risk: 4, exitValue: 30000000, timeline: '18 months', updated: '2026-02-16' },
  { id: 4, name: 'Site Delta', location: 'Louisville, KY', stage: 4, mw: 60, risk: 2, exitValue: 18000000, timeline: '6 months', updated: '2026-02-15' },
  { id: 5, name: 'Site Epsilon', location: 'Cincinnati, OH', stage: 6, mw: 120, risk: 1, exitValue: 36000000, timeline: '2 months', updated: '2026-02-13' },
  { id: 6, name: 'Site Zeta', location: 'Dayton, OH', stage: 1, mw: 40, risk: 3, exitValue: 12000000, timeline: '18 months', updated: '2026-02-11' },
  { id: 7, name: 'Site Eta', location: 'Toledo, OH', stage: 2, mw: 80, risk: 2, exitValue: 24000000, timeline: '14 months', updated: '2026-02-10' },
  { id: 8, name: 'Site Theta', location: 'Fort Wayne, IN', stage: 1, mw: 55, risk: 4, exitValue: 16500000, timeline: '16 months', updated: '2026-02-08' },
];

const stageNames: Record<number, string> = {
  1: 'Identified', 2: 'Gas Confirmed', 3: 'Power Secured', 
  4: 'Permits Filed', 5: 'De-risked', 6: 'Marketing', 7: 'Closed',
};

function formatCurrency(value: number): string {
  return `$${(value / 1000000).toFixed(1)}M`;
}

function getRiskLabel(score: number): { label: string; color: string } {
  if (score <= 2) return { label: 'Low', color: 'text-green-600 bg-green-50' };
  if (score <= 3) return { label: 'Med', color: 'text-yellow-600 bg-yellow-50' };
  return { label: 'High', color: 'text-red-600 bg-red-50' };
}

export default function PipelinePage() {
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');

  const filteredSites = stageFilter === 'all' 
    ? sites 
    : sites.filter(s => s.stage === stageFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
        <Link
          href="/portal/new-site"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          + Add Site
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <label className="text-sm text-gray-600">Filter by stage:</label>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm"
        >
          <option value="all">All Stages</option>
          {Object.entries(stageNames).map(([num, name]) => (
            <option key={num} value={num}>Stage {num}: {name}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">{filteredSites.length} sites</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MW</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timeline</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Exit Value</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSites.map((site) => {
              const risk = getRiskLabel(site.risk);
              return (
                <tr key={site.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/portal/sites/${site.id}`} className="block">
                      <p className="font-medium text-blue-600 hover:underline">{site.name}</p>
                      <p className="text-sm text-gray-500">{site.location}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {site.stage}. {stageNames[site.stage]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{site.mw} MW</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${risk.color}`}>
                      {risk.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{site.timeline}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(site.exitValue)}</td>
                  <td className="px-4 py-3 text-right text-gray-500 text-sm">{site.updated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
