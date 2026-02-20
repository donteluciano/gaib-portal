'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function NewSitePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    city: '',
    state: '',
    county: '',
    acreage: '',
    askingPrice: '',
    mw: '',
    pipelineDistance: '',
    pipelineDiameter: '',
    notes: '',
  });

  const updateForm = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      setError('Site name is required');
      return;
    }

    setSaving(true);
    setError('');

    const { data, error: dbError } = await supabase
      .from('sites')
      .insert({
        name: form.name,
        city: form.city,
        state: form.state,
        county: form.county,
        stage: 1,
        status: 'active',
        inputs: {
          acreage: parseFloat(form.acreage) || 0,
          askingPrice: parseFloat(form.askingPrice) || 0,
          mw: parseFloat(form.mw) || 0,
          pipelineDistance: parseFloat(form.pipelineDistance) || 0,
          pipelineDiameter: parseFloat(form.pipelineDiameter) || 0,
        },
        notes: form.notes,
      })
      .select()
      .single();

    if (dbError) {
      setError(dbError.message);
      setSaving(false);
      return;
    }

    // Create initial activity
    await supabase.from('activities').insert({
      site_id: data.id,
      date: new Date().toISOString().split('T')[0],
      action: 'Site created',
      stage: 1,
    });

    router.push(`/portal/sites/${data.id}`);
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#111827',
    backgroundColor: 'white',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '6px',
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>New Site</h1>

      {error && (
        <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Site Info */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Site Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Site Name *</label>
              <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} style={inputStyle} placeholder="e.g., Site Alpha" />
            </div>
            <div>
              <label style={labelStyle}>City</label>
              <input type="text" value={form.city} onChange={(e) => updateForm('city', e.target.value)} style={inputStyle} placeholder="Springfield" />
            </div>
            <div>
              <label style={labelStyle}>State</label>
              <input type="text" value={form.state} onChange={(e) => updateForm('state', e.target.value)} style={inputStyle} placeholder="OH" />
            </div>
            <div>
              <label style={labelStyle}>County</label>
              <input type="text" value={form.county} onChange={(e) => updateForm('county', e.target.value)} style={inputStyle} placeholder="Clark" />
            </div>
            <div>
              <label style={labelStyle}>Acreage</label>
              <input type="number" value={form.acreage} onChange={(e) => updateForm('acreage', e.target.value)} style={inputStyle} placeholder="25" />
            </div>
            <div>
              <label style={labelStyle}>Asking Price ($)</label>
              <input type="number" value={form.askingPrice} onChange={(e) => updateForm('askingPrice', e.target.value)} style={inputStyle} placeholder="1500000" />
            </div>
          </div>
        </div>

        {/* Gas & Power */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Gas & Power</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Estimated MW</label>
              <input type="number" value={form.mw} onChange={(e) => updateForm('mw', e.target.value)} style={inputStyle} placeholder="75" />
            </div>
            <div>
              <label style={labelStyle}>Pipeline Distance (miles)</label>
              <input type="number" value={form.pipelineDistance} onChange={(e) => updateForm('pipelineDistance', e.target.value)} style={inputStyle} placeholder="2" />
            </div>
            <div>
              <label style={labelStyle}>Pipeline Diameter (inches)</label>
              <input type="number" value={form.pipelineDiameter} onChange={(e) => updateForm('pipelineDiameter', e.target.value)} style={inputStyle} placeholder="24" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Notes</h2>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm('notes', e.target.value)}
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Initial observations, key risks, next steps..."
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
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
            {saving ? 'Saving...' : 'Create Site'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/portal/dashboard')}
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
      </form>
    </div>
  );
}
