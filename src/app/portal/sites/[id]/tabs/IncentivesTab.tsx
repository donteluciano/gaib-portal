'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type IncentiveStatus = 'not_explored' | 'in_discussion' | 'agreed' | 'denied';

const incentiveTypes = [
  { key: 'pilot', name: 'PILOT', description: 'Payment In Lieu Of Taxes - negotiated property tax reduction', typicalValue: '$2-10M over 20 years', duration: '10-30 years', howToObtain: 'Negotiate with municipality/county', buyerImpact: 'Major selling point - significantly reduces operating costs' },
  { key: 'tax_abatement', name: 'Tax Abatement', description: 'Reduction or elimination of property taxes for a period', typicalValue: '50-100% reduction', duration: '5-15 years', howToObtain: 'Apply through county/municipality', buyerImpact: 'Attractive for buyers looking at OpEx savings' },
  { key: 'sales_tax', name: 'Sales Tax Exemption', description: 'Exemption on equipment and construction materials', typicalValue: '5-10% of CapEx', duration: 'Construction period', howToObtain: 'State economic development office', buyerImpact: 'Reduces construction costs' },
  { key: 'enterprise_zone', name: 'Enterprise Zone', description: 'Special economic zone with tax incentives', typicalValue: 'Varies widely', duration: 'Zone-dependent', howToObtain: 'Site must be in designated zone', buyerImpact: 'Bundled incentives, simplified process' },
  { key: 'tif', name: 'TIF District', description: 'Tax Increment Financing - future tax revenue funds improvements', typicalValue: '$500K-5M', duration: '15-25 years', howToObtain: 'Municipality establishes district', buyerImpact: 'Infrastructure paid for by tax increment' },
  { key: 'job_credits', name: 'Job Tax Credits', description: 'Credits for each job created', typicalValue: '$1-5K per job annually', duration: '5-10 years', howToObtain: 'State economic development office', buyerImpact: 'Reduces tax liability during operations' },
  { key: 'expedited_permitting', name: 'Expedited Permitting', description: 'Fast-track approval process', typicalValue: 'Time savings', duration: 'N/A', howToObtain: 'Negotiate with planning department', buyerImpact: 'Faster time to revenue' },
  { key: 'utility_rates', name: 'Utility Rate Incentives', description: 'Reduced electricity or water rates', typicalValue: '10-30% reduction', duration: '5-20 years', howToObtain: 'Negotiate with utility/PSC', buyerImpact: 'Significant OpEx savings for power-intensive operations' },
  { key: 'infrastructure', name: 'Infrastructure Cost Sharing', description: 'Municipality pays for roads, utilities, etc.', typicalValue: '$500K-5M', duration: 'One-time', howToObtain: 'Negotiate as part of development agreement', buyerImpact: 'Reduces CapEx requirements' },
  { key: 'free_land', name: 'Free/Reduced Land', description: 'Land provided at below-market rate', typicalValue: 'Up to 100% discount', duration: 'N/A', howToObtain: 'Economic development authority', buyerImpact: 'Reduces acquisition cost' },
];

const statusColors: Record<IncentiveStatus, string> = {
  not_explored: 'bg-muted/20 text-gray-400 border-muted/30',
  in_discussion: 'bg-warning/20 text-warning border-warning/30',
  agreed: 'bg-success/20 text-success border-success/30',
  denied: 'bg-danger/20 text-danger border-danger/30',
};

interface IncentiveState {
  dbId?: string;
  status: IncentiveStatus;
  estimatedValue: number;
  notes: string;
}

interface Props {
  siteId: string;
}

export default function IncentivesTab({ siteId }: Props) {
  const [incentives, setIncentives] = useState<Record<string, IncentiveState>>(
    Object.fromEntries(incentiveTypes.map(t => [t.key, {
      status: 'not_explored' as IncentiveStatus,
      estimatedValue: 0,
      notes: '',
    }]))
  );
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Load incentives from Supabase
  useEffect(() => {
    const loadIncentives = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_incentives')
        .select('*')
        .eq('site_id', siteId);

      if (!error && data) {
        const loaded: Record<string, IncentiveState> = { ...incentives };
        data.forEach(row => {
          if (loaded[row.type] !== undefined) {
            loaded[row.type] = {
              dbId: row.id,
              status: row.status as IncentiveStatus || 'not_explored',
              estimatedValue: row.estimated_value || 0,
              notes: row.notes || '',
            };
          }
        });
        setIncentives(loaded);
      }
      setLoading(false);
    };

    loadIncentives();
  }, [siteId]);

  // Save incentive to Supabase
  const saveIncentive = useCallback(async (type: string, state: IncentiveState) => {
    setSaving(type);
    
    if (state.dbId) {
      await supabase
        .from('site_incentives')
        .update({
          status: state.status,
          estimated_value: state.estimatedValue,
          notes: state.notes,
        })
        .eq('id', state.dbId);
    } else {
      const { data, error } = await supabase
        .from('site_incentives')
        .insert({
          site_id: siteId,
          type,
          status: state.status,
          estimated_value: state.estimatedValue,
          notes: state.notes,
        })
        .select()
        .single();

      if (!error && data) {
        setIncentives(prev => ({
          ...prev,
          [type]: { ...prev[type], dbId: data.id }
        }));
      }
    }
    
    setSaving(null);
  }, [siteId]);

  const updateIncentive = (key: string, field: string, value: string | number) => {
    const newState = {
      ...incentives[key],
      [field]: value
    };
    setIncentives(prev => ({
      ...prev,
      [key]: newState
    }));
    
    // Debounce save
    setTimeout(() => saveIncentive(key, newState), 500);
  };

  const totalEstimatedValue = Object.values(incentives).reduce((sum, i) => 
    i.status !== 'denied' ? sum + (i.estimatedValue || 0) : sum, 0
  );

  const agreedIncentives = Object.values(incentives).filter(i => i.status === 'agreed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading incentives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <p className="text-gray-400 text-sm">Total Estimated Value</p>
          <p className="text-3xl font-bold text-gold mt-2">
            ${(totalEstimatedValue / 1000000).toFixed(1)}M
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Across all incentives
            {saving && <span className="text-gold"> • Saving...</span>}
          </p>
        </div>
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <p className="text-gray-400 text-sm">Incentives Agreed</p>
          <p className="text-3xl font-bold text-success mt-2">{agreedIncentives}</p>
          <p className="text-gray-400 text-sm mt-1">of {incentiveTypes.length} types</p>
        </div>
        <div className="bg-navy-card border border-navy rounded-xl p-6">
          <p className="text-gray-400 text-sm">In Discussion</p>
          <p className="text-3xl font-bold text-warning mt-2">
            {Object.values(incentives).filter(i => i.status === 'in_discussion').length}
          </p>
          <p className="text-gray-400 text-sm mt-1">Active negotiations</p>
        </div>
      </div>

      {/* Incentive Types */}
      <div className="space-y-4">
        {incentiveTypes.map((type) => (
          <div key={type.key} className="bg-navy-card border border-navy rounded-xl overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpandedType(expandedType === type.key ? null : type.key)}
              className="w-full p-4 flex items-center justify-between hover:bg-navy/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-medium text-white">{type.name}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${statusColors[incentives[type.key]?.status || 'not_explored']}`}>
                  {(incentives[type.key]?.status || 'not_explored').replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {(incentives[type.key]?.estimatedValue || 0) > 0 && (
                  <span className="text-gold font-medium">
                    ${((incentives[type.key]?.estimatedValue || 0) / 1000000).toFixed(1)}M
                  </span>
                )}
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${expandedType === type.key ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedType === type.key && (
              <div className="p-4 border-t border-navy space-y-4">
                {/* Reference Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-navy/30 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-xs">Typical Value</p>
                    <p className="text-white text-sm">{type.typicalValue}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Duration</p>
                    <p className="text-white text-sm">{type.duration}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">How to Obtain</p>
                    <p className="text-white text-sm">{type.howToObtain}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Buyer Impact</p>
                    <p className="text-white text-sm">{type.buyerImpact}</p>
                  </div>
                </div>

                {/* Site-specific Tracking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                    <select
                      value={incentives[type.key]?.status || 'not_explored'}
                      onChange={(e) => updateIncentive(type.key, 'status', e.target.value)}
                      className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
                    >
                      <option value="not_explored">Not Explored</option>
                      <option value="in_discussion">In Discussion</option>
                      <option value="agreed">Agreed</option>
                      <option value="denied">Denied</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Estimated Value ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={incentives[type.key]?.estimatedValue || 0}
                      onChange={(e) => updateIncentive(type.key, 'estimatedValue', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Notes (Contact, Terms, Negotiations)</label>
                  <textarea
                    value={incentives[type.key]?.notes || ''}
                    onChange={(e) => updateIncentive(type.key, 'notes', e.target.value)}
                    rows={2}
                    className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none resize-none"
                    placeholder="Contact name, terms, conditions, negotiation notes..."
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Exit Pitch Summary */}
      {totalEstimatedValue > 0 && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-6">
          <h3 className="text-xl font-serif text-gold mb-4">Exit Pitch Summary</h3>
          <p className="text-white">
            This site comes with an estimated <span className="text-gold font-bold">${(totalEstimatedValue / 1000000).toFixed(1)}M</span> in 
            municipal incentives, including:
          </p>
          <ul className="mt-4 space-y-2">
            {incentiveTypes.filter(t => incentives[t.key]?.status === 'agreed' || (incentives[t.key]?.estimatedValue || 0) > 0).map(type => (
              <li key={type.key} className="flex items-center gap-2 text-gray-400">
                <span className={`w-2 h-2 rounded-full ${incentives[type.key]?.status === 'agreed' ? 'bg-success' : 'bg-warning'}`} />
                {type.name}: ${((incentives[type.key]?.estimatedValue || 0) / 1000).toFixed(0)}K
                {incentives[type.key]?.status === 'agreed' && <span className="text-success text-xs">(confirmed)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
