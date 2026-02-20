'use client';

import { useState } from 'react';

const costCategories = [
  { key: 'site_control', name: 'Site Control', description: 'Option, legal, title' },
  { key: 'gas_studies', name: 'Gas Studies', description: 'Feasibility, engineering' },
  { key: 'enviro', name: 'Environmental', description: 'Phase I, Phase II, remediation' },
  { key: 'air_permit', name: 'Air Permit', description: 'Application, consulting' },
  { key: 'fiber', name: 'Fiber', description: 'Route studies, connections' },
  { key: 'political', name: 'Political/Community', description: 'CBA, lobbying' },
  { key: 'engineering', name: 'Engineering', description: 'Site design, civil' },
  { key: 'demo', name: 'Demolition', description: 'Structure removal' },
  { key: 'exit_costs', name: 'Exit Costs', description: 'Legal, broker, closing' },
];

export default function ActualsTab() {
  const [actuals, setActuals] = useState<Record<string, { estimated: number; actual: number; notes: string }>>(
    Object.fromEntries(costCategories.map(c => [c.key, { 
      estimated: c.key === 'site_control' ? 85000 : 
                 c.key === 'gas_studies' ? 75000 :
                 c.key === 'enviro' ? 50000 :
                 c.key === 'air_permit' ? 25000 : 0,
      actual: 0, 
      notes: '' 
    }]))
  );

  const totalEstimated = Object.values(actuals).reduce((sum, a) => sum + a.estimated, 0);
  const totalActual = Object.values(actuals).reduce((sum, a) => sum + a.actual, 0);
  const totalVariance = totalActual - totalEstimated;

  const updateActual = (key: string, field: string, value: number | string) => {
    setActuals({
      ...actuals,
      [key]: { ...actuals[key], [field]: value }
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Estimated</p>
          <p className="text-2xl font-bold text-white">${(totalEstimated / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Actual</p>
          <p className="text-2xl font-bold text-white">${(totalActual / 1000).toFixed(0)}K</p>
        </div>
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <p className="text-gray-400 text-sm">Variance</p>
          <p className={`text-2xl font-bold ${totalVariance > 0 ? 'text-danger' : 'text-success'}`}>
            {totalVariance > 0 ? '+' : ''}${(totalVariance / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Cost Table */}
      <div className="bg-navy-card border border-navy rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy bg-navy/50">
              <th className="px-6 py-4 text-left text-gray-400 font-medium">Category</th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">Estimated</th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">Actual</th>
              <th className="px-6 py-4 text-right text-gray-400 font-medium">Variance</th>
              <th className="px-6 py-4 text-left text-gray-400 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {costCategories.map((category) => {
              const variance = actuals[category.key].actual - actuals[category.key].estimated;
              return (
                <tr key={category.key} className="border-b border-navy/50">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{category.name}</p>
                    <p className="text-gray-400 text-sm">{category.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={actuals[category.key].estimated}
                      onChange={(e) => updateActual(category.key, 'estimated', parseInt(e.target.value) || 0)}
                      className="w-24 bg-navy border border-navy-card rounded px-2 py-1 text-white text-right focus:border-gold outline-none"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={actuals[category.key].actual}
                      onChange={(e) => updateActual(category.key, 'actual', parseInt(e.target.value) || 0)}
                      className="w-24 bg-navy border border-navy-card rounded px-2 py-1 text-white text-right focus:border-gold outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {actuals[category.key].actual > 0 && (
                      <span className={variance > 0 ? 'text-danger' : 'text-success'}>
                        {variance > 0 ? '+' : ''}${(variance / 1000).toFixed(0)}K
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={actuals[category.key].notes}
                      onChange={(e) => updateActual(category.key, 'notes', e.target.value)}
                      placeholder="Vendor, invoice..."
                      className="w-full bg-navy border border-navy-card rounded px-2 py-1 text-white text-sm focus:border-gold outline-none"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-navy/30">
              <td className="px-6 py-4 text-white font-semibold">Total</td>
              <td className="px-6 py-4 text-white font-semibold text-right">${(totalEstimated / 1000).toFixed(0)}K</td>
              <td className="px-6 py-4 text-white font-semibold text-right">${(totalActual / 1000).toFixed(0)}K</td>
              <td className={`px-6 py-4 font-semibold text-right ${totalVariance > 0 ? 'text-danger' : 'text-success'}`}>
                {totalVariance > 0 ? '+' : ''}${(totalVariance / 1000).toFixed(0)}K
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Budget Burn Chart */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h3 className="text-lg font-serif text-white mb-4">Budget Burn by Category</h3>
        <div className="space-y-4">
          {costCategories.filter(c => actuals[c.key].estimated > 0).map((category) => {
            const pct = actuals[category.key].actual / actuals[category.key].estimated * 100;
            return (
              <div key={category.key}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{category.name}</span>
                  <span className={pct > 100 ? 'text-danger' : 'text-white'}>{pct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-navy rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${pct > 100 ? 'bg-danger' : pct > 80 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
