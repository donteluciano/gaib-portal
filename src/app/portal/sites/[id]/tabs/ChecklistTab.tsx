'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type ItemStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked';

interface ChecklistItem { id: string; site_id: string; stage: number; item_key: string; status: ItemStatus; completed_date: string | null; notes: string | null; }
interface ChecklistDefinition { key: string; name: string; isGate?: boolean; }

const stageDefinitions: Record<number, { name: string; items: ChecklistDefinition[] }> = {
  1: { name: 'Stage 1: Site Control', items: [
    { key: 'site_identified', name: 'Site identification complete' },
    { key: 'ownership_confirmed', name: 'Ownership confirmed' },
    { key: 'option_drafted', name: 'Option/LOI drafted by attorney' },
    { key: 'option_executed', name: 'Option agreement executed' },
    { key: 'site_visit_complete', name: 'Preliminary site visit completed' },
  ]},
  2: { name: 'Stage 2: Gas & Power', items: [
    { key: 'gas_transmission_identified', name: 'Gas transmission pipeline identified' },
    { key: 'gas_utility_contacted', name: 'Gas utility formally contacted' },
    { key: 'will_serve_requested', name: 'Will-serve letter requested' },
    { key: 'gas_study_commissioned', name: 'Gas supply study commissioned' },
    { key: 'gas_capacity_confirmed', name: 'Gas capacity confirmed' },
    { key: 'electrical_assessed', name: 'Electrical interconnection assessed' },
    { key: 'gas_gate_decision', name: 'GATE 2: Gas confirmed', isGate: true },
  ]},
  3: { name: 'Stage 3: Water & Environmental', items: [
    { key: 'phase_i_ordered', name: 'Phase I ESA ordered' },
    { key: 'phase_i_reviewed', name: 'Phase I results reviewed' },
    { key: 'phase_ii_complete', name: 'Phase II ESA complete' },
    { key: 'water_study_complete', name: 'Water availability study complete' },
    { key: 'water_rights_confirmed', name: 'Water rights confirmed' },
    { key: 'air_permit_scoped', name: 'Air permit pathway scoped' },
    { key: 'enviro_gate_decision', name: 'GATE 3: Environmental clear', isGate: true },
  ]},
  4: { name: 'Stage 4: Fiber & Access', items: [
    { key: 'fiber_routes_assessed', name: 'Fiber routes assessed' },
    { key: 'telecom_contacted', name: 'Telecom providers contacted' },
    { key: 'fiber_cost_estimated', name: 'Fiber cost estimated' },
    { key: 'fiber_gate_decision', name: 'GATE 4: Fiber confirmed', isGate: true },
  ]},
  5: { name: 'Stage 5: Political & Community', items: [
    { key: 'municipal_contacted', name: 'Municipal officials contacted' },
    { key: 'zoning_confirmed', name: 'Zoning pathway confirmed' },
    { key: 'tax_incentives_explored', name: 'Tax incentives explored' },
    { key: 'community_engagement', name: 'Community engagement initiated' },
    { key: 'cba_drafted', name: 'CBA drafted' },
    { key: 'political_support_documented', name: 'Political support documented' },
    { key: 'political_gate_decision', name: 'GATE 5: Political aligned', isGate: true },
  ]},
  6: { name: 'Stage 6: Engineering & Feasibility', items: [
    { key: 'dc_engineer_engaged', name: 'Data center engineer engaged' },
    { key: 'mw_capacity_confirmed', name: 'MW capacity confirmed' },
    { key: 'cooling_assessed', name: 'Cooling approach assessed' },
    { key: 'structures_evaluated', name: 'Existing structures evaluated' },
    { key: 'equipment_quotes', name: 'Equipment quotes obtained' },
    { key: 'air_permit_confirmed', name: 'Air permit timeline confirmed' },
    { key: 'engineering_gate_decision', name: 'GATE 6: Engineering confirmed', isGate: true },
  ]},
  7: { name: 'Stage 7: Packaging & Exit', items: [
    { key: 'certainty_package', name: 'Certainty package assembled' },
    { key: 'financial_model', name: 'Financial model built' },
    { key: 'marketing_materials', name: 'Marketing materials prepared' },
    { key: 'buyer_outreach', name: 'Buyer outreach initiated' },
    { key: 'loi_received', name: 'LOI received' },
    { key: 'buyer_diligence', name: 'Buyer due diligence facilitated' },
    { key: 'transaction_docs', name: 'Transaction documents executed' },
    { key: 'closing', name: 'Transaction closed' },
    { key: 'capital_returned', name: 'Capital returned to LPs' },
  ]},
};

interface Props { siteId: string; currentStage: number; onStageAdvance?: (newStage: number) => void; }

export default function ChecklistTab({ siteId, currentStage, onStageAdvance }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({});
  const [showAdvancePrompt, setShowAdvancePrompt] = useState<number | null>(null);

  useEffect(() => {
    const loadChecklist = async () => {
      setLoading(true);
      const { data } = await supabase.from('checklist_items').select('*').eq('site_id', siteId).order('stage', { ascending: true });
      if (data) setItems(data);
      setLoading(false);
    };
    loadChecklist();
    const expanded: Record<number, boolean> = {};
    for (let i = 1; i <= currentStage; i++) expanded[i] = true;
    setExpandedStages(expanded);
  }, [siteId, currentStage]);

  async function updateItemStatus(itemKey: string, newStatus: ItemStatus) {
    const item = items.find(i => i.item_key === itemKey);
    if (!item) return;
    const updates: Partial<ChecklistItem> = { status: newStatus };
    if (newStatus === 'complete') updates.completed_date = new Date().toISOString().split('T')[0];
    else updates.completed_date = null;
    const { error } = await supabase.from('checklist_items').update(updates).eq('id', item.id);
    if (!error) {
      setItems(items.map(i => i.id === item.id ? { ...i, ...updates } : i));
      const stageItems = items.filter(i => i.stage === item.stage);
      const updatedStageItems = stageItems.map(i => i.id === item.id ? { ...i, ...updates } : i);
      const allComplete = updatedStageItems.every(i => i.status === 'complete');
      if (allComplete && item.stage === currentStage && item.stage < 7) setShowAdvancePrompt(item.stage + 1);
    }
  }

  async function updateItemNotes(itemKey: string, notes: string) {
    const item = items.find(i => i.item_key === itemKey);
    if (!item) return;
    await supabase.from('checklist_items').update({ notes }).eq('id', item.id);
    setItems(items.map(i => i.id === item.id ? { ...i, notes } : i));
  }

  async function advanceStage(newStage: number) {
    if (onStageAdvance) onStageAdvance(newStage);
    await supabase.from('activities').insert({ site_id: siteId, date: new Date().toISOString().split('T')[0], action: `Advanced to Stage ${newStage}: ${stageDefinitions[newStage]?.name.replace(`Stage ${newStage}: `, '')}`, stage: newStage });
    setShowAdvancePrompt(null);
  }

  const totalItems = useMemo(() => Object.values(stageDefinitions).reduce((sum, stage) => sum + stage.items.length, 0), []);
  const completedItems = useMemo(() => items.filter(i => i.status === 'complete').length, [items]);
  const getStageProgress = (stageNum: number) => { const stageItems = items.filter(i => i.stage === stageNum); const complete = stageItems.filter(i => i.status === 'complete').length; const total = stageDefinitions[stageNum]?.items.length || 0; return { complete, total }; };
  const getItemStatus = (itemKey: string): ChecklistItem | undefined => items.find(i => i.item_key === itemKey);
  const toggleStage = (stageNum: number) => setExpandedStages(prev => ({ ...prev, [stageNum]: !prev[stageNum] }));

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: '#6B7280' }}>Loading checklist...</p></div>;

  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const inputStyle = { backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '8px 12px', color: '#111827', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Overall Progress */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#111827', fontWeight: 500 }}>{completedItems}/{totalItems} Complete</span>
          <span style={{ color: '#6B7280' }}>{percent}%</span>
        </div>
        <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '12px' }}>
          <div style={{ height: '12px', borderRadius: '9999px', backgroundColor: percent >= 75 ? '#22C55E' : percent >= 50 ? '#EAB308' : '#EF4444', width: `${percent}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Stage Advance Prompt */}
      {showAdvancePrompt && (
        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><p style={{ color: '#1D4ED8', fontWeight: 500 }}>🎉 All Stage {showAdvancePrompt - 1} items complete!</p><p style={{ color: '#6B7280', fontSize: '14px' }}>Ready to advance to {stageDefinitions[showAdvancePrompt]?.name}?</p></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => advanceStage(showAdvancePrompt)} style={{ padding: '8px 16px', backgroundColor: '#2563EB', color: '#FFFFFF', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Advance Stage</button>
            <button onClick={() => setShowAdvancePrompt(null)} style={{ padding: '8px 16px', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '8px', border: '1px solid #D1D5DB', cursor: 'pointer' }}>Later</button>
          </div>
        </div>
      )}

      {/* Stage Checklists */}
      {Object.entries(stageDefinitions).map(([stageNumStr, stage]) => {
        const stageNum = parseInt(stageNumStr);
        const { complete, total } = getStageProgress(stageNum);
        const isExpanded = expandedStages[stageNum] ?? false;
        const isComplete = complete === total && total > 0;
        const isCurrent = stageNum === currentStage;
        const pct = total > 0 ? (complete / total) * 100 : 0;
        return (
          <div key={stageNum} style={{ backgroundColor: '#FFFFFF', border: isCurrent ? '2px solid #BFDBFE' : '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
            <button onClick={() => toggleStage(stageNum)} style={{ width: '100%', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: isExpanded ? '#F9FAFB' : '#FFFFFF', border: 'none', cursor: 'pointer', borderBottom: isExpanded ? '1px solid #E5E7EB' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px' }}>{isExpanded ? '▼' : '▶'}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', fontFamily: 'Georgia, serif' }}>{stage.name}</h3>
                    {isComplete && <span style={{ color: '#22C55E' }}>✓</span>}
                    {isCurrent && <span style={{ padding: '2px 8px', fontSize: '12px', backgroundColor: '#DBEAFE', color: '#1D4ED8', borderRadius: '4px' }}>Current</span>}
                  </div>
                  <p style={{ color: '#6B7280', fontSize: '14px' }}>{complete}/{total} complete</p>
                </div>
              </div>
              <div style={{ width: '96px' }}>
                <div style={{ width: '100%', backgroundColor: '#E5E7EB', borderRadius: '9999px', height: '8px' }}>
                  <div style={{ height: '8px', borderRadius: '9999px', backgroundColor: isComplete ? '#22C55E' : '#2563EB', width: `${pct}%`, transition: 'width 0.3s' }} />
                </div>
              </div>
            </button>
            {isExpanded && (
              <div>
                {stage.items.map((def) => {
                  const item = getItemStatus(def.key);
                  const status = item?.status || 'not_started';
                  const isGate = def.isGate;
                  return (
                    <div key={def.key} style={{ padding: '16px', borderTop: '1px solid #E5E7EB', backgroundColor: isGate ? '#F9FAFB' : '#FFFFFF' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <button onClick={() => updateItemStatus(def.key, status === 'complete' ? 'not_started' : 'complete')} style={{ width: '24px', height: '24px', borderRadius: '4px', border: `2px solid ${status === 'complete' ? '#22C55E' : status === 'in_progress' ? '#EAB308' : status === 'blocked' ? '#EF4444' : '#D1D5DB'}`, backgroundColor: status === 'complete' ? '#DCFCE7' : status === 'in_progress' ? '#FEF3C7' : status === 'blocked' ? '#FEE2E2' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: '4px' }}>
                          {status === 'complete' && <svg style={{ width: '16px', height: '16px', color: '#22C55E' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                          {status === 'in_progress' && <span style={{ color: '#EAB308', fontSize: '12px' }}>⟳</span>}
                          {status === 'blocked' && <svg style={{ width: '16px', height: '16px', color: '#EF4444' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                        </button>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontWeight: 500, color: status === 'complete' ? '#9CA3AF' : isGate ? '#2563EB' : '#111827', textDecoration: status === 'complete' ? 'line-through' : 'none' }}>{isGate && '🚪 '}{def.name}</p>
                            {item?.completed_date && <p style={{ color: '#22C55E', fontSize: '14px', marginTop: '4px' }}>Completed: {item.completed_date}</p>}
                          </div>
                          <select value={status} onChange={(e) => updateItemStatus(def.key, e.target.value as ItemStatus)} style={{ ...inputStyle, borderColor: status === 'complete' ? '#22C55E' : status === 'in_progress' ? '#EAB308' : status === 'blocked' ? '#EF4444' : '#D1D5DB', color: status === 'complete' ? '#22C55E' : status === 'in_progress' ? '#CA8A04' : status === 'blocked' ? '#DC2626' : '#6B7280' }}>
                            <option value="not_started">☐ Not Started</option>
                            <option value="in_progress">🔄 In Progress</option>
                            <option value="complete">✅ Complete</option>
                            <option value="blocked">🚫 Blocked</option>
                          </select>
                          <input type="text" value={item?.notes || ''} onChange={(e) => updateItemNotes(def.key, e.target.value)} placeholder="Notes..." style={inputStyle} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Legend */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px' }}>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '8px' }}>Status Legend:</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span>☐</span> Not Started</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#CA8A04' }}><span>🔄</span> In Progress</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22C55E' }}><span>✅</span> Complete</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626' }}><span>🚫</span> Blocked</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB' }}><span>🚪</span> Gate Decision</span>
        </div>
      </div>
    </div>
  );
}

export { };
