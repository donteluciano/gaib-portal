'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
  1: 'Site Control', 2: 'Gas & Power', 3: 'Water & Environmental',
  4: 'Fiber & Access', 5: 'Political & Community', 6: 'Engineering & Feasibility', 7: 'Packaging & Exit',
};

interface SiteInputs { acreage?: number; gasVolume?: number; gasPressure?: number; [key: string]: unknown; }
interface Site { id: string; name: string; city: string; state: string; county: string; stage: number; status: string; inputs: SiteInputs; notes: string; created_at: string; updated_at: string; }

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
      const { data, error } = await supabase.from('sites').select('*').eq('id', siteId).single();
      if (error || !data) { router.push('/portal/pipeline'); return; }
      setSite(data);
      setEditForm({ name: data.name || '', city: data.city || '', state: data.state || '', county: data.county || '', status: data.status || 'active' });
      setLoading(false);
    };
    loadSite();
  }, [siteId, router]);

  async function handleStageAdvance(newStage: number) {
    if (!site) return;
    const { error } = await supabase.from('sites').update({ stage: newStage, updated_at: new Date().toISOString() }).eq('id', site.id);
    if (!error) setSite({ ...site, stage: newStage });
  }

  async function handleSaveEdit() {
    if (!site || !editForm.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('sites').update({
      name: editForm.name.trim(), city: editForm.city.trim(), state: editForm.state.trim(),
      county: editForm.county.trim(), status: editForm.status, updated_at: new Date().toISOString(),
    }).eq('id', site.id);
    if (!error) {
      setSite({ ...site, name: editForm.name.trim(), city: editForm.city.trim(), state: editForm.state.trim(), county: editForm.county.trim(), status: editForm.status });
      setShowEditModal(false);
    }
    setSaving(false);
  }

  const renderTab = () => {
    if (!site) return null;
    switch (activeTab) {
      case 'evaluation': return <EvaluationTab site={{ id: site.id, name: site.name, inputs: site.inputs || {} }} />;
      case 'actuals': return <ActualsTab siteId={site.id} />;
      case 'activity': return <ActivityTab siteId={site.id} />;
      case 'documents': return <DocumentsTab siteId={site.id} />;
      case 'checklist': return <ChecklistTab siteId={site.id} currentStage={site.stage} onStageAdvance={handleStageAdvance} />;
      case 'dd-questions': return <DDQuestionsTab siteId={site.id} />;
      case 'political': return <PoliticalTab siteId={site.id} />;
      case 'air-permit': return <AirPermitTab siteId={site.id} />;
      case 'incentives': return <IncentivesTab siteId={site.id} />;
      default: return null;
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: '#6B7280' }}>Loading site...</p></div>;
  if (!site) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: '#6B7280' }}>Site not found.</p></div>;

  const gasVolume = (site.inputs?.gasVolume as number) || 0;
  const gasPressure = (site.inputs?.gasPressure as number) || 0;
  let estimatedMW = 0;
  if (gasVolume > 0) {
    let divisor = 10;
    if (gasPressure > 500) divisor = 7;
    else if (gasPressure > 300) divisor = 8.5;
    estimatedMW = Math.round(gasVolume / divisor / 192);
  }

  const inputStyle = { width: '100%', padding: '8px 12px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', color: '#111827', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Link href="/portal/pipeline" style={{ color: '#6B7280', textDecoration: 'none' }}>← Pipeline</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#111827', fontFamily: 'Georgia, serif' }}>{site.name}</h1>
            <button onClick={() => setShowEditModal(true)} style={{ padding: '6px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px' }} title="Edit site info">
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
            </button>
          </div>
          <p style={{ color: '#6B7280', marginTop: '4px' }}>
            {site.city}, {site.state}
            {site.inputs?.acreage && ` • ${site.inputs.acreage} acres`}
            {estimatedMW > 0 && ` • ${estimatedMW} MW`}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ padding: '6px 16px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: '9999px', fontSize: '14px', fontWeight: 500 }}>
            Stage {site.stage}: {stageNames[site.stage] || 'Unknown'}
          </span>
          <span style={{ padding: '6px 16px', borderRadius: '9999px', fontSize: '14px', fontWeight: 500, textTransform: 'capitalize',
            backgroundColor: site.status === 'active' ? '#DCFCE7' : site.status === 'killed' ? '#FEE2E2' : '#FEF3C7',
            color: site.status === 'active' ? '#166534' : site.status === 'killed' ? '#991B1B' : '#92400E',
            border: `1px solid ${site.status === 'active' ? '#86EFAC' : site.status === 'killed' ? '#FECACA' : '#FDE68A'}`
          }}>{site.status}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid #E5E7EB', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '4px', minWidth: 'max-content' }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '12px 16px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer',
              color: activeTab === tab.id ? '#2563EB' : '#6B7280',
              borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
            }}>{tab.name}</button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '600px' }}>{renderTab()}</div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Edit Site Info</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Site Name *</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>City</label><input type="text" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>State</label><input type="text" value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} style={inputStyle} /></div>
              </div>
              <div><label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>County</label><input type="text" value={editForm.county} onChange={(e) => setEditForm({ ...editForm, county: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Status</label><select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} style={inputStyle}><option value="active">Active</option><option value="paused">Paused</option><option value="killed">Killed</option></select></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={handleSaveEdit} disabled={saving || !editForm.name.trim()} style={{ flex: 1, padding: '10px 16px', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !editForm.name.trim() ? 0.5 : 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={() => setShowEditModal(false)} style={{ padding: '10px 16px', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '8px', border: '1px solid #D1D5DB', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
