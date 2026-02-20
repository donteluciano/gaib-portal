'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    deals: true,
    reports: true,
    distributions: true,
    marketing: false,
  });

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your account preferences and notifications.</p>
      </div>

      {/* Profile section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Profile Information</h2>
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">DB</span>
          </div>
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue="Donte"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue="Bronaugh"
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Email</label>
              <input
                type="email"
                defaultValue="donte@gaibcapital.com"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Phone</label>
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      {/* Notification preferences */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-zinc-400 text-sm">Receive notifications via email</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, email: !n.email }))}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.email ? 'bg-amber-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">New Deal Alerts</p>
              <p className="text-zinc-400 text-sm">Get notified when new investment opportunities are available</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, deals: !n.deals }))}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.deals ? 'bg-amber-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.deals ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Quarterly Reports</p>
              <p className="text-zinc-400 text-sm">Receive notifications when new reports are published</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, reports: !n.reports }))}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.reports ? 'bg-amber-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.reports ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Distribution Notices</p>
              <p className="text-zinc-400 text-sm">Get notified when distributions are sent</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, distributions: !n.distributions }))}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.distributions ? 'bg-amber-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.distributions ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Marketing Communications</p>
              <p className="text-zinc-400 text-sm">Receive news and updates from GAIB Capital</p>
            </div>
            <button
              onClick={() => setNotifications(n => ({ ...n, marketing: !n.marketing }))}
              className={`w-12 h-6 rounded-full transition-colors ${notifications.marketing ? 'bg-amber-500' : 'bg-zinc-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${notifications.marketing ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Security</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Password</p>
              <p className="text-zinc-400 text-sm">Last changed 30 days ago</p>
            </div>
            <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors">
              Change Password
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Two-Factor Authentication</p>
              <p className="text-zinc-400 text-sm">Add an extra layer of security</p>
            </div>
            <button className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
              Enabled
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Active Sessions</p>
              <p className="text-zinc-400 text-sm">Manage your logged in devices</p>
            </div>
            <button className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors">
              View Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-zinc-900 border border-red-500/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
        <p className="text-zinc-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}
