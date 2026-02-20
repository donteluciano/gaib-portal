'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [fundSettings, setFundSettings] = useState({
    fundSize: 10000000,
    prefReturn: 16,
    lpSplit: 60,
    gpSplit: 40,
  });

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-white">Settings</h1>
        <p className="text-muted mt-1">Configure portal and fund assumptions.</p>
      </div>

      {/* Fund Assumptions */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">Fund Assumptions</h2>
        <p className="text-muted text-sm mb-6">These values are used in all site calculations and projections.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Fund Size</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input
                type="number"
                value={fundSettings.fundSize}
                onChange={(e) => setFundSettings({ ...fundSettings, fundSize: parseInt(e.target.value) })}
                className="w-full pl-8 pr-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Preferred Return</label>
            <div className="relative">
              <input
                type="number"
                value={fundSettings.prefReturn}
                onChange={(e) => setFundSettings({ ...fundSettings, prefReturn: parseInt(e.target.value) })}
                className="w-full pr-8 px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">LP Split</label>
            <div className="relative">
              <input
                type="number"
                value={fundSettings.lpSplit}
                onChange={(e) => setFundSettings({ ...fundSettings, lpSplit: parseInt(e.target.value) })}
                className="w-full pr-8 px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">GP Split (Carry)</label>
            <div className="relative">
              <input
                type="number"
                value={fundSettings.gpSplit}
                onChange={(e) => setFundSettings({ ...fundSettings, gpSplit: parseInt(e.target.value) })}
                className="w-full pr-8 px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">%</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button className="px-6 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors">
            Save Fund Settings
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">Portal Password</h2>
        <div className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
            />
          </div>
          <button className="px-6 py-3 bg-navy hover:bg-navy-dark text-white font-medium rounded-lg transition-colors border border-navy-card">
            Update Password
          </button>
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

      {/* Stage Labels */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-6">Stage Labels</h2>
        <div className="space-y-3">
          {['Identified', 'Gas Confirmed', 'Power Secured', 'Permits Filed', 'De-risked', 'Marketing', 'Closed'].map((stage, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-gold w-20">Stage {i + 1}:</span>
              <input
                type="text"
                defaultValue={stage}
                className="flex-1 px-4 py-2 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button className="px-6 py-3 bg-navy hover:bg-navy-dark text-white font-medium rounded-lg transition-colors border border-navy-card">
            Save Stage Labels
          </button>
        </div>
      </div>
    </div>
  );
}
