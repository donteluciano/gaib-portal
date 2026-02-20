'use client';

import { useState } from 'react';
import Link from 'next/link';

// Tab components
import EvaluationTab from './tabs/EvaluationTab';
import ActualsTab from './tabs/ActualsTab';
import ActivityTab from './tabs/ActivityTab';
import DocumentsTab from './tabs/DocumentsTab';
import ChecklistTab from './tabs/ChecklistTab';
import DDQuestionsTab from './tabs/DDQuestionsTab';
import PoliticalTab from './tabs/PoliticalTab';
import AirPermitTab from './tabs/AirPermitTab';
import IncentivesTab from './tabs/IncentivesTab';

const tabs = [
  { id: 'evaluation', name: 'Evaluation', group: 'Analysis' },
  { id: 'dd-questions', name: 'DD Questions', group: 'Analysis' },
  { id: 'actuals', name: 'Actuals vs Est.', group: 'Tracking' },
  { id: 'activity', name: 'Activity Log', group: 'Tracking' },
  { id: 'checklist', name: 'Checklist', group: 'Tracking' },
  { id: 'air-permit', name: 'Air Permit', group: 'Regulatory' },
  { id: 'political', name: 'Political', group: 'Regulatory' },
  { id: 'incentives', name: 'Incentives', group: 'Regulatory' },
  { id: 'documents', name: 'Documents', group: 'Files' },
];

// Demo site data
const site = {
  id: '1',
  name: 'Site Alpha',
  location: { city: 'Springfield', state: 'OH', county: 'Clark' },
  stage: 3,
  status: 'active',
  mw: 75,
  acreage: 25,
  askingPrice: 1500000,
};

export default function SiteDetailPage() {
  const [activeTab, setActiveTab] = useState('evaluation');

  const renderTab = () => {
    switch (activeTab) {
      case 'evaluation': return <EvaluationTab site={site} />;
      case 'actuals': return <ActualsTab />;
      case 'activity': return <ActivityTab />;
      case 'documents': return <DocumentsTab />;
      case 'checklist': return <ChecklistTab />;
      case 'dd-questions': return <DDQuestionsTab />;
      case 'political': return <PoliticalTab />;
      case 'air-permit': return <AirPermitTab />;
      case 'incentives': return <IncentivesTab />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/portal/pipeline" className="text-muted hover:text-gold">
              ← Pipeline
            </Link>
          </div>
          <h1 className="text-3xl font-serif text-white">{site.name}</h1>
          <p className="text-muted mt-1">
            {site.location.city}, {site.location.state} • {site.acreage} acres • {site.mw} MW
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium">
            Stage {site.stage}
          </span>
          <span className="px-3 py-1 bg-gold/20 text-gold border border-gold/30 rounded-full text-sm font-medium capitalize">
            {site.status}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-navy-card overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-muted hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {renderTab()}
      </div>
    </div>
  );
}
