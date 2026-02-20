'use client';

import { useState } from 'react';

type ItemStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked';

interface ChecklistItem {
  key: string;
  name: string;
  killTrigger?: string; // Warning to show if blocked
}

const stageChecklists: Record<number, { name: string; items: ChecklistItem[] }> = {
  1: {
    name: 'Stage 1: Site Identification',
    items: [
      { key: 'site_identified', name: 'Site identified and initial screening complete' },
      { key: 'ownership_confirmed', name: 'Ownership confirmed via title search' },
      { key: 'option_executed', name: 'Option agreement or LOI executed', killTrigger: 'Unable to secure site control — kill deal' },
      { key: 'site_visit', name: 'Initial site visit completed' },
      { key: 'gate_decision', name: 'Stage 1 gate decision: GO/NO-GO' },
    ]
  },
  2: {
    name: 'Stage 2: Gas Confirmation',
    items: [
      { key: 'gas_pipeline_identified', name: 'Nearest gas transmission pipeline identified' },
      { key: 'gas_utility_contacted', name: 'Gas utility contacted', killTrigger: 'Utility unresponsive or hostile — consider kill' },
      { key: 'gas_feasibility', name: 'Gas feasibility study ordered' },
      { key: 'gas_capacity_confirmed', name: 'Gas capacity confirmed', killTrigger: 'Insufficient gas capacity — kill unless alternative identified' },
      { key: 'gas_cost_estimate', name: 'Gas lateral cost estimate received' },
      { key: 'gate_decision', name: 'Stage 2 gate decision: GO/NO-GO' },
    ]
  },
  3: {
    name: 'Stage 3: Power Secured',
    items: [
      { key: 'transmission_identified', name: 'Nearest transmission line identified' },
      { key: 'substation_capacity', name: 'Substation capacity confirmed' },
      { key: 'interconnection_filed', name: 'Interconnection application filed' },
      { key: 'interconnection_study', name: 'Interconnection study complete', killTrigger: 'Interconnection costs exceed $5M+ — evaluate economics' },
      { key: 'power_agreement', name: 'Power purchase/interconnection agreement signed' },
      { key: 'phase_i_ordered', name: 'Phase I ESA ordered' },
      { key: 'phase_i_complete', name: 'Phase I ESA complete', killTrigger: 'Phase I flagged RECs — evaluate remediation cost. Kill if >$2M uncertain scope' },
      { key: 'gate_decision', name: 'Stage 3 gate decision: GO/NO-GO' },
    ]
  },
  4: {
    name: 'Stage 4: Permits Filed',
    items: [
      { key: 'air_permit_type', name: 'Air permit type determined' },
      { key: 'air_consultant_engaged', name: 'Air permit consultant engaged' },
      { key: 'air_application_filed', name: 'Air permit application filed' },
      { key: 'zoning_confirmed', name: 'Zoning confirmed or variance filed', killTrigger: 'Zoning variance denied — kill deal' },
      { key: 'water_confirmed', name: 'Water capacity confirmed' },
      { key: 'cba_negotiated', name: 'Community benefit agreement negotiated' },
      { key: 'gate_decision', name: 'Stage 4 gate decision: GO/NO-GO' },
    ]
  },
  5: {
    name: 'Stage 5: De-risked',
    items: [
      { key: 'air_permit_issued', name: 'Air permit issued', killTrigger: 'Air permit denied or major conditions — evaluate alternatives' },
      { key: 'all_permits_secured', name: 'All required permits secured' },
      { key: 'incentives_secured', name: 'Municipal incentives formalized' },
      { key: 'engineering_complete', name: 'Site engineering/design complete' },
      { key: 'gate_decision', name: 'Stage 5 gate decision: GO/NO-GO' },
    ]
  },
  6: {
    name: 'Stage 6: Marketing',
    items: [
      { key: 'marketing_package', name: 'Marketing package prepared' },
      { key: 'buyers_contacted', name: 'Target buyers contacted' },
      { key: 'site_tours', name: 'Site tours completed' },
      { key: 'loi_received', name: 'LOI(s) received' },
      { key: 'buyer_selected', name: 'Buyer selected' },
      { key: 'psa_executed', name: 'Purchase agreement executed' },
    ]
  },
  7: {
    name: 'Stage 7: Closing',
    items: [
      { key: 'due_diligence', name: 'Buyer due diligence complete' },
      { key: 'closing_docs', name: 'Closing documents prepared' },
      { key: 'funds_escrowed', name: 'Funds escrowed' },
      { key: 'title_transferred', name: 'Title transferred' },
      { key: 'deal_closed', name: 'Deal closed' },
    ]
  },
};

const statusColors: Record<ItemStatus, string> = {
  not_started: 'border-muted',
  in_progress: 'border-warning bg-warning/10',
  complete: 'border-success bg-success/10',
  blocked: 'border-danger bg-danger/10',
};

export default function ChecklistTab() {
  const [itemStatuses, setItemStatuses] = useState<Record<string, { status: ItemStatus; date: string; notes: string }>>(
    Object.fromEntries(
      Object.values(stageChecklists).flatMap(stage => 
        stage.items.map(item => [item.key, { status: 'not_started', date: '', notes: '' }])
      )
    )
  );

  const updateStatus = (key: string, field: string, value: string) => {
    setItemStatuses({
      ...itemStatuses,
      [key]: { ...itemStatuses[key], [field]: value }
    });
  };

  const getStageProgress = (stageNum: number) => {
    const items = stageChecklists[stageNum].items;
    const complete = items.filter(i => itemStatuses[i.key]?.status === 'complete').length;
    return Math.round((complete / items.length) * 100);
  };

  // Check for kill triggers
  const activeKillTriggers = Object.values(stageChecklists).flatMap(stage =>
    stage.items.filter(item => 
      item.killTrigger && itemStatuses[item.key]?.status === 'blocked'
    )
  );

  return (
    <div className="space-y-6">
      {/* Kill Trigger Warnings */}
      {activeKillTriggers.length > 0 && (
        <div className="bg-danger/10 border border-danger rounded-xl p-4">
          <h3 className="text-danger font-semibold mb-2">⚠️ Kill Triggers Active</h3>
          <ul className="space-y-2">
            {activeKillTriggers.map(item => (
              <li key={item.key} className="text-danger/80 text-sm">
                • {item.name}: {item.killTrigger}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stage Checklists */}
      {Object.entries(stageChecklists).map(([stageNum, stage]) => {
        const progress = getStageProgress(parseInt(stageNum));
        return (
          <div key={stageNum} className="bg-navy-card border border-navy rounded-xl overflow-hidden">
            <div className="p-4 border-b border-navy bg-navy/50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif text-white">{stage.name}</h3>
                <p className="text-muted text-sm">{progress}% complete</p>
              </div>
              <div className="w-24 bg-navy rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${progress === 100 ? 'bg-success' : 'bg-gold'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="divide-y divide-navy/50">
              {stage.items.map((item) => {
                const status = itemStatuses[item.key] || { status: 'not_started', date: '', notes: '' };
                const isBlocked = status.status === 'blocked';
                return (
                  <div 
                    key={item.key} 
                    className={`p-4 ${isBlocked && item.killTrigger ? 'bg-danger/5' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-6 h-6 rounded border-2 flex-shrink-0 mt-1 ${statusColors[status.status]}`}>
                        {status.status === 'complete' && (
                          <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                        {status.status === 'blocked' && (
                          <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <p className={`font-medium ${status.status === 'complete' ? 'text-muted line-through' : 'text-white'}`}>
                            {item.name}
                          </p>
                          {isBlocked && item.killTrigger && (
                            <p className="text-danger text-sm mt-1">⚠️ {item.killTrigger}</p>
                          )}
                        </div>
                        <select
                          value={status.status}
                          onChange={(e) => updateStatus(item.key, 'status', e.target.value)}
                          className={`bg-navy border rounded-lg px-3 py-2 text-sm focus:border-gold outline-none ${
                            status.status === 'complete' ? 'border-success text-success' :
                            status.status === 'in_progress' ? 'border-warning text-warning' :
                            status.status === 'blocked' ? 'border-danger text-danger' :
                            'border-navy-card text-muted'
                          }`}
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="complete">Complete</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <input
                          type="date"
                          value={status.date}
                          onChange={(e) => updateStatus(item.key, 'date', e.target.value)}
                          className="bg-navy border border-navy-card rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
