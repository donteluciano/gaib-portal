'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [fundSettings, setFundSettings] = useState({
    fundSize: 10000000,
    prefReturn: 16,
    lpSplit: 60,
    gpSplit: 40,
    managementFee: 0,
    commitmentFeePerM: 50000,
  });

  const handleChange = (field: string, value: number) => {
    setFundSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure fund assumptions and portal settings</p>
      </div>

      {/* Fund Assumptions */}
      <div className="bg-navy-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Fund Assumptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Fund Size ($)</label>
            <input
              type="number"
              value={fundSettings.fundSize}
              onChange={(e) => handleChange('fundSize', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Preferred Return (%)</label>
            <input
              type="number"
              value={fundSettings.prefReturn}
              onChange={(e) => handleChange('prefReturn', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">LP Split (%)</label>
            <input
              type="number"
              value={fundSettings.lpSplit}
              onChange={(e) => handleChange('lpSplit', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">GP Split (%)</label>
            <input
              type="number"
              value={fundSettings.gpSplit}
              onChange={(e) => handleChange('gpSplit', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Management Fee (%)</label>
            <input
              type="number"
              value={fundSettings.managementFee}
              onChange={(e) => handleChange('managementFee', Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Commitment Fee per MW ($)</label>
            <input
              type="number"
              value={fundSettings.commitmentFeePerM}
              onChange={(e) => handleChange('commitmentFeePerM', Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
        <button className="mt-6 bg-gold text-navy px-6 py-2 rounded-lg font-semibold hover:bg-gold-light transition-colors">
          Save Changes
        </button>
      </div>

      {/* Password */}
      <div className="bg-navy-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Change Password</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Current Password</label>
            <input type="password" className="w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <input type="password" className="w-full" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
            <input type="password" className="w-full" />
          </div>
        </div>
        <button className="mt-6 bg-navy text-gold border border-gold px-6 py-2 rounded-lg hover:bg-navy-light transition-colors">
          Update Password
        </button>
      </div>

      {/* Data Management */}
      <div className="bg-navy-card rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Data Management</h2>
        <div className="flex gap-4">
          <button className="bg-navy text-gold border border-gold px-6 py-2 rounded-lg hover:bg-navy-light transition-colors">
            Export All Data (JSON)
          </button>
          <button className="bg-navy text-gold border border-gold px-6 py-2 rounded-lg hover:bg-navy-light transition-colors">
            Import Data
          </button>
        </div>
      </div>
    </div>
  );
}
