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
  
  let barColor = '#ef4444';
  if (percent >= 75) barColor = '#22c55e';
  else if (percent >= 50) barColor = '#eab308';
  else if (percent >= 25) barColor = '#ca8a04';
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '80px', backgroundColor: 'var(--border)', borderRadius: '4px', height: '8px' }}>
        <div style={{ width: `${percent}%`, backgroundColor: barColor, borderRadius: '4px', height: '8px' }} />
      </div>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '40px' }}>{percent}%</span>
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
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: colors[level],
    }} title={`${level} risk`} />
  );
}

export default function PipelinePage() {
  const [sites, setSites] = useState<SiteWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadSites = async () => {
    const { data: sitesData } = await supabase
      .from('sites')
      .select('*')
      .order('stage', { ascending: true })
      .order('updated_at', { ascending: false });
    
    const { data: checklistData } = await supabase
      .from('checklist_items')
      .select('site_id, status');

    const checklistBySite: Record<string, ChecklistItem[]> = {};
    (checklistData || []).forEach((item: ChecklistItem) => {
      if (!checklistBySite[item.site_id]) checklistBySite[item.site_id] = [];
      checklistBySite[item.site_id].push(item);
    });

    const sitesWithProgress: SiteWithProgress[] = (sitesData || []).map((site: Site) => {
      const items = checklistBySite[site.id] || [];
      const completed = items.filter(i => i.status === 'complete').length;
      const total = items.length || 47;
      
      const gasVolume = site.inputs?.gasVolume || 0;
      const gasPressure = site.inputs?.gasPressure || 0;
      let mw = 0;
      if (gasVolume > 0) {
        const divisor = gasPressure > 500 ? 7 : gasPressure > 300 ? 8.5 : 10;
        mw = Math.round(gasVolume / divisor / 192);
      }

      let riskScore = 0;
      if (!site.inputs?.gasVolume) riskScore += 2;
      if (!site.inputs?.gasPressure) riskScore += 1;
      
      return {
        ...site,
        progress: { completed, total },
        estimatedMW: mw,
        riskLevel: riskScore >= 6 ? 'high' : riskScore >= 3 ? 'medium' : 'low',
      };
    });

    setSites(sitesWithProgress);
    setLoading(false);
  };

  useEffect(() => {
    loadSites();
  }, []);

  const filteredSites = sites.filter(site => {
    if (stageFilter !== 'all' && site.stage !== stageFilter) return false;
    if (statusFilter !== 'all' && site.status !== statusFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!site.name.toLowerCase().includes(search) && 
          !site.city?.toLowerCase().includes(search) && 
          !site.state?.toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  });

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>Pipeline</h1>
        <Link
          href="/portal/new-site"
          style={{ 
            padding: '10px 20px', 
            backgroundColor: 'var(--accent)', 
            color: '#FFFFFF', 
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          + Add Site
        </Link>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, city, or state..."
          style={{
            padding: '10px 14px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
            width: '280px',
            backgroundColor: 'var(--bg-input)',
            color: 'var(--text-primary)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Stage:</label>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            style={{ 
              border: '1px solid var(--border)', 
              borderRadius: '6px', 
              padding: '10px 14px', 
              fontSize: '14px', 
              color: 'var(--text-primary)', 
              backgroundColor: 'var(--bg-input)' 
            }}
          >
            <option value="all">All Stages</option>
            {Object.entries(stageNames).map(([num, name]) => (
              <option key={num} value={num}>Stage {num}: {name}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ 
              border: '1px solid var(--border)', 
              borderRadius: '6px', 
              padding: '10px 14px', 
              fontSize: '14px', 
              color: 'var(--text-primary)', 
              backgroundColor: 'var(--bg-input)' 
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="killed">Killed</option>
          </select>
        </div>
        <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: 500 }}>{filteredSites.length} sites</span>
      </div>

      {filteredSites.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '48px', borderRadius: '12px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '16px' }}>
            {sites.length === 0 ? 'No sites found. Add your first site to get started.' : 'No sites match the current filters.'}
          </p>
          {sites.length === 0 && (
            <Link
              href="/portal/new-site"
              style={{ 
                padding: '12px 24px', 
                backgroundColor: 'var(--accent)', 
                color: '#FFFFFF', 
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              + Add Site
            </Link>
          )}
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-card)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-card)', backgroundColor: 'var(--bg-primary)' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Site</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stage</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progress</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MW</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSites.map((site, i) => (
                <tr key={site.id} style={{ borderTop: i > 0 ? '1px solid var(--border-card)' : 'none' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <Link href={`/portal/sites/${site.id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px', marginBottom: '4px' }}>{site.name}</p>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{site.city}, {site.state}</p>
                    </Link>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ padding: '6px 12px', fontSize: '12px', fontWeight: 500, backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderRadius: '6px', border: '1px solid var(--border-card)' }}>
                      {site.stage}. {stageNames[site.stage] || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <ProgressBar completed={site.progress.completed} total={site.progress.total} />
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-primary)', fontWeight: 500, fontSize: '15px' }}>{site.estimatedMW || '—'} MW</td>
                  <td style={{ padding: '16px 20px' }}>
                    <RiskDot level={site.riskLevel} />
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ 
                      padding: '6px 12px', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      backgroundColor: site.status === 'active' ? '#DCFCE7' : site.status === 'killed' ? '#FEE2E2' : '#FEF3C7',
                      color: site.status === 'active' ? '#166534' : site.status === 'killed' ? '#991B1B' : '#92400E',
                      borderRadius: '6px',
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
