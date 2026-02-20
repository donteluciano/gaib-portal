'use client';

import { useState } from 'react';

// Mock data - will be replaced with real API calls
const stats = [
  { label: 'Total Invested', value: '$24.5M', change: '+12.3%', positive: true },
  { label: 'Active Deals', value: '12', change: '+3', positive: true },
  { label: 'Avg. IRR', value: '18.7%', change: '+2.1%', positive: true },
  { label: 'Portfolio Value', value: '$31.2M', change: '+8.4%', positive: true },
];

const recentActivity = [
  { id: 1, type: 'investment', title: 'New Investment: Riverside Plaza', amount: '$2.5M', date: '2 hours ago' },
  { id: 2, type: 'distribution', title: 'Q4 Distribution Received', amount: '$125K', date: '1 day ago' },
  { id: 3, type: 'update', title: 'Construction Update: Tech Campus', amount: null, date: '2 days ago' },
  { id: 4, type: 'document', title: 'K-1 Documents Available', amount: null, date: '3 days ago' },
  { id: 5, type: 'investment', title: 'Capital Call: Marina Heights', amount: '$500K', date: '1 week ago' },
];

const activeSites = [
  { id: 1, name: 'Riverside Plaza', location: 'Austin, TX', status: 'Construction', progress: 65, invested: '$2.5M' },
  { id: 2, name: 'Tech Campus North', location: 'Denver, CO', status: 'Development', progress: 30, invested: '$4.2M' },
  { id: 3, name: 'Marina Heights', location: 'Miami, FL', status: 'Stabilized', progress: 100, invested: '$3.8M' },
  { id: 4, name: 'Urban Core Apts', location: 'Nashville, TN', status: 'Due Diligence', progress: 15, invested: '$1.5M' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Welcome back. Here&apos;s your portfolio overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <p className="text-zinc-400 text-sm font-medium">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
            <p className={`text-sm mt-2 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
              {stat.change} from last quarter
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Sites */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Active Investments</h2>
            <a href="/sites" className="text-amber-500 hover:text-amber-400 text-sm font-medium">
              View all →
            </a>
          </div>
          <div className="space-y-4">
            {activeSites.map((site) => (
              <div key={site.id} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-white">{site.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      site.status === 'Stabilized' ? 'bg-emerald-500/20 text-emerald-400' :
                      site.status === 'Construction' ? 'bg-amber-500/20 text-amber-400' :
                      site.status === 'Development' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-zinc-500/20 text-zinc-400'
                    }`}>
                      {site.status}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm mt-1">{site.location}</p>
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-zinc-700 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${site.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-white font-semibold">{site.invested}</p>
                  <p className="text-zinc-400 text-sm">invested</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'investment' ? 'bg-emerald-400' :
                  activity.type === 'distribution' ? 'bg-amber-400' :
                  activity.type === 'update' ? 'bg-blue-400' :
                  'bg-zinc-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    {activity.amount && (
                      <p className="text-amber-400 text-sm font-semibold">{activity.amount}</p>
                    )}
                    <p className="text-zinc-500 text-xs">{activity.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
            View New Opportunities
          </button>
          <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors border border-zinc-700">
            Download Reports
          </button>
          <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors border border-zinc-700">
            Schedule Call
          </button>
          <button className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors border border-zinc-700">
            Tax Documents
          </button>
        </div>
      </div>
    </div>
  );
}
