'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Lead {
  id: string;
  address: string;
  city: string;
  state: string;
  county: string;
  acreage: string;
  asking_price: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  lead_status: string;
  lead_score: number;
  created_at: string;
  relationship: string;
  current_use: string;
  additional_notes: string;
  converted_site_id: string | null;
}

type LeadStatus = 'new' | 'reviewing' | 'qualified' | 'passed' | 'converted';

const statusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'passed', label: 'Passed' },
  { value: 'converted', label: 'Converted' },
];

function getStatusStyle(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case 'new': return { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' };
    case 'reviewing': return { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' };
    case 'qualified': return { bg: '#D1FAE5', text: '#059669', border: '#6EE7B7' };
    case 'passed': return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
    case 'converted': return { bg: '#DCFCE7', text: '#16A34A', border: '#86EFAC' };
    default: return { bg: '#F3F4F6', text: '#6B7280', border: '#D1D5DB' };
  }
}

function calculateLeadScore(lead: Partial<Lead>): number {
  let score = 0;
  const acreage = parseFloat(lead.acreage || '0');
  if (acreage >= 50) score += 25;
  else if (acreage >= 25) score += 20;
  else if (acreage >= 10) score += 15;
  else if (acreage >= 5) score += 10;
  else if (acreage > 0) score += 5;
  
  if (lead.city) score += 5;
  if (lead.state) score += 5;
  if (lead.county) score += 5;
  if (lead.address) score += 5;
  
  const price = parseFloat((lead.asking_price || '0').replace(/[^0-9.]/g, ''));
  if (price > 0 && acreage > 0) {
    const pricePerAcre = price / acreage;
    if (pricePerAcre <= 50000) score += 25;
    else if (pricePerAcre <= 100000) score += 20;
    else if (pricePerAcre <= 200000) score += 15;
    else if (pricePerAcre <= 500000) score += 10;
    else score += 5;
  }
  
  if (lead.email || lead.phone) score += 10;
  if (lead.first_name && lead.last_name) score += 5;
  
  const relationship = (lead.relationship || '').toLowerCase();
  if (relationship.includes('direct') || relationship.includes('owner')) score += 15;
  else if (relationship.includes('broker') || relationship.includes('costar')) score += 10;
  else if (relationship) score += 5;
  
  return Math.min(100, score);
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#16A34A';
  if (score >= 50) return '#EAB308';
  if (score >= 30) return '#F97316';
  return '#DC2626';
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | LeadStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newLead, setNewLead] = useState({
    address: '', city: '', state: '', county: '', acreage: '', asking_price: '',
    first_name: '', last_name: '', email: '', phone: '', company: '', relationship: '', current_use: '', additional_notes: '',
  });

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (dbError) {
        console.error('Leads error:', dbError);
        setError(`Failed to load leads: ${dbError.message}`);
      } else if (data) {
        const leadsWithScores = data.map(lead => ({ ...lead, lead_score: lead.lead_score || calculateLeadScore(lead) }));
        setLeads(leadsWithScores);
      }
    } catch (err) {
      console.error('Leads exception:', err);
      setError('Failed to load leads. Check console for details.');
    }
    setLoading(false);
  };

  useEffect(() => { loadLeads(); }, []);

  async function addLead() {
    if (!newLead.address || !newLead.city || !newLead.state) {
      setError('Address, city, and state are required');
      return;
    }
    setSaving(true);
    setError(null);
    const leadScore = calculateLeadScore(newLead);
    const { data, error: dbError } = await supabase.from('leads').insert({ ...newLead, lead_status: 'new', lead_score: leadScore }).select().single();
    if (!dbError && data) {
      setLeads([{ ...data, lead_score: leadScore }, ...leads]);
      setNewLead({ address: '', city: '', state: '', county: '', acreage: '', asking_price: '', first_name: '', last_name: '', email: '', phone: '', company: '', relationship: '', current_use: '', additional_notes: '' });
      setShowForm(false);
    } else {
      setError(dbError?.message || 'Failed to add lead');
    }
    setSaving(false);
  }

  async function updateLeadStatus(id: string, status: LeadStatus) {
    const { error } = await supabase.from('leads').update({ lead_status: status, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) setLeads(leads.map(l => l.id === id ? { ...l, lead_status: status } : l));
  }

  async function deleteLead(id: string) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (!error) setLeads(leads.filter(l => l.id !== id));
  }

  async function convertToSite(lead: Lead) {
    if (!confirm(`Convert "${lead.address}" to a new site?`)) return;
    setConverting(lead.id);
    const siteInputs = { acreage: parseFloat(lead.acreage) || 0, askingPrice: parseFloat((lead.asking_price || '0').replace(/[^0-9.]/g, '')) || 0 };
    const { data: siteData, error: siteError } = await supabase.from('sites').insert({
      name: lead.address || `${lead.city}, ${lead.state}`,
      city: lead.city,
      state: lead.state,
      county: lead.county,
      stage: 1,
      status: 'active',
      inputs: siteInputs,
      notes: `Converted from lead. Contact: ${lead.first_name} ${lead.last_name} ${lead.email ? `(${lead.email})` : ''}\n\n${lead.additional_notes || ''}`,
    }).select().single();
    if (siteError) { alert('Failed to create site: ' + siteError.message); setConverting(null); return; }
    await supabase.from('leads').update({ lead_status: 'converted', converted_site_id: siteData.id, updated_at: new Date().toISOString() }).eq('id', lead.id);
    setLeads(leads.map(l => l.id === lead.id ? { ...l, lead_status: 'converted', converted_site_id: siteData.id } : l));
    setConverting(null);
    router.push(`/portal/sites/${siteData.id}`);
  }

  const filteredLeads = leads.filter(l => {
    if (filter !== 'all' && l.lead_status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return l.address?.toLowerCase().includes(term) || l.city?.toLowerCase().includes(term) || l.state?.toLowerCase().includes(term) || l.county?.toLowerCase().includes(term);
    }
    return true;
  });

  const stats = {
    new: leads.filter(l => l.lead_status === 'new').length,
    reviewing: leads.filter(l => l.lead_status === 'reviewing').length,
    qualified: leads.filter(l => l.lead_status === 'qualified').length,
    passed: leads.filter(l => l.lead_status === 'passed').length,
    converted: leads.filter(l => l.lead_status === 'converted').length,
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px', color: 'var(--text-primary)', backgroundColor: 'var(--bg-input)' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading leads...</div>;
  
  if (error && leads.length === 0) return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>
      <button onClick={loadLeads} style={{ padding: '10px 20px', backgroundColor: 'var(--accent)', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>Leads</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Incoming site opportunities and listings.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 500, fontSize: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Add Lead</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>New</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--accent)' }}>{stats.new}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Reviewing</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#B45309' }}>{stats.reviewing}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Qualified</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#059669' }}>{stats.qualified}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Converted</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#16A34A' }}>{stats.converted}</p>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Passed</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-muted)' }}>{stats.passed}</p>
        </div>
      </div>

      {showForm && (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '8px', border: '1px solid var(--border-card)', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Add New Lead</h2>
          {error && <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '6px', color: '#991B1B', fontSize: '14px' }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div><label style={labelStyle}>Address *</label><input type="text" value={newLead.address} onChange={(e) => setNewLead({ ...newLead, address: e.target.value })} style={inputStyle} placeholder="123 Industrial Blvd" /></div>
            <div><label style={labelStyle}>City *</label><input type="text" value={newLead.city} onChange={(e) => setNewLead({ ...newLead, city: e.target.value })} style={inputStyle} placeholder="Springfield" /></div>
            <div><label style={labelStyle}>State *</label><input type="text" value={newLead.state} onChange={(e) => setNewLead({ ...newLead, state: e.target.value })} style={inputStyle} placeholder="OH" maxLength={2} /></div>
            <div><label style={labelStyle}>County</label><input type="text" value={newLead.county} onChange={(e) => setNewLead({ ...newLead, county: e.target.value })} style={inputStyle} placeholder="Clark" /></div>
            <div><label style={labelStyle}>Acreage</label><input type="number" min="0" value={newLead.acreage} onChange={(e) => setNewLead({ ...newLead, acreage: e.target.value })} style={inputStyle} placeholder="25" /></div>
            <div><label style={labelStyle}>Asking Price</label><input type="text" value={newLead.asking_price} onChange={(e) => setNewLead({ ...newLead, asking_price: e.target.value })} style={inputStyle} placeholder="$1,500,000" /></div>
            <div><label style={labelStyle}>Source</label><input type="text" value={newLead.relationship} onChange={(e) => setNewLead({ ...newLead, relationship: e.target.value })} style={inputStyle} placeholder="CoStar, Broker, Direct" /></div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={addLead} disabled={saving} style={{ padding: '10px 24px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 500, fontSize: '14px', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>{saving ? 'Adding...' : 'Add Lead'}</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '10px 24px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by address, city, state..." style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '14px', width: '250px', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }} />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter('all')} style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 500, borderRadius: '6px', border: '1px solid', borderColor: filter === 'all' ? 'var(--accent)' : 'var(--border)', backgroundColor: filter === 'all' ? 'var(--accent)' : 'var(--bg-card)', color: filter === 'all' ? '#FFFFFF' : 'var(--text-secondary)', cursor: 'pointer' }}>All ({leads.length})</button>
          {statusOptions.map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)} style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 500, borderRadius: '6px', border: '1px solid', borderColor: filter === opt.value ? getStatusStyle(opt.value).border : 'var(--border)', backgroundColor: filter === opt.value ? getStatusStyle(opt.value).bg : 'var(--bg-card)', color: filter === opt.value ? getStatusStyle(opt.value).text : 'var(--text-secondary)', cursor: 'pointer' }}>{opt.label}</button>
          ))}
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '40px', borderRadius: '8px', border: '1px solid var(--border-card)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{leads.length === 0 ? 'No leads yet. Add your first lead to get started.' : 'No leads match the current filter.'}</p>
          {leads.length === 0 && <button onClick={() => setShowForm(true)} style={{ padding: '10px 20px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 500, fontSize: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Add Lead</button>}
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-card)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--bg-primary)' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Property</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Source</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Acreage</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Asking</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, i) => {
                const statusStyle = getStatusStyle(lead.lead_status);
                const score = lead.lead_score || 0;
                return (
                  <tr key={lead.id} style={{ borderTop: i > 0 ? '1px solid var(--border-card)' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{lead.address || 'Unknown Address'}</p>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{lead.city}, {lead.state}{lead.county ? ` (${lead.county})` : ''}</p>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{lead.relationship || '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{lead.acreage ? `${lead.acreage} acres` : '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{lead.asking_price || '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: `${getScoreColor(score)}20`, color: getScoreColor(score), fontWeight: 600, fontSize: '12px' }}>{score}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select value={lead.lead_status} onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)} disabled={lead.lead_status === 'converted'} style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 500, borderRadius: '6px', border: `1px solid ${statusStyle.border}`, backgroundColor: statusStyle.bg, color: statusStyle.text, cursor: lead.lead_status === 'converted' ? 'not-allowed' : 'pointer' }}>
                        {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {lead.lead_status !== 'converted' && lead.lead_status !== 'passed' && (
                          <button onClick={() => convertToSite(lead)} disabled={converting === lead.id} style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 500, borderRadius: '4px', border: '1px solid #16A34A', backgroundColor: '#DCFCE7', color: '#16A34A', cursor: converting === lead.id ? 'not-allowed' : 'pointer', opacity: converting === lead.id ? 0.5 : 1 }}>{converting === lead.id ? 'Converting...' : '→ Site'}</button>
                        )}
                        {lead.converted_site_id && (
                          <button onClick={() => router.push(`/portal/sites/${lead.converted_site_id}`)} style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 500, borderRadius: '4px', border: '1px solid var(--accent)', backgroundColor: '#DBEAFE', color: 'var(--accent)', cursor: 'pointer' }}>View Site</button>
                        )}
                        <button onClick={() => deleteLead(lead.id)} style={{ color: 'var(--text-muted)', fontSize: '13px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
