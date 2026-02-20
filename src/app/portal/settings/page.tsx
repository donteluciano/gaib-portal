'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Stage labels per spec
const stageLabels = [
  'Site Control',
  'Gas & Power',
  'Water & Environmental',
  'Fiber & Access',
  'Political & Community',
  'Engineering & Feasibility',
  'Packaging & Exit',
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const [fundSettings, setFundSettings] = useState({
    id: null as string | null,
    fundSize: 10000000,
    prefReturn: 16,
    lpSplit: 60,
    gpSplit: 40,
    managementFee: 0,
    commitmentFeePerM: 50000,
  });

  const loadFundSettings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('fund_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setFundSettings({
        id: data.id,
        fundSize: data.fund_size || 10000000,
        prefReturn: (data.pref_return || 0.16) * 100,
        lpSplit: (data.lp_split || 0.60) * 100,
        gpSplit: (data.gp_split || 0.40) * 100,
        managementFee: (data.management_fee || 0) * 100,
        commitmentFeePerM: data.commitment_fee_per_m || 50000,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFundSettings();
  }, []);

  async function saveFundSettings() {
    setSaving(true);
    setSaveMessage('');

    const payload = {
      fund_size: fundSettings.fundSize,
      pref_return: fundSettings.prefReturn / 100,
      lp_split: fundSettings.lpSplit / 100,
      gp_split: fundSettings.gpSplit / 100,
      management_fee: fundSettings.managementFee / 100,
      commitment_fee_per_m: fundSettings.commitmentFeePerM,
      updated_at: new Date().toISOString(),
    };

    let error;
    if (fundSettings.id) {
      const result = await supabase
        .from('fund_settings')
        .update(payload)
        .eq('id', fundSettings.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('fund_settings')
        .insert(payload)
        .select()
        .single();
      error = result.error;
      if (result.data) {
        setFundSettings({ ...fundSettings, id: result.data.id });
      }
    }

    if (error) {
      setSaveMessage(`Error: ${error.message}`);
    } else {
      setSaveMessage('Fund settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure portal and fund assumptions.</p>
      </div>

      {/* Fund Assumptions */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">Fund Assumptions</h2>
        <p className="text-gray-400 text-sm mb-6">These values are used in all site calculations and projections.</p>
        
        {saveMessage && (
          <div className={`mb-6 p-3 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
            {saveMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Fund Size</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={fundSettings.fundSize}
                onChange={(e) => setFundSettings({ ...fundSettings, fundSize: parseInt(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Default: $10,000,000</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Return</label>
            <div className="relative">
              <input
                type="number"
                value={fundSettings.prefReturn}
                onChange={(e) => setFundSettings({ ...fundSettings, prefReturn: parseFloat(e.target.value) || 0 })}
                className="w-full pr-8 px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Default: 16%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">LP Split</label>
            <div className="relative">
              <input
                type="number"
                value={fundSettings.lpSplit}
                onChange={(e) => setFundSettings({ ...fundSettings, lpSplit: parseFloat(e.target.value) || 0 })}
                className="w-full pr-8 px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Default: 60%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">GP Split (Carry)</label>
            <div className="relative">
              <input
                type="number"
                value={fundSettings.gpSplit}
                onChange={(e) => setFundSettings({ ...fundSettings, gpSplit: parseFloat(e.target.value) || 0 })}
                className="w-full pr-8 px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Default: 40%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Management Fee</label>
            <div className="relative">
              <input
                type="number"
                value={fundSettings.managementFee}
                onChange={(e) => setFundSettings({ ...fundSettings, managementFee: parseFloat(e.target.value) || 0 })}
                className="w-full pr-8 px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Default: 0%</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Commitment Fee (per $1M)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={fundSettings.commitmentFeePerM}
                onChange={(e) => setFundSettings({ ...fundSettings, commitmentFeePerM: parseInt(e.target.value) || 0 })}
                className="w-full pl-8 pr-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Default: $50,000</p>
          </div>
        </div>
        <div className="mt-6">
          <button 
            onClick={saveFundSettings}
            disabled={saving}
            className="px-6 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Fund Settings'}
          </button>
        </div>
      </div>

      {/* Stage Labels (Read-only per spec) */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">Stage Labels</h2>
        <p className="text-gray-400 text-sm mb-6">Standard pipeline stages for site progression.</p>
        <div className="space-y-3">
          {stageLabels.map((stage, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-gold w-20">Stage {i + 1}:</span>
              <div className="flex-1 px-4 py-2 bg-navy border border-navy-card rounded-lg text-white">
                {stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">Data Management</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-navy hover:bg-navy-dark text-white font-medium rounded-lg transition-colors border border-navy-card">
            Export All Data (JSON)
          </button>
          <button className="px-6 py-3 bg-navy hover:bg-navy-dark text-white font-medium rounded-lg transition-colors border border-navy-card">
            Import Data
          </button>
        </div>
      </div>
    </div>
  );
}
