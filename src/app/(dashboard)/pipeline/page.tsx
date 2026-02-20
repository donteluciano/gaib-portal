'use client';

import { useState } from 'react';

type DealStage = 'all' | 'review' | 'due-diligence' | 'closing' | 'funded';

const deals = [
  {
    id: 1,
    name: 'Sunset Industrial Park',
    location: 'Phoenix, AZ',
    type: 'Industrial',
    targetRaise: '$8.5M',
    minInvestment: '$100K',
    targetIRR: '22%',
    holdPeriod: '5 years',
    stage: 'due-diligence',
    progress: 65,
    deadline: '15 days left',
    image: '/api/placeholder/400/250',
    highlights: ['Value-add opportunity', 'Below market rents', 'Strong tenant demand'],
  },
  {
    id: 2,
    name: 'Downtown Mixed-Use',
    location: 'Charlotte, NC',
    type: 'Mixed-Use',
    targetRaise: '$12M',
    minInvestment: '$150K',
    targetIRR: '18%',
    holdPeriod: '7 years',
    stage: 'review',
    progress: 25,
    deadline: '30 days left',
    image: '/api/placeholder/400/250',
    highlights: ['Ground-up development', 'Retail + residential', 'Urban core location'],
  },
  {
    id: 3,
    name: 'Lakeside Apartments',
    location: 'Orlando, FL',
    type: 'Multifamily',
    targetRaise: '$6.2M',
    minInvestment: '$75K',
    targetIRR: '16%',
    holdPeriod: '5 years',
    stage: 'closing',
    progress: 90,
    deadline: '5 days left',
    image: '/api/placeholder/400/250',
    highlights: ['Class A property', 'Strong population growth', '95% pre-leased'],
  },
  {
    id: 4,
    name: 'Tech Flex Campus',
    location: 'Raleigh, NC',
    type: 'Office/Flex',
    targetRaise: '$15M',
    minInvestment: '$200K',
    targetIRR: '20%',
    holdPeriod: '6 years',
    stage: 'review',
    progress: 15,
    deadline: '45 days left',
    image: '/api/placeholder/400/250',
    highlights: ['Research Triangle', 'Triple net leases', 'Tech tenant focus'],
  },
  {
    id: 5,
    name: 'Harbor View Retail',
    location: 'San Diego, CA',
    type: 'Retail',
    targetRaise: '$4.8M',
    minInvestment: '$50K',
    targetIRR: '14%',
    holdPeriod: '4 years',
    stage: 'funded',
    progress: 100,
    deadline: 'Fully funded',
    image: '/api/placeholder/400/250',
    highlights: ['Waterfront location', 'F&B anchored', 'Strong foot traffic'],
  },
];

const stageConfig: Record<DealStage, { label: string; color: string; bg: string }> = {
  'all': { label: 'All Deals', color: 'text-zinc-400', bg: 'bg-zinc-500/20' },
  'review': { label: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-500/20' },
  'due-diligence': { label: 'Due Diligence', color: 'text-amber-400', bg: 'bg-amber-500/20' },
  'closing': { label: 'Closing', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  'funded': { label: 'Funded', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
};

export default function PipelinePage() {
  const [activeStage, setActiveStage] = useState<DealStage>('all');

  const filteredDeals = activeStage === 'all' 
    ? deals 
    : deals.filter(d => d.stage === activeStage);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Investment Pipeline</h1>
        <p className="text-zinc-400 mt-1">Review current opportunities and track deal progress.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-sm">Active Opportunities</p>
          <p className="text-2xl font-bold text-white mt-1">{deals.filter(d => d.stage !== 'funded').length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-sm">Total Capital Sought</p>
          <p className="text-2xl font-bold text-white mt-1">$46.5M</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-sm">Avg. Target IRR</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">18.0%</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-zinc-400 text-sm">Closing Soon</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">2 deals</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(stageConfig) as DealStage[]).map((stage) => (
          <button
            key={stage}
            onClick={() => setActiveStage(stage)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeStage === stage
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {stageConfig[stage].label}
            {stage !== 'all' && (
              <span className="ml-2 text-xs opacity-75">
                ({deals.filter(d => d.stage === stage).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Deal cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDeals.map((deal) => (
          <div key={deal.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors">
            {/* Deal header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">{deal.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${stageConfig[deal.stage as DealStage].bg} ${stageConfig[deal.stage as DealStage].color}`}>
                      {stageConfig[deal.stage as DealStage].label}
                    </span>
                  </div>
                  <p className="text-zinc-400 mt-1">{deal.location} • {deal.type}</p>
                </div>
                <span className={`text-sm font-medium ${deal.stage === 'funded' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {deal.deadline}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-400">Funding Progress</span>
                  <span className="text-white font-medium">{deal.progress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      deal.progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${deal.progress}%` }}
                  />
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-zinc-500 text-xs">Target Raise</p>
                  <p className="text-white font-semibold">{deal.targetRaise}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Min. Investment</p>
                  <p className="text-white font-semibold">{deal.minInvestment}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Target IRR</p>
                  <p className="text-emerald-400 font-semibold">{deal.targetIRR}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Hold Period</p>
                  <p className="text-white font-semibold">{deal.holdPeriod}</p>
                </div>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-2 mb-4">
                {deal.highlights.map((highlight, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-zinc-800 text-zinc-300 rounded">
                    {highlight}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
                  View Details
                </button>
                <button className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No deals in this stage.</p>
        </div>
      )}
    </div>
  );
}
