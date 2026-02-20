'use client';

import { DocumentArrowDownIcon, TableCellsIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-white">Reports</h1>
        <p className="text-gray-400 mt-1">Generate portfolio summaries and LP reports</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-card rounded-lg p-6">
          <div className="p-3 bg-navy rounded-lg w-fit mb-4">
            <TableCellsIcon className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Portfolio Summary</h2>
          <p className="text-gray-400 text-sm mb-4">
            Export a complete table of all sites with key metrics.
          </p>
          <button className="w-full bg-navy text-gold border border-gold py-2 rounded-lg hover:bg-navy-light transition-colors">
            Generate CSV
          </button>
        </div>

        <div className="bg-navy-card rounded-lg p-6">
          <div className="p-3 bg-navy rounded-lg w-fit mb-4">
            <DocumentTextIcon className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">LP Report</h2>
          <p className="text-gray-400 text-sm mb-4">
            Generate formatted one-page summaries per site for LP updates.
          </p>
          <button className="w-full bg-navy text-gold border border-gold py-2 rounded-lg hover:bg-navy-light transition-colors">
            Generate PDF
          </button>
        </div>

        <div className="bg-navy-card rounded-lg p-6">
          <div className="p-3 bg-navy rounded-lg w-fit mb-4">
            <DocumentArrowDownIcon className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Site Comparison</h2>
          <p className="text-gray-400 text-sm mb-4">
            Compare 2-4 sites side by side across all key metrics.
          </p>
          <button className="w-full bg-navy text-gold border border-gold py-2 rounded-lg hover:bg-navy-light transition-colors">
            Select Sites
          </button>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-navy-card rounded-lg p-8 text-center">
        <p className="text-gray-400">Full report generation coming in Phase 5.</p>
      </div>
    </div>
  );
}
