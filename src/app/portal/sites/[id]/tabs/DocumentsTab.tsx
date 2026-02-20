'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type DocCategory = 'legal' | 'gas' | 'environmental' | 'political' | 'engineering' | 'fiber' | 'financial' | 'other';

interface Document {
  id: string;
  name: string;
  url: string;
  category: DocCategory;
  date_added: string;
}

const categoryLabels: Record<DocCategory, string> = {
  legal: 'Legal',
  gas: 'Gas',
  environmental: 'Environmental',
  political: 'Political',
  engineering: 'Engineering',
  fiber: 'Fiber',
  financial: 'Financial',
  other: 'Other',
};

const categoryColors: Record<DocCategory, string> = {
  legal: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  gas: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  environmental: 'bg-green-500/20 text-green-400 border-green-500/30',
  political: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  engineering: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  fiber: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  financial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  other: 'bg-muted/20 text-muted border-muted/30',
};

interface Props {
  siteId: string;
}

export default function DocumentsTab({ siteId }: Props) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', url: '', category: 'other' as DocCategory });

  useEffect(() => {
    loadDocuments();
  }, [siteId]);

  async function loadDocuments() {
    setLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('site_id', siteId)
      .order('date_added', { ascending: false });
    
    if (!error && data) {
      setDocs(data);
    }
    setLoading(false);
  }

  async function addDoc() {
    if (!newDoc.name || !newDoc.url) return;
    
    setSaving(true);
    const { data, error } = await supabase
      .from('documents')
      .insert({
        site_id: siteId,
        name: newDoc.name,
        url: newDoc.url,
        category: newDoc.category,
        date_added: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (!error && data) {
      setDocs([data, ...docs]);
      setNewDoc({ name: '', url: '', category: 'other' });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function removeDoc(id: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (!error) {
      setDocs(docs.filter(d => d.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-white">Documents & Links</h2>
          <p className="text-muted text-sm">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg transition-colors"
        >
          + Add Document
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="p-4 bg-navy-card border border-gold/20 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-muted mb-1">Document Name *</label>
              <input
                type="text"
                value={newDoc.name}
                onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                placeholder="Phase I ESA Report"
                className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">URL *</label>
              <input
                type="url"
                value={newDoc.url}
                onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1">Category</label>
              <select
                value={newDoc.category}
                onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as DocCategory })}
                className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addDoc}
              disabled={saving || !newDoc.name || !newDoc.url}
              className="px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-navy hover:bg-navy-card text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="bg-navy-card border border-navy rounded-xl overflow-hidden">
        {docs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-white font-medium mb-2">No documents yet</p>
            <p className="text-muted text-sm">Add links to Google Drive, Dropbox, or other file storage.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy">
                <th className="px-6 py-4 text-left text-muted font-medium">Name</th>
                <th className="px-6 py-4 text-left text-muted font-medium">Category</th>
                <th className="px-6 py-4 text-left text-muted font-medium">Added</th>
                <th className="px-6 py-4 text-right text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-b border-navy/50 hover:bg-navy/30">
                  <td className="px-6 py-4">
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:text-gold transition-colors"
                    >
                      {doc.name} ↗
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${categoryColors[doc.category] || categoryColors.other}`}>
                      {categoryLabels[doc.category] || 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">{doc.date_added}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => removeDoc(doc.id)}
                      className="text-muted hover:text-danger transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-muted text-sm text-center">
        💡 Tip: Store actual files in Google Drive or Dropbox and add links here.
      </p>
    </div>
  );
}
