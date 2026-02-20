'use client';

import Link from 'next/link';

// Demo data
const stats = {
  totalSites: 8,
  totalMW: 485,
  totalExitValue: 142500000,
  avgRiskScore: 2.3,
};

const sites = [
  { id: 1, name: 'Site Alpha', location: 'Springfield, OH', stage: 3, mw: 75, risk: 2, exitValue: 22500000, updated: '2 hours ago' },
  { id: 2, name: 'Site Beta', location: 'Columbus, OH', stage: 2, mw: 50, risk: 3, exitValue: 15000000, updated: '1 day ago' },
  { id: 3, name: 'Site Gamma', location: 'Indianapolis, IN', stage: 1, mw: 100, risk: 4, exitValue: 30000000, updated: '2 days ago' },
  { id: 4, name: 'Site Delta', location: 'Louisville, KY', stage: 4, mw: 60, risk: 2, exitValue: 18000000, updated: '3 days ago' },
  { id: 5, name: 'Site Epsilon', location: 'Cincinnati, OH', stage: 6, mw: 120, risk: 1, exitValue: 36000000, updated: '5 days ago' },
];

const recentActivity = [
  { site: 'Site Alpha', action: 'Power agreement signed with AEP', date: '2 hours ago' },
  { site: 'Site Beta', action: 'Gas feasibility study completed', date: '1 day ago' },
  { site: 'Site Gamma', action: 'Initial site visit scheduled', date: '2 days ago' },
  { site: 'Site Delta', action: 'Air permit application submitted', date: '3 days ago' },
];

function formatCurrency(value: number): string {
  return `$${(value / 1000000).toFixed(1)}M`;
}

function getRiskLabel(score: number): { label: string; color: string } {
  if (score <= 2) return { label: 'Low', color: 'text-green-600 bg-green-50' };
  if (score <= 3) return { label: 'Med', color: 'text-yellow-600 bg-yellow-50' };
  return { label: 'High', color: 'text-red-600 bg-red-50' };
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <Link
          href="/portal/new-site"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
        >
          + Add Site
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-500">Active Sites</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalSites}</p>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-500">Total MW</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.totalMW}</p>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-500">Est. Exit Value</p>
          <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalExitValue)}</p>
        </div>
        <div className="bg-white p-4 rounded border border-gray-200">
          <p className="text-sm text-gray-500">Avg Risk Score</p>
          <p className="text-2xl font-semibold text-gray-900">{stats.avgRiskScore}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Sites Table */}
        <div className="col-span-2 bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Active Sites</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">MW</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Exit Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sites.map((site) => {
                const risk = getRiskLabel(site.risk);
                return (
                  <tr key={site.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/portal/sites/${site.id}`} className="block">
                        <p className="font-medium text-gray-900">{site.name}</p>
                        <p className="text-sm text-gray-500">{site.location}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        Stage {site.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{site.mw}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${risk.color}`}>
                        {risk.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(site.exitValue)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-gray-900">{activity.site}</p>
                <p className="text-sm text-gray-600">{activity.action}</p>
                <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
