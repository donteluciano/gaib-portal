'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

// Master checklist items to create on site creation
const masterChecklist = [
  // Stage 1: Site Control (5 items)
  { stage: 1, item_key: 'site_identified', name: 'Site identification complete (parcel mapped, initial screening passed)' },
  { stage: 1, item_key: 'ownership_confirmed', name: 'Ownership confirmed (title search, owner identified)' },
  { stage: 1, item_key: 'option_drafted', name: 'Option/LOI drafted by attorney' },
  { stage: 1, item_key: 'option_executed', name: 'Option agreement executed and deposit paid' },
  { stage: 1, item_key: 'site_visit_complete', name: 'Preliminary site visit completed (photos, notes)' },
  // Stage 2: Gas & Power (7 items)
  { stage: 2, item_key: 'gas_transmission_identified', name: 'Gas transmission pipeline identified (operator, diameter, pressure)' },
  { stage: 2, item_key: 'gas_utility_contacted', name: 'Gas utility formally contacted' },
  { stage: 2, item_key: 'will_serve_requested', name: 'Will-serve or capacity letter requested' },
  { stage: 2, item_key: 'gas_study_commissioned', name: 'Gas supply study commissioned (third-party engineer)' },
  { stage: 2, item_key: 'gas_capacity_confirmed', name: 'Gas pressure and volume confirmed sufficient for target MW' },
  { stage: 2, item_key: 'electrical_assessed', name: 'Electrical interconnection assessed (grid backup/supplement)' },
  { stage: 2, item_key: 'gas_gate_decision', name: 'GATE 2 DECISION: Gas confirmed, proceed to Stage 3' },
  // Stage 3-7 abbreviated for brevity - same as before
  { stage: 3, item_key: 'phase_i_ordered', name: 'Phase I ESA ordered' },
  { stage: 3, item_key: 'phase_i_reviewed', name: 'Phase I results reviewed' },
  { stage: 3, item_key: 'phase_ii_complete', name: 'Phase II ESA complete (if needed, mark complete if not needed)' },
  { stage: 3, item_key: 'remediation_scoped', name: 'Remediation plan scoped (if needed, mark complete if not needed)' },
  { stage: 3, item_key: 'water_study_complete', name: 'Water availability study complete' },
  { stage: 3, item_key: 'water_rights_confirmed', name: 'Water rights confirmed' },
  { stage: 3, item_key: 'air_permit_scoped', name: 'Air permit pathway scoped (emissions modeling, regulatory path)' },
  { stage: 3, item_key: 'enviro_gate_decision', name: 'GATE 3 DECISION: Environmental clear, proceed to Stage 4' },
  { stage: 4, item_key: 'fiber_routes_assessed', name: 'Fiber routes assessed and mapped' },
  { stage: 4, item_key: 'telecom_contacted', name: 'Telecom providers contacted (2-3 providers)' },
  { stage: 4, item_key: 'fiber_cost_estimated', name: 'Last-mile fiber cost and timeline estimated' },
  { stage: 4, item_key: 'fiber_gate_decision', name: 'GATE 4 DECISION: Fiber path confirmed, proceed to Stage 5' },
  { stage: 5, item_key: 'municipal_contacted', name: 'Municipal officials contacted' },
  { stage: 5, item_key: 'zoning_confirmed', name: 'Zoning pathway confirmed' },
  { stage: 5, item_key: 'tax_incentives_explored', name: 'Tax incentives explored' },
  { stage: 5, item_key: 'community_engagement', name: 'Community engagement initiated' },
  { stage: 5, item_key: 'cba_drafted', name: 'Community benefit agreement drafted' },
  { stage: 5, item_key: 'political_support_documented', name: 'Political support documented' },
  { stage: 5, item_key: 'political_gate_decision', name: 'GATE 5 DECISION: Political alignment confirmed' },
  { stage: 6, item_key: 'dc_engineer_engaged', name: 'Data center engineer engaged' },
  { stage: 6, item_key: 'mw_capacity_confirmed', name: 'Deliverable MW capacity confirmed' },
  { stage: 6, item_key: 'cooling_assessed', name: 'Cooling approach assessed' },
  { stage: 6, item_key: 'structures_evaluated', name: 'Existing structures evaluated' },
  { stage: 6, item_key: 'equipment_quotes', name: 'Equipment budgetary quotes obtained' },
  { stage: 6, item_key: 'air_permit_confirmed', name: 'Air permit timeline confirmed' },
  { stage: 6, item_key: 'engineering_gate_decision', name: 'GATE 6 DECISION: Engineering confirmed' },
  { stage: 7, item_key: 'certainty_package', name: 'Certainty package assembled' },
  { stage: 7, item_key: 'financial_model', name: 'Institutional-grade financial model built' },
  { stage: 7, item_key: 'marketing_materials', name: 'Marketing materials prepared' },
  { stage: 7, item_key: 'buyer_outreach', name: 'Buyer outreach initiated' },
  { stage: 7, item_key: 'loi_received', name: 'LOI or term sheet received' },
  { stage: 7, item_key: 'buyer_diligence', name: 'Buyer due diligence facilitated' },
  { stage: 7, item_key: 'transaction_docs', name: 'Transaction documents executed' },
  { stage: 7, item_key: 'closing', name: 'Transaction closed' },
  { stage: 7, item_key: 'capital_returned', name: 'Capital returned to LPs' },
];

// Tooltips for technical fields
const fieldTooltips: Record<string, string> = {
  gasVolume: 'MCFD = Thousand Cubic Feet per Day. Typical data centers need 10,000-50,000 MCFD.',
  gasPressure: 'PSI = Pounds per Square Inch. Higher pressure (500+) allows more efficient generation.',
  acreage: 'Total developable land area. 20+ acres preferred for large-scale data centers.',
  exitPricePerMW: 'Expected sale price per megawatt of capacity. Market range: $0.25-0.50M/MW.',
  pipelineDistance: 'Distance to nearest gas transmission pipeline. Under 2 miles is ideal.',
  pipelineDiameter: 'Larger diameter (24"+) indicates more capacity available.',
  fiberDistance: 'Distance to nearest fiber Point of Interconnect. Under 5 miles preferred.',
};

// Validation rules
const validationRules = {
  acreage: { min: 0, max: 10000, message: 'Acreage must be between 0 and 10,000' },
  askingPrice: { min: 0, max: 1000000000, message: 'Price seems unreasonable' },
  gasVolume: { min: 0, max: 500000, message: 'Gas volume must be between 0 and 500,000 MCFD' },
  gasPressure: { min: 0, max: 2000, message: 'Gas pressure must be between 0 and 2,000 PSI' },
  pipelineDistance: { min: 0, max: 100, message: 'Pipeline distance must be between 0 and 100 miles' },
  fiberDistance: { min: 0, max: 100, message: 'Fiber distance must be between 0 and 100 miles' },
  exitPricePerMW: { min: 0, max: 10, message: 'Exit price must be between 0 and $10M/MW' },
};

const DRAFT_KEY = 'gaib-new-site-draft';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div style={{ backgroundColor: '#1A3050', borderRadius: '8px', border: '1px solid #2A4060', marginBottom: '16px', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          padding: '16px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: isOpen ? '#0A1628' : '#1A3050',
          border: 'none',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid #2A4060' : 'none'
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>{title}</h2>
        <span style={{ fontSize: '20px', color: '#9CA3AF' }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// Tooltip component
function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative cursor-help ml-1 inline-block">
      <InformationCircleIcon className="w-4 h-4 text-gray-400 inline" />
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        {text}
      </span>
    </span>
  );
}

export default function NewSitePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const [form, setForm] = useState({
    // Site Info
    name: '',
    city: '',
    state: '',
    county: '',
    acreage: '',
    askingPrice: '',
    existingStructures: 'none',
    structureValue: '',
    demoCost: '',
    // Gas & Power
    pipelineDistance: '',
    pipelineDiameter: '',
    terrain: 'easy',
    gasVolume: '',
    gasPressure: '',
    powerStrategy: 'behind-the-meter',
    gridQueue: 'available',
    // Water & Environmental
    coolingType: 'air',
    waterSource: 'municipal',
    phaseIStatus: 'not_conducted',
    airQualityZone: 'attainment',
    // Permitting & Regulatory
    airPermitPathway: 'identified',
    permitType: 'minor',
    existingPermits: 'none',
    depRelationship: 'neutral',
    // Fiber & Access
    fiberDistance: '',
    fiberType: 'lit',
    floodZone: 'no',
    railAccess: 'no',
    airportProximity: 'moderate',
    // Political & Community
    politicalClimate: 'neutral',
    zoning: 'by-right',
    communityOpposition: 'none',
    propertyTaxRate: '',
    pilotAvailable: 'maybe',
    // Buyer Market
    competingSites: 'some',
    cloudProximity: 'moderate',
    dcActivity: 'emerging',
    laborMarket: 'moderate',
    // Legal & Title
    titleComplexity: 'clean',
    easementIssues: 'none',
    adjacentConflict: 'no',
    eminentDomainRisk: 'no',
    // Exit Assumptions
    exitPricePerMW: '0.3',
    // Notes
    notes: '',
  });

  // Load draft from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setForm(parsed.form);
        setHasDraft(true);
      } catch (e) {
        // Invalid draft, ignore
      }
    }
  }, []);

  // Autosave to localStorage
  const saveDraft = useCallback(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, savedAt: new Date().toISOString() }));
    setLastSaved(new Date());
    setHasDraft(true);
  }, [form]);

  // Debounced autosave
  useEffect(() => {
    const timer = setTimeout(saveDraft, 1000);
    return () => clearTimeout(timer);
  }, [form, saveDraft]);

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
    setForm({
      name: '', city: '', state: '', county: '', acreage: '', askingPrice: '',
      existingStructures: 'none', structureValue: '', demoCost: '',
      pipelineDistance: '', pipelineDiameter: '', terrain: 'easy', gasVolume: '',
      gasPressure: '', powerStrategy: 'behind-the-meter', gridQueue: 'available',
      coolingType: 'air', waterSource: 'municipal', phaseIStatus: 'not_conducted',
      airQualityZone: 'attainment', airPermitPathway: 'identified', permitType: 'minor',
      existingPermits: 'none', depRelationship: 'neutral', fiberDistance: '',
      fiberType: 'lit', floodZone: 'no', railAccess: 'no', airportProximity: 'moderate',
      politicalClimate: 'neutral', zoning: 'by-right', communityOpposition: 'none',
      propertyTaxRate: '', pilotAvailable: 'maybe', competingSites: 'some',
      cloudProximity: 'moderate', dcActivity: 'emerging', laborMarket: 'moderate',
      titleComplexity: 'clean', easementIssues: 'none', adjacentConflict: 'no',
      eminentDomainRisk: 'no', exitPricePerMW: '0.3', notes: '',
    });
  };

  // Validation function
  const validateField = (field: string, value: string): string | null => {
    const rule = validationRules[field as keyof typeof validationRules];
    if (!rule) return null;
    
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    if (num < rule.min || num > rule.max) return rule.message;
    return null;
  };

  const updateForm = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    
    // Validate
    const error = validateField(field, value);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setValidationErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      setError('Site name is required');
      return;
    }

    // Check for validation errors
    if (Object.keys(validationErrors).length > 0) {
      setError('Please fix validation errors before submitting');
      return;
    }

    setSaving(true);
    setError('');

    // Prepare inputs object
    const inputs = {
      acreage: parseFloat(form.acreage) || 0,
      askingPrice: parseFloat(form.askingPrice) || 0,
      existingStructures: form.existingStructures,
      structureValue: parseFloat(form.structureValue) || 0,
      demoCost: parseFloat(form.demoCost) || 0,
      pipelineDistance: parseFloat(form.pipelineDistance) || 0,
      pipelineDiameter: parseFloat(form.pipelineDiameter) || 0,
      terrain: form.terrain,
      gasVolume: parseFloat(form.gasVolume) || 0,
      gasPressure: parseFloat(form.gasPressure) || 0,
      powerStrategy: form.powerStrategy,
      gridQueue: form.gridQueue,
      coolingType: form.coolingType,
      waterSource: form.waterSource,
      phaseIStatus: form.phaseIStatus,
      airQualityZone: form.airQualityZone,
      airPermitPathway: form.airPermitPathway,
      permitType: form.permitType,
      existingPermits: form.existingPermits,
      depRelationship: form.depRelationship,
      fiberDistance: parseFloat(form.fiberDistance) || 0,
      fiberType: form.fiberType,
      floodZone: form.floodZone,
      railAccess: form.railAccess,
      airportProximity: form.airportProximity,
      politicalClimate: form.politicalClimate,
      zoning: form.zoning,
      communityOpposition: form.communityOpposition,
      propertyTaxRate: parseFloat(form.propertyTaxRate) || 0,
      pilotAvailable: form.pilotAvailable,
      competingSites: form.competingSites,
      cloudProximity: form.cloudProximity,
      dcActivity: form.dcActivity,
      laborMarket: form.laborMarket,
      titleComplexity: form.titleComplexity,
      easementIssues: form.easementIssues,
      adjacentConflict: form.adjacentConflict,
      eminentDomainRisk: form.eminentDomainRisk,
      exitPricePerMW: parseFloat(form.exitPricePerMW) || 0.3,
    };

    const { data, error: dbError } = await supabase
      .from('sites')
      .insert({
        name: form.name,
        city: form.city,
        state: form.state,
        county: form.county,
        stage: 1,
        status: 'active',
        inputs,
        notes: form.notes,
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    // Create initial activity
    await supabase.from('activities').insert({
      site_id: data.id,
      date: new Date().toISOString().split('T')[0],
      action: 'Site created',
      stage: 1,
    });

    // Create checklist items
    const checklistItems = masterChecklist.map(item => ({
      site_id: data.id,
      stage: item.stage,
      item_key: item.item_key,
      status: 'not_started',
    }));

    await supabase.from('checklist_items').insert(checklistItems);

    // Clear draft on success
    localStorage.removeItem(DRAFT_KEY);

    router.push(`/portal/sites/${data.id}`);
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #1A3050',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#FFFFFF',
    backgroundColor: '#0A1628',
    boxSizing: 'border-box' as const,
  };

  const inputErrorStyle = {
    ...inputStyle,
    borderColor: '#ef4444',
  };

  const selectStyle = { ...inputStyle, cursor: 'pointer' };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 500,
    color: '#9CA3AF',
    marginBottom: '6px',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#FFFFFF' }}>New Site</h1>
        {hasDraft && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
              Draft saved {lastSaved ? lastSaved.toLocaleTimeString() : ''}
            </span>
            <button
              type="button"
              onClick={clearDraft}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                color: '#dc2626',
                background: 'none',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear Draft
            </button>
          </div>
        )}
      </div>
      <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '24px' }}>
        Enter all available information. Form auto-saves as you type.
      </p>

      {error && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '6px', color: '#fecaca', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Site Info */}
        <CollapsibleSection title="Site Information" defaultOpen={true}>
          <div style={gridStyle}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Site Name *</label>
              <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} style={inputStyle} placeholder="e.g., Site Alpha" />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input type="text" value={form.city} onChange={(e) => updateForm('city', e.target.value)} style={inputStyle} placeholder="Springfield" />
            </div>
            <div>
              <label style={labelStyle}>State</label>
              <input type="text" value={form.state} onChange={(e) => updateForm('state', e.target.value)} style={inputStyle} placeholder="OH" maxLength={2} />
            </div>
            <div>
              <label style={labelStyle}>County</label>
              <input type="text" value={form.county} onChange={(e) => updateForm('county', e.target.value)} style={inputStyle} placeholder="Clark" />
            </div>
            <div>
              <label style={labelStyle}>
                Acreage
                {fieldTooltips.acreage && <Tooltip text={fieldTooltips.acreage} />}
              </label>
              <input 
                type="number" 
                step="0.1" 
                min="0"
                value={form.acreage} 
                onChange={(e) => updateForm('acreage', e.target.value)} 
                style={validationErrors.acreage ? inputErrorStyle : inputStyle} 
                placeholder="25" 
              />
              {validationErrors.acreage && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{validationErrors.acreage}</p>}
            </div>
            <div>
              <label style={labelStyle}>Asking Price ($)</label>
              <input 
                type="number" 
                min="0"
                value={form.askingPrice} 
                onChange={(e) => updateForm('askingPrice', e.target.value)} 
                style={validationErrors.askingPrice ? inputErrorStyle : inputStyle} 
                placeholder="1500000" 
              />
              {validationErrors.askingPrice && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{validationErrors.askingPrice}</p>}
            </div>
            <div>
              <label style={labelStyle}>Existing Structures</label>
              <select value={form.existingStructures} onChange={(e) => updateForm('existingStructures', e.target.value)} style={selectStyle}>
                <option value="usable">Usable</option>
                <option value="none">None</option>
                <option value="demolish">Demolish</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Structure Value ($)</label>
              <input type="number" min="0" value={form.structureValue} onChange={(e) => updateForm('structureValue', e.target.value)} style={inputStyle} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Demo Cost ($)</label>
              <input type="number" min="0" value={form.demoCost} onChange={(e) => updateForm('demoCost', e.target.value)} style={inputStyle} placeholder="0" />
            </div>
          </div>
        </CollapsibleSection>

        {/* Gas & Power */}
        <CollapsibleSection title="Gas & Power">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>
                Pipeline Distance (miles)
                {fieldTooltips.pipelineDistance && <Tooltip text={fieldTooltips.pipelineDistance} />}
              </label>
              <input type="number" step="0.1" min="0" value={form.pipelineDistance} onChange={(e) => updateForm('pipelineDistance', e.target.value)} style={validationErrors.pipelineDistance ? inputErrorStyle : inputStyle} placeholder="2" />
              {validationErrors.pipelineDistance && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{validationErrors.pipelineDistance}</p>}
            </div>
            <div>
              <label style={labelStyle}>
                Pipeline Diameter (inches)
                {fieldTooltips.pipelineDiameter && <Tooltip text={fieldTooltips.pipelineDiameter} />}
              </label>
              <input type="number" min="0" value={form.pipelineDiameter} onChange={(e) => updateForm('pipelineDiameter', e.target.value)} style={inputStyle} placeholder="24" />
            </div>
            <div>
              <label style={labelStyle}>Terrain Difficulty</label>
              <select value={form.terrain} onChange={(e) => updateForm('terrain', e.target.value)} style={selectStyle}>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                Gas Volume (MCFD)
                {fieldTooltips.gasVolume && <Tooltip text={fieldTooltips.gasVolume} />}
              </label>
              <input type="number" min="0" value={form.gasVolume} onChange={(e) => updateForm('gasVolume', e.target.value)} style={validationErrors.gasVolume ? inputErrorStyle : inputStyle} placeholder="14400" />
              {validationErrors.gasVolume && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{validationErrors.gasVolume}</p>}
            </div>
            <div>
              <label style={labelStyle}>
                Gas Pressure (PSI)
                {fieldTooltips.gasPressure && <Tooltip text={fieldTooltips.gasPressure} />}
              </label>
              <input type="number" min="0" value={form.gasPressure} onChange={(e) => updateForm('gasPressure', e.target.value)} style={validationErrors.gasPressure ? inputErrorStyle : inputStyle} placeholder="600" />
              {validationErrors.gasPressure && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{validationErrors.gasPressure}</p>}
            </div>
            <div>
              <label style={labelStyle}>Power Strategy</label>
              <select value={form.powerStrategy} onChange={(e) => updateForm('powerStrategy', e.target.value)} style={selectStyle}>
                <option value="behind-the-meter">Behind-the-Meter</option>
                <option value="grid">Grid</option>
                <option value="dual">Dual</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Grid Queue Status</label>
              <select value={form.gridQueue} onChange={(e) => updateForm('gridQueue', e.target.value)} style={selectStyle}>
                <option value="available">Available</option>
                <option value="moderate">Moderate</option>
                <option value="congested">Congested</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Water & Environmental */}
        <CollapsibleSection title="Water & Environmental">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Cooling Type</label>
              <select value={form.coolingType} onChange={(e) => updateForm('coolingType', e.target.value)} style={selectStyle}>
                <option value="air">Air-cooled</option>
                <option value="hybrid">Hybrid</option>
                <option value="evaporative">Evaporative</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Water Source</label>
              <select value={form.waterSource} onChange={(e) => updateForm('waterSource', e.target.value)} style={selectStyle}>
                <option value="municipal">Municipal</option>
                <option value="well">Well</option>
                <option value="surface">Surface</option>
                <option value="contested">Contested</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Phase I ESA Status</label>
              <select value={form.phaseIStatus} onChange={(e) => updateForm('phaseIStatus', e.target.value)} style={selectStyle}>
                <option value="clean">Clean</option>
                <option value="flagged">Flagged</option>
                <option value="not_conducted">Not Conducted</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Air Quality Zone</label>
              <select value={form.airQualityZone} onChange={(e) => updateForm('airQualityZone', e.target.value)} style={selectStyle}>
                <option value="attainment">Attainment</option>
                <option value="marginal">Marginal</option>
                <option value="non-attainment">Non-Attainment</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Permitting, Fiber, Political sections - abbreviated for space */}
        <CollapsibleSection title="Permitting & Regulatory">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Air Permit Pathway</label>
              <select value={form.airPermitPathway} onChange={(e) => updateForm('airPermitPathway', e.target.value)} style={selectStyle}>
                <option value="identified">Identified</option>
                <option value="not_identified">Not Identified</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Permit Type Required</label>
              <select value={form.permitType} onChange={(e) => updateForm('permitType', e.target.value)} style={selectStyle}>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="PSD">PSD</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Existing Permits</label>
              <select value={form.existingPermits} onChange={(e) => updateForm('existingPermits', e.target.value)} style={selectStyle}>
                <option value="transferable">Transferable</option>
                <option value="partial">Partial</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>State DEP Relationship</label>
              <select value={form.depRelationship} onChange={(e) => updateForm('depRelationship', e.target.value)} style={selectStyle}>
                <option value="cooperative">Cooperative</option>
                <option value="neutral">Neutral</option>
                <option value="adversarial">Adversarial</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Fiber & Access">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>
                Fiber Distance (miles)
                {fieldTooltips.fiberDistance && <Tooltip text={fieldTooltips.fiberDistance} />}
              </label>
              <input type="number" step="0.1" min="0" value={form.fiberDistance} onChange={(e) => updateForm('fiberDistance', e.target.value)} style={validationErrors.fiberDistance ? inputErrorStyle : inputStyle} placeholder="2" />
            </div>
            <div>
              <label style={labelStyle}>Fiber Type</label>
              <select value={form.fiberType} onChange={(e) => updateForm('fiberType', e.target.value)} style={selectStyle}>
                <option value="lit">Lit</option>
                <option value="dark">Dark</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Flood Zone</label>
              <select value={form.floodZone} onChange={(e) => updateForm('floodZone', e.target.value)} style={selectStyle}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Political & Community">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Political Climate</label>
              <select value={form.politicalClimate} onChange={(e) => updateForm('politicalClimate', e.target.value)} style={selectStyle}>
                <option value="receptive">Receptive</option>
                <option value="neutral">Neutral</option>
                <option value="unknown">Unknown</option>
                <option value="hostile">Hostile</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Zoning</label>
              <select value={form.zoning} onChange={(e) => updateForm('zoning', e.target.value)} style={selectStyle}>
                <option value="by-right">By-Right</option>
                <option value="variance_needed">Variance Needed</option>
                <option value="rezoning_needed">Rezoning Needed</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Community Opposition</label>
              <select value={form.communityOpposition} onChange={(e) => updateForm('communityOpposition', e.target.value)} style={selectStyle}>
                <option value="none">None</option>
                <option value="some">Some</option>
                <option value="organized">Organized</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>PILOT Available</label>
              <select value={form.pilotAvailable} onChange={(e) => updateForm('pilotAvailable', e.target.value)} style={selectStyle}>
                <option value="yes">Yes</option>
                <option value="maybe">Maybe</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Exit Assumptions">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>
                Exit Price per MW ($M)
                {fieldTooltips.exitPricePerMW && <Tooltip text={fieldTooltips.exitPricePerMW} />}
              </label>
              <input type="number" step="0.01" min="0" value={form.exitPricePerMW} onChange={(e) => updateForm('exitPricePerMW', e.target.value)} style={validationErrors.exitPricePerMW ? inputErrorStyle : inputStyle} placeholder="0.3" />
              {validationErrors.exitPricePerMW && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{validationErrors.exitPricePerMW}</p>}
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => updateForm('notes', e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Initial observations, key risks, next steps..."
          />
        </CollapsibleSection>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            type="submit"
            disabled={saving || Object.keys(validationErrors).length > 0}
            style={{
              padding: '10px 24px',
              backgroundColor: Object.keys(validationErrors).length > 0 ? '#9ca3af' : '#B8965A',
              color: '#0A1628',
              fontWeight: 500,
              fontSize: '14px',
              border: 'none',
              borderRadius: '6px',
              cursor: saving || Object.keys(validationErrors).length > 0 ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Creating Site...' : 'Create Site'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/portal/dashboard')}
            style={{
              padding: '10px 24px',
              backgroundColor: '#1A3050',
              color: '#FFFFFF',
              fontWeight: 500,
              fontSize: '14px',
              border: '1px solid #2A4060',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
