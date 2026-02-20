'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

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
  // Stage 3: Water & Environmental (8 items)
  { stage: 3, item_key: 'phase_i_ordered', name: 'Phase I ESA ordered' },
  { stage: 3, item_key: 'phase_i_reviewed', name: 'Phase I results reviewed' },
  { stage: 3, item_key: 'phase_ii_complete', name: 'Phase II ESA complete (if needed, mark complete if not needed)' },
  { stage: 3, item_key: 'remediation_scoped', name: 'Remediation plan scoped (if needed, mark complete if not needed)' },
  { stage: 3, item_key: 'water_study_complete', name: 'Water availability study complete' },
  { stage: 3, item_key: 'water_rights_confirmed', name: 'Water rights confirmed' },
  { stage: 3, item_key: 'air_permit_scoped', name: 'Air permit pathway scoped (emissions modeling, regulatory path)' },
  { stage: 3, item_key: 'enviro_gate_decision', name: 'GATE 3 DECISION: Environmental clear, proceed to Stage 4' },
  // Stage 4: Fiber & Access (4 items)
  { stage: 4, item_key: 'fiber_routes_assessed', name: 'Fiber routes assessed and mapped' },
  { stage: 4, item_key: 'telecom_contacted', name: 'Telecom providers contacted (2-3 providers)' },
  { stage: 4, item_key: 'fiber_cost_estimated', name: 'Last-mile fiber cost and timeline estimated' },
  { stage: 4, item_key: 'fiber_gate_decision', name: 'GATE 4 DECISION: Fiber path confirmed, proceed to Stage 5' },
  // Stage 5: Political & Community (7 items)
  { stage: 5, item_key: 'municipal_contacted', name: 'Municipal officials contacted (mayor, council, planning, EDO)' },
  { stage: 5, item_key: 'zoning_confirmed', name: 'Zoning pathway confirmed (by-right, variance, or rezoning)' },
  { stage: 5, item_key: 'tax_incentives_explored', name: 'Tax incentives explored (PILOT, abatement, enterprise zone)' },
  { stage: 5, item_key: 'community_engagement', name: 'Community engagement initiated (public meetings, stakeholders)' },
  { stage: 5, item_key: 'cba_drafted', name: 'Community benefit agreement drafted' },
  { stage: 5, item_key: 'political_support_documented', name: 'Political support documented (letters, resolutions)' },
  { stage: 5, item_key: 'political_gate_decision', name: 'GATE 5 DECISION: Political alignment confirmed, proceed to Stage 6' },
  // Stage 6: Engineering & Feasibility (7 items)
  { stage: 6, item_key: 'dc_engineer_engaged', name: 'Data center engineer engaged' },
  { stage: 6, item_key: 'mw_capacity_confirmed', name: 'Deliverable MW capacity confirmed with engineering basis' },
  { stage: 6, item_key: 'cooling_assessed', name: 'Cooling approach assessed (water, air, or hybrid)' },
  { stage: 6, item_key: 'structures_evaluated', name: 'Existing structures evaluated (acquire vs demolish)' },
  { stage: 6, item_key: 'equipment_quotes', name: 'Equipment budgetary quotes obtained (turbines, switchgear)' },
  { stage: 6, item_key: 'air_permit_confirmed', name: 'Air permit timeline confirmed by engineering' },
  { stage: 6, item_key: 'engineering_gate_decision', name: 'GATE 6 DECISION: Engineering confirmed, proceed to Stage 7' },
  // Stage 7: Packaging & Exit (9 items)
  { stage: 7, item_key: 'certainty_package', name: 'Certainty package assembled (all studies, letters, permits)' },
  { stage: 7, item_key: 'financial_model', name: 'Institutional-grade financial model built' },
  { stage: 7, item_key: 'marketing_materials', name: 'Marketing materials and data room prepared' },
  { stage: 7, item_key: 'buyer_outreach', name: 'Buyer outreach initiated (developers, hyperscalers, funds)' },
  { stage: 7, item_key: 'loi_received', name: 'LOI or term sheet received from buyer' },
  { stage: 7, item_key: 'buyer_diligence', name: 'Buyer due diligence facilitated' },
  { stage: 7, item_key: 'transaction_docs', name: 'Transaction documents executed' },
  { stage: 7, item_key: 'closing', name: 'Transaction closed' },
  { stage: 7, item_key: 'capital_returned', name: 'Capital returned and profit distributed to LPs' },
];

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '16px', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          padding: '16px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: isOpen ? '#f9fafb' : 'white',
          border: 'none',
          cursor: 'pointer',
          borderBottom: isOpen ? '1px solid #e5e7eb' : 'none'
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: 0 }}>{title}</h2>
        <span style={{ fontSize: '20px', color: '#6b7280' }}>{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function NewSitePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    // Site Info
    name: '',
    city: '',
    state: '',
    county: '',
    acreage: '',
    askingPrice: '',
    existingStructures: 'none', // usable, none, demolish
    structureValue: '',
    demoCost: '',
    // Gas & Power
    pipelineDistance: '',
    pipelineDiameter: '',
    terrain: 'easy', // easy, moderate, difficult
    gasVolume: '',
    gasPressure: '',
    powerStrategy: 'behind-the-meter', // behind-the-meter, grid, dual
    gridQueue: 'available', // available, moderate, congested
    // Water & Environmental
    coolingType: 'air', // air, hybrid, evaporative
    waterSource: 'municipal', // municipal, well, surface, contested, none
    phaseIStatus: 'not_conducted', // clean, flagged, not_conducted
    airQualityZone: 'attainment', // attainment, marginal, non-attainment
    // Permitting & Regulatory
    airPermitPathway: 'identified', // identified, not_identified, denied
    permitType: 'minor', // minor, major, PSD
    existingPermits: 'none', // transferable, partial, none
    depRelationship: 'neutral', // cooperative, neutral, adversarial
    // Fiber & Access
    fiberDistance: '',
    fiberType: 'lit', // lit, dark, none
    floodZone: 'no', // yes, no
    railAccess: 'no', // yes, no
    airportProximity: 'moderate', // near, moderate, far
    // Political & Community
    politicalClimate: 'neutral', // receptive, neutral, unknown, hostile
    zoning: 'by-right', // by-right, variance_needed, rezoning_needed
    communityOpposition: 'none', // none, some, organized
    propertyTaxRate: '',
    pilotAvailable: 'maybe', // yes, maybe, no
    // Buyer Market
    competingSites: 'some', // few, some, many
    cloudProximity: 'moderate', // near, moderate, far
    dcActivity: 'emerging', // active, emerging, none
    laborMarket: 'moderate', // available, moderate, tight
    // Legal & Title
    titleComplexity: 'clean', // clean, minor_issues, complex
    easementIssues: 'none', // none, minor, major
    adjacentConflict: 'no', // yes, no
    eminentDomainRisk: 'no', // yes, no
    // Exit Assumptions
    exitPricePerMW: '0.3', // in millions
    // Notes
    notes: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      setError('Site name is required');
      return;
    }

    setSaving(true);
    setError('');

    // Prepare inputs object with all form fields
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

    // Create checklist items for the new site
    const checklistItems = masterChecklist.map(item => ({
      site_id: data.id,
      stage: item.stage,
      item_key: item.item_key,
      status: 'not_started',
    }));

    await supabase.from('checklist_items').insert(checklistItems);

    router.push(`/portal/sites/${data.id}`);
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: 'white',
    boxSizing: 'border-box' as const,
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>New Site</h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
        Enter all available information. All fields save to the site inputs for calculation.
      </p>

      {error && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '14px' }}>
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
              <input type="text" value={form.state} onChange={(e) => updateForm('state', e.target.value)} style={inputStyle} placeholder="OH" />
            </div>
            <div>
              <label style={labelStyle}>County</label>
              <input type="text" value={form.county} onChange={(e) => updateForm('county', e.target.value)} style={inputStyle} placeholder="Clark" />
            </div>
            <div>
              <label style={labelStyle}>Acreage</label>
              <input type="number" step="0.1" value={form.acreage} onChange={(e) => updateForm('acreage', e.target.value)} style={inputStyle} placeholder="25" />
            </div>
            <div>
              <label style={labelStyle}>Asking Price ($)</label>
              <input type="number" value={form.askingPrice} onChange={(e) => updateForm('askingPrice', e.target.value)} style={inputStyle} placeholder="1500000" />
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
              <input type="number" value={form.structureValue} onChange={(e) => updateForm('structureValue', e.target.value)} style={inputStyle} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Demo Cost ($)</label>
              <input type="number" value={form.demoCost} onChange={(e) => updateForm('demoCost', e.target.value)} style={inputStyle} placeholder="0" />
            </div>
          </div>
        </CollapsibleSection>

        {/* Gas & Power */}
        <CollapsibleSection title="Gas & Power">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Pipeline Distance (miles)</label>
              <input type="number" step="0.1" value={form.pipelineDistance} onChange={(e) => updateForm('pipelineDistance', e.target.value)} style={inputStyle} placeholder="2" />
            </div>
            <div>
              <label style={labelStyle}>Pipeline Diameter (inches)</label>
              <input type="number" value={form.pipelineDiameter} onChange={(e) => updateForm('pipelineDiameter', e.target.value)} style={inputStyle} placeholder="24" />
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
              <label style={labelStyle}>Gas Volume (MCFD)</label>
              <input type="number" value={form.gasVolume} onChange={(e) => updateForm('gasVolume', e.target.value)} style={inputStyle} placeholder="14400" />
            </div>
            <div>
              <label style={labelStyle}>Gas Pressure (PSI)</label>
              <input type="number" value={form.gasPressure} onChange={(e) => updateForm('gasPressure', e.target.value)} style={inputStyle} placeholder="600" />
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

        {/* Permitting & Regulatory */}
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

        {/* Fiber & Access */}
        <CollapsibleSection title="Fiber & Access">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Fiber Distance (miles)</label>
              <input type="number" step="0.1" value={form.fiberDistance} onChange={(e) => updateForm('fiberDistance', e.target.value)} style={inputStyle} placeholder="2" />
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
            <div>
              <label style={labelStyle}>Rail Access</label>
              <select value={form.railAccess} onChange={(e) => updateForm('railAccess', e.target.value)} style={selectStyle}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Airport Proximity</label>
              <select value={form.airportProximity} onChange={(e) => updateForm('airportProximity', e.target.value)} style={selectStyle}>
                <option value="near">Near</option>
                <option value="moderate">Moderate</option>
                <option value="far">Far</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Political & Community */}
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
              <label style={labelStyle}>Property Tax Rate (%)</label>
              <input type="number" step="0.01" value={form.propertyTaxRate} onChange={(e) => updateForm('propertyTaxRate', e.target.value)} style={inputStyle} placeholder="2.5" />
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

        {/* Buyer Market */}
        <CollapsibleSection title="Buyer Market">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Competing Sites</label>
              <select value={form.competingSites} onChange={(e) => updateForm('competingSites', e.target.value)} style={selectStyle}>
                <option value="few">Few</option>
                <option value="some">Some</option>
                <option value="many">Many</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Cloud Proximity</label>
              <select value={form.cloudProximity} onChange={(e) => updateForm('cloudProximity', e.target.value)} style={selectStyle}>
                <option value="near">Near</option>
                <option value="moderate">Moderate</option>
                <option value="far">Far</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>DC Activity</label>
              <select value={form.dcActivity} onChange={(e) => updateForm('dcActivity', e.target.value)} style={selectStyle}>
                <option value="active">Active</option>
                <option value="emerging">Emerging</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Construction Labor Market</label>
              <select value={form.laborMarket} onChange={(e) => updateForm('laborMarket', e.target.value)} style={selectStyle}>
                <option value="available">Available</option>
                <option value="moderate">Moderate</option>
                <option value="tight">Tight</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Legal & Title */}
        <CollapsibleSection title="Legal & Title">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Title Complexity</label>
              <select value={form.titleComplexity} onChange={(e) => updateForm('titleComplexity', e.target.value)} style={selectStyle}>
                <option value="clean">Clean</option>
                <option value="minor_issues">Minor Issues</option>
                <option value="complex">Complex</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Easement Issues</label>
              <select value={form.easementIssues} onChange={(e) => updateForm('easementIssues', e.target.value)} style={selectStyle}>
                <option value="none">None</option>
                <option value="minor">Minor</option>
                <option value="major">Major</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Adjacent Use Conflict</label>
              <select value={form.adjacentConflict} onChange={(e) => updateForm('adjacentConflict', e.target.value)} style={selectStyle}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Eminent Domain Risk</label>
              <select value={form.eminentDomainRisk} onChange={(e) => updateForm('eminentDomainRisk', e.target.value)} style={selectStyle}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Exit Assumptions */}
        <CollapsibleSection title="Exit Assumptions">
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Exit Price per MW ($M)</label>
              <input type="number" step="0.01" value={form.exitPricePerMW} onChange={(e) => updateForm('exitPricePerMW', e.target.value)} style={inputStyle} placeholder="0.3" />
            </div>
          </div>
        </CollapsibleSection>

        {/* Notes */}
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
            disabled={saving}
            style={{
              padding: '10px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              fontWeight: 500,
              fontSize: '14px',
              border: 'none',
              borderRadius: '6px',
              cursor: saving ? 'not-allowed' : 'pointer',
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
              backgroundColor: 'white',
              color: '#374151',
              fontWeight: 500,
              fontSize: '14px',
              border: '1px solid #d1d5db',
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
