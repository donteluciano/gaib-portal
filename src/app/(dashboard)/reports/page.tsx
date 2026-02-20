'use client';

import { useState } from 'react';

const portfolioPerformance = [
  { quarter: 'Q1 2024', value: 22.5, irr: 14.2 },
  { quarter: 'Q2 2024', value: 24.1, irr: 15.8 },
  { quarter: 'Q3 2024', value: 25.8, irr: 16.5 },
  { quarter: 'Q4 2024', value: 27.2, irr: 17.2 },
  { quarter: 'Q1 2025', value: 28.9, irr: 17.8 },
  { quarter: 'Q2 2025', value: 29.6, irr: 18.1 },
  { quarter: 'Q3 2025', value: 30.4, irr: 18.4 },
  { quarter: 'Q4 2025', value: 31.2, irr: 18.7 },
];

const propertyBreakdown = [
  { name: 'Riverside Plaza', invested: 2.5, currentValue: 3.1, return: 24, type: 'Mixed-Use' },
  { name: 'Tech Campus North', invested: 4.2, currentValue: 4.8, return: 14, type: 'Office' },
  { name: 'Marina Heights', invested: 3.8, currentValue: 5.2, return: 37, type: 'Multifamily' },
  { name: 'Urban Core Apts', invested: 1.5, currentValue: 1.7, return: 13, type: 'Multifamily' },
  { name: 'Sunset Industrial', invested: 2.8, currentValue: 3.4, return: 21, type: 'Industrial' },
];

const distributions = [
  { date: 'Jan 2026', amount: 125000, type: 'Quarterly Distribution' },
  { date: 'Oct 2025', amount: 118500, type: 'Quarterly Distribution' },
  { date: 'Jul 2025', amount: 112000, type: 'Quarterly Distribution' },
  { date: 'Apr 2025', amount: 98500, type: 'Quarterly Distribution' },
  { date: 'Jan 2025', amount: 95000, type: 'Quarterly Distribution' },
  { date: 'Dec 2024', amount: 250000, type: 'Capital Return - Marina Heights' },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const totalDistributions = distributions.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-zinc-400 mt-1">Track your portfolio performance and returns.</p>
        </div>
        <div className="flex gap-2">
          {['1Y', '3Y', 'All'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period.toLowerCase())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period.toLowerCase()
                  ? 'bg-amber-500 text-black'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-white mt-2">$31.2M</p>
          <p className="text-emerald-400 text-sm mt-2">+$6.7M from cost basis</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Net IRR</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">18.7%</p>
          <p className="text-zinc-400 text-sm mt-2">vs 15% target</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Cash on Cash</p>
          <p className="text-3xl font-bold text-white mt-2">8.4%</p>
          <p className="text-zinc-400 text-sm mt-2">Trailing 12 months</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <p className="text-zinc-400 text-sm">Total Distributions</p>
          <p className="text-3xl font-bold text-amber-400 mt-2">${(totalDistributions / 1000).toFixed(0)}K</p>
          <p className="text-zinc-400 text-sm mt-2">Since inception</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Portfolio Value Over Time</h2>
          <div className="h-64 flex items-end gap-2">
            {portfolioPerformance.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t transition-all hover:from-amber-500 hover:to-amber-300"
                  style={{ height: `${(data.value / 35) * 100}%` }}
                  title={`$${data.value}M`}
                />
                <span className="text-zinc-500 text-xs rotate-45 origin-left">{data.quarter}</span>
              </div>
            ))}
          </div>
        </div>

        {/* IRR Trend */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">IRR Trend</h2>
          <div className="h-64 flex items-end gap-2">
            {portfolioPerformance.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all hover:from-emerald-500 hover:to-emerald-300"
                  style={{ height: `${(data.irr / 25) * 100}%` }}
                  title={`${data.irr}%`}
                />
                <span className="text-zinc-500 text-xs rotate-45 origin-left">{data.quarter}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Property breakdown */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Property Performance</h2>
          <button className="text-amber-500 hover:text-amber-400 text-sm font-medium">
            Export CSV →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-zinc-800">
                <th className="pb-4 text-zinc-400 font-medium">Property</th>
                <th className="pb-4 text-zinc-400 font-medium">Type</th>
                <th className="pb-4 text-zinc-400 font-medium text-right">Invested</th>
                <th className="pb-4 text-zinc-400 font-medium text-right">Current Value</th>
                <th className="pb-4 text-zinc-400 font-medium text-right">Return</th>
              </tr>
            </thead>
            <tbody>
              {propertyBreakdown.map((property, i) => (
                <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                  <td className="py-4 text-white font-medium">{property.name}</td>
                  <td className="py-4 text-zinc-400">{property.type}</td>
                  <td className="py-4 text-white text-right">${property.invested}M</td>
                  <td className="py-4 text-white text-right">${property.currentValue}M</td>
                  <td className="py-4 text-right">
                    <span className={`font-semibold ${property.return >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      +{property.return}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribution history */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Distribution History</h2>
        <div className="space-y-3">
          {distributions.map((dist, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="text-white font-medium">{dist.type}</p>
                <p className="text-zinc-400 text-sm">{dist.date}</p>
              </div>
              <p className="text-emerald-400 font-bold text-lg">
                +${dist.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
