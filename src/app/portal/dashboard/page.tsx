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
  inputs: { mw?: number };
  status: string;
  updated_at: string;
}

interface Activity {
  id: string;
  site_id: string;
  action: string;
  date: string;
  sites?: { name: string };
}

export default function DashboardPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [sitesRes, activitiesRes] = await Promise.all([
      supabase.from('sites').select('*').eq('status', 'active').order('updated_at', { ascending: false }),
      supabase.from('activities').select('*, sites(name)').order('created_at', { ascending: false }).limit(5)
    ]);
    
    setSites(sitesRes.data || []);
    setActivities(activitiesRes.data || []);
    setLoading(false);
  }

  const totalMW = sites.reduce((sum, s) => sum + (s.inputs?.mw || 0), 0);

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
          {/* Sites Table */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Active Sites</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Site</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Stage</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>MW</th>
                </tr>
              </thead>
              <tbody>
                {sites.slice(0, 5).map((site, i) => (
                  <tr key={site.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Link href={`/portal/sites/${site.id}`} style={{ textDecoration: 'none' }}>
                        <p style={{ fontWeight: 500, color: '#2563eb' }}>{site.name}</p>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>{site.city}, {site.state}</p>
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 500, backgroundColor: '#f3f4f6', color: '#374151', borderRadius: '4px' }}>
                        Stage {site.stage}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#111827' }}>{site.inputs?.mw || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
