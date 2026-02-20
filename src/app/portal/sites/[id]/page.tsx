'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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

const stageNames: Record<number, string> = {
  1: 'Site Control',
  2: 'Gas & Power',
  3: 'Water & Environmental',
  4: 'Fiber & Access',
  5: 'Political & Community',
  6: 'Engineering & Feasibility',
  7: 'Packaging & Exit',
};

interface SiteInputs {
  acreage?: number;
  gasVolume?: number;
  gasPressure?: number;
  [key: string]: unknown;
}

interface Site {
  id: string;
  name: string;
  city: string;
  state: string;
  county: string;
  stage: number;
  status: string;
  inputs: SiteInputs;
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('evaluation');

  useEffect(() => {
    const loadSite = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', siteId)
        .single();

      if (error || !data) {
        router.push('/portal/pipeline');
        return;
      }

      setSite(data);
      setLoading(false);
    };

    loadSite();
  }, [siteId, router]);

  async function handleStageAdvance(newStage: number) {
    if (!site) return;
    
    const { error } = await supabase
      .from('sites')
      .update({ stage: newStage, updated_at: new Date().toISOString() })
      .eq('id', site.id);

    if (!error) {
      setSite({ ...site, stage: newStage });
    }
  }

  const renderTab = () => {
    if (!site) return null;

    switch (activeTab) {
      case 'evaluation': 
        return <EvaluationTab site={{ id: site.id, name: site.name, inputs: site.inputs || {} }} />;
      case 'actuals': 
        return <ActualsTab />;
      case 'activity': 
        return <ActivityTab siteId={site.id} />;
      case 'documents': 
        return <DocumentsTab siteId={site.id} />;
      case 'checklist': 
        return <ChecklistTab siteId={site.id} currentStage={site.stage} onStageAdvance={handleStageAdvance} />;
      case 'dd-questions': 
        return <DDQuestionsTab />;
      case 'political': 
        return <PoliticalTab />;
      case 'air-permit': 
        return <AirPermitTab />;
      case 'incentives': 
        return <IncentivesTab />;
      default: 
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading site...</p>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Site not found.</p>
      </div>
    );
  }

  // Calculate estimated MW from inputs
  const gasVolume = (site.inputs?.gasVolume as number) || 0;
  const gasPressure = (site.inputs?.gasPressure as number) || 0;
  let estimatedMW = 0;
  if (gasVolume > 0) {
    let divisor = 10;
    if (gasPressure > 500) divisor = 7;
    else if (gasPressure > 300) divisor = 8.5;
    estimatedMW = Math.round(gasVolume / divisor / 192);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/portal/pipeline" className="text-gray-400 hover:text-gold">
              ← Pipeline
            </Link>
          </div>
          <h1 className="text-3xl font-serif text-white">{site.name}</h1>
          <p className="text-gray-400 mt-1">
            {site.city}, {site.state} 
            {site.inputs?.acreage && ` • ${site.inputs.acreage} acres`}
            {estimatedMW > 0 && ` • ${estimatedMW} MW`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-sm font-medium">
            Stage {site.stage}: {stageNames[site.stage] || 'Unknown'}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
            site.status === 'active' 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : site.status === 'killed'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
          }`}>
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
                  : 'text-gray-400 hover:text-white'
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
