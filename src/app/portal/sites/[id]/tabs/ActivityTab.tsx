'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Activity {
  id: string;
  date: string;
  action: string;
  notes: string;
  cost: number;
  stage: number;
}

const stageNames: Record<number, string> = {
  1: 'Site Control',
  2: 'Gas & Power',
  3: 'Water & Environmental',
  4: 'Fiber & Access',
  5: 'Political & Community',
  6: 'Engineering & Feasibility',
  7: 'Packaging & Exit',
};

interface Props {
  siteId: string;
}

export default function ActivityTab({ siteId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({ date: '', action: '', notes: '', cost: 0, stage: 1 });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [siteId]);

  async function loadActivities() {
    setLoading(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('site_id', siteId)
      .order('date', { ascending: false });

    if (!error && data) {
      setActivities(data);
    }
    setLoading(false);
  }

  async function addActivity() {
    if (!newActivity.date || !newActivity.action) return;
    
    setSaving(true);
    const { data, error } = await supabase
      .from('activities')
      .insert({
        site_id: siteId,
        date: newActivity.date,
        action: newActivity.action,
        notes: newActivity.notes,
        cost: newActivity.cost,
        stage: newActivity.stage,
      })
      .select()
      .single();

    if (!error && data) {
      setActivities([data, ...activities]);
      setNewActivity({ date: '', action: '', notes: '', cost: 0, stage: 1 });
      setShowForm(false);
    }
    setSaving(false);
  }

  async function deleteActivity(id: string) {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (!error) {
      setActivities(activities.filter(a => a.id !== id));
    }
  }

  const totalCosts = activities.reduce((sum, a) => sum + (a.cost || 0), 0);

  // Get stage history from activities
  const stageHistory = Array.from(
    new Map(
      activities
        .filter(a => a.stage)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(a => [a.stage, a.date])
    )
  ).map(([stage, date]) => ({ stage, date }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted">Loading activities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stage Timeline */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-4">Stage Progression</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7].map((stage, i) => {
            const stageEntry = stageHistory.find(s => s.stage === stage);
            const isReached = !!stageEntry;
            
            return (
              <div key={stage} className="flex items-center">
                <div className={`flex flex-col items-center ${isReached ? 'text-gold' : 'text-muted'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                    isReached ? 'bg-gold text-navy' : 'bg-navy-card border border-navy'
                  }`}>
                    {stage}
                  </div>
                  <p className="text-xs mt-2 text-center w-20">{stageNames[stage]?.split(' ')[0]}</p>
                  {stageEntry && (
                    <p className="text-xs text-muted">{stageEntry.date}</p>
                  )}
                </div>
                {i < 6 && (
                  <div className={`w-8 h-0.5 mx-1 ${isReached ? 'bg-gold' : 'bg-navy-card'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-white">Activity Log</h2>
            <p className="text-muted text-sm">{activities.length} entries • ${totalCosts.toLocaleString()} total costs</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg transition-colors"
          >
            + Add Entry
          </button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="mb-6 p-4 bg-navy/50 rounded-lg border border-gold/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm text-muted mb-1">Date *</label>
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-muted mb-1">Action *</label>
                <input
                  type="text"
                  value={newActivity.action}
                  onChange={(e) => setNewActivity({ ...newActivity, action: e.target.value })}
                  placeholder="What happened?"
                  className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Cost ($)</label>
                <input
                  type="number"
                  value={newActivity.cost || ''}
                  onChange={(e) => setNewActivity({ ...newActivity, cost: parseInt(e.target.value) || 0 })}
                  className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-muted mb-1">Notes</label>
                <textarea
                  value={newActivity.notes}
                  onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-muted mb-1">Stage</label>
                <select
                  value={newActivity.stage}
                  onChange={(e) => setNewActivity({ ...newActivity, stage: parseInt(e.target.value) })}
                  className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
                >
                  {Object.entries(stageNames).map(([num, name]) => (
                    <option key={num} value={num}>Stage {num}: {name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addActivity}
                disabled={saving || !newActivity.date || !newActivity.action}
                className="px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Entry'}
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

        {/* Activity List */}
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-white font-medium mb-2">No activities yet</p>
            <p className="text-muted text-sm">Start logging key events and milestones for this site.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 bg-navy/30 rounded-lg group">
                <div className="w-24 text-muted text-sm flex-shrink-0">{activity.date}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{activity.action}</p>
                    {activity.stage && (
                      <span className="text-xs px-2 py-0.5 bg-navy-card rounded text-muted">
                        Stage {activity.stage}
                      </span>
                    )}
                  </div>
                  {activity.notes && <p className="text-muted text-sm mt-1">{activity.notes}</p>}
                </div>
                {activity.cost > 0 && (
                  <div className="text-gold font-medium">${activity.cost.toLocaleString()}</div>
                )}
                <button
                  onClick={() => deleteActivity(activity.id)}
                  className="text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
