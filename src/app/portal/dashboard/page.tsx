'use client';

import Link from 'next/link';

// Demo data
const stats = [
  { label: 'Active Sites', value: '8' },
  { label: 'Total MW', value: '485' },
  { label: 'Est. Exit Value', value: '$142.5M' },
  { label: 'Avg Risk Score', value: '2.3' },
];

const sites = [
  { id: 1, name: 'Site Alpha', location: 'Springfield, OH', stage: 3, mw: 75, risk: 'Low', exitValue: '$22.5M' },
  { id: 2, name: 'Site Beta', location: 'Columbus, OH', stage: 2, mw: 50, risk: 'Med', exitValue: '$15.0M' },
  { id: 3, name: 'Site Gamma', location: 'Indianapolis, IN', stage: 1, mw: 100, risk: 'High', exitValue: '$30.0M' },
  { id: 4, name: 'Site Delta', location: 'Louisville, KY', stage: 4, mw: 60, risk: 'Low', exitValue: '$18.0M' },
  { id: 5, name: 'Site Epsilon', location: 'Cincinnati, OH', stage: 6, mw: 120, risk: 'Low', exitValue: '$36.0M' },
];

const recentActivity = [
  { site: 'Site Alpha', action: 'Power agreement signed with AEP', date: '2 hours ago' },
  { site: 'Site Beta', action: 'Gas feasibility study completed', date: '1 day ago' },
  { site: 'Site Gamma', action: 'Initial site visit scheduled', date: '2 days ago' },
  { site: 'Site Delta', action: 'Air permit application submitted', date: '3 days ago' },
];

const riskColors: Record<string, string> = {
  Low: '#16a34a',
  Med: '#ca8a04', 
  High: '#dc2626',
};

export default function DashboardPage() {
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
        {stats.map((stat) => (
          <div key={stat.label} style={{ 
            backgroundColor: 'white', 
            padding: '16px', 
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{stat.label}</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>{stat.value}</p>
          </div>
        ))}
      </div>

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
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Risk</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Exit Value</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site, i) => (
                <tr key={site.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/portal/sites/${site.id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ fontWeight: 500, color: '#111827' }}>{site.name}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>{site.location}</p>
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      fontSize: '12px', 
                      fontWeight: 500,
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      borderRadius: '4px'
                    }}>
                      Stage {site.stage}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#111827' }}>{site.mw}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      fontSize: '12px', 
                      fontWeight: 500,
                      color: riskColors[site.risk],
                      backgroundColor: `${riskColors[site.risk]}15`,
                      borderRadius: '4px'
                    }}>
                      {site.risk}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 500, color: '#111827' }}>{site.exitValue}</td>
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
            {recentActivity.map((activity, i) => (
              <div key={i} style={{ 
                paddingBottom: '12px', 
                marginBottom: '12px',
                borderBottom: i < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none'
              }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{activity.site}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{activity.action}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{activity.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
