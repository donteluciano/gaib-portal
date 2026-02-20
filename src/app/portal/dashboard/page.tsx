'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Site {
  id: string;
  name: string;
  city: string;
  state: string;
  stage: number;
  inputs: { 
    gasVolume?: number;
    gasPressure?: number;
    phaseIStatus?: string;
    waterSource?: string;
    politicalClimate?: string;
    airPermitPathway?: string;
  };
  status: string;
  updated_at: string;
}

interface SiteWithProgress extends Site {
  progress: { completed: number; total: number };
  estimatedMW: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface Activity {
  id: string;
  site_id: string;
  action: string;
  date: string;
  sites?: { name: string };
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

function ProgressBar({ completed, total, size = 'normal' }: { completed: number; total: number; size?: 'normal' | 'small' }) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  let barColor = '#ef4444'; // red
  if (percent >= 75) barColor = '#22c55e'; // green
  else if (percent >= 50) barColor = '#eab308'; // yellow
  else if (percent >= 25) barColor = '#ca8a04'; // darker yellow
  
  if (size === 'small') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
        <div style={{ flex: 1, backgroundColor: '#e5e7eb', borderRadius: '4px', height: '4px' }}>
          <div style={{ width: `${percent}%`, backgroundColor: barColor, borderRadius: '4px', height: '4px' }} />
        </div>
        <span style={{ fontSize: '11px', color: '#6b7280' }}>{percent}%</span>
      </div>
    );
  }
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '60px', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '6px' }}>
        <div style={{ width: `${percent}%`, backgroundColor: barColor, borderRadius: '4px', height: '6px' }} />
      </div>
      <span style={{ fontSize: '12px', color: '#6b7280' }}>{percent}%</span>
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
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: colors[level],
      marginLeft: '8px',
    }} title={`${level} risk`} />
  );
}

export default function DashboardPage() {
  const [sites, setSites] = useState<SiteWithProgress[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [sitesRes, activitiesRes, checklistRes] = await Promise.all([
      supabase.from('sites').select('*').eq('status', 'active').order('updated_at', { ascending: false }),
      supabase.from('activities').select('*, sites(name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('checklist_items').select('site_id, status'),
    ]);
    
    // Build checklist progress by site
    const checklistBySite: Record<string, { completed: number; total: number }> = {};
    (checklistRes.data || []).forEach(item => {
      if (!checklistBySite[item.site_id]) {
        checklistBySite[item.site_id] = { completed: 0, total: 0 };
      }
      checklistBySite[item.site_id].total++;
      if (item.status === 'complete') {
        checklistBySite[item.site_id].completed++;
      }
    });

    // Enrich sites with progress and calculated values
    const sitesWithProgress: SiteWithProgress[] = (sitesRes.data || []).map(site => {
      const progress = checklistBySite[site.id] || { completed: 0, total: 47 };

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

      // Calculate risk level
      const inputs = site.inputs || {};
      let riskScore = 0;
      if (inputs.phaseIStatus === 'flagged') riskScore += 3;
      if (inputs.waterSource === 'contested' || inputs.waterSource === 'none') riskScore += 2;
      if (inputs.politicalClimate === 'hostile') riskScore += 4;
      if (inputs.airPermitPathway !== 'identified') riskScore += 2;
      
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (riskScore >= 6) riskLevel = 'high';
      else if (riskScore >= 3) riskLevel = 'medium';

      return { ...site, progress, estimatedMW, riskLevel };
    });
    
    setSites(sitesWithProgress);
    setActivities(activitiesRes.data || []);
    setLoading(false);
  }

  const totalMW = sites.reduce((sum, s) => sum + (s.estimatedMW || 0), 0);
  const avgProgress = sites.length > 0 
    ? Math.round(sites.reduce((sum, s) => sum + (s.progress.total > 0 ? s.progress.completed / s.progress.total * 100 : 0), 0) / sites.length)
    : 0;

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Dashboard</h1>
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

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Active Sites</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>{sites.length}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total MW</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>{totalMW}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Avg Progress</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>{avgProgress}%</p>
        </div>
      </div>

      {sites.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>No sites yet. Add your first site to get started.</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Site Cards */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Active Sites</h2>
            </div>
            <div style={{ padding: '16px' }}>
              {sites.slice(0, 5).map((site, i) => (
                <Link 
                  key={site.id} 
                  href={`/portal/sites/${site.id}`} 
                  style={{ 
                    display: 'block',
                    padding: '12px', 
                    marginBottom: i < Math.min(sites.length, 5) - 1 ? '12px' : 0, 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{ fontWeight: 500, color: '#111827' }}>{site.name}</p>
                        <RiskDot level={site.riskLevel} />
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>{site.city}, {site.state}</p>
                    </div>
                    <span style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px', 
                      fontWeight: 500, 
                      backgroundColor: '#f3f4f6', 
                      color: '#374151', 
                      borderRadius: '4px' 
                    }}>
                      Stage {site.stage}
                    </span>
                  </div>
                  <ProgressBar completed={site.progress.completed} total={site.progress.total} size="small" />
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                    <span>{stageNames[site.stage]}</span>
                    {site.estimatedMW > 0 && <span>{site.estimatedMW} MW</span>}
                  </div>
                </Link>
              ))}
              {sites.length > 5 && (
                <Link 
                  href="/portal/pipeline" 
                  style={{ 
                    display: 'block', 
                    textAlign: 'center', 
                    padding: '12px', 
                    color: '#2563eb', 
                    fontSize: '14px',
                    textDecoration: 'none'
                  }}
                >
                  View all {sites.length} sites →
                </Link>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Recent Activity</h2>
            </div>
            <div style={{ padding: '16px' }}>
              {activities.length === 0 ? (
                <p style={{ color: '#6b7280', fontSize: '14px' }}>No activity yet.</p>
              ) : (
                activities.map((activity, i) => (
                  <div key={activity.id} style={{ paddingBottom: '12px', marginBottom: '12px', borderBottom: i < activities.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{activity.sites?.name}</p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{activity.action}</p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{activity.date}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
