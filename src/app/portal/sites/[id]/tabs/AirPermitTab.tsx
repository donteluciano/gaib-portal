'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

type PermitType = 'minor' | 'synthetic_minor' | 'major' | 'psd';
type ChecklistStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked';

const permitTypes = [
  { id: 'minor', name: 'Minor Source', timeline: '3-6 months', cost: '$15-50K', publicComment: 'None', epaInvolvement: 'None', bactRequired: 'No', riskLevel: 'low' },
  { id: 'synthetic_minor', name: 'Synthetic Minor', timeline: '6-12 months', cost: '$50-150K', publicComment: 'Sometimes', epaInvolvement: 'Limited', bactRequired: 'No', riskLevel: 'medium' },
  { id: 'major', name: 'Major Source (Title V)', timeline: '12-18 months', cost: '$150-500K', publicComment: 'Required', epaInvolvement: 'Review', bactRequired: 'Yes (BACT)', riskLevel: 'high' },
  { id: 'psd', name: 'PSD (Attainment)', timeline: '18-24+ months', cost: '$500K-2M+', publicComment: 'Required', epaInvolvement: 'Full', bactRequired: 'Yes (BACT/LAER)', riskLevel: 'very_high' },
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

interface Props {
  siteId: string;
}

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
    permit_type: 'minor',
    state: 'OH',
    consultant: '',
    consultant_contact: '',
    application_date: '',
    expected_approval: '',
    notes: '',
    checklist: Object.fromEntries(permitChecklist.map(item => [item.step, { status: 'not_started' as ChecklistStatus, notes: '' }])),
  });
  const [dbId, setDbId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load from Supabase (stored in site inputs or a dedicated table)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: siteData } = await supabase
        .from('sites')
        .select('inputs')
        .eq('id', siteId)
        .single();

      if (siteData?.inputs?.airPermitData) {
        setData(siteData.inputs.airPermitData);
      }
      setLoading(false);
    };

    loadData();
  }, [siteId]);

  // Save to Supabase
  const saveData = useCallback(async (newData: AirPermitData) => {
    setSaving(true);
    
    // Get current inputs
    const { data: siteData } = await supabase
      .from('sites')
      .select('inputs')
      .eq('id', siteId)
      .single();

    const currentInputs = siteData?.inputs || {};
    
    await supabase
      .from('sites')
      .update({
        inputs: { ...currentInputs, airPermitData: newData },
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId);

    setSaving(false);
  }, [siteId]);

  const updateData = (field: string, value: string | Record<number, { status: ChecklistStatus; notes: string }>) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    setTimeout(() => saveData(newData), 500);
  };

  const updateChecklist = (step: number, field: string, value: string) => {
    const newChecklist = {
      ...data.checklist,
      [step]: { ...data.checklist[step], [field]: value }
    };
    updateData('checklist', newChecklist);
  };

  const completedSteps = Object.values(data.checklist).filter(i => i.status === 'complete').length;
  const selectedStateInfo = stateNotes.find(s => s.state === data.state);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading air permit data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Save indicator */}
      {saving && (
        <div className="text-right text-sm text-gold">Saving...</div>
      )}

      {/* Permit Configuration */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-4">Permit Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
              Permit Type
              <span className="group relative cursor-help">
                <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-navy text-xs text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  Select based on expected emissions. Minor &lt;100 tpy, Major &gt;100 tpy threshold pollutant.
                </span>
              </span>
            </label>
            <select
              value={data.permit_type}
              onChange={(e) => updateData('permit_type', e.target.value)}
              className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
            >
              {permitTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">State</label>
            <select
              value={data.state}
              onChange={(e) => updateData('state', e.target.value)}
              className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
            >
              {stateNotes.map(s => (
                <option key={s.state} value={s.state}>{s.state} - {s.agency}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Consultant</label>
            <input
              type="text"
              value={data.consultant}
              onChange={(e) => updateData('consultant', e.target.value)}
              placeholder="Firm name"
              className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Consultant Contact</label>
            <input
              type="text"
              value={data.consultant_contact}
              onChange={(e) => updateData('consultant_contact', e.target.value)}
              placeholder="Name, email, phone"
              className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Application Date</label>
            <input
              type="date"
              value={data.application_date}
              onChange={(e) => updateData('application_date', e.target.value)}
              className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Expected Approval</label>
            <input
              type="date"
              value={data.expected_approval}
              onChange={(e) => updateData('expected_approval', e.target.value)}
              className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
            />
          </div>
        </div>
      </div>

      {/* Permit Type Comparison Table */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-4">Permit Type Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy">
                <th className="px-4 py-3 text-left text-gray-400 font-medium text-sm">Attribute</th>
                {permitTypes.map((type) => (
                  <th 
                    key={type.id} 
                    className={`px-4 py-3 text-left text-sm font-medium ${
                      data.permit_type === type.id ? 'text-gold bg-gold/5' : 'text-gray-400'
                    }`}
                  >
                    {type.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/50">
              <tr>
                <td className="px-4 py-3 text-gray-400">Timeline</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${data.permit_type === type.id ? 'bg-gold/5' : ''}`}>
                    {type.timeline}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-400">Cost</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${data.permit_type === type.id ? 'bg-gold/5' : ''}`}>
                    {type.cost}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-400">Public Comment</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${data.permit_type === type.id ? 'bg-gold/5' : ''}`}>
                    {type.publicComment}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-400">EPA Involvement</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${data.permit_type === type.id ? 'bg-gold/5' : ''}`}>
                    {type.epaInvolvement}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-gray-400">BACT/LAER Required</td>
                {permitTypes.map((type) => (
                  <td key={type.id} className={`px-4 py-3 text-white ${data.permit_type === type.id ? 'bg-gold/5' : ''}`}>
                    {type.bactRequired}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* State Notes */}
      {selectedStateInfo && (
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <h2 className="text-xl font-serif text-white mb-4">State-Specific Information: {selectedStateInfo.state}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-navy/50 rounded-lg">
              <p className="text-gray-400 text-sm">Agency</p>
              <p className="text-white font-medium">{selectedStateInfo.agency}</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-lg">
              <p className="text-gray-400 text-sm">Typical Timeline</p>
              <p className="text-white font-medium">{selectedStateInfo.timeline}</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-lg">
              <p className="text-gray-400 text-sm">Difficulty</p>
              <p className={`font-medium ${
                selectedStateInfo.difficulty === 'Easy' ? 'text-success' :
                selectedStateInfo.difficulty === 'Moderate' ? 'text-warning' :
                'text-danger'
              }`}>{selectedStateInfo.difficulty}</p>
            </div>
            <div className="p-4 bg-navy/50 rounded-lg col-span-2 md:col-span-1">
              <p className="text-gray-400 text-sm">Notes</p>
              <p className="text-white text-sm">{selectedStateInfo.notes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Permit Pathway Checklist */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-white">Permit Pathway Checklist</h2>
            <p className="text-gray-400 text-sm">{completedSteps} of {permitChecklist.length} steps complete</p>
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
                    <p className="text-gray-400 text-sm">{item.description}</p>
                  </div>
                  <select
                    value={data.checklist[item.step]?.status || 'not_started'}
                    onChange={(e) => updateChecklist(item.step, 'status', e.target.value)}
                    className={`bg-navy border rounded-lg px-3 py-2 text-sm focus:border-gold outline-none ${
                      data.checklist[item.step]?.status === 'complete' ? 'border-success text-success' :
                      data.checklist[item.step]?.status === 'in_progress' ? 'border-warning text-warning' :
                      data.checklist[item.step]?.status === 'blocked' ? 'border-danger text-danger' :
                      'border-navy-card text-gray-400'
                    }`}
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="complete">Complete</option>
                    <option value="blocked">Blocked</option>
                  </select>
                  <input
                    type="text"
                    value={data.checklist[item.step]?.notes || ''}
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

      {/* Notes */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-4">Additional Notes</h2>
        <textarea
          value={data.notes}
          onChange={(e) => updateData('notes', e.target.value)}
          rows={4}
          placeholder="Key concerns, communications, timeline updates..."
          className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none resize-none"
        />
      </div>
    </div>
  );
}
