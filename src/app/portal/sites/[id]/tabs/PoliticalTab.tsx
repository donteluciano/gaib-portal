'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

// Political Risk Matrix factors
const politicalFactors = [
  { key: 'mayor_stance', label: 'Mayor/Council Stance', weight: 15, desc1: 'Openly hostile to data centers', desc3: 'Neutral, no public position', desc5: 'Actively recruiting data centers' },
  { key: 'election_dynamics', label: 'Election Dynamics', weight: 10, desc1: 'Election in <6 months, opposition leading', desc3: 'Election >12 months away', desc5: 'Recent election, stable leadership' },
  { key: 'prior_approvals', label: 'Prior Data Center Approvals', weight: 15, desc1: 'Denied similar projects', desc3: 'No precedent', desc5: 'Multiple approvals, streamlined process' },
  { key: 'zoning_authority', label: 'Zoning Authority Attitude', weight: 10, desc1: 'Hostile planning board', desc3: 'Standard process', desc5: 'Pro-development, fast approvals' },
  { key: 'community_activism', label: 'Community Activism Level', weight: 15, desc1: 'Active opposition groups', desc3: 'Typical NIMBYism', desc5: 'Community supportive of jobs' },
  { key: 'media_environment', label: 'Media Environment', weight: 5, desc1: 'Hostile coverage of development', desc3: 'Neutral', desc5: 'Positive coverage of economic development' },
  { key: 'labor_relations', label: 'Labor Relations', weight: 5, desc1: 'Strong union opposition', desc3: 'Mixed', desc5: 'Pro-business labor environment' },
  { key: 'regulatory_burden', label: 'Regulatory Burden', weight: 10, desc1: 'Excessive permitting requirements', desc3: 'Standard', desc5: 'Streamlined, business-friendly' },
  { key: 'tax_policy', label: 'Tax Policy', weight: 10, desc1: 'High taxes, no incentives', desc3: 'Average', desc5: 'Tax incentives available' },
  { key: 'infrastructure_support', label: 'Infrastructure Support', weight: 5, desc1: 'No utility cooperation', desc3: 'Standard', desc5: 'Proactive utility partnerships' },
];

// Community Sentiment factors
const communityFactors = [
  { key: 'employment_conditions', label: 'Local Employment Conditions', weight: 15, desc1: 'Very low unemployment, labor shortage', desc3: 'Average employment', desc5: 'High unemployment, desperate for jobs' },
  { key: 'industrial_history', label: 'Industrial History', weight: 15, desc1: 'No industrial history, residential focus', desc3: 'Mixed use area', desc5: 'Strong industrial heritage, factory town' },
  { key: 'environmental_sensitivity', label: 'Environmental Sensitivity', weight: 15, desc1: 'History of environmental activism', desc3: 'Moderate awareness', desc5: 'Practical, jobs-first mentality' },
  { key: 'noise_concerns', label: 'Noise Sensitivity', weight: 10, desc1: 'Dense residential nearby', desc3: 'Some residential', desc5: 'Isolated, industrial area' },
  { key: 'traffic_concerns', label: 'Traffic Concerns', weight: 10, desc1: 'Major traffic issues', desc3: 'Moderate concern', desc5: 'Good infrastructure, low impact' },
  { key: 'property_values', label: 'Property Value Concerns', weight: 10, desc1: 'High-value residential area', desc3: 'Mixed valuations', desc5: 'Industrial/low-value area' },
  { key: 'water_sensitivity', label: 'Water Resource Sensitivity', weight: 15, desc1: 'Water scarcity, conservation focus', desc3: 'Adequate water', desc5: 'Abundant water, industrial use accepted' },
  { key: 'tax_base_need', label: 'Tax Base Need', weight: 10, desc1: 'Wealthy municipality', desc3: 'Average', desc5: 'Struggling, needs tax revenue' },
];

// CBA options
const cbaOptions = [
  { key: 'local_hiring', label: 'Local Hiring Commitment', description: 'Commit to hiring X% local residents', defaultCost: 0 },
  { key: 'job_training', label: 'Job Training Program', description: 'Fund workforce development programs', defaultCost: 100000 },
  { key: 'infrastructure', label: 'Infrastructure Improvements', description: 'Road, utility, or public infrastructure upgrades', defaultCost: 250000 },
  { key: 'education', label: 'Education Contribution', description: 'School donations, STEM programs, scholarships', defaultCost: 150000 },
  { key: 'community_fund', label: 'Community Fund', description: 'Annual contribution to community projects', defaultCost: 50000 },
  { key: 'park_improvements', label: 'Park/Recreation Improvements', description: 'Parks, trails, recreation facilities', defaultCost: 100000 },
  { key: 'affordable_housing', label: 'Affordable Housing Contribution', description: 'Housing fund or direct development', defaultCost: 200000 },
  { key: 'environmental_offset', label: 'Environmental Offset', description: 'Tree planting, green space, sustainability', defaultCost: 75000 },
];

// Official contact interface
interface Official {
  id: string;
  name: string;
  title: string;
  contact: string;
  stance: 'supportive' | 'neutral' | 'opposed' | 'unknown';
  lastContact: string;
  notes: string;
}

interface PoliticalData {
  politicalScores: Record<string, number>;
  communityScores: Record<string, number>;
  cbaItems: Record<string, { enabled: boolean; cost: number }>;
  officials: Official[];
  notes: string;
}

function getRatingColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.7) return 'text-success';
  if (pct >= 0.4) return 'text-warning';
  return 'text-danger';
}

function getRatingLabel(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.7) return 'Low Risk';
  if (pct >= 0.4) return 'Medium Risk';
  return 'High Risk';
}

interface Props {
  siteId: string;
}

export default function PoliticalTab({ siteId }: Props) {
  const [data, setData] = useState<PoliticalData>({
    politicalScores: Object.fromEntries(politicalFactors.map(f => [f.key, 3])),
    communityScores: Object.fromEntries(communityFactors.map(f => [f.key, 3])),
    cbaItems: Object.fromEntries(cbaOptions.map(o => [o.key, { enabled: false, cost: o.defaultCost }])),
    officials: [],
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddOfficial, setShowAddOfficial] = useState(false);
  const [newOfficial, setNewOfficial] = useState<Omit<Official, 'id'>>({
    name: '', title: '', contact: '', stance: 'unknown', lastContact: '', notes: ''
  });

  // Load from Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { data: siteData } = await supabase
        .from('sites')
        .select('inputs')
        .eq('id', siteId)
        .single();

      if (siteData?.inputs?.politicalData) {
        setData({
          ...data,
          ...siteData.inputs.politicalData,
        });
      }
      setLoading(false);
    };

    loadData();
  }, [siteId]);

  // Save to Supabase
  const saveData = useCallback(async (newData: PoliticalData) => {
    setSaving(true);
    
    const { data: siteData } = await supabase
      .from('sites')
      .select('inputs')
      .eq('id', siteId)
      .single();

    const currentInputs = siteData?.inputs || {};
    
    await supabase
      .from('sites')
      .update({
        inputs: { ...currentInputs, politicalData: newData },
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId);

    setSaving(false);
  }, [siteId]);

  const updateData = (field: keyof PoliticalData, value: unknown) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    setTimeout(() => saveData(newData), 500);
  };

  const addOfficial = () => {
    if (!newOfficial.name) return;
    const official: Official = {
      id: crypto.randomUUID(),
      ...newOfficial,
    };
    updateData('officials', [...data.officials, official]);
    setNewOfficial({ name: '', title: '', contact: '', stance: 'unknown', lastContact: '', notes: '' });
    setShowAddOfficial(false);
  };

  const removeOfficial = (id: string) => {
    if (!confirm('Remove this official?')) return;
    updateData('officials', data.officials.filter(o => o.id !== id));
  };

  const politicalTotal = politicalFactors.reduce((sum, f) => sum + ((data.politicalScores[f.key] || 3) * f.weight / 100), 0);
  const politicalMax = 5;
  
  const communityTotal = communityFactors.reduce((sum, f) => sum + ((data.communityScores[f.key] || 3) * f.weight / 100), 0);
  const communityMax = 5;

  const cbaTotal = Object.entries(data.cbaItems).reduce((sum, [, item]) => sum + (item.enabled ? item.cost : 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading political data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {saving && (
        <div className="text-right text-sm text-gold">Saving...</div>
      )}

      {/* Officials Contacted */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-white">Officials & Stakeholders</h2>
            <p className="text-gray-400 text-sm">{data.officials.length} contacts tracked</p>
          </div>
          <button
            onClick={() => setShowAddOfficial(true)}
            className="px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg transition-colors"
          >
            + Add Contact
          </button>
        </div>

        {showAddOfficial && (
          <div className="mb-6 p-4 bg-navy/50 rounded-lg border border-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={newOfficial.name}
                onChange={(e) => setNewOfficial({ ...newOfficial, name: e.target.value })}
                placeholder="Name *"
                className="bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
              />
              <input
                type="text"
                value={newOfficial.title}
                onChange={(e) => setNewOfficial({ ...newOfficial, title: e.target.value })}
                placeholder="Title (Mayor, Council, etc.)"
                className="bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
              />
              <input
                type="text"
                value={newOfficial.contact}
                onChange={(e) => setNewOfficial({ ...newOfficial, contact: e.target.value })}
                placeholder="Email / Phone"
                className="bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <select
                value={newOfficial.stance}
                onChange={(e) => setNewOfficial({ ...newOfficial, stance: e.target.value as Official['stance'] })}
                className="bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
              >
                <option value="unknown">Unknown Stance</option>
                <option value="supportive">Supportive</option>
                <option value="neutral">Neutral</option>
                <option value="opposed">Opposed</option>
              </select>
              <input
                type="date"
                value={newOfficial.lastContact}
                onChange={(e) => setNewOfficial({ ...newOfficial, lastContact: e.target.value })}
                className="bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
              />
              <input
                type="text"
                value={newOfficial.notes}
                onChange={(e) => setNewOfficial({ ...newOfficial, notes: e.target.value })}
                placeholder="Notes"
                className="bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addOfficial}
                disabled={!newOfficial.name}
                className="px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg disabled:opacity-50"
              >
                Add Contact
              </button>
              <button
                onClick={() => setShowAddOfficial(false)}
                className="px-4 py-2 bg-navy hover:bg-navy-card text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {data.officials.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No officials tracked yet. Add contacts to track political relationships.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.officials.map(official => (
              <div key={official.id} className="p-4 bg-navy/50 rounded-lg flex items-center gap-4 group">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  official.stance === 'supportive' ? 'bg-success' :
                  official.stance === 'opposed' ? 'bg-danger' :
                  official.stance === 'neutral' ? 'bg-warning' : 'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="text-white font-medium">{official.name}</p>
                  <p className="text-gray-400 text-sm">{official.title} {official.contact && `• ${official.contact}`}</p>
                </div>
                {official.lastContact && (
                  <span className="text-gray-400 text-sm">Last: {official.lastContact}</span>
                )}
                <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                  official.stance === 'supportive' ? 'bg-success/20 text-success' :
                  official.stance === 'opposed' ? 'bg-danger/20 text-danger' :
                  official.stance === 'neutral' ? 'bg-warning/20 text-warning' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {official.stance}
                </span>
                <button
                  onClick={() => removeOfficial(official.id)}
                  className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Political Risk Matrix */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-white">Political Risk Matrix</h2>
            <p className="text-gray-400 text-sm mt-1">Score each factor 1-5 based on site conditions</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${getRatingColor(politicalTotal, politicalMax)}`}>
              {politicalTotal.toFixed(1)}
            </p>
            <p className={`text-sm ${getRatingColor(politicalTotal, politicalMax)}`}>
              {getRatingLabel(politicalTotal, politicalMax)}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {politicalFactors.map((factor) => (
            <div key={factor.key} className="p-4 bg-navy/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{factor.label}</p>
                  <span className="group relative cursor-help">
                    <InformationCircleIcon className="w-4 h-4 text-gray-400" />
                    <span className="absolute bottom-full left-0 mb-2 w-64 p-2 bg-navy text-xs text-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <strong>1:</strong> {factor.desc1}<br/>
                      <strong>3:</strong> {factor.desc3}<br/>
                      <strong>5:</strong> {factor.desc5}
                    </span>
                  </span>
                  <span className="text-gray-400 text-xs">Weight: {factor.weight}%</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => updateData('politicalScores', { ...data.politicalScores, [factor.key]: score })}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        data.politicalScores[factor.key] === score
                          ? score <= 2 ? 'bg-danger text-white' : score <= 3 ? 'bg-warning text-black' : 'bg-success text-white'
                          : 'bg-navy text-gray-400 hover:bg-navy-card'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Sentiment Scorecard */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-white">Community Sentiment Scorecard</h2>
            <p className="text-gray-400 text-sm mt-1">Assess community acceptance factors</p>
          </div>
          <div className="text-right">
            <p className={`text-3xl font-bold ${getRatingColor(communityTotal, communityMax)}`}>
              {communityTotal.toFixed(1)}
            </p>
            <p className={`text-sm ${getRatingColor(communityTotal, communityMax)}`}>
              {getRatingLabel(communityTotal, communityMax)}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {communityFactors.map((factor) => (
            <div key={factor.key} className="p-4 bg-navy/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{factor.label}</p>
                  <span className="text-gray-400 text-xs">Weight: {factor.weight}%</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => updateData('communityScores', { ...data.communityScores, [factor.key]: score })}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        data.communityScores[factor.key] === score
                          ? score <= 2 ? 'bg-danger text-white' : score <= 3 ? 'bg-warning text-black' : 'bg-success text-white'
                          : 'bg-navy text-gray-400 hover:bg-navy-card'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CBA Builder */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-white">Community Benefit Agreement Builder</h2>
            <p className="text-gray-400 text-sm mt-1">Toggle offerings and estimate costs</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gold">
              ${(cbaTotal / 1000).toFixed(0)}K
            </p>
            <p className="text-gray-400 text-sm">Est. CBA Cost</p>
          </div>
        </div>
        <div className="space-y-3">
          {cbaOptions.map((option) => (
            <div key={option.key} className="flex items-center gap-4 p-4 bg-navy/50 rounded-lg">
              <button
                onClick={() => updateData('cbaItems', {
                  ...data.cbaItems,
                  [option.key]: { ...data.cbaItems[option.key], enabled: !data.cbaItems[option.key]?.enabled }
                })}
                className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  data.cbaItems[option.key]?.enabled ? 'bg-gold border-gold' : 'border-muted hover:border-gold'
                }`}
              >
                {data.cbaItems[option.key]?.enabled && (
                  <svg className="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <p className="text-white font-medium">{option.label}</p>
                <p className="text-gray-400 text-sm">{option.description}</p>
              </div>
              <div className="w-32">
                <input
                  type="number"
                  min="0"
                  value={data.cbaItems[option.key]?.cost || option.defaultCost}
                  onChange={(e) => updateData('cbaItems', {
                    ...data.cbaItems,
                    [option.key]: { ...data.cbaItems[option.key], cost: Math.max(0, parseInt(e.target.value) || 0) }
                  })}
                  className="w-full px-3 py-2 bg-navy border border-navy-card rounded-lg text-white text-sm focus:border-gold outline-none"
                  placeholder="Cost"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-4">Political Notes</h2>
        <textarea
          value={data.notes}
          onChange={(e) => updateData('notes', e.target.value)}
          rows={4}
          placeholder="Meeting notes, strategy, timeline..."
          className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none resize-none"
        />
      </div>
    </div>
  );
}
