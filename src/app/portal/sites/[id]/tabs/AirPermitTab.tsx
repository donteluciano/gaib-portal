'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type PermitType = 'minor' | 'synthetic_minor' | 'major' | 'psd';
type ChecklistStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked';

const permitTypes = [
  { id: 'minor', name: 'Minor Source', timeline: '3-6 months', cost: '$15-50K' },
  { id: 'synthetic_minor', name: 'Synthetic Minor', timeline: '6-12 months', cost: '$50-150K' },
  { id: 'major', name: 'Major Source (Title V)', timeline: '12-18 months', cost: '$150-500K' },
  { id: 'psd', name: 'PSD (Attainment)', timeline: '18-24+ months', cost: '$500K-2M+' },
];

const stateNotes = [
  { state: 'OH', agency: 'Ohio EPA', timeline: '6-12 months', difficulty: 'Moderate' },
  { state: 'IN', agency: 'IDEM', timeline: '6-9 months', difficulty: 'Easy' },
  { state: 'PA', agency: 'PA DEP', timeline: '12-18 months', difficulty: 'Hard' },
  { state: 'TX', agency: 'TCEQ', timeline: '6-12 months', difficulty: 'Moderate' },
  { state: 'VA', agency: 'VA DEQ', timeline: '9-15 months', difficulty: 'Moderate' },
  { state: 'GA', agency: 'GA EPD', timeline: '6-12 months', difficulty: 'Easy' },
];

const permitChecklist = [
  { step: 1, name: 'Determine attainment status', description: 'Check EPA database' },
  { step: 2, name: 'Calculate potential emissions', description: 'Engineering estimate' },
  { step: 3, name: 'Determine permit type required', description: 'Minor vs Major vs PSD' },
  { step: 4, name: 'Engage air permit consultant', description: 'Select experienced firm' },
  { step: 5, name: 'Pre-application meeting', description: 'Meet with state agency' },
  { step: 6, name: 'Prepare permit application', description: 'Draft application' },
  { step: 7, name: 'Submit application', description: 'File with state agency' },
  { step: 8, name: 'Completeness review', description: 'Agency confirms complete' },
  { step: 9, name: 'Technical review', description: 'Agency reviews calculations' },
  { step: 10, name: 'Draft permit issued', description: 'Agency issues draft' },
  { step: 11, name: 'Public comment period', description: '30-45 day public comment' },
  { step: 12, name: 'Final permit issued', description: 'Agency issues final permit' },
];

interface Props { siteId: string; }

interface AirPermitData {
  permit_type: PermitType;
  state: string;
  consultant: string;
  consultant_contact: string;
  application_date: string;
  expected_approval: string;
  notes: string;
  checklist: Record<number, { status: ChecklistStatus; notes: string }>;
}

export default function AirPermitTab({ siteId }: Props) {
  const [data, setData] = useState<AirPermitData>({
    permit_type: 'minor', state: 'OH', consultant: '', consultant_contact: '', application_date: '', expected_approval: '', notes: '',
    checklist: Object.fromEntries(permitChecklist.map(item => [item.step, { status: 'not_started' as ChecklistStatus, notes: '' }])),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: siteData } = await supabase.from('sites').select('inputs').eq('id', siteId).single();
      if (siteData?.inputs?.airPermitData) setData({ ...data, ...siteData.inputs.airPermitData });
      setLoading(false);
    };
    loadData();
  }, [siteId]);

  const saveData = useCallback(async (newData: AirPermitData) => {
    setSaving(true);
    const { data: siteData } = await supabase.from('sites').select('inputs').eq('id', siteId).single();
    const currentInputs = siteData?.inputs || {};
    await supabase.from('sites').update({ inputs: { ...currentInputs, airPermitData: newData }, updated_at: new Date().toISOString() }).eq('id', siteId);
    setSaving(false);
  }, [siteId]);

  const updateData = (field: string, value: string | Record<number, { status: ChecklistStatus; notes: string }>) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    setTimeout(() => saveData(newData), 500);
  };

  const updateChecklist = (step: number, field: string, value: string) => {
    const newChecklist = { ...data.checklist, [step]: { ...data.checklist[step], [field]: value } };
    updateData('checklist', newChecklist);
  };

  const completedSteps = Object.values(data.checklist).filter(i => i.status === 'complete').length;
  const selectedStateInfo = stateNotes.find(s => s.state === data.state);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: 'var(--text-muted)' }}>Loading air permit data...</p></div>;

  const inputStyle = { width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {saving && <div style={{ textAlign: 'right', fontSize: '14px', color: 'var(--accent)' }}>Saving...</div>}

      {/* Permit Configuration */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Permit Configuration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Permit Type</label><select value={data.permit_type} onChange={(e) => updateData('permit_type', e.target.value)} style={inputStyle}>{permitTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>State</label><select value={data.state} onChange={(e) => updateData('state', e.target.value)} style={inputStyle}>{stateNotes.map(s => <option key={s.state} value={s.state}>{s.state} - {s.agency}</option>)}</select></div>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Consultant</label><input type="text" value={data.consultant} onChange={(e) => updateData('consultant', e.target.value)} placeholder="Firm name" style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Consultant Contact</label><input type="text" value={data.consultant_contact} onChange={(e) => updateData('consultant_contact', e.target.value)} placeholder="Name, email, phone" style={inputStyle} /></div>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Application Date</label><input type="date" value={data.application_date} onChange={(e) => updateData('application_date', e.target.value)} style={inputStyle} /></div>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Expected Approval</label><input type="date" value={data.expected_approval} onChange={(e) => updateData('expected_approval', e.target.value)} style={inputStyle} /></div>
        </div>
      </div>

      {/* Permit Type Comparison */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Permit Type Comparison</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border-card)' }}><th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontSize: '14px' }}>Attribute</th>{permitTypes.map((type) => <th key={type.id} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 500, color: data.permit_type === type.id ? 'var(--accent)' : 'var(--text-muted)', backgroundColor: data.permit_type === type.id ? '#EFF6FF' : 'transparent' }}>{type.name}</th>)}</tr></thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-card)' }}><td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Timeline</td>{permitTypes.map((type) => <td key={type.id} style={{ padding: '12px 16px', color: 'var(--text-primary)', backgroundColor: data.permit_type === type.id ? '#EFF6FF' : 'transparent' }}>{type.timeline}</td>)}</tr>
              <tr style={{ borderBottom: '1px solid var(--border-card)' }}><td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Cost</td>{permitTypes.map((type) => <td key={type.id} style={{ padding: '12px 16px', color: 'var(--text-primary)', backgroundColor: data.permit_type === type.id ? '#EFF6FF' : 'transparent' }}>{type.cost}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* State Notes */}
      {selectedStateInfo && (
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>State Information: {selectedStateInfo.state}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Agency</p><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedStateInfo.agency}</p></div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Typical Timeline</p><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedStateInfo.timeline}</p></div>
            <div style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Difficulty</p><p style={{ fontWeight: 500, color: selectedStateInfo.difficulty === 'Easy' ? '#22C55E' : selectedStateInfo.difficulty === 'Moderate' ? '#EAB308' : '#EF4444' }}>{selectedStateInfo.difficulty}</p></div>
          </div>
        </div>
      )}

      {/* Permit Pathway Checklist */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div><h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>Permit Pathway Checklist</h2><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{completedSteps} of {permitChecklist.length} steps complete</p></div>
          <div style={{ width: '128px', backgroundColor: 'var(--border)', borderRadius: '9999px', height: '8px' }}><div style={{ backgroundColor: 'var(--accent)', height: '8px', borderRadius: '9999px', width: `${(completedSteps / permitChecklist.length) * 100}%`, transition: 'width 0.3s' }} /></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {permitChecklist.map((item) => (
            <div key={item.step} style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <span style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: 500, flexShrink: 0 }}>{item.step}</span>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                  <div><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.name}</p><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{item.description}</p></div>
                  <select value={data.checklist[item.step]?.status || 'not_started'} onChange={(e) => updateChecklist(item.step, 'status', e.target.value)} style={{ ...inputStyle, borderColor: data.checklist[item.step]?.status === 'complete' ? '#22C55E' : data.checklist[item.step]?.status === 'in_progress' ? '#EAB308' : data.checklist[item.step]?.status === 'blocked' ? '#EF4444' : 'var(--border)', color: data.checklist[item.step]?.status === 'complete' ? '#22C55E' : data.checklist[item.step]?.status === 'in_progress' ? '#CA8A04' : data.checklist[item.step]?.status === 'blocked' ? '#DC2626' : 'var(--text-muted)' }}>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="complete">Complete</option>
                    <option value="blocked">Blocked</option>
                  </select>
                  <input type="text" value={data.checklist[item.step]?.notes || ''} onChange={(e) => updateChecklist(item.step, 'notes', e.target.value)} placeholder="Notes..." style={inputStyle} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Additional Notes</h2>
        <textarea value={data.notes} onChange={(e) => updateData('notes', e.target.value)} rows={4} placeholder="Key concerns, communications, timeline updates..." style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
    </div>
  );
}
