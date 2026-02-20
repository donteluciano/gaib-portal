'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteInputs {
  acreage?: number;
  askingPrice?: number;
  existingStructures?: string;
  structureValue?: number;
  demoCost?: number;
  pipelineDistance?: number;
  pipelineDiameter?: number;
  terrain?: string;
  gasVolume?: number;
  gasPressure?: number;
  powerStrategy?: string;
  gridQueue?: string;
  coolingType?: string;
  waterSource?: string;
  phaseIStatus?: string;
  airQualityZone?: string;
  airPermitPathway?: string;
  permitType?: string;
  existingPermits?: string;
  depRelationship?: string;
  fiberDistance?: number;
  fiberType?: string;
  floodZone?: string;
  railAccess?: string;
  airportProximity?: string;
  politicalClimate?: string;
  zoning?: string;
  communityOpposition?: string;
  propertyTaxRate?: number;
  pilotAvailable?: string;
  competingSites?: string;
  cloudProximity?: string;
  dcActivity?: string;
  laborMarket?: string;
  titleComplexity?: string;
  easementIssues?: string;
  adjacentConflict?: string;
  eminentDomainRisk?: string;
  exitPricePerMW?: number;
}

interface Site {
  id: string;
  name: string;
  inputs: SiteInputs;
}

interface FundSettings {
  fund_size: number;
  pref_return: number;
  lp_split: number;
  gp_split: number;
  management_fee: number;
  commitment_fee_per_m: number;
}

const defaultFundSettings: FundSettings = {
  fund_size: 10000000,
  pref_return: 0.16,
  lp_split: 0.60,
  gp_split: 0.40,
  management_fee: 0,
  commitment_fee_per_m: 50000,
};

export default function EvaluationTab({ site }: { site: Site }) {
  const [inputs, setInputs] = useState<SiteInputs>(site.inputs || {});
  const [fundSettings, setFundSettings] = useState<FundSettings>(defaultFundSettings);
  const [saving, setSaving] = useState(false);
  const [showGasRef, setShowGasRef] = useState(false);
  const [showWaterRef, setShowWaterRef] = useState(false);

  useEffect(() => {
    const loadFundSettings = async () => {
      const { data } = await supabase
        .from('fund_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setFundSettings(data);
      }
    };

    loadFundSettings();
  }, []);

  // Calculate MW from gas volume and pressure per spec
  // Base: 192 MCFD = 1 MW (from reference table: 14400 MCFD = 75 MW)
  // Pressure factor increases efficiency at higher pressure
  const calculatedMW = useMemo(() => {
    const gasVolume = inputs.gasVolume || 0; // MCFD
    const gasPressure = inputs.gasPressure || 0; // PSI
    
    if (gasVolume === 0) return 0;
    
    // Higher pressure = more efficient gas utilization = more MW
    // Using spec formula: MW = gasVolume / (7 if PSI>500, 8.5 if PSI>300, else 10)
    // Normalized to reference table baseline
    let efficiencyFactor = 1.0; // baseline at low pressure
    if (gasPressure > 500) efficiencyFactor = 10 / 7; // ~1.43x more efficient
    else if (gasPressure > 300) efficiencyFactor = 10 / 8.5; // ~1.18x more efficient
    
    return Math.round((gasVolume / 192) * efficiencyFactor);
  }, [inputs.gasVolume, inputs.gasPressure]);

  // Calculate tap cost based on pipeline diameter
  const tapCost = useMemo(() => {
    const diameter = inputs.pipelineDiameter || 0;
    if (diameter >= 36) return 650000;
    if (diameter >= 24) return 500000;
    if (diameter >= 16) return 350000;
    if (diameter >= 12) return 200000;
    return 100000;
  }, [inputs.pipelineDiameter]);

  // Calculate lateral cost based on distance and terrain
  const lateralCost = useMemo(() => {
    const distance = inputs.pipelineDistance || 0;
    const terrain = inputs.terrain || 'easy';
    
    let costPerMile = 1500000; // easy
    if (terrain === 'moderate') costPerMile = 2500000;
    if (terrain === 'difficult') costPerMile = 4000000;
    
    return distance * costPerMile;
  }, [inputs.pipelineDistance, inputs.terrain]);

  // Meter station cost
  const meterCost = 150000;

  // Total gas cost
  const totalGasCost = tapCost + lateralCost + meterCost;

  // De-risking cost breakdown
  const deRiskingCosts = useMemo(() => {
    const askingPrice = inputs.askingPrice || 0;
    const phaseIStatus = inputs.phaseIStatus || 'not_conducted';
    const permitType = inputs.permitType || 'minor';
    const politicalClimate = inputs.politicalClimate || 'neutral';
    const communityOpposition = inputs.communityOpposition || 'none';
    const fiberDistance = inputs.fiberDistance || 0;
    const existingStructures = inputs.existingStructures || 'none';
    const demoCost = inputs.demoCost || 0;

    const siteControl = askingPrice * 0.05 + 10000;
    const gasStudies = totalGasCost > 0 ? 75000 : 30000;
    const enviro = phaseIStatus === 'flagged' ? 120000 : 50000;
    
    let airPermit = 25000; // minor
    if (permitType === 'PSD') airPermit = 75000;
    else if (permitType === 'major') airPermit = 50000;

    const fiber = fiberDistance > 5 ? 5000 : 2000;

    let political = 10000;
    if (politicalClimate === 'hostile') political = 25000;
    else if (communityOpposition === 'organized') political = 20000;

    const engineering = 50000;
    const demo = existingStructures === 'demolish' ? demoCost : 0;
    const exitCosts = 50000;

    return {
      siteControl,
      gasStudies,
      enviro,
      airPermit,
      fiber,
      political,
      engineering,
      demo,
      exitCosts,
      total: siteControl + gasStudies + enviro + airPermit + fiber + political + engineering + demo + exitCosts,
    };
  }, [inputs, totalGasCost]);

  // Water budget calculation
  const waterBudget = useMemo(() => {
    const mw = calculatedMW || 75; // fallback to 75 MW
    const coolingType = inputs.coolingType || 'air';
    
    let gpdPerMW = 500; // air
    if (coolingType === 'hybrid') gpdPerMW = 3000;
    if (coolingType === 'evaporative') gpdPerMW = 7000;
    
    const dailyGPD = mw * gpdPerMW;
    const annualGallons = dailyGPD * 365;
    
    return { dailyGPD, annualGallons };
  }, [calculatedMW, inputs.coolingType]);

  // Risk score calculation
  const riskScore = useMemo(() => {
    let score = 0;
    
    // Pipeline distance: >5 miles = +2, >3 miles = +1
    const pipelineDistance = inputs.pipelineDistance || 0;
    if (pipelineDistance > 5) score += 2;
    else if (pipelineDistance > 3) score += 1;

    // Phase I: flagged = +3
    if (inputs.phaseIStatus === 'flagged') score += 3;

    // Water: contested = +2, none = +3
    if (inputs.waterSource === 'contested') score += 2;
    if (inputs.waterSource === 'none') score += 3;

    // Air quality: non-attainment = +3, marginal = +1
    if (inputs.airQualityZone === 'non-attainment') score += 3;
    if (inputs.airQualityZone === 'marginal') score += 1;

    // Permit pathway: not_identified = +2, denied = +4
    if (inputs.airPermitPathway === 'not_identified') score += 2;
    if (inputs.airPermitPathway === 'denied') score += 4;

    // Political: hostile = +4, unknown = +1
    if (inputs.politicalClimate === 'hostile') score += 4;
    if (inputs.politicalClimate === 'unknown') score += 1;

    // Zoning: rezoning = +3, variance = +2
    if (inputs.zoning === 'rezoning_needed') score += 3;
    if (inputs.zoning === 'variance_needed') score += 2;

    // Flood zone: +2
    if (inputs.floodZone === 'yes') score += 2;

    // Community opposition: organized = +2, some = +1
    if (inputs.communityOpposition === 'organized') score += 2;
    if (inputs.communityOpposition === 'some') score += 1;

    // Fiber: none = +2
    if (inputs.fiberType === 'none') score += 2;

    // Title: complex = +3, minor = +1
    if (inputs.titleComplexity === 'complex') score += 3;
    if (inputs.titleComplexity === 'minor_issues') score += 1;

    // Adjacent conflict: +2
    if (inputs.adjacentConflict === 'yes') score += 2;

    // Eminent domain: +3
    if (inputs.eminentDomainRisk === 'yes') score += 3;

    // Competing sites: many = +2
    if (inputs.competingSites === 'many') score += 2;

    // Grid queue: congested = +2
    if (inputs.gridQueue === 'congested') score += 2;

    // Labor market: tight = +1
    if (inputs.laborMarket === 'tight') score += 1;

    return score;
  }, [inputs]);

  const riskLevel = useMemo(() => {
    if (riskScore <= 5) return { label: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (riskScore <= 12) return { label: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { label: 'High', color: 'text-red-400', bg: 'bg-red-500/20' };
  }, [riskScore]);

  // Timeline estimate
  const timeline = useMemo(() => {
    let months = 8; // base

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
    if (inputs.titleComplexity === 'complex') months += 2;
    if (inputs.depRelationship === 'adversarial') months += 2;
    if (riskScore >= 13) months += 2;

    const low = Math.max(6, months - 2);
    const high = Math.min(30, months + 2);

    return { low, high, base: months };
  }, [inputs, riskScore]);

  // Fund returns waterfall
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

    return {
      grossExit,
      lpPreferred,
      lpFirst,
      remaining,
      lpShare,
      gpShare,
      totalLP,
      lpMultiple,
    };
  }, [calculatedMW, inputs, timeline.high, fundSettings]);

  async function saveInputs() {
    setSaving(true);
    await supabase
      .from('sites')
      .update({ inputs })
      .eq('id', site.id);
    setSaving(false);
  }

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 bg-navy-card border border-navy rounded-xl">
          <p className="text-gray-400 text-sm">Est. MW</p>
          <p className="text-2xl font-bold text-white">{calculatedMW || '—'}</p>
        </div>
        <div className="p-4 bg-navy-card border border-navy rounded-xl">
          <p className="text-gray-400 text-sm">Gas Cost</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalGasCost)}</p>
        </div>
        <div className="p-4 bg-navy-card border border-navy rounded-xl">
          <p className="text-gray-400 text-sm">De-risking</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(deRiskingCosts.total)}</p>
        </div>
        <div className={`p-4 ${riskLevel.bg} border border-navy rounded-xl`}>
          <p className="text-gray-400 text-sm">Risk Score</p>
          <p className={`text-2xl font-bold ${riskLevel.color}`}>{riskScore} ({riskLevel.label})</p>
        </div>
        <div className="p-4 bg-navy-card border border-navy rounded-xl">
          <p className="text-gray-400 text-sm">Timeline</p>
          <p className="text-2xl font-bold text-white">{timeline.low}-{timeline.high}mo</p>
        </div>
      </div>

      {/* Gas & MW Calculation */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-white">Gas & MW Calculation</h2>
          <button onClick={() => setShowGasRef(!showGasRef)} className="text-gold text-sm hover:text-gold-light">
            {showGasRef ? 'Hide' : 'Show'} Reference
          </button>
        </div>

        {showGasRef && (
          <div className="mb-6 p-4 bg-navy/50 rounded-lg text-sm text-gray-400">
            <p className="font-medium text-white mb-2">MW Calculation Formula:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>PSI &gt; 500: MW = MCFD ÷ 7 ÷ 192</li>
              <li>PSI &gt; 300: MW = MCFD ÷ 8.5 ÷ 192</li>
              <li>PSI ≤ 300: MW = MCFD ÷ 10 ÷ 192</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Gas Volume (MCFD)</label>
            <input
              type="number"
              value={inputs.gasVolume || ''}
              onChange={(e) => setInputs({ ...inputs, gasVolume: parseFloat(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
              placeholder="14400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Gas Pressure (PSI)</label>
            <input
              type="number"
              value={inputs.gasPressure || ''}
              onChange={(e) => setInputs({ ...inputs, gasPressure: parseFloat(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
              placeholder="600"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Pipeline Diameter (in)</label>
            <input
              type="number"
              value={inputs.pipelineDiameter || ''}
              onChange={(e) => setInputs({ ...inputs, pipelineDiameter: parseFloat(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
              placeholder="24"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Pipeline Distance (mi)</label>
            <input
              type="number"
              step="0.1"
              value={inputs.pipelineDistance || ''}
              onChange={(e) => setInputs({ ...inputs, pipelineDistance: parseFloat(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
              placeholder="2"
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Terrain</label>
            <select
              value={inputs.terrain || 'easy'}
              onChange={(e) => setInputs({ ...inputs, terrain: e.target.value })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            >
              <option value="easy">Easy ($1.5M/mi)</option>
              <option value="moderate">Moderate ($2.5M/mi)</option>
              <option value="difficult">Difficult ($4M/mi)</option>
            </select>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">Tap Cost</p>
            <p className="text-lg font-bold text-white">{formatCurrency(tapCost)}</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">Lateral Cost</p>
            <p className="text-lg font-bold text-white">{formatCurrency(lateralCost)}</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">Meter Station</p>
            <p className="text-lg font-bold text-white">{formatCurrency(meterCost)}</p>
          </div>
        </div>
      </div>

      {/* De-risking Cost Breakdown */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">De-risking Cost Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-xs">Site Control</p>
            <p className="text-white font-medium">{formatCurrency(deRiskingCosts.siteControl)}</p>
          </div>
          <div className="p-3 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-xs">Gas Studies</p>
            <p className="text-white font-medium">{formatCurrency(deRiskingCosts.gasStudies)}</p>
          </div>
          <div className="p-3 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-xs">Environmental</p>
            <p className="text-white font-medium">{formatCurrency(deRiskingCosts.enviro)}</p>
          </div>
          <div className="p-3 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-xs">Air Permit</p>
            <p className="text-white font-medium">{formatCurrency(deRiskingCosts.airPermit)}</p>
          </div>
          <div className="p-3 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-xs">Fiber</p>
            <p className="text-white font-medium">{formatCurrency(deRiskingCosts.fiber)}</p>
          </div>
          <div className="p-3 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-xs">Political</p>
            <p className="text-white font-medium">{formatCurrency(deRiskingCosts.political)}</p>
          </div>
          <div className="p-3 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-xs">Engineering</p>
            <p className="text-white font-medium">{formatCurrency(deRiskingCosts.engineering)}</p>
          </div>
          <div className="p-3 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-xs">Demo</p>
            <p className="text-white font-medium">{formatCurrency(deRiskingCosts.demo)}</p>
          </div>
          <div className="p-3 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-xs">Exit Costs</p>
            <p className="text-white font-medium">{formatCurrency(deRiskingCosts.exitCosts)}</p>
          </div>
          <div className="p-3 bg-gold/20 border border-gold/30 rounded-lg">
            <p className="text-gold text-xs">Total</p>
            <p className="text-gold font-bold">{formatCurrency(deRiskingCosts.total)}</p>
          </div>
        </div>
      </div>

      {/* Water Budget */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-white">Water Budget</h2>
          <button onClick={() => setShowWaterRef(!showWaterRef)} className="text-gold text-sm hover:text-gold-light">
            {showWaterRef ? 'Hide' : 'Show'} Reference
          </button>
        </div>

        {showWaterRef && (
          <div className="mb-6 p-4 bg-navy/50 rounded-lg text-sm text-gray-400">
            <p className="font-medium text-white mb-2">GPD per MW by Cooling Type:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Air-cooled: 500 GPD/MW</li>
              <li>Hybrid: 3,000 GPD/MW</li>
              <li>Evaporative: 7,000 GPD/MW</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Cooling Type</label>
            <select
              value={inputs.coolingType || 'air'}
              onChange={(e) => setInputs({ ...inputs, coolingType: e.target.value })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            >
              <option value="air">Air-cooled (500 GPD/MW)</option>
              <option value="hybrid">Hybrid (3,000 GPD/MW)</option>
              <option value="evaporative">Evaporative (7,000 GPD/MW)</option>
            </select>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">Daily Usage</p>
            <p className="text-lg font-bold text-white">{waterBudget.dailyGPD.toLocaleString()} GPD</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">Annual Usage</p>
            <p className="text-lg font-bold text-white">{(waterBudget.annualGallons / 1000000).toFixed(2)}M gal</p>
          </div>
        </div>
      </div>

      {/* Fund Returns Waterfall */}
      <div className="bg-navy-card border border-gold/30 rounded-xl p-6">
        <h2 className="text-xl font-serif text-gold mb-6">Fund Returns Waterfall</h2>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Exit Price per MW ($M)</label>
          <input
            type="number"
            step="0.01"
            value={inputs.exitPricePerMW || ''}
            onChange={(e) => setInputs({ ...inputs, exitPricePerMW: parseFloat(e.target.value) || 0 })}
            className="w-48 bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            placeholder="0.3"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">Gross Exit</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(fundReturns.grossExit)}</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">LP Preferred ({(fundSettings.pref_return * 100).toFixed(0)}%)</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(fundReturns.lpPreferred)}</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">LP First (Return of Capital)</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(fundReturns.lpFirst)}</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">Remaining</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(fundReturns.remaining)}</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">LP Share ({(fundSettings.lp_split * 100).toFixed(0)}%)</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(fundReturns.lpShare)}</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-gray-400 text-sm">GP Share ({(fundSettings.gp_split * 100).toFixed(0)}%)</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(fundReturns.gpShare)}</p>
          </div>
          <div className="p-4 bg-gold/20 border border-gold/30 rounded-lg">
            <p className="text-gold text-sm">Total LP Return</p>
            <p className="text-2xl font-bold text-gold">{formatCurrency(fundReturns.totalLP)}</p>
          </div>
          <div className="p-4 bg-success/20 border border-success/30 rounded-lg">
            <p className="text-success text-sm">LP Multiple</p>
            <p className="text-2xl font-bold text-success">{fundReturns.lpMultiple.toFixed(2)}x</p>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">Risk Factors (Score: {riskScore})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Phase I Status', value: inputs.phaseIStatus, risk: inputs.phaseIStatus === 'flagged' },
            { label: 'Water Source', value: inputs.waterSource, risk: inputs.waterSource === 'contested' || inputs.waterSource === 'none' },
            { label: 'Air Quality', value: inputs.airQualityZone, risk: inputs.airQualityZone === 'non-attainment' },
            { label: 'Permit Pathway', value: inputs.airPermitPathway, risk: inputs.airPermitPathway !== 'identified' },
            { label: 'Political Climate', value: inputs.politicalClimate, risk: inputs.politicalClimate === 'hostile' || inputs.politicalClimate === 'unknown' },
            { label: 'Zoning', value: inputs.zoning, risk: inputs.zoning !== 'by-right' },
            { label: 'Flood Zone', value: inputs.floodZone, risk: inputs.floodZone === 'yes' },
            { label: 'Title', value: inputs.titleComplexity, risk: inputs.titleComplexity === 'complex' },
          ].map((item, i) => (
            <div key={i} className={`p-3 rounded-lg ${item.risk ? 'bg-red-500/10 border border-red-500/30' : 'bg-navy/50'}`}>
              <p className="text-gray-400 text-xs">{item.label}</p>
              <p className={`font-medium capitalize ${item.risk ? 'text-red-400' : 'text-white'}`}>
                {(item.value || '—').replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveInputs}
          disabled={saving}
          className="px-8 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
