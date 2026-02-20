'use client';

import { useState } from 'react';

interface Site {
  id: string;
  name: string;
  mw: number;
  acreage: number;
  askingPrice: number;
}

// Gas to MW reference table (collapsible)
const gasToMWReference = [
  { mw: 25, mmbtuDay: 4800, mcfDay: 4800 },
  { mw: 50, mmbtuDay: 9600, mcfDay: 9600 },
  { mw: 75, mmbtuDay: 14400, mcfDay: 14400 },
  { mw: 100, mmbtuDay: 19200, mcfDay: 19200 },
  { mw: 150, mmbtuDay: 28800, mcfDay: 28800 },
  { mw: 200, mmbtuDay: 38400, mcfDay: 38400 },
];

// Water budget reference (collapsible)
const waterBudgetReference = [
  { coolingType: 'Air-cooled', gpdPerMW: 0, notes: 'No water cooling needed' },
  { coolingType: 'Hybrid', gpdPerMW: 15000, notes: 'Partial evaporative cooling' },
  { coolingType: 'Evaporative', gpdPerMW: 30000, notes: 'Full evaporative cooling' },
  { coolingType: 'Once-through', gpdPerMW: 100000, notes: 'Requires water body access' },
];

export default function EvaluationTab({ site }: { site: Site }) {
  const [showGasRef, setShowGasRef] = useState(false);
  const [showWaterRef, setShowWaterRef] = useState(false);

  // Input state
  const [inputs, setInputs] = useState({
    acreage: site.acreage || 25,
    askingPrice: site.askingPrice || 1500000,
    pipelineDistance: 2,
    pipelineDiameter: 24,
    pipelinePressure: 600,
    estimatedMW: site.mw || 75,
    transmissionDistance: 5,
    substationCapacity: 100,
    waterCapacity: 2,
    coolingType: 'hybrid',
    zoning: 'industrial',
    existingStructures: false,
    environmentalIssues: false,
  });

  // Calculate outputs
  const gasLateralCost = inputs.pipelineDistance * 500000; // $500K per mile
  const transmissionCost = inputs.transmissionDistance * 1000000; // $1M per mile
  const siteControlCost = inputs.askingPrice * 0.05 + 50000; // 5% + legal/title
  const deRiskingBudget = 500000; // Base de-risking
  const totalDeRiskingCost = gasLateralCost + deRiskingBudget + siteControlCost;
  const exitValuePerMW = 300000; // $300K/MW
  const grossExitValue = inputs.estimatedMW * exitValuePerMW;
  const netProfit = grossExitValue - totalDeRiskingCost - inputs.askingPrice;
  const roi = ((netProfit / (totalDeRiskingCost + inputs.askingPrice)) * 100);

  return (
    <div className="space-y-6">
      {/* Site Info */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">Site Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-muted mb-2">Acreage</label>
            <input
              type="number"
              value={inputs.acreage}
              onChange={(e) => setInputs({ ...inputs, acreage: parseInt(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Asking Price ($)</label>
            <input
              type="number"
              value={inputs.askingPrice}
              onChange={(e) => setInputs({ ...inputs, askingPrice: parseInt(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Estimated MW</label>
            <input
              type="number"
              value={inputs.estimatedMW}
              onChange={(e) => setInputs({ ...inputs, estimatedMW: parseInt(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
        </div>
      </div>

      {/* Gas & Power */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-white">Gas & Power</h2>
          <button
            onClick={() => setShowGasRef(!showGasRef)}
            className="text-gold text-sm hover:text-gold-light"
          >
            {showGasRef ? 'Hide' : 'Show'} Gas-to-MW Reference
          </button>
        </div>

        {/* Gas Reference Table (collapsible) */}
        {showGasRef && (
          <div className="mb-6 p-4 bg-navy/50 rounded-lg">
            <p className="text-muted text-sm mb-3">Gas Volume to MW Conversion Reference</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy">
                  <th className="py-2 text-left text-muted">MW</th>
                  <th className="py-2 text-left text-muted">MMBtu/day</th>
                  <th className="py-2 text-left text-muted">MCF/day</th>
                </tr>
              </thead>
              <tbody>
                {gasToMWReference.map((row) => (
                  <tr key={row.mw} className="border-b border-navy/50">
                    <td className="py-2 text-white">{row.mw}</td>
                    <td className="py-2 text-white">{row.mmbtuDay.toLocaleString()}</td>
                    <td className="py-2 text-white">{row.mcfDay.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-muted mb-2">Pipeline Distance (miles)</label>
            <input
              type="number"
              value={inputs.pipelineDistance}
              onChange={(e) => setInputs({ ...inputs, pipelineDistance: parseFloat(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Pipeline Diameter (inches)</label>
            <input
              type="number"
              value={inputs.pipelineDiameter}
              onChange={(e) => setInputs({ ...inputs, pipelineDiameter: parseInt(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Transmission Distance (miles)</label>
            <input
              type="number"
              value={inputs.transmissionDistance}
              onChange={(e) => setInputs({ ...inputs, transmissionDistance: parseFloat(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
        </div>
      </div>

      {/* Water */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-white">Water</h2>
          <button
            onClick={() => setShowWaterRef(!showWaterRef)}
            className="text-gold text-sm hover:text-gold-light"
          >
            {showWaterRef ? 'Hide' : 'Show'} Water Budget Reference
          </button>
        </div>

        {/* Water Reference Table (collapsible) */}
        {showWaterRef && (
          <div className="mb-6 p-4 bg-navy/50 rounded-lg">
            <p className="text-muted text-sm mb-3">Water Budget by Cooling Type (GPD per MW)</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy">
                  <th className="py-2 text-left text-muted">Cooling Type</th>
                  <th className="py-2 text-left text-muted">GPD/MW</th>
                  <th className="py-2 text-left text-muted">Notes</th>
                </tr>
              </thead>
              <tbody>
                {waterBudgetReference.map((row) => (
                  <tr key={row.coolingType} className="border-b border-navy/50">
                    <td className="py-2 text-white">{row.coolingType}</td>
                    <td className="py-2 text-white">{row.gpdPerMW.toLocaleString()}</td>
                    <td className="py-2 text-muted">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-muted mb-2">Municipal Water Capacity (MGD)</label>
            <input
              type="number"
              value={inputs.waterCapacity}
              onChange={(e) => setInputs({ ...inputs, waterCapacity: parseFloat(e.target.value) || 0 })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Cooling Type</label>
            <select
              value={inputs.coolingType}
              onChange={(e) => setInputs({ ...inputs, coolingType: e.target.value })}
              className="w-full bg-navy border border-navy-card rounded-lg px-4 py-3 text-white focus:border-gold outline-none"
            >
              <option value="air">Air-cooled</option>
              <option value="hybrid">Hybrid</option>
              <option value="evaporative">Evaporative</option>
            </select>
          </div>
        </div>
      </div>

      {/* Outputs */}
      <div className="bg-navy-card border border-gold/30 rounded-xl p-6">
        <h2 className="text-xl font-serif text-gold mb-6">Projected Returns</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-muted text-sm">Total De-risking Cost</p>
            <p className="text-2xl font-bold text-white">${(totalDeRiskingCost / 1000000).toFixed(2)}M</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-muted text-sm">Gross Exit Value</p>
            <p className="text-2xl font-bold text-white">${(grossExitValue / 1000000).toFixed(1)}M</p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-muted text-sm">Net Profit</p>
            <p className={`text-2xl font-bold ${netProfit > 0 ? 'text-success' : 'text-danger'}`}>
              ${(netProfit / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="p-4 bg-navy/50 rounded-lg">
            <p className="text-muted text-sm">ROI</p>
            <p className={`text-2xl font-bold ${roi > 0 ? 'text-success' : 'text-danger'}`}>
              {roi.toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-8 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
