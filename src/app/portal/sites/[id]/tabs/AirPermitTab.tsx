'use client';

import { useState } from 'react';

type PermitType = 'minor' | 'synthetic_minor' | 'major' | 'psd';

const permitTypes = [
  { 
    id: 'minor', 
    name: 'Minor Source', 
    timeline: '3-6 months', 
    cost: '$15-50K',
    publicComment: 'None',
    epaInvolvement: 'None',
    bactRequired: 'No',
    riskLevel: 'low'
  },
  { 
    id: 'synthetic_minor', 
    name: 'Synthetic Minor', 
    timeline: '6-12 months', 
    cost: '$50-150K',
    publicComment: 'Sometimes',
    epaInvolvement: 'Limited',
    bactRequired: 'No',
    riskLevel: 'medium'
  },
  { 
    id: 'major', 
    name: 'Major Source (Title V)', 
    timeline: '12-18 months', 
    cost: '$150-500K',
    publicComment: 'Required',
    epaInvolvement: 'Review',
    bactRequired: 'Yes (BACT)',
    riskLevel: 'high'
  },
  { 
    id: 'psd', 
    name: 'PSD (Attainment)', 
    timeline: '18-24+ months', 
    cost: '$500K-2M+',
    publicComment: 'Required',
    epaInvolvement: 'Full',
    bactRequired: 'Yes (BACT/LAER)',
    riskLevel: 'very_high'
  },
];

const stateNotes = [
  { state: 'OH', agency: 'Ohio EPA', timeline: '6-12 months', difficulty: 'Moderate', notes: 'Experienced with power plants. Split jurisdiction with local air quality.' },
  { state: 'IN', agency: 'IDEM', timeline: '6-9 months', difficulty: 'Easy', notes: 'Pro-development. Streamlined process for industrial projects.' },
  { state: 'PA', agency: 'PA DEP', timeline: '12-18 months', difficulty: 'Hard', notes: 'Strict requirements. Lengthy public comment periods.' },
  { state: 'TX', agency: 'TCEQ', timeline: '6-12 months', difficulty: 'Moderate', notes: 'Large volume of permits. May face delays but generally pro-business.' },
  { state: 'VA', agency: 'VA DEQ', timeline: '9-15 months', difficulty: 'Moderate', notes: 'Data center friendly. PJM grid access.' },
  { state: 'GA', agency: 'GA EPD', timeline: '6-12 months', difficulty: 'Easy', notes: 'Business friendly. Fast permitting.' },
  { state: 'NJ', agency: 'NJ DEP', timeline: '12-24 months', difficulty: 'Very Hard', notes: 'Strict environmental regulations. Dense population = opposition.' },
  { state: 'IL', agency: 'IL EPA', timeline: '9-15 months', difficulty: 'Moderate', notes: 'Chicago region stricter. Downstate more accommodating.' },
];

const permitChecklist = [
  { step: 1, name: 'Determine attainment status', description: 'Check EPA database for area designation' },
  { step: 2, name: 'Calculate potential emissions', description: 'Engineering estimate of NOx, CO, PM, VOC' },
  { step: 3, name: 'Determine permit type required', description: 'Minor vs Synthetic Minor vs Major vs PSD' },
  { step: 4, name: 'Engage air permit consultant', description: 'Select experienced firm for state' },
  { step: 5, name: 'Pre-application meeting', description: 'Meet with state agency to discuss approach' },
  { step: 6, name: 'Prepare permit application', description: 'Draft application with all required data' },
  { step: 7, name: 'Submit application', description: 'File application with state agency' },
  { step: 8, name: 'Completeness review', description: 'Agency confirms application is complete' },
  { step: 9, name: 'Technical review', description: 'Agency reviews emissions calculations' },
  { step: 10, name: 'Draft permit issued', description: 'Agency issues draft permit for review' },
  { step: 11, name: 'Public comment period', description: 'If required, 30-45 day public comment' },
  { step: 12, name: 'Respond to comments', description: 'Address any public or agency concerns' },
  { step: 13, name: 'Final permit issued', description: 'Agency issues final air permit' },
  { step: 14, name: 'EPA review (if major)', description: 'EPA 45-day review period for major sources' },
  { step: 15, name: 'Permit effective', description: 'Permit becomes effective, construction can begin' },
];

type ChecklistStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked';

export default function AirPermitTab() {
  const [selectedPermitType, setSelectedPermitType] = useState<PermitType>('minor');
  const [selectedState, setSelectedState] = useState('OH');
  const [checklistItems, setChecklistItems] = useState<Record<number, { status: ChecklistStatus; date: string; cost: number; notes: string }>>(
    Object.fromEntries(permitChecklist.map(item => [item.step, { status: 'not_started', date: '', cost: 0, notes: '' }]))
  );

  const updateChecklist = (step: number, field: string, value: string | number) => {
    setChecklistItems({
      ...checklistItems,
      [step]: { ...checklistItems[step], [field]: value }
    });
  };

  const completedSteps = Object.values(checklistItems).filter(i => i.status === 'complete').length;
  const selectedStateInfo = stateNotes.find(s => s.state === selectedState);

  return (
    <div className="space-y-8">
      {/* Permit Type Selector */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-4">Permit Type for This Site</h2>
        <div className="flex gap-4">
          {permitTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedPermitType(type.id as PermitType)}
              className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                selectedPermitType === type.id
                  ? 'border-gold bg-gold/10'
                  : 'border-navy hover:border-gold/50'
              }`}
            >
              <p className="text-white font-medium">{type.name}</p>
              <p className="text-muted text-sm">{type.timeline}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Permit Type Comparison Table */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-4">Permit Type Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy">
                <th className="px-4 py-3 text-left text-muted font-medium text-sm">Attribute</th>
                {permitTypes.map((type) => (
                  <th 
                    key={type.id} 
                    className={`px-4 py-3 text-left text-sm font-medium ${
                      selectedPermitType === type.id ? 'text-gold bg-gold/5' : 'text-muted'
                    }`}
                  >
                    {type.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/50">
              <tr>
                <td className="px-4 py-3 text-muted">Timeline</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${selectedPermitType === type.id ? 'bg-gold/5' : ''}`}>
                    {type.timeline}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted">Cost</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${selectedPermitType === type.id ? 'bg-gold/5' : ''}`}>
                    {type.cost}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted">Public Comment</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${selectedPermitType === type.id ? 'bg-gold/5' : ''}`}>
                    {type.publicComment}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted">EPA Involvement</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${selectedPermitType === type.id ? 'bg-gold/5' : ''}`}>
                    {type.epaInvolvement}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-muted">BACT/LAER Required</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${selectedPermitType === type.id ? 'bg-gold/5' : ''}`}>
                    {type.bactRequired}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* State Notes */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif text-white">State-Specific Information</h2>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-navy border border-navy-card text-white px-4 py-2 rounded-lg focus:border-gold outline-none"
          >
            {stateNotes.map((s) => (
              <option key={s.state} value={s.state}>{s.state}</option>
            ))}
          </select>
        </div>
        {selectedStateInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-navy/50 rounded-lg">
              <p className="text-muted text-sm">Agency</p>
              <p className="text-white font-medium">{selectedStateInfo.agency}</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-lg">
              <p className="text-muted text-sm">Typical Timeline</p>
              <p className="text-white font-medium">{selectedStateInfo.timeline}</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-lg">
              <p className="text-muted text-sm">Difficulty</p>
              <p className={`font-medium ${
                selectedStateInfo.difficulty === 'Easy' ? 'text-success' :
                selectedStateInfo.difficulty === 'Moderate' ? 'text-warning' :
                'text-danger'
              }`}>{selectedStateInfo.difficulty}</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-lg col-span-2 md:col-span-1">
              <p className="text-muted text-sm">Notes</p>
              <p className="text-white text-sm">{selectedStateInfo.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Permit Pathway Checklist */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-white">Permit Pathway Checklist</h2>
            <p className="text-muted text-sm">{completedSteps} of {permitChecklist.length} steps complete</p>
          </div>
          <div className="w-32 bg-navy rounded-full h-2">
            <div 
              className="bg-gold h-2 rounded-full transition-all"
              style={{ width: `${(completedSteps / permitChecklist.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="space-y-3">
          {permitChecklist.map((item) => (
            <div key={item.step} className="p-4 bg-navy/50 rounded-lg">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-gold font-medium flex-shrink-0">
                  {item.step}
                </span>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-muted text-sm">{item.description}</p>
                  </div>
                  <select
                    value={checklistItems[item.step].status}
                    onChange={(e) => updateChecklist(item.step, 'status', e.target.value)}
                    className={`bg-navy border rounded-lg px-3 py-2 text-sm focus:border-gold outline-none ${
                      checklistItems[item.step].status === 'complete' ? 'border-success text-success' :
                      checklistItems[item.step].status === 'in_progress' ? 'border-warning text-warning' :
                      checklistItems[item.step].status === 'blocked' ? 'border-danger text-danger' :
                      'border-navy-card text-muted'
                    }`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="complete">Complete</option>
                    <option value="blocked">Blocked</option>
                  </select>
                  <input
                    type="text"
                    value={checklistItems[item.step].notes}
                    onChange={(e) => updateChecklist(item.step, 'notes', e.target.value)}
                    placeholder="Notes..."
                    className="bg-navy border border-navy-card rounded-lg px-3 py-2 text-white text-sm focus:border-gold outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
