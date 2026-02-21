'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const costCategories = [
  { key: 'site_control', name: 'Site Control', description: 'Option, legal, title' },
  { key: 'gas_studies', name: 'Gas Studies', description: 'Feasibility, engineering' },
  { key: 'enviro', name: 'Environmental', description: 'Phase I, Phase II, remediation' },
  { key: 'air_permit', name: 'Air Permit', description: 'Application, consulting' },
  { key: 'fiber', name: 'Fiber', description: 'Route studies, connections' },
  { key: 'political', name: 'Political/Community', description: 'CBA, lobbying' },
  { key: 'engineering', name: 'Engineering', description: 'Site design, civil' },
  { key: 'demo', name: 'Demolition', description: 'Structure removal' },
  { key: 'exit_costs', name: 'Exit Costs', description: 'Legal, broker, closing' },
];

const defaultValues: Record<string, { estimated: number; actual: number; notes: string }> = {
  site_control: { estimated: 85000, actual: 0, notes: '' },
  gas_studies: { estimated: 75000, actual: 0, notes: '' },
  enviro: { estimated: 50000, actual: 0, notes: '' },
  air_permit: { estimated: 25000, actual: 0, notes: '' },
  fiber: { estimated: 0, actual: 0, notes: '' },
  political: { estimated: 0, actual: 0, notes: '' },
  engineering: { estimated: 0, actual: 0, notes: '' },
  demo: { estimated: 0, actual: 0, notes: '' },
  exit_costs: { estimated: 0, actual: 0, notes: '' },
};

interface Props { siteId: string; }

export default function ActualsTab({ siteId }: Props) {
  const [actuals, setActuals] = useState<Record<string, { estimated: number; actual: number; notes: string; id?: string }>>(Object.fromEntries(costCategories.map(c => [c.key, { ...defaultValues[c.key] }])));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const loadActuals = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('site_actuals').select('*').eq('site_id', siteId);
      if (!error && data) {
        const loaded = { ...actuals };
        data.forEach(row => { if (loaded[row.category]) loaded[row.category] = { id: row.id, estimated: row.estimated || 0, actual: row.actual || 0, notes: row.notes || '' }; });
        setActuals(loaded);
      }
      setLoading(false);
    };
    loadActuals();
  }, [siteId]);

  const saveActual = useCallback(async (key: string, data: { estimated: number; actual: number; notes: string; id?: string }) => {
    setSaving(key);
    if (data.id) {
      await supabase.from('site_actuals').update({ estimated: data.estimated, actual: data.actual, notes: data.notes, updated_at: new Date().toISOString() }).eq('id', data.id);
    } else {
      const { data: newRow, error } = await supabase.from('site_actuals').insert({ site_id: siteId, category: key, estimated: data.estimated, actual: data.actual, notes: data.notes }).select().single();
      if (!error && newRow) setActuals(prev => ({ ...prev, [key]: { ...prev[key], id: newRow.id } }));
    }
    setSaving(null);
    setLastSaved(new Date());
  }, [siteId]);

  const updateActual = (key: string, field: string, value: number | string) => {
    const newData = { ...actuals[key], [field]: value };
    setActuals(prev => ({ ...prev, [key]: newData }));
    const timeout = setTimeout(() => saveActual(key, newData), 500);
    return () => clearTimeout(timeout);
  };

  const totalEstimated = Object.values(actuals).reduce((sum, a) => sum + (a.estimated || 0), 0);
  const totalActual = Object.values(actuals).reduce((sum, a) => sum + (a.actual || 0), 0);
  const totalVariance = totalActual - totalEstimated;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: '#6B7280' }}>Loading budget data...</p></div>;

  const inputStyle = { width: '96px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '4px', padding: '4px 8px', color: '#111827', textAlign: 'right' as const, fontSize: '14px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {lastSaved && <div style={{ textAlign: 'right', fontSize: '14px', color: '#6B7280' }}>{saving ? 'Saving...' : `Last saved: ${lastSaved.toLocaleTimeString()}`}</div>}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Total Estimated</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>${(totalEstimated / 1000).toFixed(0)}K</p>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Total Actual</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>${(totalActual / 1000).toFixed(0)}K</p>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>Variance</p>
          <p style={{ fontSize: '24px', fontWeight: 700, color: totalVariance > 0 ? '#DC2626' : '#16A34A' }}>{totalVariance > 0 ? '+' : ''}${(totalVariance / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Cost Table */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#374151', fontWeight: 500 }}>Category</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', color: '#374151', fontWeight: 500 }}>Estimated</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', color: '#374151', fontWeight: 500 }}>Actual</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', color: '#374151', fontWeight: 500 }}>Variance</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#374151', fontWeight: 500 }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {costCategories.map((category) => {
              const variance = (actuals[category.key]?.actual || 0) - (actuals[category.key]?.estimated || 0);
              return (
                <tr key={category.key} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ color: '#111827', fontWeight: 500 }}>{category.name}</p>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>{category.description}</p>
                  </td>
                  <td style={{ padding: '16px 24px' }}><input type="number" min="0" value={actuals[category.key]?.estimated || 0} onChange={(e) => updateActual(category.key, 'estimated', Math.max(0, parseInt(e.target.value) || 0))} style={inputStyle} /></td>
                  <td style={{ padding: '16px 24px' }}><input type="number" min="0" value={actuals[category.key]?.actual || 0} onChange={(e) => updateActual(category.key, 'actual', Math.max(0, parseInt(e.target.value) || 0))} style={inputStyle} /></td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>{(actuals[category.key]?.actual || 0) > 0 && <span style={{ color: variance > 0 ? '#DC2626' : '#16A34A' }}>{variance > 0 ? '+' : ''}${(variance / 1000).toFixed(0)}K</span>}</td>
                  <td style={{ padding: '16px 24px' }}><input type="text" value={actuals[category.key]?.notes || ''} onChange={(e) => updateActual(category.key, 'notes', e.target.value)} placeholder="Vendor, invoice..." style={{ ...inputStyle, width: '100%', textAlign: 'left' as const }} /></td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              <td style={{ padding: '16px 24px', color: '#111827', fontWeight: 600 }}>Total</td>
              <td style={{ padding: '16px 24px', color: '#111827', fontWeight: 600, textAlign: 'right' }}>${(totalEstimated / 1000).toFixed(0)}K</td>
              <td style={{ padding: '16px 24px', color: '#111827', fontWeight: 600, textAlign: 'right' }}>${(totalActual / 1000).toFixed(0)}K</td>
              <td style={{ padding: '16px 24px', fontWeight: 600, textAlign: 'right', color: totalVariance > 0 ? '#DC2626' : '#16A34A' }}>{totalVariance > 0 ? '+' : ''}${(totalVariance / 1000).toFixed(0)}K</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Budget Burn Chart */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Budget Burn by Category</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {costCategories.filter(c => (actuals[c.key]?.estimated || 0) > 0).map((category) => {
            const pct = actuals[category.key]?.estimated ? (actuals[category.key].actual / actuals[category.key].estimated) * 100 : 0;
            return (
              <div key={category.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                  <span style={{ color: '#6B7280' }}>{category.name}</span>
                  <span style={{ color: pct > 100 ? '#DC2626' : '#111827' }}>{pct.toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '12px' }}>
                  <div style={{ height: '12px', borderRadius: '9999px', backgroundColor: pct > 100 ? '#DC2626' : pct > 80 ? '#F59E0B' : '#22C55E', width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
