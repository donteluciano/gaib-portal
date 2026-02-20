'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface ChecklistItem {
  site_id: string;
  status: string;
}

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
    askingPrice?: number;
    exitPricePerMW?: number;
  };
  updated_at: string;
}

interface SiteWithProgress extends Site {
  progress: { completed: number; total: number };
  estimatedMW: number;
  riskLevel: 'low' | 'medium' | 'high';
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

function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  let barColor = '#ef4444'; // red
  if (percent >= 75) barColor = '#22c55e'; // green
  else if (percent >= 50) barColor = '#eab308'; // yellow
  else if (percent >= 25) barColor = '#ca8a04'; // darker yellow
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '60px', backgroundColor: '#1e293b', borderRadius: '4px', height: '6px' }}>
        <div style={{ width: `${percent}%`, backgroundColor: barColor, borderRadius: '4px', height: '6px' }} />
      </div>
      <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '36px' }}>{percent}%</span>
    </div>
  );
}

function RiskDot({ level }: { level: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#ef4444',
  };
  
  return (
    <span style={{
      display: 'inline-block',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: colors[level],
    }} title={`${level} risk`} />
  );
}

export default function PipelinePage() {
  const [sites, setSites] = useState<SiteWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');

  const loadSites = async () => {
    // Fetch sites
    const { data: sitesData } = await supabase
      .from('sites')
      .select('*')
      .order('stage', { ascending: true })
      .order('updated_at', { ascending: false });
    
    // Fetch all checklist items to calculate progress
    const { data: checklistData } = await supabase
      .from('checklist_items')
      .select('site_id, status');

    const checklistBySite: Record<string, ChecklistItem[]> = {};
    (checklistData || []).forEach(item => {
      if (!checklistBySite[item.site_id]) {
        checklistBySite[item.site_id] = [];
      }
      checklistBySite[item.site_id].push(item);
    });

    const sitesWithProgress: SiteWithProgress[] = (sitesData || []).map(site => {
      const siteChecklist = checklistBySite[site.id] || [];
      const completed = siteChecklist.filter(i => i.status === 'complete').length;
      const total = siteChecklist.length || 47; // Default to 47 if no checklist items

      // Calculate MW
      const gasVolume = site.inputs?.gasVolume || 0;
      const gasPressure = site.inputs?.gasPressure || 0;
      let estimatedMW = 0;
      if (gasVolume > 0) {
        let divisor = 10;
        if (gasPressure > 500) divisor = 7;
        else if (gasPressure > 300) divisor = 8.5;
        estimatedMW = Math.round(gasVolume / divisor / 192);
      }

      // Calculate simple risk level based on inputs
      const inputs = site.inputs || {};
      let riskScore = 0;
      if (inputs.phaseIStatus === 'flagged') riskScore += 3;
      if (inputs.waterSource === 'contested' || inputs.waterSource === 'none') riskScore += 2;
      if (inputs.politicalClimate === 'hostile') riskScore += 4;
      if (inputs.airPermitPathway !== 'identified') riskScore += 2;
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (riskScore >= 6) riskLevel = 'high';
      else if (riskScore >= 3) riskLevel = 'medium';

      return {
        ...site,
        progress: { completed, total },
        estimatedMW,
        riskLevel,
      };
    });
    
    setSites(sitesWithProgress);
    setLoading(false);
  };

  useEffect(() => {
    loadSites();
  }, []);

  const filteredSites = stageFilter === 'all' 
    ? sites 
    : sites.filter(s => s.stage === stageFilter);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Pipeline</h1>
        <Link
          href="/portal/new-site"
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          + Add Site
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <label style={{ fontSize: '14px', color: '#6b7280' }}>Filter by stage:</label>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          style={{ border: '1px solid #d1d5db', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', color: '#111827', backgroundColor: 'white' }}
        >
          <option value="all">All Stages</option>
          {Object.entries(stageNames).map(([num, name]) => (
            <option key={num} value={num}>Stage {num}: {name}</option>
          ))}
        </select>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>{filteredSites.length} sites</span>
      </div>

      {filteredSites.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>No sites found.</p>
          <Link
            href="/portal/new-site"
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#2563eb', 
              color: 'white', 
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '6px',
              textDecoration: 'none'
            }}
          >
            + Add Site
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Site</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Stage</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Progress</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>MW</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Risk</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map((site, i) => (
                <tr key={site.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/portal/sites/${site.id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ fontWeight: 500, color: '#2563eb' }}>{site.name}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>{site.city}, {site.state}</p>
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 500, backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '4px' }}>
                      {site.stage}. {stageNames[site.stage] || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <ProgressBar completed={site.progress.completed} total={site.progress.total} />
                  </td>
                  <td style={{ padding: '12px 16px', color: '#111827' }}>{site.estimatedMW || '-'} MW</td>
                  <td style={{ padding: '12px 16px' }}>
                    <RiskDot level={site.riskLevel} />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      fontSize: '12px', 
                      fontWeight: 500, 
                      backgroundColor: site.status === 'active' ? '#dcfce7' : site.status === 'killed' ? '#fee2e2' : '#fef3c7',
                      color: site.status === 'active' ? '#16a34a' : site.status === 'killed' ? '#dc2626' : '#ca8a04',
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
        </div>
      )}
    </div>
  );
}
