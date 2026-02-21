'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type DocCategory = 'legal' | 'gas' | 'environmental' | 'political' | 'engineering' | 'fiber' | 'financial' | 'other';
type AddMode = 'upload' | 'link';

interface Document { id: string; name: string; url: string; category: DocCategory; date_added: string; file_size?: number; file_type?: string; }

const categoryLabels: Record<DocCategory, string> = { legal: 'Legal', gas: 'Gas', environmental: 'Environmental', political: 'Political', engineering: 'Engineering', fiber: 'Fiber', financial: 'Financial', other: 'Other' };
const categoryColors: Record<DocCategory, { bg: string; text: string; border: string }> = {
  legal: { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' },
  gas: { bg: '#FFEDD5', text: '#EA580C', border: '#FED7AA' },
  environmental: { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' },
  political: { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' },
  engineering: { bg: '#CFFAFE', text: '#0891B2', border: '#A5F3FC' },
  fiber: { bg: '#FCE7F3', text: '#DB2777', border: '#FBCFE8' },
  financial: { bg: '#FEF3C7', text: '#CA8A04', border: '#FDE68A' },
  other: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' },
};

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'csv'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

interface Props { siteId: string; }

export default function DocumentsTab({ siteId }: Props) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('upload');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState({ name: '', url: '', category: 'other' as DocCategory });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadDocuments(); }, [siteId]);

  async function loadDocuments() {
    setLoading(true);
    const { data, error } = await supabase.from('documents').select('*').eq('site_id', siteId).order('date_added', { ascending: false });
    if (!error && data) setDocs(data);
    setLoading(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > MAX_FILE_SIZE) { setError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`); return; }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) { setError(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`); return; }
    setSelectedFile(file);
    if (!newDoc.name) setNewDoc({ ...newDoc, name: file.name.replace(/\.[^/.]+$/, '') });
  }

  async function uploadFile(): Promise<string | null> {
    if (!selectedFile) return null;
    try {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      const timestamp = Date.now();
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `sites/${siteId}/${timestamp}_${safeName}`;
      const { data, error } = await supabase.storage.from('documents').upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });
      if (error) { if (error.message.includes('Bucket not found')) throw new Error('Storage bucket "documents" not found. Please create it in Supabase Dashboard → Storage.'); throw error; }
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return null;
    }
  }

  async function addDoc() {
    setError(null);
    if (addMode === 'upload') {
      if (!selectedFile) { setError('Please select a file to upload'); return; }
      if (!newDoc.name) { setError('Please enter a document name'); return; }
      setSaving(true);
      const uploadedUrl = await uploadFile();
      if (!uploadedUrl) { setSaving(false); return; }
      const { data, error: dbError } = await supabase.from('documents').insert({ site_id: siteId, name: newDoc.name, url: uploadedUrl, category: newDoc.category, date_added: new Date().toISOString().split('T')[0], file_size: selectedFile.size, file_type: selectedFile.type }).select().single();
      if (!dbError && data) { setDocs([data, ...docs]); resetForm(); }
      else setError(dbError?.message || 'Failed to save document');
    } else {
      if (!newDoc.name || !newDoc.url) { setError('Please enter document name and URL'); return; }
      setSaving(true);
      const { data, error: dbError } = await supabase.from('documents').insert({ site_id: siteId, name: newDoc.name, url: newDoc.url, category: newDoc.category, date_added: new Date().toISOString().split('T')[0] }).select().single();
      if (!dbError && data) { setDocs([data, ...docs]); resetForm(); }
      else setError(dbError?.message || 'Failed to save document');
    }
    setSaving(false);
  }

  function resetForm() { setNewDoc({ name: '', url: '', category: 'other' }); setSelectedFile(null); setShowForm(false); setError(null); if (fileInputRef.current) fileInputRef.current.value = ''; }

  async function removeDoc(id: string, url: string) {
    if (url.includes('supabase') && url.includes('/documents/')) {
      try { const pathMatch = url.match(/\/documents\/(.+)$/); if (pathMatch) await supabase.storage.from('documents').remove([pathMatch[1]]); } catch (e) { console.error('Failed to delete file from storage:', e); }
    }
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (!error) setDocs(docs.filter(d => d.id !== id));
  }

  function formatFileSize(bytes?: number): string { if (!bytes) return ''; if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
  function getFileIcon(fileType?: string, url?: string): string { if (fileType?.includes('pdf')) return '📄'; if (fileType?.includes('image')) return '🖼️'; if (fileType?.includes('spreadsheet') || fileType?.includes('excel') || url?.match(/\.xlsx?$/)) return '📊'; if (fileType?.includes('presentation') || url?.match(/\.pptx?$/)) return '📽️'; if (fileType?.includes('word') || url?.match(/\.docx?$/)) return '📝'; if (url?.includes('drive.google.com')) return '📁'; if (url?.includes('dropbox.com')) return '📦'; return '📎'; }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: 'var(--text-muted)' }}>Loading documents...</p></div>;

  const inputStyle = { width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>Documents & Files</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 16px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ Add Document</button>
      </div>

      {showForm && (
        <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button type="button" onClick={() => setAddMode('upload')} style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 500, backgroundColor: addMode === 'upload' ? 'var(--accent)' : 'var(--bg-primary)', color: addMode === 'upload' ? '#FFFFFF' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>📤 Upload File</button>
            <button type="button" onClick={() => setAddMode('link')} style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', fontWeight: 500, backgroundColor: addMode === 'link' ? 'var(--accent)' : 'var(--bg-primary)', color: addMode === 'link' ? '#FFFFFF' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>🔗 Add Link</button>
          </div>
          {error && <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#FEE2E2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', fontSize: '14px' }}>{error}</div>}
          {addMode === 'upload' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed', borderRadius: '8px', padding: '32px', textAlign: 'center', cursor: 'pointer', borderColor: selectedFile ? '#22C55E' : 'var(--border)', backgroundColor: selectedFile ? '#F0FDF4' : 'var(--bg-primary)' }}>
                {selectedFile ? (<div><div style={{ fontSize: '32px', marginBottom: '8px' }}>{getFileIcon(selectedFile.type)}</div><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedFile.name}</p><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{formatFileSize(selectedFile.size)}</p><button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ marginTop: '8px', color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Remove</button></div>) : (<div><div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div><p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Click to select a file</p><p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>PDF, Word, Excel, Images • Max {MAX_FILE_SIZE / 1024 / 1024}MB</p></div>)}
                <input ref={fileInputRef} type="file" onChange={handleFileSelect} accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')} style={{ display: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Document Name *</label><input type="text" value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })} placeholder="Phase I ESA Report" style={inputStyle} /></div>
                <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Category</label><select value={newDoc.category} onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as DocCategory })} style={inputStyle}>{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Document Name *</label><input type="text" value={newDoc.name} onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })} placeholder="Phase I ESA Report" style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>URL *</label><input type="url" value={newDoc.url} onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })} placeholder="https://drive.google.com/..." style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>Category</label><select value={newDoc.category} onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as DocCategory })} style={inputStyle}>{Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <button onClick={addDoc} disabled={saving} style={{ padding: '10px 20px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}>{saving ? (addMode === 'upload' ? 'Uploading...' : 'Adding...') : (addMode === 'upload' ? 'Upload' : 'Add Link')}</button>
            <button onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', overflow: 'hidden' }}>
        {docs.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}><div style={{ fontSize: '32px', marginBottom: '16px' }}>📄</div><p style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '8px' }}>No documents yet</p><p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Upload files or add links to Google Drive, Dropbox, etc.</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border-card)', backgroundColor: 'var(--bg-primary)' }}><th style={{ padding: '12px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px' }}>Name</th><th style={{ padding: '12px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px' }}>Category</th><th style={{ padding: '12px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px' }}>Size</th><th style={{ padding: '12px 24px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px' }}>Added</th><th style={{ padding: '12px 24px', textAlign: 'right', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '14px' }}>Actions</th></tr></thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-card)' }}>
                  <td style={{ padding: '12px 24px' }}><a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', textDecoration: 'none' }}><span>{getFileIcon(doc.file_type, doc.url)}</span><span>{doc.name}</span><span style={{ color: 'var(--text-muted)' }}>↗</span></a></td>
                  <td style={{ padding: '12px 24px' }}><span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 500, borderRadius: '4px', backgroundColor: categoryColors[doc.category]?.bg || '#F3F4F6', color: categoryColors[doc.category]?.text || '#6B7280', border: `1px solid ${categoryColors[doc.category]?.border || '#E5E7EB'}` }}>{categoryLabels[doc.category] || 'Other'}</span></td>
                  <td style={{ padding: '12px 24px', color: 'var(--text-muted)', fontSize: '14px' }}>{formatFileSize(doc.file_size) || '—'}</td>
                  <td style={{ padding: '12px 24px', color: 'var(--text-muted)' }}>{doc.date_added}</td>
                  <td style={{ padding: '12px 24px', textAlign: 'right' }}><button onClick={() => removeDoc(doc.id, doc.url)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center' }}>💡 Upload files directly or link to external storage like Google Drive or Dropbox.</p>
    </div>
  );
}
