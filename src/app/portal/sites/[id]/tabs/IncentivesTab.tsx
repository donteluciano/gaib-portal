'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type IncentiveStatus = 'not_explored' | 'in_discussion' | 'agreed' | 'denied';

const incentiveTypes = [
  { key: 'pilot', name: 'PILOT', description: 'Payment In Lieu Of Taxes - negotiated property tax reduction', typicalValue: '$2-10M over 20 years' },
  { key: 'tax_abatement', name: 'Tax Abatement', description: 'Reduction or elimination of property taxes for a period', typicalValue: '50-100% reduction' },
  { key: 'sales_tax', name: 'Sales Tax Exemption', description: 'Exemption on equipment and construction materials', typicalValue: '5-10% of CapEx' },
  { key: 'enterprise_zone', name: 'Enterprise Zone', description: 'Special economic zone with tax incentives', typicalValue: 'Varies widely' },
  { key: 'tif', name: 'TIF District', description: 'Tax Increment Financing - future tax revenue funds improvements', typicalValue: '$500K-5M' },
  { key: 'job_credits', name: 'Job Tax Credits', description: 'Credits for each job created', typicalValue: '$1-5K per job annually' },
  { key: 'expedited_permitting', name: 'Expedited Permitting', description: 'Fast-track approval process', typicalValue: 'Time savings' },
  { key: 'utility_rates', name: 'Utility Rate Incentives', description: 'Reduced electricity or water rates', typicalValue: '10-30% reduction' },
  { key: 'infrastructure', name: 'Infrastructure Cost Sharing', description: 'Municipality pays for roads, utilities, etc.', typicalValue: '$500K-5M' },
  { key: 'free_land', name: 'Free/Reduced Land', description: 'Land provided at below-market rate', typicalValue: 'Up to 100% discount' },
];

const statusColors: Record<IncentiveStatus, { bg: string; text: string; border: string }> = {
  not_explored: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
  in_discussion: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  agreed: { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC' },
  denied: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
};

interface IncentiveState { dbId?: string; status: IncentiveStatus; estimatedValue: number; notes: string; }

interface Props { siteId: string; }

export default function IncentivesTab({ siteId }: Props) {
  const [incentives, setIncentives] = useState<Record<string, IncentiveState>>(Object.fromEntries(incentiveTypes.map(t => [t.key, { status: 'not_explored' as IncentiveStatus, estimatedValue: 0, notes: '' }])));
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const loadIncentives = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('site_incentives').select('*').eq('site_id', siteId);
      if (!error && data) {
        const loaded: Record<string, IncentiveState> = { ...incentives };
        data.forEach(row => { if (loaded[row.type] !== undefined) loaded[row.type] = { dbId: row.id, status: row.status as IncentiveStatus || 'not_explored', estimatedValue: row.estimated_value || 0, notes: row.notes || '' }; });
        setIncentives(loaded);
      }
      setLoading(false);
    };
    loadIncentives();
  }, [siteId]);

  const saveIncentive = useCallback(async (type: string, state: IncentiveState) => {
    setSaving(type);
    if (state.dbId) {
      await supabase.from('site_incentives').update({ status: state.status, estimated_value: state.estimatedValue, notes: state.notes }).eq('id', state.dbId);
    } else {
      const { data, error } = await supabase.from('site_incentives').insert({ site_id: siteId, type, status: state.status, estimated_value: state.estimatedValue, notes: state.notes }).select().single();
      if (!error && data) setIncentives(prev => ({ ...prev, [type]: { ...prev[type], dbId: data.id } }));
    }
    setSaving(null);
  }, [siteId]);

  const updateIncentive = (key: string, field: string, value: string | number) => {
    const newState = { ...incentives[key], [field]: value };
    setIncentives(prev => ({ ...prev, [key]: newState }));
    setTimeout(() => saveIncentive(key, newState), 500);
  };

  const totalEstimatedValue = Object.values(incentives).reduce((sum, i) => i.status !== 'denied' ? sum + (i.estimatedValue || 0) : sum, 0);
  const agreedIncentives = Object.values(incentives).filter(i => i.status === 'agreed').length;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: 'var(--text-muted)' }}>Loading incentives...</p></div>;

  const inputStyle = { width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Total Estimated Value</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent)', marginTop: '8px' }}>${(totalEstimatedValue / 1000000).toFixed(1)}M</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Across all incentives {saving && <span style={{ color: 'var(--accent)' }}>• Saving...</span>}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Incentives Agreed</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#22C55E', marginTop: '8px' }}>{agreedIncentives}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>of {incentiveTypes.length} types</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>In Discussion</p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#EAB308', marginTop: '8px' }}>{Object.values(incentives).filter(i => i.status === 'in_discussion').length}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Active negotiations</p>
        </div>
      </div>

      {/* Incentive Types */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {incentiveTypes.map((type) => (
          <div key={type.key} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', overflow: 'hidden' }}>
            <button onClick={() => setExpandedType(expandedType === type.key ? null : type.key)} style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>{type.name}</h3>
                <span style={{ padding: '4px 12px', fontSize: '12px', fontWeight: 500, borderRadius: '9999px', backgroundColor: statusColors[incentives[type.key]?.status || 'not_explored'].bg, color: statusColors[incentives[type.key]?.status || 'not_explored'].text, border: `1px solid ${statusColors[incentives[type.key]?.status || 'not_explored'].border}` }}>{(incentives[type.key]?.status || 'not_explored').replace(/_/g, ' ')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {(incentives[type.key]?.estimatedValue || 0) > 0 && <span style={{ color: 'var(--accent)', fontWeight: 500 }}>${((incentives[type.key]?.estimatedValue || 0) / 1000000).toFixed(1)}M</span>}
                <svg style={{ width: '20px', height: '20px', color: 'var(--text-muted)', transform: expandedType === type.key ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </div>
            </button>
            {expandedType === type.key && (
              <div style={{ padding: '16px', borderTop: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
                  <div><p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Typical Value</p><p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{type.typicalValue}</p></div>
                  <div><p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Description</p><p style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{type.description}</p></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Status</label><select value={incentives[type.key]?.status || 'not_explored'} onChange={(e) => updateIncentive(type.key, 'status', e.target.value)} style={inputStyle}><option value="not_explored">Not Explored</option><option value="in_discussion">In Discussion</option><option value="agreed">Agreed</option><option value="denied">Denied</option></select></div>
                  <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Estimated Value ($)</label><input type="number" min="0" value={incentives[type.key]?.estimatedValue || 0} onChange={(e) => updateIncentive(type.key, 'estimatedValue', Math.max(0, parseInt(e.target.value) || 0))} style={inputStyle} placeholder="0" /></div>
                </div>
                <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Notes (Contact, Terms, Negotiations)</label><textarea value={incentives[type.key]?.notes || ''} onChange={(e) => updateIncentive(type.key, 'notes', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }} placeholder="Contact name, terms, conditions, negotiation notes..." /></div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Exit Pitch Summary */}
      {totalEstimatedValue > 0 && (
        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Exit Pitch Summary</h3>
          <p style={{ color: 'var(--text-primary)' }}>This site comes with an estimated <span style={{ color: 'var(--accent)', fontWeight: 700 }}>${(totalEstimatedValue / 1000000).toFixed(1)}M</span> in municipal incentives, including:</p>
          <ul style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {incentiveTypes.filter(t => incentives[t.key]?.status === 'agreed' || (incentives[t.key]?.estimatedValue || 0) > 0).map(type => (
              <li key={type.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: incentives[type.key]?.status === 'agreed' ? '#22C55E' : '#EAB308' }} />
                {type.name}: ${((incentives[type.key]?.estimatedValue || 0) / 1000).toFixed(0)}K
                {incentives[type.key]?.status === 'agreed' && <span style={{ color: '#22C55E', fontSize: '12px' }}>(confirmed)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
