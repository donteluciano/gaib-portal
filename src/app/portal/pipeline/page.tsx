'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Site {
  id: string;
  name: string;
  city: string;
  state: string;
  stage: number;
  status: string;
  inputs: { mw?: number; askingPrice?: number };
  updated_at: string;
}

const stageNames: Record<number, string> = {
  1: 'Site Control',
  2: 'Gas & Power',
  3: 'Water & Enviro',
  4: 'Fiber & Access',
  5: 'Political',
  6: 'Engineering',
  7: 'Exit',
};

export default function PipelinePage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    loadSites();
  }, []);

  async function loadSites() {
    const { data } = await supabase
      .from('sites')
      .select('*')
      .order('stage', { ascending: true })
      .order('updated_at', { ascending: false });
    
    setSites(data || []);
    setLoading(false);
  }

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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>MW</th>
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
                  <td style={{ padding: '12px 16px', color: '#111827' }}>{site.inputs?.mw || '-'} MW</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      fontSize: '12px', 
                      fontWeight: 500, 
                      backgroundColor: site.status === 'active' ? '#dcfce7' : '#fef3c7',
                      color: site.status === 'active' ? '#16a34a' : '#ca8a04',
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
