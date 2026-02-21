'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  async function exportAllData() {
    setExporting(true);
    setSaveMessage('');

    try {
      // Fetch all data from relevant tables
      const [sitesRes, leadsRes, activitiesRes, checklistRes, settingsRes] = await Promise.all([
        supabase.from('sites').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('activities').select('*'),
        supabase.from('checklist_items').select('*'),
        supabase.from('fund_settings').select('*'),
      ]);

      // Try to get additional tables (may not exist)
      let actualsRes = { data: [] as unknown[] };
      let ddAnswersRes = { data: [] as unknown[] };
      let incentivesRes = { data: [] as unknown[] };
      
      try {
        const res = await supabase.from('site_actuals').select('*');
        if (res.data) actualsRes = res;
      } catch { /* table may not exist */ }
      
      try {
        const res = await supabase.from('dd_answers').select('*');
        if (res.data) ddAnswersRes = res;
      } catch { /* table may not exist */ }
      
      try {
        const res = await supabase.from('site_incentives').select('*');
        if (res.data) incentivesRes = res;
      } catch { /* table may not exist */ }

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        sites: sitesRes.data || [],
        leads: leadsRes.data || [],
        activities: activitiesRes.data || [],
        checklistItems: checklistRes.data || [],
        fundSettings: settingsRes.data || [],
        siteActuals: actualsRes.data || [],
        ddAnswers: ddAnswersRes.data || [],
        siteIncentives: incentivesRes.data || [],
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gaib-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setSaveMessage(`Exported ${exportData.sites.length} sites, ${exportData.leads.length} leads, and all related data.`);
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (err) {
      setSaveMessage(`Export error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
    setExporting(false);
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('Importing data will add to your existing data. Continue?')) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImporting(true);
    setSaveMessage('');

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      let imported = { sites: 0, leads: 0, activities: 0 };

      // Import sites (update existing or insert new)
      if (data.sites?.length > 0) {
        for (const site of data.sites) {
          const { error } = await supabase
            .from('sites')
            .upsert(site, { onConflict: 'id' });
          if (!error) imported.sites++;
        }
      }

      // Import leads
      if (data.leads?.length > 0) {
        for (const lead of data.leads) {
          const { error } = await supabase
            .from('leads')
            .upsert(lead, { onConflict: 'id' });
          if (!error) imported.leads++;
        }
      }

      // Import activities
      if (data.activities?.length > 0) {
        for (const activity of data.activities) {
          const { error } = await supabase
            .from('activities')
            .upsert(activity, { onConflict: 'id' });
          if (!error) imported.activities++;
        }
      }

      // Import checklist items
      if (data.checklistItems?.length > 0) {
        for (const item of data.checklistItems) {
          await supabase
            .from('checklist_items')
            .upsert(item, { onConflict: 'id' });
        }
      }

      setSaveMessage(`Imported: ${imported.sites} sites, ${imported.leads} leads, ${imported.activities} activities`);
      setTimeout(() => setSaveMessage(''), 5000);
    } catch (err) {
      setSaveMessage(`Import error: ${err instanceof Error ? err.message : 'Invalid JSON file'}`);
    }

    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '896px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '30px', fontFamily: 'Georgia, serif', color: 'var(--text-primary)' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Configure portal and fund assumptions.</p>
      </div>

      {/* Fund Assumptions */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: '24px' }}>Fund Assumptions</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>These values are used in all site calculations and projections.</p>
        
        {saveMessage && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '12px', 
            borderRadius: '8px',
            backgroundColor: saveMessage.includes('Error') || saveMessage.includes('error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            color: saveMessage.includes('Error') || saveMessage.includes('error') ? '#f87171' : '#4ade80'
          }}>
            {saveMessage}
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Fund Size</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                min="0"
                value={fundSettings.fundSize}
                onChange={(e) => setFundSettings({ ...fundSettings, fundSize: Math.max(0, parseInt(e.target.value) || 0) })}
                style={{
                  width: '100%',
                  paddingLeft: '32px',
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: $10,000,000</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Preferred Return</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={fundSettings.prefReturn}
                onChange={(e) => setFundSettings({ ...fundSettings, prefReturn: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                style={{
                  width: '100%',
                  paddingRight: '32px',
                  paddingLeft: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>%</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: 16%</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>LP Split</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={fundSettings.lpSplit}
                onChange={(e) => setFundSettings({ ...fundSettings, lpSplit: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                style={{
                  width: '100%',
                  paddingRight: '32px',
                  paddingLeft: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>%</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: 60%</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>GP Split (Carry)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={fundSettings.gpSplit}
                onChange={(e) => setFundSettings({ ...fundSettings, gpSplit: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                style={{
                  width: '100%',
                  paddingRight: '32px',
                  paddingLeft: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>%</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: 40%</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Management Fee</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={fundSettings.managementFee}
                onChange={(e) => setFundSettings({ ...fundSettings, managementFee: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                style={{
                  width: '100%',
                  paddingRight: '32px',
                  paddingLeft: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
              <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>%</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: 0%</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)', marginBottom: '8px' }}>Commitment Fee (per $1M)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                min="0"
                value={fundSettings.commitmentFeePerM}
                onChange={(e) => setFundSettings({ ...fundSettings, commitmentFeePerM: Math.max(0, parseInt(e.target.value) || 0) })}
                style={{
                  width: '100%',
                  paddingLeft: '32px',
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Default: $50,000</p>
          </div>
        </div>
        <div style={{ marginTop: '24px' }}>
          <button 
            onClick={saveFundSettings}
            disabled={saving}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-secondary)',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
            }}
          >
            {saving ? 'Saving...' : 'Save Fund Settings'}
          </button>
        </div>
      </div>

      {/* Stage Labels (Read-only per spec) */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: '24px' }}>Stage Labels</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Standard pipeline stages for site progression.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stageLabels.map((stage, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: 'var(--accent)', width: '80px' }}>Stage {i + 1}:</span>
              <div style={{ 
                flex: 1, 
                padding: '8px 16px', 
                backgroundColor: 'var(--bg-input)', 
                border: '1px solid var(--border-card)', 
                borderRadius: '8px', 
                color: 'var(--text-primary)' 
              }}>
                {stage}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontFamily: 'Georgia, serif', color: 'var(--text-primary)', marginBottom: '24px' }}>Data Management</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Export all portal data or import from a previous backup.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <button 
            onClick={exportAllData}
            disabled={exporting}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontWeight: 500,
              borderRadius: '8px',
              border: '1px solid var(--border-card)',
              cursor: exporting ? 'not-allowed' : 'pointer',
              opacity: exporting ? 0.5 : 1,
            }}
          >
            {exporting ? 'Exporting...' : '📥 Export All Data (JSON)'}
          </button>
          <label style={{
            padding: '12px 24px',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-primary)',
            fontWeight: 500,
            borderRadius: '8px',
            border: '1px solid var(--border-card)',
            cursor: importing ? 'not-allowed' : 'pointer',
          }}>
            {importing ? 'Importing...' : '📤 Import Data'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={importing}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '16px' }}>
          Export creates a complete backup of all sites, leads, activities, and settings. Import will add/update records based on IDs.
        </p>
      </div>

      {/* Danger Zone */}
      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontFamily: 'Georgia, serif', color: '#f87171', marginBottom: '16px' }}>Danger Zone</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>Irreversible actions. Use with caution.</p>
        <button 
          onClick={() => alert('Contact administrator to clear data.')}
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            fontWeight: 500,
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            cursor: 'pointer',
          }}
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}
