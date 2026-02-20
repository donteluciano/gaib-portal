'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type ItemStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked';

interface ChecklistItem {
  id: string;
  site_id: string;
  stage: number;
  item_key: string;
  status: ItemStatus;
  completed_date: string | null;
  notes: string | null;
}

interface ChecklistDefinition {
  key: string;
  name: string;
  isGate?: boolean;
}

// Master checklist - exact 47 items from spec
const stageDefinitions: Record<number, { name: string; items: ChecklistDefinition[] }> = {
  1: {
    name: 'Stage 1: Site Control',
    items: [
      { key: 'site_identified', name: 'Site identification complete (parcel mapped, initial screening passed)' },
      { key: 'ownership_confirmed', name: 'Ownership confirmed (title search, owner identified)' },
      { key: 'option_drafted', name: 'Option/LOI drafted by attorney' },
      { key: 'option_executed', name: 'Option agreement executed and deposit paid' },
      { key: 'site_visit_complete', name: 'Preliminary site visit completed (photos, notes)' },
    ]
  },
  2: {
    name: 'Stage 2: Gas & Power',
    items: [
      { key: 'gas_transmission_identified', name: 'Gas transmission pipeline identified (operator, diameter, pressure)' },
      { key: 'gas_utility_contacted', name: 'Gas utility formally contacted' },
      { key: 'will_serve_requested', name: 'Will-serve or capacity letter requested' },
      { key: 'gas_study_commissioned', name: 'Gas supply study commissioned (third-party engineer)' },
      { key: 'gas_capacity_confirmed', name: 'Gas pressure and volume confirmed sufficient for target MW' },
      { key: 'electrical_assessed', name: 'Electrical interconnection assessed (grid backup/supplement)' },
      { key: 'gas_gate_decision', name: 'GATE 2 DECISION: Gas confirmed, proceed to Stage 3', isGate: true },
    ]
  },
  3: {
    name: 'Stage 3: Water & Environmental',
    items: [
      { key: 'phase_i_ordered', name: 'Phase I ESA ordered' },
      { key: 'phase_i_reviewed', name: 'Phase I results reviewed' },
      { key: 'phase_ii_complete', name: 'Phase II ESA complete (if needed, mark complete if not needed)' },
      { key: 'remediation_scoped', name: 'Remediation plan scoped (if needed, mark complete if not needed)' },
      { key: 'water_study_complete', name: 'Water availability study complete' },
      { key: 'water_rights_confirmed', name: 'Water rights confirmed' },
      { key: 'air_permit_scoped', name: 'Air permit pathway scoped (emissions modeling, regulatory path)' },
      { key: 'enviro_gate_decision', name: 'GATE 3 DECISION: Environmental clear, proceed to Stage 4', isGate: true },
    ]
  },
  4: {
    name: 'Stage 4: Fiber & Access',
    items: [
      { key: 'fiber_routes_assessed', name: 'Fiber routes assessed and mapped' },
      { key: 'telecom_contacted', name: 'Telecom providers contacted (2-3 providers)' },
      { key: 'fiber_cost_estimated', name: 'Last-mile fiber cost and timeline estimated' },
      { key: 'fiber_gate_decision', name: 'GATE 4 DECISION: Fiber path confirmed, proceed to Stage 5', isGate: true },
    ]
  },
  5: {
    name: 'Stage 5: Political & Community',
    items: [
      { key: 'municipal_contacted', name: 'Municipal officials contacted (mayor, council, planning, EDO)' },
      { key: 'zoning_confirmed', name: 'Zoning pathway confirmed (by-right, variance, or rezoning)' },
      { key: 'tax_incentives_explored', name: 'Tax incentives explored (PILOT, abatement, enterprise zone)' },
      { key: 'community_engagement', name: 'Community engagement initiated (public meetings, stakeholders)' },
      { key: 'cba_drafted', name: 'Community benefit agreement drafted' },
      { key: 'political_support_documented', name: 'Political support documented (letters, resolutions)' },
      { key: 'political_gate_decision', name: 'GATE 5 DECISION: Political alignment confirmed, proceed to Stage 6', isGate: true },
    ]
  },
  6: {
    name: 'Stage 6: Engineering & Feasibility',
    items: [
      { key: 'dc_engineer_engaged', name: 'Data center engineer engaged' },
      { key: 'mw_capacity_confirmed', name: 'Deliverable MW capacity confirmed with engineering basis' },
      { key: 'cooling_assessed', name: 'Cooling approach assessed (water, air, or hybrid)' },
      { key: 'structures_evaluated', name: 'Existing structures evaluated (acquire vs demolish)' },
      { key: 'equipment_quotes', name: 'Equipment budgetary quotes obtained (turbines, switchgear)' },
      { key: 'air_permit_confirmed', name: 'Air permit timeline confirmed by engineering' },
      { key: 'engineering_gate_decision', name: 'GATE 6 DECISION: Engineering confirmed, proceed to Stage 7', isGate: true },
    ]
  },
  7: {
    name: 'Stage 7: Packaging & Exit',
    items: [
      { key: 'certainty_package', name: 'Certainty package assembled (all studies, letters, permits)' },
      { key: 'financial_model', name: 'Institutional-grade financial model built' },
      { key: 'marketing_materials', name: 'Marketing materials and data room prepared' },
      { key: 'buyer_outreach', name: 'Buyer outreach initiated (developers, hyperscalers, funds)' },
      { key: 'loi_received', name: 'LOI or term sheet received from buyer' },
      { key: 'buyer_diligence', name: 'Buyer due diligence facilitated' },
      { key: 'transaction_docs', name: 'Transaction documents executed' },
      { key: 'closing', name: 'Transaction closed' },
      { key: 'capital_returned', name: 'Capital returned and profit distributed to LPs' },
    ]
  },
};

const statusColors: Record<ItemStatus, string> = {
  not_started: 'border-gray-500',
  in_progress: 'border-yellow-500 bg-yellow-500/10',
  complete: 'border-green-500 bg-green-500/10',
  blocked: 'border-red-500 bg-red-500/10',
};

interface Props {
  siteId: string;
  currentStage: number;
  onStageAdvance?: (newStage: number) => void;
}

function ProgressBar({ completed, total, size = 'normal' }: { completed: number; total: number; size?: 'normal' | 'mini' }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  let barColor = 'bg-red-500';
  if (percent >= 75) barColor = 'bg-green-500';
  else if (percent >= 50) barColor = 'bg-yellow-500';
  else if (percent >= 25) barColor = 'bg-yellow-600';
  
  if (size === 'mini') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 bg-navy rounded-full h-1.5">
          <div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-xs text-gray-400">{percent}%</span>
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-white font-medium">{completed}/{total} Complete</span>
        <span className="text-gray-400">{percent}%</span>
      </div>
      <div className="w-full bg-navy rounded-full h-3">
        <div className={`h-3 rounded-full ${barColor} transition-all duration-300`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default function ChecklistTab({ siteId, currentStage, onStageAdvance }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState<Record<number, boolean>>({});
  const [showAdvancePrompt, setShowAdvancePrompt] = useState<number | null>(null);

  useEffect(() => {
    const loadChecklist = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('site_id', siteId)
        .order('stage', { ascending: true });
      
      if (data) {
        setItems(data);
      }
      setLoading(false);
    };

    loadChecklist();
    
    // Expand current and previous stages by default
    const expanded: Record<number, boolean> = {};
    for (let i = 1; i <= currentStage; i++) {
      expanded[i] = true;
    }
    setExpandedStages(expanded);
  }, [siteId, currentStage]);

  async function updateItemStatus(itemKey: string, newStatus: ItemStatus) {
    const item = items.find(i => i.item_key === itemKey);
    if (!item) return;

    const updates: Partial<ChecklistItem> = { status: newStatus };
    if (newStatus === 'complete') {
      updates.completed_date = new Date().toISOString().split('T')[0];
    } else {
      updates.completed_date = null;
    }

    const { error } = await supabase
      .from('checklist_items')
      .update(updates)
      .eq('id', item.id);

    if (!error) {
      setItems(items.map(i => 
        i.id === item.id ? { ...i, ...updates } : i
      ));

      // Check if stage is complete and should prompt for advancement
      const stageItems = items.filter(i => i.stage === item.stage);
      const updatedStageItems = stageItems.map(i => 
        i.id === item.id ? { ...i, ...updates } : i
      );
      const allComplete = updatedStageItems.every(i => i.status === 'complete');
      
      if (allComplete && item.stage === currentStage && item.stage < 7) {
        setShowAdvancePrompt(item.stage + 1);
      }
    }
  }

  async function updateItemNotes(itemKey: string, notes: string) {
    const item = items.find(i => i.item_key === itemKey);
    if (!item) return;

    await supabase
      .from('checklist_items')
      .update({ notes })
      .eq('id', item.id);

    setItems(items.map(i => 
      i.id === item.id ? { ...i, notes } : i
    ));
  }

  async function advanceStage(newStage: number) {
    if (onStageAdvance) {
      onStageAdvance(newStage);
    }

    // Log activity
    await supabase.from('activities').insert({
      site_id: siteId,
      date: new Date().toISOString().split('T')[0],
      action: `Advanced to Stage ${newStage}: ${stageDefinitions[newStage]?.name.replace(`Stage ${newStage}: `, '')}`,
      stage: newStage,
    });

    setShowAdvancePrompt(null);
  }

  const totalItems = useMemo(() => {
    return Object.values(stageDefinitions).reduce((sum, stage) => sum + stage.items.length, 0);
  }, []);

  const completedItems = useMemo(() => {
    return items.filter(i => i.status === 'complete').length;
  }, [items]);

  const getStageProgress = (stageNum: number) => {
    const stageItems = items.filter(i => i.stage === stageNum);
    const complete = stageItems.filter(i => i.status === 'complete').length;
    const total = stageDefinitions[stageNum]?.items.length || 0;
    return { complete, total };
  };

  const getItemStatus = (itemKey: string): ChecklistItem | undefined => {
    return items.find(i => i.item_key === itemKey);
  };

  const toggleStage = (stageNum: number) => {
    setExpandedStages(prev => ({ ...prev, [stageNum]: !prev[stageNum] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <ProgressBar completed={completedItems} total={totalItems} />
      </div>

      {/* Stage Advance Prompt */}
      {showAdvancePrompt && (
        <div className="bg-gold/20 border border-gold/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-gold font-medium">🎉 All Stage {showAdvancePrompt - 1} items complete!</p>
            <p className="text-gray-400 text-sm">Ready to advance to {stageDefinitions[showAdvancePrompt]?.name}?</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => advanceStage(showAdvancePrompt)}
              className="px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg"
            >
              Advance Stage
            </button>
            <button
              onClick={() => setShowAdvancePrompt(null)}
              className="px-4 py-2 bg-navy hover:bg-navy-card text-white rounded-lg"
            >
              Later
            </button>
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

        return (
          <div 
            key={stageNum} 
            className={`bg-navy-card border rounded-xl overflow-hidden ${
              isCurrent ? 'border-gold/50' : 'border-navy'
            }`}
          >
            {/* Stage Header */}
            <button
              onClick={() => toggleStage(stageNum)}
              className="w-full p-4 flex items-center justify-between bg-navy/50 hover:bg-navy/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-serif text-white">{stage.name}</h3>
                    {isComplete && <span className="text-green-400">✓</span>}
                    {isCurrent && <span className="px-2 py-0.5 text-xs bg-gold/20 text-gold rounded">Current</span>}
                  </div>
                  <p className="text-gray-400 text-sm">{complete}/{total} complete</p>
                </div>
              </div>
              <div className="w-24">
                <div className="w-full bg-navy rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${isComplete ? 'bg-green-500' : 'bg-gold'}`}
                    style={{ width: `${total > 0 ? (complete / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Stage Items */}
            {isExpanded && (
              <div className="divide-y divide-navy/50">
                {stage.items.map((def) => {
                  const item = getItemStatus(def.key);
                  const status = item?.status || 'not_started';
                  const isGate = def.isGate;

                  return (
                    <div 
                      key={def.key} 
                      className={`p-4 ${isGate ? 'bg-navy/30' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Status Checkbox/Button */}
                        <div className="flex-shrink-0 pt-1">
                          <button
                            onClick={() => {
                              const nextStatus: ItemStatus = status === 'complete' ? 'not_started' : 'complete';
                              updateItemStatus(def.key, nextStatus);
                            }}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${statusColors[status]}`}
                          >
                            {status === 'complete' && (
                              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                            {status === 'in_progress' && (
                              <span className="text-yellow-400 text-xs">⟳</span>
                            )}
                            {status === 'blocked' && (
                              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                        </div>

                        {/* Item Content */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-2">
                            <p className={`font-medium ${status === 'complete' ? 'text-gray-400 line-through' : 'text-white'} ${isGate ? 'text-gold' : ''}`}>
                              {isGate && '🚪 '}{def.name}
                            </p>
                            {item?.completed_date && (
                              <p className="text-green-400 text-sm mt-1">Completed: {item.completed_date}</p>
                            )}
                          </div>

                          {/* Status Dropdown */}
                          <select
                            value={status}
                            onChange={(e) => updateItemStatus(def.key, e.target.value as ItemStatus)}
                            className={`bg-navy border rounded-lg px-3 py-2 text-sm focus:border-gold outline-none ${
                              status === 'complete' ? 'border-green-500 text-green-400' :
                              status === 'in_progress' ? 'border-yellow-500 text-yellow-400' :
                              status === 'blocked' ? 'border-red-500 text-red-400' :
                              'border-navy-card text-gray-400'
                            }`}
                          >
                            <option value="not_started">☐ Not Started</option>
                            <option value="in_progress">🔄 In Progress</option>
                            <option value="complete">✅ Complete</option>
                            <option value="blocked">🚫 Blocked</option>
                          </select>

                          {/* Notes */}
                          <input
                            type="text"
                            value={item?.notes || ''}
                            onChange={(e) => updateItemNotes(def.key, e.target.value)}
                            placeholder="Notes..."
                            className="bg-navy border border-navy-card rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
                          />
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
      <div className="bg-navy-card border border-navy rounded-xl p-4">
        <p className="text-gray-400 text-sm mb-2">Status Legend:</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2"><span>☐</span> Not Started</span>
          <span className="flex items-center gap-2 text-yellow-400"><span>🔄</span> In Progress</span>
          <span className="flex items-center gap-2 text-green-400"><span>✅</span> Complete</span>
          <span className="flex items-center gap-2 text-red-400"><span>🚫</span> Blocked</span>
          <span className="flex items-center gap-2 text-gold"><span>🚪</span> Gate Decision</span>
        </div>
      </div>
    </div>
  );
}

// Export for use in other components
export { ProgressBar };
