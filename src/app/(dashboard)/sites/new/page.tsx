'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewSitePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const [siteInfo, setSiteInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    county: '',
    acreage: 25,
    askingPrice: 1500000,
    stage: 1,
    notes: '',
  });

  const [gasInputs, setGasInputs] = useState({
    pipelineDistance: 2,
    pipelineDiameter: 24,
    pressureAvailable: 600,
    hasExistingService: false,
    utilityName: '',
  });

  const [powerInputs, setPowerInputs] = useState({
    substationDistance: 3,
    transmissionVoltage: 345,
    availableCapacityMW: 100,
  });

  // Calculated outputs (simplified for now)
  const estimatedMW = Math.round((gasInputs.pipelineDiameter / 24) * 50 * (1 - gasInputs.pipelineDistance * 0.05));
  const grossExitValue = estimatedMW * 900000;
  const deRiskingCost = 350000 + (gasInputs.pipelineDistance * 50000);
  const netExitValue = grossExitValue - deRiskingCost;

  const handleSave = async () => {
    setSaving(true);
    // For now, just redirect - will add Supabase later
    setTimeout(() => {
      router.push('/pipeline');
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-white">New Site Evaluation</h1>
          <p className="text-gray-400 mt-1">Evaluate and save a potential data center site</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !siteInfo.name}
          className="bg-gold text-navy px-6 py-2 rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Site'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Site Info */}
          <div className="bg-navy-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gold mb-4">Site Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Site Name *</label>
                <input
                  type="text"
                  value={siteInfo.name}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Site Alpha"
                  className="w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Address</label>
                <input
                  type="text"
                  value={siteInfo.address}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Industrial Rd"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">City</label>
                <input
                  type="text"
                  value={siteInfo.city}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">State</label>
                <input
                  type="text"
                  value={siteInfo.state}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="OH"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Acreage</label>
                <input
                  type="number"
                  value={siteInfo.acreage}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, acreage: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Asking Price ($)</label>
                <input
                  type="number"
                  value={siteInfo.askingPrice}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, askingPrice: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current Stage</label>
                <select
                  value={siteInfo.stage}
                  onChange={(e) => setSiteInfo(prev => ({ ...prev, stage: Number(e.target.value) }))}
                  className="w-full"
                >
                  <option value={1}>Stage 1 - Identification</option>
                  <option value={2}>Stage 2 - Gas Viability</option>
                  <option value={3}>Stage 3 - Environmental</option>
                  <option value={4}>Stage 4 - Permitting</option>
                  <option value={5}>Stage 5 - Engineering</option>
                  <option value={6}>Stage 6 - Exit Process</option>
                  <option value={7}>Stage 7 - Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gas & Power */}
          <div className="bg-navy-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gold mb-4">Gas Infrastructure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pipeline Distance (miles)</label>
                <input
                  type="number"
                  value={gasInputs.pipelineDistance}
                  onChange={(e) => setGasInputs(prev => ({ ...prev, pipelineDistance: Number(e.target.value) }))}
                  step="0.1"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pipeline Diameter (inches)</label>
                <input
                  type="number"
                  value={gasInputs.pipelineDiameter}
                  onChange={(e) => setGasInputs(prev => ({ ...prev, pipelineDiameter: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Pressure Available (PSI)</label>
                <input
                  type="number"
                  value={gasInputs.pressureAvailable}
                  onChange={(e) => setGasInputs(prev => ({ ...prev, pressureAvailable: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Utility Name</label>
                <input
                  type="text"
                  value={gasInputs.utilityName}
                  onChange={(e) => setGasInputs(prev => ({ ...prev, utilityName: e.target.value }))}
                  placeholder="e.g., Columbia Gas"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Power */}
          <div className="bg-navy-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gold mb-4">Power Infrastructure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Substation Distance (miles)</label>
                <input
                  type="number"
                  value={powerInputs.substationDistance}
                  onChange={(e) => setPowerInputs(prev => ({ ...prev, substationDistance: Number(e.target.value) }))}
                  step="0.1"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Transmission Voltage (kV)</label>
                <input
                  type="number"
                  value={powerInputs.transmissionVoltage}
                  onChange={(e) => setPowerInputs(prev => ({ ...prev, transmissionVoltage: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Available Capacity (MW)</label>
                <input
                  type="number"
                  value={powerInputs.availableCapacityMW}
                  onChange={(e) => setPowerInputs(prev => ({ ...prev, availableCapacityMW: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-navy-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gold mb-4">Notes</h2>
            <textarea
              value={siteInfo.notes}
              onChange={(e) => setSiteInfo(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this site..."
              rows={4}
              className="w-full"
            />
          </div>
        </div>

        {/* Right Column - Outputs */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="bg-navy-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gold mb-4">Estimated Outputs</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-navy">
                <span className="text-gray-400">Estimated MW</span>
                <span className="text-2xl font-bold text-white">{estimatedMW} MW</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-navy">
                <span className="text-gray-400">Gross Exit Value</span>
                <span className="text-xl font-semibold text-white">${(grossExitValue / 1000000).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-navy">
                <span className="text-gray-400">De-Risking Cost</span>
                <span className="text-lg text-warning">${(deRiskingCost / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Net Exit Value</span>
                <span className="text-xl font-semibold text-success">${(netExitValue / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-navy-card rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gold mb-4">Risk Assessment</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Gas Access</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${gasInputs.pipelineDistance <= 1 ? 'bg-success' : gasInputs.pipelineDistance <= 3 ? 'bg-warning' : 'bg-danger'}`} />
                  <span className="text-white text-sm">{gasInputs.pipelineDistance <= 1 ? 'Low' : gasInputs.pipelineDistance <= 3 ? 'Medium' : 'High'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Power Access</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${powerInputs.substationDistance <= 2 ? 'bg-success' : powerInputs.substationDistance <= 5 ? 'bg-warning' : 'bg-danger'}`} />
                  <span className="text-white text-sm">{powerInputs.substationDistance <= 2 ? 'Low' : powerInputs.substationDistance <= 5 ? 'Medium' : 'High'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Capacity</span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${powerInputs.availableCapacityMW >= 75 ? 'bg-success' : powerInputs.availableCapacityMW >= 50 ? 'bg-warning' : 'bg-danger'}`} />
                  <span className="text-white text-sm">{powerInputs.availableCapacityMW >= 75 ? 'Low' : powerInputs.availableCapacityMW >= 50 ? 'Medium' : 'High'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-navy rounded-lg p-4 border border-navy-card">
            <p className="text-gray-400 text-sm">
              💡 This is a simplified evaluation. The full simulator with all inputs and detailed calculations will be available once we port your existing model.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
