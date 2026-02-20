'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Site {
  id: string;
  name: string;
  city: string;
  state: string;
  stage: number;
  status: string;
  inputs: {
    gasVolume?: number;
    gasPressure?: number;
    exitPricePerMW?: number;
  };
}

const stageNames: Record<number, string> = {
  1: 'Site Control',
  2: 'Gas & Power',
  3: 'Water & Environmental',
  4: 'Fiber & Access',
  5: 'Political & Community',
  6: 'Engineering & Feasibility',
  7: 'Packaging & Exit',
};

export default function ReportsPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const loadSites = async () => {
    const { data } = await supabase
      .from('sites')
      .select('*')
      .order('stage', { ascending: true });
    
    if (data) {
      setSites(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSites();
  }, []);

  function calculateMW(site: Site): number {
    const gasVolume = site.inputs?.gasVolume || 0;
    const gasPressure = site.inputs?.gasPressure || 0;
    if (gasVolume === 0) return 0;
    
    let divisor = 10;
    if (gasPressure > 500) divisor = 7;
    else if (gasPressure > 300) divisor = 8.5;
    return Math.round(gasVolume / divisor / 192);
  }

  function exportCSV() {
    const headers = ['Name', 'City', 'State', 'Stage', 'Status', 'Est. MW'];
    const rows = sites.map(site => [
      site.name,
      site.city,
      site.state,
      `Stage ${site.stage}: ${stageNames[site.stage]}`,
      site.status,
      calculateMW(site),
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gaib-sites-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportJSON() {
    const data = sites.map(site => ({
      name: site.name,
      location: `${site.city}, ${site.state}`,
      stage: site.stage,
      stageName: stageNames[site.stage],
      status: site.status,
      estimatedMW: calculateMW(site),
      inputs: site.inputs,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gaib-sites-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Calculate summary stats
  const totalMW = sites.reduce((sum, s) => sum + calculateMW(s), 0);
  const activeSites = sites.filter(s => s.status === 'active').length;
  const avgStage = sites.length > 0 
    ? (sites.reduce((sum, s) => sum + s.stage, 0) / sites.length).toFixed(1)
    : 0;

  const stageDistribution = Object.fromEntries(
    [1, 2, 3, 4, 5, 6, 7].map(stage => [stage, sites.filter(s => s.stage === stage).length])
  );

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Reports</h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Generate portfolio summaries and export data.</p>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Total Sites</p>
          <p style={{ fontSize: '28px', fontWeight: 600, color: '#111827' }}>{sites.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Active Sites</p>
          <p style={{ fontSize: '28px', fontWeight: 600, color: '#16a34a' }}>{activeSites}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Total MW</p>
          <p style={{ fontSize: '28px', fontWeight: 600, color: '#2563eb' }}>{totalMW}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Avg Stage</p>
          <p style={{ fontSize: '28px', fontWeight: 600, color: '#b45309' }}>{avgStage}</p>
        </div>
      </div>

      {/* Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Portfolio Summary */}
        <div 
          onClick={() => setSelectedReport(selectedReport === 'summary' ? null : 'summary')}
          style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            border: selectedReport === 'summary' ? '2px solid #2563eb' : '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dbeafe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>📊</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Portfolio Summary</h3>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Overview of all sites with key metrics, stages, and pipeline status.
          </p>
        </div>

        {/* Stage Distribution */}
        <div 
          onClick={() => setSelectedReport(selectedReport === 'stages' ? null : 'stages')}
          style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            border: selectedReport === 'stages' ? '2px solid #2563eb' : '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>📈</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Stage Distribution</h3>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Breakdown of sites across all 7 pipeline stages.
          </p>
        </div>

        {/* MW Capacity */}
        <div 
          onClick={() => setSelectedReport(selectedReport === 'capacity' ? null : 'capacity')}
          style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '8px', 
            border: selectedReport === 'capacity' ? '2px solid #2563eb' : '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#dcfce7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '20px' }}>⚡</span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>MW Capacity Report</h3>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Estimated megawatt capacity per site and portfolio total.
          </p>
        </div>
      </div>

      {/* Report Content */}
      {selectedReport === 'summary' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Portfolio Summary</h2>
          {sites.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No sites in portfolio yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>Site</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>Location</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>Stage</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>MW</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: 500, color: '#111827' }}>{site.name}</td>
                    <td style={{ padding: '12px', color: '#6b7280' }}>{site.city}, {site.state}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        fontSize: '12px', 
                        fontWeight: 500, 
                        backgroundColor: '#f3f4f6', 
                        color: '#374151', 
                        borderRadius: '4px' 
                      }}>
                        {site.stage}. {stageNames[site.stage]}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#111827' }}>{calculateMW(site)} MW</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        fontSize: '12px', 
                        fontWeight: 500, 
                        backgroundColor: site.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: site.status === 'active' ? '#16a34a' : '#dc2626',
                        borderRadius: '4px',
                        textTransform: 'capitalize'
                      }}>
                        {site.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selectedReport === 'stages' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Stage Distribution</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {[1, 2, 3, 4, 5, 6, 7].map(stage => {
              const count = stageDistribution[stage];
              const percent = sites.length > 0 ? Math.round((count / sites.length) * 100) : 0;
              return (
                <div key={stage} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500, color: '#111827' }}>Stage {stage}</span>
                    <span style={{ fontWeight: 600, color: '#2563eb' }}>{count}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{stageNames[stage]}</p>
                  <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${percent}%`, 
                      backgroundColor: '#2563eb', 
                      borderRadius: '3px',
                      transition: 'width 0.3s' 
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedReport === 'capacity' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>MW Capacity Report</h2>
          {sites.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No sites with capacity data.</p>
          ) : (
            <>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#dbeafe', 
                borderRadius: '8px', 
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 500, color: '#1e40af' }}>Total Portfolio Capacity</span>
                <span style={{ fontSize: '24px', fontWeight: 600, color: '#1e40af' }}>{totalMW} MW</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {sites.filter(s => calculateMW(s) > 0).map(site => {
                  const mw = calculateMW(site);
                  const percent = totalMW > 0 ? Math.round((mw / totalMW) * 100) : 0;
                  return (
                    <div key={site.id} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500, color: '#111827' }}>{site.name}</span>
                        <span style={{ fontWeight: 600, color: '#16a34a' }}>{mw} MW</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{site.city}, {site.state}</p>
                      <div style={{ height: '6px', backgroundColor: '#e5e7eb', borderRadius: '3px' }}>
                        <div style={{ 
                          height: '100%', 
                          width: `${percent}%`, 
                          backgroundColor: '#16a34a', 
                          borderRadius: '3px' 
                        }} />
                      </div>
                      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>{percent}% of portfolio</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Export Buttons */}
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Export Data</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={exportCSV}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              fontWeight: 500,
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            📄 Export CSV
          </button>
          <button
            onClick={exportJSON}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              fontWeight: 500,
              fontSize: '14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            📋 Export JSON
          </button>
        </div>
      </div>

      {/* Coming Soon */}
      <div style={{ 
        backgroundColor: '#fffbeb', 
        border: '1px solid #fcd34d', 
        borderRadius: '8px', 
        padding: '16px', 
        marginTop: '24px',
        textAlign: 'center' 
      }}>
        <p style={{ color: '#92400e', fontSize: '14px' }}>
          💡 PDF export and automated LP update reports coming soon.
        </p>
      </div>
    </div>
  );
}
