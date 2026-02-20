'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const tabs = [
  { id: 'evaluation', name: 'Evaluation' },
  { id: 'actuals', name: 'Actuals vs Estimated' },
  { id: 'activity', name: 'Activity Log' },
  { id: 'documents', name: 'Documents' },
  { id: 'checklist', name: 'Checklist' },
];

// Mock site data
const mockSite = {
  id: '1',
  name: 'Site Alpha',
  location: { city: 'Springfield', state: 'OH', address: '123 Industrial Rd' },
  stage: 3,
  mw: 50,
  exitValue: 45000000,
  riskScore: 2,
  notes: 'Strong site. Gas looks good. Waiting on Phase I results.',
};

function getStageColor(stage: number) {
  const colors = ['bg-gray-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-gold', 'bg-gold-light', 'bg-success'];
  return colors[stage - 1] || 'bg-gray-500';
}

export default function SiteDetailPage() {
  const [activeTab, setActiveTab] = useState('evaluation');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pipeline" className="p-2 hover:bg-navy-card rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-white">{mockSite.name}</h1>
            <span className={`px-3 py-1 rounded text-sm font-medium ${getStageColor(mockSite.stage)} text-white`}>
              Stage {mockSite.stage}
            </span>
          </div>
          <p className="text-gray-400 mt-1">{mockSite.location.address}, {mockSite.location.city}, {mockSite.location.state}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{mockSite.mw} MW</p>
          <p className="text-gold">${(mockSite.exitValue / 1000000).toFixed(0)}M exit value</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-navy-card">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-navy-card rounded-lg p-6">
        {activeTab === 'evaluation' && (
          <div>
            <h2 className="text-lg font-semibold text-gold mb-4">Site Evaluation</h2>
            <p className="text-gray-400">Full simulator inputs and outputs will be displayed here. This is the same as the New Site page but pre-populated with saved data.</p>
            <div className="mt-6 p-4 bg-navy rounded-lg">
              <p className="text-white font-medium">Notes:</p>
              <p className="text-gray-300 mt-2">{mockSite.notes}</p>
            </div>
          </div>
        )}

        {activeTab === 'actuals' && (
          <div>
            <h2 className="text-lg font-semibold text-gold mb-4">Actuals vs Estimated</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Estimated</th>
                  <th>Actual</th>
                  <th>Variance</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-white">Site Control</td>
                  <td className="text-gray-300">$85,000</td>
                  <td className="text-white">$72,000</td>
                  <td className="text-success">-$13,000</td>
                  <td className="text-gray-400 text-sm">Option $50K, legal $12K, title $10K</td>
                </tr>
                <tr>
                  <td className="text-white">Gas Studies</td>
                  <td className="text-gray-300">$75,000</td>
                  <td className="text-gray-500">—</td>
                  <td className="text-gray-500">—</td>
                  <td className="text-gray-400 text-sm"></td>
                </tr>
                <tr>
                  <td className="text-white">Environmental</td>
                  <td className="text-gray-300">$50,000</td>
                  <td className="text-gray-500">—</td>
                  <td className="text-gray-500">—</td>
                  <td className="text-gray-400 text-sm"></td>
                </tr>
                <tr>
                  <td className="text-white">Air Permit</td>
                  <td className="text-gray-300">$25,000</td>
                  <td className="text-gray-500">—</td>
                  <td className="text-gray-500">—</td>
                  <td className="text-gray-400 text-sm"></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            <h2 className="text-lg font-semibold text-gold mb-4">Activity Log</h2>
            <div className="space-y-4">
              {[
                { date: '2026-02-15', action: 'Moved to Stage 3', notes: 'Environmental studies initiated', cost: 0 },
                { date: '2026-02-01', action: 'Gas utility response received', notes: 'Capacity confirmed at 50MW equivalent', cost: 0 },
                { date: '2026-01-20', action: 'Option agreement executed', notes: '12-month option, $50K deposit', cost: 50000 },
                { date: '2026-01-10', action: 'Site visit completed', notes: 'Good condition, minimal demo needed', cost: 500 },
                { date: '2026-01-05', action: 'Site identified', notes: 'CoStar listing, former manufacturing', cost: 0 },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-navy rounded-lg">
                  <div className="text-sm text-gray-400 w-24 flex-shrink-0">{activity.date}</div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.action}</p>
                    <p className="text-gray-400 text-sm mt-1">{activity.notes}</p>
                  </div>
                  {activity.cost > 0 && (
                    <div className="text-gold font-medium">${activity.cost.toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
            <button className="mt-4 bg-navy text-gold border border-gold px-4 py-2 rounded-lg hover:bg-navy-light transition-colors">
              + Add Activity
            </button>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 className="text-lg font-semibold text-gold mb-4">Documents & Links</h2>
            <div className="space-y-2">
              {[
                { name: 'Option Agreement', category: 'Legal', url: '#', date: '2026-01-20' },
                { name: 'Site Photos', category: 'Other', url: '#', date: '2026-01-10' },
                { name: 'CoStar Listing', category: 'Other', url: '#', date: '2026-01-05' },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-navy rounded-lg hover:bg-navy-light transition-colors">
                  <div className="flex-1">
                    <a href={doc.url} className="text-gold hover:text-gold-light">{doc.name}</a>
                    <span className="text-gray-500 text-sm ml-2">({doc.category})</span>
                  </div>
                  <span className="text-gray-400 text-sm">{doc.date}</span>
                </div>
              ))}
            </div>
            <button className="mt-4 bg-navy text-gold border border-gold px-4 py-2 rounded-lg hover:bg-navy-light transition-colors">
              + Add Document
            </button>
          </div>
        )}

        {activeTab === 'checklist' && (
          <div>
            <h2 className="text-lg font-semibold text-gold mb-4">Stage Checklist</h2>
            <div className="space-y-6">
              {/* Stage 1 */}
              <div>
                <h3 className="text-white font-medium mb-3">Stage 1 — Identification</h3>
                <div className="space-y-2">
                  {[
                    { item: 'Site identified', status: 'complete' },
                    { item: 'Ownership confirmed', status: 'complete' },
                    { item: 'Site visit completed', status: 'complete' },
                    { item: 'Option executed', status: 'complete' },
                    { item: 'Gate decision: GO', status: 'complete' },
                  ].map((check, i) => (
                    <label key={i} className="flex items-center gap-3 p-2 hover:bg-navy rounded cursor-pointer">
                      <input type="checkbox" checked={check.status === 'complete'} readOnly className="w-4 h-4 accent-gold" />
                      <span className={check.status === 'complete' ? 'text-gray-400 line-through' : 'text-white'}>{check.item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stage 2 */}
              <div>
                <h3 className="text-white font-medium mb-3">Stage 2 — Gas Viability</h3>
                <div className="space-y-2">
                  {[
                    { item: 'Gas transmission identified', status: 'complete' },
                    { item: 'Utility contacted', status: 'complete' },
                    { item: 'Capacity response received', status: 'complete' },
                    { item: 'Preliminary cost estimate', status: 'in_progress' },
                    { item: 'Gate decision', status: 'not_started' },
                  ].map((check, i) => (
                    <label key={i} className="flex items-center gap-3 p-2 hover:bg-navy rounded cursor-pointer">
                      <input type="checkbox" checked={check.status === 'complete'} readOnly className="w-4 h-4 accent-gold" />
                      <span className={check.status === 'complete' ? 'text-gray-400 line-through' : 'text-white'}>{check.item}</span>
                      {check.status === 'in_progress' && <span className="text-xs bg-warning text-navy px-2 py-0.5 rounded">In Progress</span>}
                    </label>
                  ))}
                </div>
              </div>

              {/* Stage 3 */}
              <div>
                <h3 className="text-white font-medium mb-3">Stage 3 — Environmental</h3>
                <div className="space-y-2">
                  {[
                    { item: 'Phase I ESA ordered', status: 'in_progress' },
                    { item: 'Phase I ESA complete', status: 'not_started' },
                    { item: 'Wetlands assessment', status: 'not_started' },
                    { item: 'SHPO clearance', status: 'not_started' },
                    { item: 'Gate decision', status: 'not_started' },
                  ].map((check, i) => (
                    <label key={i} className="flex items-center gap-3 p-2 hover:bg-navy rounded cursor-pointer">
                      <input type="checkbox" checked={check.status === 'complete'} readOnly className="w-4 h-4 accent-gold" />
                      <span className={check.status === 'complete' ? 'text-gray-400 line-through' : 'text-white'}>{check.item}</span>
                      {check.status === 'in_progress' && <span className="text-xs bg-warning text-navy px-2 py-0.5 rounded">In Progress</span>}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
