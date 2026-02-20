'use client';

import Link from 'next/link';
import { 
  BuildingOfficeIcon, 
  BoltIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  PlusIcon 
} from '@heroicons/react/24/outline';

// Mock data - will be replaced with Supabase
const mockStats = {
  totalSites: 8,
  totalMW: 245,
  totalExitValue: 287500000,
  avgRiskScore: 2.3,
};

const mockSites = [
  { id: '1', name: 'Site Alpha', location: 'Springfield, OH', stage: 3, mw: 50, riskScore: 2, exitValue: 45000000, lastUpdated: '2026-02-15' },
  { id: '2', name: 'Site Beta', location: 'Toledo, OH', stage: 2, mw: 35, riskScore: 3, exitValue: 32000000, lastUpdated: '2026-02-18' },
  { id: '3', name: 'Site Gamma', location: 'Columbus, OH', stage: 4, mw: 75, riskScore: 1, exitValue: 68000000, lastUpdated: '2026-02-19' },
  { id: '4', name: 'Site Delta', location: 'Cincinnati, OH', stage: 1, mw: 40, riskScore: 4, exitValue: 36000000, lastUpdated: '2026-02-20' },
  { id: '5', name: 'Site Epsilon', location: 'Dayton, OH', stage: 5, mw: 45, riskScore: 2, exitValue: 41000000, lastUpdated: '2026-02-14' },
];

const stageFunnel = [
  { stage: 1, name: 'Identification', count: 5 },
  { stage: 2, name: 'Gas Viability', count: 3 },
  { stage: 3, name: 'Environmental', count: 2 },
  { stage: 4, name: 'Permitting', count: 2 },
  { stage: 5, name: 'Engineering', count: 1 },
  { stage: 6, name: 'Exit Process', count: 0 },
  { stage: 7, name: 'Closed', count: 0 },
];

const recentActivity = [
  { id: '1', site: 'Site Gamma', action: 'Moved to Stage 4', time: '2 hours ago' },
  { id: '2', site: 'Site Beta', action: 'Gas utility response received', time: '5 hours ago' },
  { id: '3', site: 'Site Delta', action: 'New site added to pipeline', time: '1 day ago' },
  { id: '4', site: 'Site Alpha', action: 'Phase I ESA completed', time: '2 days ago' },
];

function formatCurrency(value: number) {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

function getRiskColor(score: number) {
  if (score <= 2) return 'bg-success';
  if (score <= 3) return 'bg-warning';
  return 'bg-danger';
}

function getStageColor(stage: number) {
  const colors = [
    'bg-gray-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-gold',
    'bg-gold-light',
    'bg-success',
  ];
  return colors[stage - 1] || 'bg-gray-500';
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Pipeline overview and recent activity</p>
        </div>
        <Link
          href="/sites/new"
          className="flex items-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg font-semibold hover:bg-gold-light transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Site
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-navy-card rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-navy rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Sites</p>
              <p className="text-2xl font-bold text-white">{mockStats.totalSites}</p>
            </div>
          </div>
        </div>

        <div className="bg-navy-card rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-navy rounded-lg">
              <BoltIcon className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total MW</p>
              <p className="text-2xl font-bold text-white">{mockStats.totalMW} MW</p>
            </div>
          </div>
        </div>

        <div className="bg-navy-card rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-navy rounded-lg">
              <CurrencyDollarIcon className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Est. Exit Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(mockStats.totalExitValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-navy-card rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-navy rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Risk Score</p>
              <p className="text-2xl font-bold text-white">{mockStats.avgRiskScore.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Table */}
        <div className="lg:col-span-2 bg-navy-card rounded-lg overflow-hidden">
          <div className="p-4 border-b border-navy">
            <h2 className="text-lg font-semibold text-white">Pipeline</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Location</th>
                  <th>Stage</th>
                  <th>MW</th>
                  <th>Risk</th>
                  <th>Exit Value</th>
                </tr>
              </thead>
              <tbody>
                {mockSites.map((site) => (
                  <tr key={site.id} className="cursor-pointer">
                    <td>
                      <Link href={`/sites/${site.id}`} className="text-gold hover:text-gold-light">
                        {site.name}
                      </Link>
                    </td>
                    <td className="text-gray-300">{site.location}</td>
                    <td>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStageColor(site.stage)} text-white`}>
                        Stage {site.stage}
                      </span>
                    </td>
                    <td className="text-white">{site.mw} MW</td>
                    <td>
                      <span className={`inline-block w-3 h-3 rounded-full ${getRiskColor(site.riskScore)}`} />
                    </td>
                    <td className="text-white">{formatCurrency(site.exitValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Stage Funnel */}
          <div className="bg-navy-card rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Stage Funnel</h2>
            <div className="space-y-3">
              {stageFunnel.map((stage) => (
                <div key={stage.stage} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-24 truncate">{stage.name}</span>
                  <div className="flex-1 bg-navy rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-full ${getStageColor(stage.stage)}`}
                      style={{ width: `${Math.max(stage.count * 15, stage.count > 0 ? 10 : 0)}%` }}
                    />
                  </div>
                  <span className="text-white text-sm w-6 text-right">{stage.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-navy-card rounded-lg p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full mt-2" />
                  <div>
                    <p className="text-white text-sm">
                      <span className="text-gold">{activity.site}</span> — {activity.action}
                    </p>
                    <p className="text-gray-500 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
