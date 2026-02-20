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
    case 'new': return { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' };
    case 'reviewing': return { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' };
    case 'qualified': return { bg: '#d1fae5', text: '#059669', border: '#6ee7b7' };
    case 'passed': return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
    case 'converted': return { bg: '#dcfce7', text: '#16a34a', border: '#86efac' };
    default: return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
  }
}

// Lead scoring algorithm
function calculateLeadScore(lead: Partial<Lead>): number {
  let score = 0;
  
  // Acreage score (0-25 points)
  const acreage = parseFloat(lead.acreage || '0');
  if (acreage >= 50) score += 25;
  else if (acreage >= 25) score += 20;
  else if (acreage >= 10) score += 15;
  else if (acreage >= 5) score += 10;
  else if (acreage > 0) score += 5;
  
  // Location completeness (0-20 points)
  if (lead.city) score += 5;
  if (lead.state) score += 5;
  if (lead.county) score += 5;
  if (lead.address) score += 5;
  
  // Price reasonableness (0-25 points)
  const price = parseFloat((lead.asking_price || '0').replace(/[^0-9.]/g, ''));
  if (price > 0 && acreage > 0) {
    const pricePerAcre = price / acreage;
    if (pricePerAcre <= 50000) score += 25;
    else if (pricePerAcre <= 100000) score += 20;
    else if (pricePerAcre <= 200000) score += 15;
    else if (pricePerAcre <= 500000) score += 10;
    else score += 5;
  }
  
  // Contact info (0-15 points)
  if (lead.email || lead.phone) score += 10;
  if (lead.first_name && lead.last_name) score += 5;
  
  // Source/relationship (0-15 points)
  const relationship = (lead.relationship || '').toLowerCase();
  if (relationship.includes('direct') || relationship.includes('owner')) score += 15;
  else if (relationship.includes('broker') || relationship.includes('costar')) score += 10;
  else if (relationship) score += 5;
  
  return Math.min(100, score);
}

function getScoreColor(score: number): string {
  if (score >= 70) return '#16a34a';
  if (score >= 50) return '#eab308';
  if (score >= 30) return '#f97316';
  return '#dc2626';
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
    address: '',
    city: '',
    state: '',
    county: '',
    acreage: '',
    asking_price: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    relationship: '',
    current_use: '',
    additional_notes: '',
  });

  const loadLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      // Calculate scores for leads without them
      const leadsWithScores = data.map(lead => ({
        ...lead,
        lead_score: lead.lead_score || calculateLeadScore(lead),
      }));
      setLeads(leadsWithScores);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  async function addLead() {
    if (!newLead.address || !newLead.city || !newLead.state) {
      setError('Address, city, and state are required');
      return;
    }

    setSaving(true);
    setError(null);

    const leadScore = calculateLeadScore(newLead);

    const { data, error: dbError } = await supabase
      .from('leads')
      .insert({
        ...newLead,
        lead_status: 'new',
        lead_score: leadScore,
      })
      .select()
      .single();

    if (!dbError && data) {
      setLeads([{ ...data, lead_score: leadScore }, ...leads]);
      setNewLead({
        address: '',
        city: '',
        state: '',
        county: '',
        acreage: '',
        asking_price: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        relationship: '',
        current_use: '',
        additional_notes: '',
      });
      setShowForm(false);
    } else {
      setError(dbError?.message || 'Failed to add lead');
    }
    setSaving(false);
  }

  async function updateLeadStatus(id: string, status: LeadStatus) {
    const { error } = await supabase
      .from('leads')
      .update({ lead_status: status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setLeads(leads.map(l => l.id === id ? { ...l, lead_status: status } : l));
    }
  }

  async function deleteLead(id: string) {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (!error) {
      setLeads(leads.filter(l => l.id !== id));
    }
  }

  async function convertToSite(lead: Lead) {
    if (!confirm(`Convert "${lead.address}" to a new site? This will create a site pre-filled with lead data.`)) return;

    setConverting(lead.id);

    // Create the site
    const siteInputs = {
      acreage: parseFloat(lead.acreage) || 0,
      askingPrice: parseFloat((lead.asking_price || '0').replace(/[^0-9.]/g, '')) || 0,
      currentUse: lead.current_use,
    };

    const { data: siteData, error: siteError } = await supabase
      .from('sites')
      .insert({
        name: lead.address || `${lead.city}, ${lead.state}`,
        city: lead.city,
        state: lead.state,
        county: lead.county,
        stage: 1,
        status: 'active',
        inputs: siteInputs,
        notes: `Converted from lead. Contact: ${lead.first_name} ${lead.last_name} ${lead.email ? `(${lead.email})` : ''}\n\n${lead.additional_notes || ''}`,
      })
      .select()
      .single();

    if (siteError) {
      alert('Failed to create site: ' + siteError.message);
      setConverting(null);
      return;
    }

    // Update the lead
    await supabase
      .from('leads')
      .update({
        lead_status: 'converted',
        converted_site_id: siteData.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', lead.id);

    // Update local state
    setLeads(leads.map(l => l.id === lead.id ? { ...l, lead_status: 'converted', converted_site_id: siteData.id } : l));
    setConverting(null);

    // Navigate to the new site
    router.push(`/portal/sites/${siteData.id}`);
  }

  // Filter and search
  const filteredLeads = leads.filter(l => {
    if (filter !== 'all' && l.lead_status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        l.address?.toLowerCase().includes(term) ||
        l.city?.toLowerCase().includes(term) ||
        l.state?.toLowerCase().includes(term) ||
        l.county?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Stats
  const stats = {
    new: leads.filter(l => l.lead_status === 'new').length,
    reviewing: leads.filter(l => l.lead_status === 'reviewing').length,
    qualified: leads.filter(l => l.lead_status === 'qualified').length,
    passed: leads.filter(l => l.lead_status === 'passed').length,
    converted: leads.filter(l => l.lead_status === 'converted').length,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: 'white',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading leads...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827' }}>Leads</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Incoming site opportunities and listings.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            fontWeight: 500,
            fontSize: '14px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          + Add Lead
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>New</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#2563eb' }}>{stats.new}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Reviewing</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#b45309' }}>{stats.reviewing}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Qualified</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#059669' }}>{stats.qualified}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Converted</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#16a34a' }}>{stats.converted}</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>Passed</p>
          <p style={{ fontSize: '24px', fontWeight: 600, color: '#6b7280' }}>{stats.passed}</p>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Add New Lead</h2>
          
          {error && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>Address *</label>
              <input type="text" value={newLead.address} onChange={(e) => setNewLead({ ...newLead, address: e.target.value })} style={inputStyle} placeholder="123 Industrial Blvd" />
            </div>
            <div>
              <label style={labelStyle}>City *</label>
              <input type="text" value={newLead.city} onChange={(e) => setNewLead({ ...newLead, city: e.target.value })} style={inputStyle} placeholder="Springfield" />
            </div>
            <div>
              <label style={labelStyle}>State *</label>
              <input type="text" value={newLead.state} onChange={(e) => setNewLead({ ...newLead, state: e.target.value })} style={inputStyle} placeholder="OH" maxLength={2} />
            </div>
            <div>
              <label style={labelStyle}>County</label>
              <input type="text" value={newLead.county} onChange={(e) => setNewLead({ ...newLead, county: e.target.value })} style={inputStyle} placeholder="Clark" />
            </div>
            <div>
              <label style={labelStyle}>Acreage</label>
              <input type="number" min="0" value={newLead.acreage} onChange={(e) => setNewLead({ ...newLead, acreage: e.target.value })} style={inputStyle} placeholder="25" />
            </div>
            <div>
              <label style={labelStyle}>Asking Price</label>
              <input type="text" value={newLead.asking_price} onChange={(e) => setNewLead({ ...newLead, asking_price: e.target.value })} style={inputStyle} placeholder="$1,500,000" />
            </div>
            <div>
              <label style={labelStyle}>Current Use</label>
              <input type="text" value={newLead.current_use} onChange={(e) => setNewLead({ ...newLead, current_use: e.target.value })} style={inputStyle} placeholder="Former manufacturing" />
            </div>
            <div>
              <label style={labelStyle}>Relationship/Source</label>
              <input type="text" value={newLead.relationship} onChange={(e) => setNewLead({ ...newLead, relationship: e.target.value })} style={inputStyle} placeholder="CoStar, Broker, Direct" />
            </div>
          </div>

          <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '12px' }}>Contact Information (Optional)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={labelStyle}>First Name</label>
              <input type="text" value={newLead.first_name} onChange={(e) => setNewLead({ ...newLead, first_name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Last Name</label>
              <input type="text" value={newLead.last_name} onChange={(e) => setNewLead({ ...newLead, last_name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input type="tel" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Company</label>
              <input type="text" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              value={newLead.additional_notes}
              onChange={(e) => setNewLead({ ...newLead, additional_notes: e.target.value })}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Initial observations, key details..."
            />
          </div>

          {/* Preview Score */}
          {(newLead.address || newLead.acreage) && (
            <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', color: '#166534' }}>
                Estimated Lead Score: <strong style={{ color: getScoreColor(calculateLeadScore(newLead)) }}>{calculateLeadScore(newLead)}</strong>/100
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={addLead}
              disabled={saving}
              style={{
                padding: '10px 24px',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                borderRadius: '6px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Adding...' : 'Add Lead'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: '10px 24px',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: 500,
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by address, city, state..."
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            width: '250px',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '6px',
              border: '1px solid',
              borderColor: filter === 'all' ? '#2563eb' : '#d1d5db',
              backgroundColor: filter === 'all' ? '#dbeafe' : 'white',
              color: filter === 'all' ? '#2563eb' : '#374151',
              cursor: 'pointer',
            }}
          >
            All ({leads.length})
          </button>
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 500,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: filter === opt.value ? getStatusStyle(opt.value).border : '#d1d5db',
                backgroundColor: filter === opt.value ? getStatusStyle(opt.value).bg : 'white',
                color: filter === opt.value ? getStatusStyle(opt.value).text : '#374151',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            {leads.length === 0 ? 'No leads yet. Add your first lead to get started.' : 'No leads match the current filter.'}
          </p>
          {leads.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 500,
                fontSize: '14px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              + Add Lead
            </button>
          )}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Property</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Source</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Acreage</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Asking</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Score</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 500, color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, i) => {
                const statusStyle = getStatusStyle(lead.lead_status);
                const score = lead.lead_score || 0;
                return (
                  <tr key={lead.id} style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <p style={{ fontWeight: 500, color: '#111827' }}>{lead.address || 'Unknown Address'}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>{lead.city}, {lead.state}{lead.county ? ` (${lead.county})` : ''}</p>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{lead.relationship || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#111827' }}>{lead.acreage ? `${lead.acreage} acres` : '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#111827' }}>{lead.asking_price || '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: `${getScoreColor(score)}20`,
                        color: getScoreColor(score),
                        fontWeight: 600,
                        fontSize: '12px',
                      }}>
                        {score}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={lead.lead_status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                        disabled={lead.lead_status === 'converted'}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '6px',
                          border: `1px solid ${statusStyle.border}`,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          cursor: lead.lead_status === 'converted' ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {lead.lead_status !== 'converted' && lead.lead_status !== 'passed' && (
                          <button
                            onClick={() => convertToSite(lead)}
                            disabled={converting === lead.id}
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 500,
                              borderRadius: '4px',
                              border: '1px solid #16a34a',
                              backgroundColor: '#dcfce7',
                              color: '#16a34a',
                              cursor: converting === lead.id ? 'not-allowed' : 'pointer',
                              opacity: converting === lead.id ? 0.5 : 1,
                            }}
                          >
                            {converting === lead.id ? 'Converting...' : '→ Site'}
                          </button>
                        )}
                        {lead.converted_site_id && (
                          <button
                            onClick={() => router.push(`/portal/sites/${lead.converted_site_id}`)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '12px',
                              fontWeight: 500,
                              borderRadius: '4px',
                              border: '1px solid #2563eb',
                              backgroundColor: '#dbeafe',
                              color: '#2563eb',
                              cursor: 'pointer',
                            }}
                          >
                            View Site
                          </button>
                        )}
                        <button
                          onClick={() => deleteLead(lead.id)}
                          style={{
                            color: '#6b7280',
                            fontSize: '13px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.color = '#dc2626')}
                          onMouseOut={(e) => (e.currentTarget.style.color = '#6b7280')}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Integration Note */}
      <div style={{ 
        backgroundColor: '#fffbeb', 
        border: '1px solid #fcd34d', 
        borderRadius: '8px', 
        padding: '16px', 
        marginTop: '24px',
        textAlign: 'center' 
      }}>
        <p style={{ color: '#92400e', fontSize: '14px' }}>
          💡 PowerSite Acquisitions integration coming soon — leads will flow in automatically.
        </p>
      </div>
    </div>
  );
}
