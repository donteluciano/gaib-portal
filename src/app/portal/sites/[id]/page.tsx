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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', city: '', state: '', county: '', status: 'active' });
  const [saving, setSaving] = useState(false);

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
      setEditForm({
        name: data.name || '',
        city: data.city || '',
        state: data.state || '',
        county: data.county || '',
        status: data.status || 'active',
      });
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

  async function handleSaveEdit() {
    if (!site || !editForm.name.trim()) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('sites')
      .update({
        name: editForm.name.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        county: editForm.county.trim(),
        status: editForm.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', site.id);

    if (!error) {
      setSite({
        ...site,
        name: editForm.name.trim(),
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        county: editForm.county.trim(),
        status: editForm.status,
      });
      setShowEditModal(false);
    }
    setSaving(false);
  }

  const renderTab = () => {
    if (!site) return null;

    switch (activeTab) {
      case 'evaluation': 
        return <EvaluationTab site={{ id: site.id, name: site.name, inputs: site.inputs || {} }} />;
      case 'actuals': 
        return <ActualsTab siteId={site.id} />;
      case 'activity': 
        return <ActivityTab siteId={site.id} />;
      case 'documents': 
        return <DocumentsTab siteId={site.id} />;
      case 'checklist': 
        return <ChecklistTab siteId={site.id} currentStage={site.stage} onStageAdvance={handleStageAdvance} />;
      case 'dd-questions': 
        return <DDQuestionsTab siteId={site.id} />;
      case 'political': 
        return <PoliticalTab siteId={site.id} />;
      case 'air-permit': 
        return <AirPermitTab siteId={site.id} />;
      case 'incentives': 
        return <IncentivesTab siteId={site.id} />;
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-white">{site.name}</h1>
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1.5 text-gray-400 hover:text-gold hover:bg-navy-card rounded transition-colors"
              title="Edit site info"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          </div>
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

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-card border border-navy rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-serif text-white mb-4">Edit Site Info</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Site Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-navy border border-navy-card rounded-lg text-white focus:border-gold outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-navy border border-navy-card rounded-lg text-white focus:border-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3 py-2 bg-navy border border-navy-card rounded-lg text-white focus:border-gold outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">County</label>
                <input
                  type="text"
                  value={editForm.county}
                  onChange={(e) => setEditForm({ ...editForm, county: e.target.value })}
                  className="w-full px-3 py-2 bg-navy border border-navy-card rounded-lg text-white focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-navy border border-navy-card rounded-lg text-white focus:border-gold outline-none"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="killed">Killed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editForm.name.trim()}
                className="flex-1 px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-navy hover:bg-navy-dark text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
