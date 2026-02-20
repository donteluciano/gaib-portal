'use client';

import { useState } from 'react';

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

export default function PoliticalTab() {
  const [politicalScores, setPoliticalScores] = useState<Record<string, number>>(
    Object.fromEntries(politicalFactors.map(f => [f.key, 3]))
  );
  const [communityScores, setCommunityScores] = useState<Record<string, number>>(
    Object.fromEntries(communityFactors.map(f => [f.key, 3]))
  );
  const [cbaItems, setCbaItems] = useState<Record<string, { enabled: boolean; cost: number }>>(
    Object.fromEntries(cbaOptions.map(o => [o.key, { enabled: false, cost: o.defaultCost }]))
  );

  const politicalTotal = politicalFactors.reduce((sum, f) => sum + (politicalScores[f.key] * f.weight / 100), 0);
  const politicalMax = 5;
  
  const communityTotal = communityFactors.reduce((sum, f) => sum + (communityScores[f.key] * f.weight / 100), 0);
  const communityMax = 5;

  const cbaTotal = Object.entries(cbaItems).reduce((sum, [, item]) => sum + (item.enabled ? item.cost : 0), 0);

  return (
    <div className="space-y-8">
      {/* Political Risk Matrix */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-white">Political Risk Matrix</h2>
            <p className="text-muted text-sm mt-1">Score each factor 1-5 based on site conditions</p>
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
                <div>
                  <p className="text-white font-medium">{factor.label}</p>
                  <p className="text-muted text-xs">Weight: {factor.weight}%</p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setPoliticalScores({ ...politicalScores, [factor.key]: score })}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        politicalScores[factor.key] === score
                          ? score <= 2 ? 'bg-danger text-white' : score <= 3 ? 'bg-warning text-black' : 'bg-success text-white'
                          : 'bg-navy text-muted hover:bg-navy-card'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted mt-2">
                <p><span className="text-danger">1:</span> {factor.desc1}</p>
                <p><span className="text-warning">3:</span> {factor.desc3}</p>
                <p><span className="text-success">5:</span> {factor.desc5}</p>
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
            <p className="text-muted text-sm mt-1">Assess community acceptance factors</p>
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
                <div>
                  <p className="text-white font-medium">{factor.label}</p>
                  <p className="text-muted text-xs">Weight: {factor.weight}%</p>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => setCommunityScores({ ...communityScores, [factor.key]: score })}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                        communityScores[factor.key] === score
                          ? score <= 2 ? 'bg-danger text-white' : score <= 3 ? 'bg-warning text-black' : 'bg-success text-white'
                          : 'bg-navy text-muted hover:bg-navy-card'
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
            <p className="text-muted text-sm mt-1">Toggle offerings and estimate costs</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gold">
              ${(cbaTotal / 1000).toFixed(0)}K
            </p>
            <p className="text-muted text-sm">Est. CBA Cost</p>
          </div>
        </div>
        <div className="space-y-3">
          {cbaOptions.map((option) => (
            <div key={option.key} className="flex items-center gap-4 p-4 bg-navy/50 rounded-lg">
              <button
                onClick={() => setCbaItems({
                  ...cbaItems,
                  [option.key]: { ...cbaItems[option.key], enabled: !cbaItems[option.key].enabled }
                })}
                className={`w-6 h-6 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  cbaItems[option.key].enabled ? 'bg-gold border-gold' : 'border-muted hover:border-gold'
                }`}
              >
                {cbaItems[option.key].enabled && (
                  <svg className="w-4 h-4 text-navy" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
              <div className="flex-1">
                <p className="text-white font-medium">{option.label}</p>
                <p className="text-muted text-sm">{option.description}</p>
              </div>
              <div className="w-32">
                <input
                  type="number"
                  value={cbaItems[option.key].cost}
                  onChange={(e) => setCbaItems({
                    ...cbaItems,
                    [option.key]: { ...cbaItems[option.key], cost: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-3 py-2 bg-navy border border-navy-card rounded-lg text-white text-sm focus:border-gold outline-none"
                  placeholder="Cost"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
