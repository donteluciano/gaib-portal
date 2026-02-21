'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteInputs { acreage?: number; askingPrice?: number; existingStructures?: string; structureValue?: number; demoCost?: number; pipelineDistance?: number; pipelineDiameter?: number; terrain?: string; gasVolume?: number; gasPressure?: number; coolingType?: string; waterSource?: string; phaseIStatus?: string; airQualityZone?: string; airPermitPathway?: string; permitType?: string; politicalClimate?: string; zoning?: string; communityOpposition?: string; floodZone?: string; fiberType?: string; titleComplexity?: string; adjacentConflict?: string; eminentDomainRisk?: string; competingSites?: string; gridQueue?: string; laborMarket?: string; exitPricePerMW?: number; }
interface Site { id: string; name: string; inputs: SiteInputs; }
interface FundSettings { fund_size: number; pref_return: number; lp_split: number; gp_split: number; management_fee: number; commitment_fee_per_m: number; }

const defaultFundSettings: FundSettings = { fund_size: 10000000, pref_return: 0.16, lp_split: 0.60, gp_split: 0.40, management_fee: 0, commitment_fee_per_m: 50000 };

export default function EvaluationTab({ site }: { site: Site }) {
  const [inputs, setInputs] = useState<SiteInputs>(site.inputs || {});
  const [fundSettings, setFundSettings] = useState<FundSettings>(defaultFundSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadFundSettings = async () => {
      const { data } = await supabase.from('fund_settings').select('*').order('updated_at', { ascending: false }).limit(1).single();
      if (data) setFundSettings(data);
    };
    loadFundSettings();
  }, []);

  const calculatedMW = useMemo(() => {
    const gasVolume = inputs.gasVolume || 0;
    const gasPressure = inputs.gasPressure || 0;
    if (gasVolume === 0) return 0;
    let efficiencyFactor = 1.0;
    if (gasPressure > 500) efficiencyFactor = 10 / 7;
    else if (gasPressure > 300) efficiencyFactor = 10 / 8.5;
    return Math.round((gasVolume / 192) * efficiencyFactor);
  }, [inputs.gasVolume, inputs.gasPressure]);

  const tapCost = useMemo(() => {
    const diameter = inputs.pipelineDiameter || 0;
    if (diameter >= 36) return 650000;
    if (diameter >= 24) return 500000;
    if (diameter >= 16) return 350000;
    if (diameter >= 12) return 200000;
    return 100000;
  }, [inputs.pipelineDiameter]);

  const lateralCost = useMemo(() => {
    const distance = inputs.pipelineDistance || 0;
    const terrain = inputs.terrain || 'easy';
    let costPerMile = 1500000;
    if (terrain === 'moderate') costPerMile = 2500000;
    if (terrain === 'difficult') costPerMile = 4000000;
    return distance * costPerMile;
  }, [inputs.pipelineDistance, inputs.terrain]);

  const meterCost = 150000;
  const totalGasCost = tapCost + lateralCost + meterCost;

  const deRiskingCosts = useMemo(() => {
    const askingPrice = inputs.askingPrice || 0;
    const phaseIStatus = inputs.phaseIStatus || 'not_conducted';
    const permitType = inputs.permitType || 'minor';
    const politicalClimate = inputs.politicalClimate || 'neutral';
    const communityOpposition = inputs.communityOpposition || 'none';
    const fiberDistance = 0;
    const existingStructures = inputs.existingStructures || 'none';
    const demoCost = inputs.demoCost || 0;
    const siteControl = askingPrice * 0.05 + 10000;
    const gasStudies = totalGasCost > 0 ? 75000 : 30000;
    const enviro = phaseIStatus === 'flagged' ? 120000 : 50000;
    let airPermit = 25000;
    if (permitType === 'PSD') airPermit = 75000;
    else if (permitType === 'major') airPermit = 50000;
    const fiber = fiberDistance > 5 ? 5000 : 2000;
    let political = 10000;
    if (politicalClimate === 'hostile') political = 25000;
    else if (communityOpposition === 'organized') political = 20000;
    const engineering = 50000;
    const demo = existingStructures === 'demolish' ? demoCost : 0;
    const exitCosts = 50000;
    return { siteControl, gasStudies, enviro, airPermit, fiber, political, engineering, demo, exitCosts, total: siteControl + gasStudies + enviro + airPermit + fiber + political + engineering + demo + exitCosts };
  }, [inputs, totalGasCost]);

  const riskScore = useMemo(() => {
    let score = 0;
    const pipelineDistance = inputs.pipelineDistance || 0;
    if (pipelineDistance > 5) score += 2;
    else if (pipelineDistance > 3) score += 1;
    if (inputs.phaseIStatus === 'flagged') score += 3;
    if (inputs.waterSource === 'contested') score += 2;
    if (inputs.waterSource === 'none') score += 3;
    if (inputs.airQualityZone === 'non-attainment') score += 3;
    if (inputs.airQualityZone === 'marginal') score += 1;
    if (inputs.airPermitPathway === 'not_identified') score += 2;
    if (inputs.airPermitPathway === 'denied') score += 4;
    if (inputs.politicalClimate === 'hostile') score += 4;
    if (inputs.politicalClimate === 'unknown') score += 1;
    if (inputs.zoning === 'rezoning_needed') score += 3;
    if (inputs.zoning === 'variance_needed') score += 2;
    if (inputs.floodZone === 'yes') score += 2;
    if (inputs.communityOpposition === 'organized') score += 2;
    if (inputs.communityOpposition === 'some') score += 1;
    if (inputs.fiberType === 'none') score += 2;
    if (inputs.titleComplexity === 'complex') score += 3;
    if (inputs.adjacentConflict === 'yes') score += 2;
    if (inputs.eminentDomainRisk === 'yes') score += 3;
    if (inputs.competingSites === 'many') score += 2;
    if (inputs.gridQueue === 'congested') score += 2;
    if (inputs.laborMarket === 'tight') score += 1;
    return score;
  }, [inputs]);

  const riskLevel = useMemo(() => {
    if (riskScore <= 5) return { label: 'Low', color: '#22C55E', bg: '#DCFCE7' };
    if (riskScore <= 12) return { label: 'Medium', color: '#EAB308', bg: '#FEF3C7' };
    return { label: 'High', color: '#EF4444', bg: '#FEE2E2' };
  }, [riskScore]);

  const timeline = useMemo(() => {
    let months = 8;
    if ((inputs.pipelineDistance || 0) > 3) months += 2;
    if (inputs.phaseIStatus === 'flagged') months += 3;
    if (inputs.waterSource === 'contested') months += 2;
    if (inputs.airQualityZone === 'non-attainment') months += 3;
    if (inputs.airPermitPathway === 'not_identified') months += 2;
    if (inputs.permitType === 'PSD') months += 4;
    else if (inputs.permitType === 'major') months += 2;
    if (inputs.politicalClimate === 'unknown') months += 1;
    if (inputs.politicalClimate === 'hostile') months += 4;
    if (inputs.zoning === 'variance_needed') months += 2;
    if (inputs.zoning === 'rezoning_needed') months += 4;
    const low = Math.max(6, months - 2);
    const high = Math.min(30, months + 2);
    return { low, high, base: months };
  }, [inputs, riskScore]);

  const fundReturns = useMemo(() => {
    const mw = calculatedMW || 75;
    const exitPricePerMW = inputs.exitPricePerMW || 0.3;
    const structureValue = inputs.existingStructures === 'usable' ? (inputs.structureValue || 0) : 0;
    const grossExit = mw * exitPricePerMW * 1000000 + structureValue;
    const timelineYears = timeline.high / 12;
    const lpPreferred = fundSettings.fund_size * fundSettings.pref_return * timelineYears;
    const lpFirst = fundSettings.fund_size + lpPreferred;
    const remaining = Math.max(0, grossExit - lpFirst);
    const lpShare = remaining * fundSettings.lp_split;
    const gpShare = remaining * fundSettings.gp_split;
    const totalLP = lpFirst + lpShare;
    const lpMultiple = fundSettings.fund_size > 0 ? totalLP / fundSettings.fund_size : 0;
    return { grossExit, lpPreferred, lpFirst, remaining, lpShare, gpShare, totalLP, lpMultiple };
  }, [calculatedMW, inputs, timeline.high, fundSettings]);

  async function saveInputs() {
    setSaving(true);
    await supabase.from('sites').update({ inputs }).eq('id', site.id);
    setSaving(false);
  }

  const formatCurrency = (val: number) => { if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`; if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`; return `$${val.toLocaleString()}`; };
  const inputStyle = { width: '100%', padding: '12px 16px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' };
  const cardStyle = { padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
        <div style={{ ...cardStyle, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Est. MW</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{calculatedMW || '—'}</p></div>
        <div style={{ ...cardStyle, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Gas Cost</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(totalGasCost)}</p></div>
        <div style={{ ...cardStyle, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>De-risking</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(deRiskingCosts.total)}</p></div>
        <div style={{ ...cardStyle, backgroundColor: riskLevel.bg, border: '1px solid var(--border-card)' }}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Risk Score</p><p style={{ fontSize: '24px', fontWeight: 700, color: riskLevel.color }}>{riskScore} ({riskLevel.label})</p></div>
        <div style={{ ...cardStyle, backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)' }}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Timeline</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{timeline.low}-{timeline.high}mo</p></div>
      </div>

      {/* Gas & MW Calculation */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>Gas & MW Calculation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Gas Volume (MCFD)</label><input type="number" value={inputs.gasVolume || ''} onChange={(e) => setInputs({ ...inputs, gasVolume: parseFloat(e.target.value) || 0 })} style={inputStyle} placeholder="14400" /></div>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Gas Pressure (PSI)</label><input type="number" value={inputs.gasPressure || ''} onChange={(e) => setInputs({ ...inputs, gasPressure: parseFloat(e.target.value) || 0 })} style={inputStyle} placeholder="600" /></div>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pipeline Diameter (in)</label><input type="number" value={inputs.pipelineDiameter || ''} onChange={(e) => setInputs({ ...inputs, pipelineDiameter: parseFloat(e.target.value) || 0 })} style={inputStyle} placeholder="24" /></div>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Pipeline Distance (mi)</label><input type="number" step="0.1" value={inputs.pipelineDistance || ''} onChange={(e) => setInputs({ ...inputs, pipelineDistance: parseFloat(e.target.value) || 0 })} style={inputStyle} placeholder="2" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
          <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Terrain</label><select value={inputs.terrain || 'easy'} onChange={(e) => setInputs({ ...inputs, terrain: e.target.value })} style={inputStyle}><option value="easy">Easy ($1.5M/mi)</option><option value="moderate">Moderate ($2.5M/mi)</option><option value="difficult">Difficult ($4M/mi)</option></select></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Tap Cost</p><p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(tapCost)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Lateral Cost</p><p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(lateralCost)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Meter Station</p><p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(meterCost)}</p></div>
        </div>
      </div>

      {/* De-risking Cost Breakdown */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>De-risking Cost Breakdown</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Site Control</p><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(deRiskingCosts.siteControl)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Gas Studies</p><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(deRiskingCosts.gasStudies)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Environmental</p><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(deRiskingCosts.enviro)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Air Permit</p><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(deRiskingCosts.airPermit)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Engineering</p><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(deRiskingCosts.engineering)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Political</p><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(deRiskingCosts.political)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Exit Costs</p><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatCurrency(deRiskingCosts.exitCosts)}</p></div>
          <div></div>
          <div></div>
          <div style={{ ...cardStyle, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}><p style={{ color: '#1D4ED8', fontSize: '12px' }}>Total</p><p style={{ color: '#1D4ED8', fontWeight: 700 }}>{formatCurrency(deRiskingCosts.total)}</p></div>
        </div>
      </div>

      {/* Fund Returns Waterfall */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>Fund Returns Waterfall</h2>
        <div style={{ marginBottom: '16px' }}><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Exit Price per MW ($M)</label><input type="number" step="0.01" value={inputs.exitPricePerMW || ''} onChange={(e) => setInputs({ ...inputs, exitPricePerMW: parseFloat(e.target.value) || 0 })} style={{ ...inputStyle, width: '200px' }} placeholder="0.3" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Gross Exit</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(fundReturns.grossExit)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>LP Preferred ({(fundSettings.pref_return * 100).toFixed(0)}%)</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(fundReturns.lpPreferred)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>LP First (Return of Capital)</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(fundReturns.lpFirst)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Remaining</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(fundReturns.remaining)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>LP Share ({(fundSettings.lp_split * 100).toFixed(0)}%)</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(fundReturns.lpShare)}</p></div>
          <div style={cardStyle}><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>GP Share ({(fundSettings.gp_split * 100).toFixed(0)}%)</p><p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(fundReturns.gpShare)}</p></div>
          <div style={{ ...cardStyle, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}><p style={{ color: '#1D4ED8', fontSize: '14px' }}>Total LP Return</p><p style={{ fontSize: '24px', fontWeight: 700, color: '#1D4ED8' }}>{formatCurrency(fundReturns.totalLP)}</p></div>
          <div style={{ ...cardStyle, backgroundColor: '#DCFCE7', border: '1px solid #86EFAC' }}><p style={{ color: '#16A34A', fontSize: '14px' }}>LP Multiple</p><p style={{ fontSize: '24px', fontWeight: 700, color: '#16A34A' }}>{fundReturns.lpMultiple.toFixed(2)}x</p></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={saveInputs} disabled={saving} style={{ padding: '12px 32px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  );
}
