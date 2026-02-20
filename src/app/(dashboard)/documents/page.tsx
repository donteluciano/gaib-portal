'use client';

import { useState } from 'react';

type DocCategory = 'all' | 'tax' | 'reports' | 'legal' | 'statements';

const documents = [
  {
    id: 1,
    name: 'K-1 Tax Document 2025',
    category: 'tax',
    property: 'Riverside Plaza',
    date: 'Feb 15, 2026',
    size: '2.4 MB',
    new: true,
  },
  {
    id: 2,
    name: 'Q4 2025 Performance Report',
    category: 'reports',
    property: 'All Properties',
    date: 'Jan 30, 2026',
    size: '5.1 MB',
    new: true,
  },
  {
    id: 3,
    name: 'Annual Statement 2025',
    category: 'statements',
    property: 'All Properties',
    date: 'Jan 15, 2026',
    size: '1.8 MB',
    new: false,
  },
  {
    id: 4,
    name: 'Subscription Agreement',
    category: 'legal',
    property: 'Tech Campus North',
    date: 'Dec 10, 2025',
    size: '890 KB',
    new: false,
  },
  {
    id: 5,
    name: 'Q3 2025 Performance Report',
    category: 'reports',
    property: 'All Properties',
    date: 'Oct 30, 2025',
    size: '4.7 MB',
    new: false,
  },
  {
    id: 6,
    name: 'Operating Agreement',
    category: 'legal',
    property: 'Marina Heights',
    date: 'Sep 5, 2025',
    size: '1.2 MB',
    new: false,
  },
  {
    id: 7,
    name: 'Distribution Notice',
    category: 'statements',
    property: 'Riverside Plaza',
    date: 'Aug 15, 2025',
    size: '245 KB',
    new: false,
  },
  {
    id: 8,
    name: 'K-1 Tax Document 2024',
    category: 'tax',
    property: 'Marina Heights',
    date: 'Mar 1, 2025',
    size: '2.1 MB',
    new: false,
  },
];

const categoryConfig: Record<DocCategory, { label: string; icon: string; color: string }> = {
  'all': { label: 'All Documents', icon: '📁', color: 'text-zinc-400' },
  'tax': { label: 'Tax Documents', icon: '📋', color: 'text-emerald-400' },
  'reports': { label: 'Reports', icon: '📊', color: 'text-blue-400' },
  'legal': { label: 'Legal', icon: '⚖️', color: 'text-purple-400' },
  'statements': { label: 'Statements', icon: '📄', color: 'text-amber-400' },
};

export default function DocumentsPage() {
  const [activeCategory, setActiveCategory] = useState<DocCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = documents
    .filter(doc => activeCategory === 'all' || doc.category === activeCategory)
    .filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.property.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const newDocsCount = documents.filter(d => d.new).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Documents</h1>
          <p className="text-zinc-400 mt-1">Access your investment documents and reports.</p>
        </div>
        {newDocsCount > 0 && (
          <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <span className="text-amber-400 font-medium">{newDocsCount} new document{newDocsCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>
        <button className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download All
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(categoryConfig) as DocCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeCategory === category
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <span>{categoryConfig[category].icon}</span>
            {categoryConfig[category].label}
          </button>
        ))}
      </div>

      {/* Documents list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 text-sm font-medium text-zinc-400">
          <div className="col-span-5">Document</div>
          <div className="col-span-3">Property</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1">Size</div>
          <div className="col-span-1"></div>
        </div>
        
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="grid grid-cols-12 gap-4 p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors items-center">
            <div className="col-span-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                doc.category === 'tax' ? 'bg-emerald-500/20' :
                doc.category === 'reports' ? 'bg-blue-500/20' :
                doc.category === 'legal' ? 'bg-purple-500/20' :
                'bg-amber-500/20'
              }`}>
                {categoryConfig[doc.category as DocCategory].icon}
              </div>
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  {doc.name}
                  {doc.new && (
                    <span className="text-xs px-1.5 py-0.5 bg-amber-500 text-black rounded font-semibold">NEW</span>
                  )}
                </p>
                <p className="text-zinc-500 text-sm">{categoryConfig[doc.category as DocCategory].label}</p>
              </div>
            </div>
            <div className="col-span-3 text-zinc-400">{doc.property}</div>
            <div className="col-span-2 text-zinc-400">{doc.date}</div>
            <div className="col-span-1 text-zinc-500">{doc.size}</div>
            <div className="col-span-1 flex justify-end">
              <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-zinc-400">No documents found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
