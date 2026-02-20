'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

type DocCategory = 'legal' | 'gas' | 'environmental' | 'political' | 'engineering' | 'fiber' | 'financial' | 'other';
type AddMode = 'upload' | 'link';

interface Document {
  id: string;
  name: string;
  url: string;
  category: DocCategory;
  date_added: string;
  file_size?: number;
  file_type?: string;
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
  legal: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  gas: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  environmental: 'bg-green-500/20 text-green-300 border-green-500/30',
  political: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  engineering: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  fiber: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  financial: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  other: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

// Allowed file types for upload
const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'csv'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

interface Props {
  siteId: string;
}

export default function DocumentsTab({ siteId }: Props) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('upload');
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newDoc, setNewDoc] = useState({ name: '', url: '', category: 'other' as DocCategory });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }

    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    // Auto-fill name if empty
    if (!newDoc.name) {
      setNewDoc({ ...newDoc, name: file.name.replace(/\.[^/.]+$/, '') });
    }
  }

  async function uploadFile(): Promise<string | null> {
    if (!selectedFile) return null;

    setUploadProgress(0);

    try {
      // Generate unique filename
      const ext = selectedFile.name.split('.').pop()?.toLowerCase() || '';
      const timestamp = Date.now();
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `sites/${siteId}/${timestamp}_${safeName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        // If bucket doesn't exist, show helpful error
        if (error.message.includes('Bucket not found')) {
          throw new Error('Storage bucket "documents" not found. Please create it in Supabase Dashboard → Storage.');
        }
        throw error;
      }

      setUploadProgress(100);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setUploadProgress(null);
      return null;
    }
  }

  async function addDoc() {
    setError(null);

    if (addMode === 'upload') {
      if (!selectedFile) {
        setError('Please select a file to upload');
        return;
      }
      if (!newDoc.name) {
        setError('Please enter a document name');
        return;
      }

      setSaving(true);
      const uploadedUrl = await uploadFile();
      
      if (!uploadedUrl) {
        setSaving(false);
        return;
      }

      const { data, error: dbError } = await supabase
        .from('documents')
        .insert({
          site_id: siteId,
          name: newDoc.name,
          url: uploadedUrl,
          category: newDoc.category,
          date_added: new Date().toISOString().split('T')[0],
          file_size: selectedFile.size,
          file_type: selectedFile.type,
        })
        .select()
        .single();

      if (!dbError && data) {
        setDocs([data, ...docs]);
        resetForm();
      } else {
        setError(dbError?.message || 'Failed to save document');
      }
    } else {
      // Link mode
      if (!newDoc.name || !newDoc.url) {
        setError('Please enter document name and URL');
        return;
      }

      setSaving(true);
      const { data, error: dbError } = await supabase
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

      if (!dbError && data) {
        setDocs([data, ...docs]);
        resetForm();
      } else {
        setError(dbError?.message || 'Failed to save document');
      }
    }
    setSaving(false);
  }

  function resetForm() {
    setNewDoc({ name: '', url: '', category: 'other' });
    setSelectedFile(null);
    setUploadProgress(null);
    setShowForm(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function removeDoc(id: string, url: string) {
    // If it's an uploaded file (contains our storage path), delete from storage too
    if (url.includes('supabase') && url.includes('/documents/')) {
      try {
        const pathMatch = url.match(/\/documents\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from('documents').remove([pathMatch[1]]);
        }
      } catch (e) {
        console.error('Failed to delete file from storage:', e);
      }
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (!error) {
      setDocs(docs.filter(d => d.id !== id));
    }
  }

  function formatFileSize(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getFileIcon(fileType?: string, url?: string): string {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('image')) return '🖼️';
    if (fileType?.includes('spreadsheet') || fileType?.includes('excel') || url?.match(/\.xlsx?$/)) return '📊';
    if (fileType?.includes('presentation') || url?.match(/\.pptx?$/)) return '📽️';
    if (fileType?.includes('word') || url?.match(/\.docx?$/)) return '📝';
    if (url?.includes('drive.google.com')) return '📁';
    if (url?.includes('dropbox.com')) return '📦';
    return '📎';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-white">Documents & Files</h2>
          <p className="text-gray-400 text-sm">{docs.length} document{docs.length !== 1 ? 's' : ''}</p>
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
        <div className="p-5 bg-navy-card border border-gold/20 rounded-xl">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => setAddMode('upload')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                addMode === 'upload'
                  ? 'bg-gold text-navy'
                  : 'bg-navy text-gray-300 hover:bg-navy-dark'
              }`}
            >
              📤 Upload File
            </button>
            <button
              type="button"
              onClick={() => setAddMode('link')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                addMode === 'link'
                  ? 'bg-gold text-navy'
                  : 'bg-navy text-gray-300 hover:bg-navy-dark'
              }`}
            >
              🔗 Add Link
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {addMode === 'upload' ? (
            <div className="space-y-4">
              {/* File Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  selectedFile
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-gray-600 hover:border-gold/50 hover:bg-navy/50'
                }`}
              >
                {selectedFile ? (
                  <div>
                    <div className="text-4xl mb-2">{getFileIcon(selectedFile.type)}</div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="mt-2 text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">📁</div>
                    <p className="text-white font-medium">Click to select a file</p>
                    <p className="text-gray-400 text-sm mt-1">
                      PDF, Word, Excel, Images • Max {MAX_FILE_SIZE / 1024 / 1024}MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept={ALLOWED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
                  className="hidden"
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress !== null && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Uploading...</span>
                    <span className="text-gray-300">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-navy rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Name and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 font-medium mb-1.5">Document Name *</label>
                  <input
                    type="text"
                    value={newDoc.name}
                    onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                    placeholder="Phase I ESA Report"
                    className="w-full bg-navy border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 font-medium mb-1.5">Category</label>
                  <select
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as DocCategory })}
                    className="w-full bg-navy border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:border-gold focus:outline-none"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 font-medium mb-1.5">Document Name *</label>
                <input
                  type="text"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  placeholder="Phase I ESA Report"
                  className="w-full bg-navy border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 font-medium mb-1.5">URL *</label>
                <input
                  type="url"
                  value={newDoc.url}
                  onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-navy border border-gray-600 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 font-medium mb-1.5">Category</label>
                <select
                  value={newDoc.category}
                  onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as DocCategory })}
                  className="w-full bg-navy border border-gray-600 rounded-lg px-3 py-2.5 text-white focus:border-gold focus:outline-none"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={addDoc}
              disabled={saving}
              className="px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (addMode === 'upload' ? 'Uploading...' : 'Adding...') : (addMode === 'upload' ? 'Upload' : 'Add Link')}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-navy hover:bg-navy-dark text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Document List */}
      <div className="bg-navy-card border border-gray-700 rounded-xl overflow-hidden">
        {docs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-white font-medium mb-2">No documents yet</p>
            <p className="text-gray-400 text-sm">Upload files or add links to Google Drive, Dropbox, etc.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-6 py-4 text-left text-gray-300 font-medium text-sm">Name</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium text-sm">Category</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium text-sm">Size</th>
                <th className="px-6 py-4 text-left text-gray-300 font-medium text-sm">Added</th>
                <th className="px-6 py-4 text-right text-gray-300 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-700/50 hover:bg-navy/30">
                  <td className="px-6 py-4">
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-white hover:text-gold transition-colors"
                    >
                      <span>{getFileIcon(doc.file_type, doc.url)}</span>
                      <span>{doc.name}</span>
                      <span className="text-gray-500">↗</span>
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${categoryColors[doc.category] || categoryColors.other}`}>
                      {categoryLabels[doc.category] || 'Other'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {formatFileSize(doc.file_size) || '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{doc.date_added}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => removeDoc(doc.id, doc.url)}
                      className="text-gray-400 hover:text-red-400 transition-colors"
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

      <p className="text-gray-400 text-sm text-center">
        💡 Upload files directly or link to external storage like Google Drive or Dropbox.
      </p>
    </div>
  );
}
