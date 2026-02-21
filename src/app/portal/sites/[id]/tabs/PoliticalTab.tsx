'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const politicalFactors = [
  { key: 'mayor_stance', label: 'Mayor/Council Stance', weight: 15 },
  { key: 'election_dynamics', label: 'Election Dynamics', weight: 10 },
  { key: 'prior_approvals', label: 'Prior Data Center Approvals', weight: 15 },
  { key: 'zoning_authority', label: 'Zoning Authority Attitude', weight: 10 },
  { key: 'community_activism', label: 'Community Activism Level', weight: 15 },
  { key: 'regulatory_burden', label: 'Regulatory Burden', weight: 10 },
  { key: 'tax_policy', label: 'Tax Policy', weight: 10 },
  { key: 'infrastructure_support', label: 'Infrastructure Support', weight: 5 },
];

const communityFactors = [
  { key: 'employment_conditions', label: 'Local Employment Conditions', weight: 15 },
  { key: 'industrial_history', label: 'Industrial History', weight: 15 },
  { key: 'environmental_sensitivity', label: 'Environmental Sensitivity', weight: 15 },
  { key: 'noise_concerns', label: 'Noise Sensitivity', weight: 10 },
  { key: 'traffic_concerns', label: 'Traffic Concerns', weight: 10 },
  { key: 'property_values', label: 'Property Value Concerns', weight: 10 },
  { key: 'water_sensitivity', label: 'Water Resource Sensitivity', weight: 15 },
  { key: 'tax_base_need', label: 'Tax Base Need', weight: 10 },
];

const cbaOptions = [
  { key: 'local_hiring', label: 'Local Hiring Commitment', description: 'Commit to hiring X% local residents', defaultCost: 0 },
  { key: 'job_training', label: 'Job Training Program', description: 'Fund workforce development programs', defaultCost: 100000 },
  { key: 'infrastructure', label: 'Infrastructure Improvements', description: 'Road, utility, or public infrastructure upgrades', defaultCost: 250000 },
  { key: 'education', label: 'Education Contribution', description: 'School donations, STEM programs, scholarships', defaultCost: 150000 },
  { key: 'community_fund', label: 'Community Fund', description: 'Annual contribution to community projects', defaultCost: 50000 },
];

interface Official { id: string; name: string; title: string; contact: string; stance: 'supportive' | 'neutral' | 'opposed' | 'unknown'; lastContact: string; notes: string; }

interface PoliticalData {
  politicalScores: Record<string, number>;
  communityScores: Record<string, number>;
  cbaItems: Record<string, { enabled: boolean; cost: number }>;
  officials: Official[];
  notes: string;
}

function getRatingColor(score: number, max: number): string { const pct = score / max; if (pct >= 0.7) return '#22C55E'; if (pct >= 0.4) return '#EAB308'; return '#EF4444'; }
function getRatingLabel(score: number, max: number): string { const pct = score / max; if (pct >= 0.7) return 'Low Risk'; if (pct >= 0.4) return 'Medium Risk'; return 'High Risk'; }

interface Props { siteId: string; }

export default function PoliticalTab({ siteId }: Props) {
  const [data, setData] = useState<PoliticalData>({
    politicalScores: Object.fromEntries(politicalFactors.map(f => [f.key, 3])),
    communityScores: Object.fromEntries(communityFactors.map(f => [f.key, 3])),
    cbaItems: Object.fromEntries(cbaOptions.map(o => [o.key, { enabled: false, cost: o.defaultCost }])),
    officials: [],
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddOfficial, setShowAddOfficial] = useState(false);
  const [newOfficial, setNewOfficial] = useState<Omit<Official, 'id'>>({ name: '', title: '', contact: '', stance: 'unknown', lastContact: '', notes: '' });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: siteData } = await supabase.from('sites').select('inputs').eq('id', siteId).single();
      if (siteData?.inputs?.politicalData) setData({ ...data, ...siteData.inputs.politicalData });
      setLoading(false);
    };
    loadData();
  }, [siteId]);

  const saveData = useCallback(async (newData: PoliticalData) => {
    setSaving(true);
    const { data: siteData } = await supabase.from('sites').select('inputs').eq('id', siteId).single();
    const currentInputs = siteData?.inputs || {};
    await supabase.from('sites').update({ inputs: { ...currentInputs, politicalData: newData }, updated_at: new Date().toISOString() }).eq('id', siteId);
    setSaving(false);
  }, [siteId]);

  const updateData = (field: keyof PoliticalData, value: unknown) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    setTimeout(() => saveData(newData), 500);
  };

  const addOfficial = () => {
    if (!newOfficial.name) return;
    const official: Official = { id: crypto.randomUUID(), ...newOfficial };
    updateData('officials', [...data.officials, official]);
    setNewOfficial({ name: '', title: '', contact: '', stance: 'unknown', lastContact: '', notes: '' });
    setShowAddOfficial(false);
  };

  const removeOfficial = (id: string) => { if (!confirm('Remove this official?')) return; updateData('officials', data.officials.filter(o => o.id !== id)); };

  const politicalTotal = politicalFactors.reduce((sum, f) => sum + ((data.politicalScores[f.key] || 3) * f.weight / 100), 0);
  const communityTotal = communityFactors.reduce((sum, f) => sum + ((data.communityScores[f.key] || 3) * f.weight / 100), 0);
  const cbaTotal = Object.entries(data.cbaItems).reduce((sum, [, item]) => sum + (item.enabled ? item.cost : 0), 0);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: 'var(--text-muted)' }}>Loading political data...</p></div>;

  const inputStyle = { width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {saving && <div style={{ textAlign: 'right', fontSize: '14px', color: 'var(--accent)' }}>Saving...</div>}

      {/* Officials Contacted */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div><h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>Officials & Stakeholders</h2><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{data.officials.length} contacts tracked</p></div>
          <button onClick={() => setShowAddOfficial(true)} style={{ padding: '10px 16px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ Add Contact</button>
        </div>
        {showAddOfficial && (
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <input type="text" value={newOfficial.name} onChange={(e) => setNewOfficial({ ...newOfficial, name: e.target.value })} placeholder="Name *" style={inputStyle} />
              <input type="text" value={newOfficial.title} onChange={(e) => setNewOfficial({ ...newOfficial, title: e.target.value })} placeholder="Title (Mayor, Council, etc.)" style={inputStyle} />
              <input type="text" value={newOfficial.contact} onChange={(e) => setNewOfficial({ ...newOfficial, contact: e.target.value })} placeholder="Email / Phone" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <select value={newOfficial.stance} onChange={(e) => setNewOfficial({ ...newOfficial, stance: e.target.value as Official['stance'] })} style={inputStyle}><option value="unknown">Unknown Stance</option><option value="supportive">Supportive</option><option value="neutral">Neutral</option><option value="opposed">Opposed</option></select>
              <input type="date" value={newOfficial.lastContact} onChange={(e) => setNewOfficial({ ...newOfficial, lastContact: e.target.value })} style={inputStyle} />
              <input type="text" value={newOfficial.notes} onChange={(e) => setNewOfficial({ ...newOfficial, notes: e.target.value })} placeholder="Notes" style={inputStyle} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={addOfficial} disabled={!newOfficial.name} style={{ padding: '10px 16px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: !newOfficial.name ? 0.5 : 1 }}>Add Contact</button>
              <button onClick={() => setShowAddOfficial(false)} style={{ padding: '10px 16px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
        {data.officials.length === 0 ? <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}><p>No officials tracked yet. Add contacts to track political relationships.</p></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.officials.map(official => (
              <div key={official.id} style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0, backgroundColor: official.stance === 'supportive' ? '#22C55E' : official.stance === 'opposed' ? '#EF4444' : official.stance === 'neutral' ? '#EAB308' : '#9CA3AF' }} />
                <div style={{ flex: 1 }}><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{official.name}</p><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{official.title} {official.contact && `• ${official.contact}`}</p></div>
                {official.lastContact && <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Last: {official.lastContact}</span>}
                <span style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 500, borderRadius: '9999px', textTransform: 'capitalize', backgroundColor: official.stance === 'supportive' ? '#DCFCE7' : official.stance === 'opposed' ? '#FEE2E2' : official.stance === 'neutral' ? '#FEF3C7' : '#F3F4F6', color: official.stance === 'supportive' ? '#16A34A' : official.stance === 'opposed' ? '#DC2626' : official.stance === 'neutral' ? '#B45309' : '#6B7280' }}>{official.stance}</span>
                <button onClick={() => removeOfficial(official.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Political Risk Matrix */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div><h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>Political Risk Matrix</h2><p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Score each factor 1-5 based on site conditions</p></div>
          <div style={{ textAlign: 'right' }}><p style={{ fontSize: '28px', fontWeight: 700, color: getRatingColor(politicalTotal, 5) }}>{politicalTotal.toFixed(1)}</p><p style={{ fontSize: '14px', color: getRatingColor(politicalTotal, 5) }}>{getRatingLabel(politicalTotal, 5)}</p></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {politicalFactors.map((factor) => (
            <div key={factor.key} style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{factor.label}</p><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Weight: {factor.weight}%</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{[1, 2, 3, 4, 5].map((score) => <button key={score} onClick={() => updateData('politicalScores', { ...data.politicalScores, [factor.key]: score })} style={{ width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: data.politicalScores[factor.key] === score ? (score <= 2 ? '#EF4444' : score <= 3 ? '#EAB308' : '#22C55E') : 'var(--border)', color: data.politicalScores[factor.key] === score ? '#FFFFFF' : 'var(--text-muted)' }}>{score}</button>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Sentiment Scorecard */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div><h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>Community Sentiment Scorecard</h2><p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Assess community acceptance factors</p></div>
          <div style={{ textAlign: 'right' }}><p style={{ fontSize: '28px', fontWeight: 700, color: getRatingColor(communityTotal, 5) }}>{communityTotal.toFixed(1)}</p><p style={{ fontSize: '14px', color: getRatingColor(communityTotal, 5) }}>{getRatingLabel(communityTotal, 5)}</p></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {communityFactors.map((factor) => (
            <div key={factor.key} style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{factor.label}</p><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Weight: {factor.weight}%</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{[1, 2, 3, 4, 5].map((score) => <button key={score} onClick={() => updateData('communityScores', { ...data.communityScores, [factor.key]: score })} style={{ width: '32px', height: '32px', borderRadius: '50%', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', backgroundColor: data.communityScores[factor.key] === score ? (score <= 2 ? '#EF4444' : score <= 3 ? '#EAB308' : '#22C55E') : 'var(--border)', color: data.communityScores[factor.key] === score ? '#FFFFFF' : 'var(--text-muted)' }}>{score}</button>)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CBA Builder */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div><h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>Community Benefit Agreement Builder</h2><p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Toggle offerings and estimate costs</p></div>
          <div style={{ textAlign: 'right' }}><p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)' }}>${(cbaTotal / 1000).toFixed(0)}K</p><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Est. CBA Cost</p></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cbaOptions.map((option) => (
            <div key={option.key} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
              <button onClick={() => updateData('cbaItems', { ...data.cbaItems, [option.key]: { ...data.cbaItems[option.key], enabled: !data.cbaItems[option.key]?.enabled } })} style={{ width: '24px', height: '24px', borderRadius: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: data.cbaItems[option.key]?.enabled ? 'var(--accent)' : 'var(--bg-card)', border: data.cbaItems[option.key]?.enabled ? 'none' : '2px solid var(--border)' }}>
                {data.cbaItems[option.key]?.enabled && <svg style={{ width: '16px', height: '16px', color: '#FFFFFF' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
              </button>
              <div style={{ flex: 1 }}><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{option.label}</p><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{option.description}</p></div>
              <div style={{ width: '128px' }}><input type="number" min="0" value={data.cbaItems[option.key]?.cost || option.defaultCost} onChange={(e) => updateData('cbaItems', { ...data.cbaItems, [option.key]: { ...data.cbaItems[option.key], cost: Math.max(0, parseInt(e.target.value) || 0) } })} style={inputStyle} placeholder="Cost" /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Political Notes</h2>
        <textarea value={data.notes} onChange={(e) => updateData('notes', e.target.value)} rows={4} placeholder="Meeting notes, strategy, timeline..." style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
    </div>
  );
}
