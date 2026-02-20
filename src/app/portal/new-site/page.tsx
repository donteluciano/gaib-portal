'use client';

import { useState } from 'react';

export default function NewSitePage() {
  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState({ city: '', state: '', county: '' });
  const [acreage, setAcreage] = useState('');
  const [askingPrice, setAskingPrice] = useState('');

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-white">New Site Evaluation</h1>
        <p className="text-muted mt-1">Add a new site to the acquisition pipeline.</p>
      </div>

      <form className="space-y-8">
        {/* Site Info Section */}
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <h2 className="text-xl font-serif text-white mb-6">Site Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted mb-2">Site Name</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g., Site Alpha"
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">City</label>
              <input
                type="text"
                value={location.city}
                onChange={(e) => setLocation({ ...location, city: e.target.value })}
                placeholder="Springfield"
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">State</label>
              <input
                type="text"
                value={location.state}
                onChange={(e) => setLocation({ ...location, state: e.target.value })}
                placeholder="OH"
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Acreage</label>
              <input
                type="number"
                value={acreage}
                onChange={(e) => setAcreage(e.target.value)}
                placeholder="25"
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Asking Price</label>
              <input
                type="number"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="1500000"
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
          </div>
        </div>

        {/* Gas & Power Section */}
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <h2 className="text-xl font-serif text-white mb-6">Gas & Power</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Pipeline Distance (miles)</label>
              <input
                type="number"
                placeholder="2"
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Pipeline Diameter (inches)</label>
              <input
                type="number"
                placeholder="24"
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Estimated MW Capacity</label>
              <input
                type="number"
                placeholder="75"
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Transmission Distance (miles)</label>
              <input
                type="number"
                placeholder="5"
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none"
              />
            </div>
          </div>
        </div>

        {/* Stage & Notes */}
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <h2 className="text-xl font-serif text-white mb-6">Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Current Stage</label>
              <select className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none">
                <option value="1">Stage 1: Identified</option>
                <option value="2">Stage 2: Gas Confirmed</option>
                <option value="3">Stage 3: Power Secured</option>
                <option value="4">Stage 4: Permits Filed</option>
                <option value="5">Stage 5: De-risked</option>
                <option value="6">Stage 6: Marketing</option>
                <option value="7">Stage 7: Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Status</label>
              <select className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold outline-none">
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="killed">Killed</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted mb-2">Notes</label>
              <textarea
                rows={4}
                placeholder="Initial observations, key risks, next steps..."
                className="w-full px-4 py-3 bg-navy border border-navy-card rounded-lg text-white placeholder-muted focus:border-gold focus:ring-1 focus:ring-gold outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-8 py-3 bg-gold hover:bg-gold-dark text-navy font-semibold rounded-lg transition-colors"
          >
            Save Site
          </button>
          <a
            href="/portal/dashboard"
            className="px-8 py-3 bg-navy-card hover:bg-navy text-white font-medium rounded-lg transition-colors border border-navy"
          >
            Cancel
          </a>
        </div>
      </form>

      {/* Coming Soon: Full Simulator */}
      <div className="bg-navy border border-gold/20 rounded-xl p-6 text-center">
        <p className="text-gold">
          Full site evaluation simulator with MW calculations, exit projections, and risk scoring coming soon.
        </p>
      </div>
    </div>
  );
}
