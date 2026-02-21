'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Activity { id: string; date: string; action: string; notes: string; cost: number; stage: number; created_at?: string; }

const stageNames: Record<number, string> = { 1: 'Site Control', 2: 'Gas & Power', 3: 'Water & Environmental', 4: 'Fiber & Access', 5: 'Political & Community', 6: 'Engineering & Feasibility', 7: 'Packaging & Exit' };

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

interface Props { siteId: string; }

export default function ActivityTab({ siteId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivity, setNewActivity] = useState({ date: '', action: '', notes: '', cost: 0, stage: 1 });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadActivities = async () => {
      setLoading(true);
      const { data } = await supabase.from('activities').select('*').eq('site_id', siteId).order('date', { ascending: false });
      if (data) setActivities(data);
      setLoading(false);
    };
    loadActivities();
  }, [siteId]);

  async function addActivity() {
    if (!newActivity.date || !newActivity.action) return;
    setSaving(true);
    const { data, error } = await supabase.from('activities').insert({ site_id: siteId, date: newActivity.date, action: newActivity.action, notes: newActivity.notes, cost: newActivity.cost, stage: newActivity.stage }).select().single();
    if (!error && data) { setActivities([data, ...activities]); setNewActivity({ date: '', action: '', notes: '', cost: 0, stage: 1 }); setShowForm(false); }
    setSaving(false);
  }

  async function deleteActivity(id: string) {
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (!error) setActivities(activities.filter(a => a.id !== id));
    setDeleteConfirm(null);
  }

  const totalCosts = activities.reduce((sum, a) => sum + (a.cost || 0), 0);
  const stageHistory = Array.from(new Map(activities.filter(a => a.stage).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(a => [a.stage, a.date]))).map(([stage, date]) => ({ stage, date }));

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: 'var(--text-muted)' }}>Loading activities...</p></div>;

  const inputStyle = { width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stage Timeline */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>Stage Progression</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((stage, i) => {
            const stageEntry = stageHistory.find(s => s.stage === stage);
            const isReached = !!stageEntry;
            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: isReached ? 'var(--accent)' : 'var(--text-muted)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, backgroundColor: isReached ? 'var(--accent)' : 'var(--bg-primary)', color: isReached ? '#FFFFFF' : 'var(--text-muted)', border: isReached ? 'none' : '1px solid var(--border-card)' }}>{stage}</div>
                  <p style={{ fontSize: '12px', marginTop: '8px', textAlign: 'center', width: '80px' }}>{stageNames[stage]?.split(' ')[0]}</p>
                  {stageEntry && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stageEntry.date}</p>}
                </div>
                {i < 6 && <div style={{ width: '32px', height: '2px', margin: '0 4px', backgroundColor: isReached ? 'var(--accent)' : 'var(--border-card)' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity Log */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>Activity Log</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{activities.length} entries • ${totalCosts.toLocaleString()} total costs</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 16px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>+ Add Entry</button>
        </div>

        {showForm && (
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Date *</label><input type="date" value={newActivity.date} onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })} style={inputStyle} /></div>
              <div style={{ gridColumn: 'span 2' }}><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Action *</label><input type="text" value={newActivity.action} onChange={(e) => setNewActivity({ ...newActivity, action: e.target.value })} placeholder="What happened?" style={inputStyle} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Cost ($)</label><input type="number" min="0" value={newActivity.cost || ''} onChange={(e) => setNewActivity({ ...newActivity, cost: Math.max(0, parseInt(e.target.value) || 0) })} style={inputStyle} /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Notes</label><textarea value={newActivity.notes} onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })} placeholder="Additional details..." rows={2} style={{ ...inputStyle, resize: 'none' }} /></div>
              <div><label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Stage</label><select value={newActivity.stage} onChange={(e) => setNewActivity({ ...newActivity, stage: parseInt(e.target.value) })} style={inputStyle}>{Object.entries(stageNames).map(([num, name]) => <option key={num} value={num}>Stage {num}: {name}</option>)}</select></div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={addActivity} disabled={saving || !newActivity.date || !newActivity.action} style={{ padding: '10px 16px', backgroundColor: 'var(--accent)', color: '#FFFFFF', fontWeight: 500, borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: saving || !newActivity.date || !newActivity.action ? 0.5 : 1 }}>{saving ? 'Adding...' : 'Add Entry'}</button>
              <button onClick={() => setShowForm(false)} style={{ padding: '10px 16px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📋</div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '8px' }}>No activities yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Start logging key events and milestones for this site.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activities.map((activity) => (
              <div key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', position: 'relative' }}>
                <div style={{ width: '96px', flexShrink: 0 }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{activity.date}</p>
                  {activity.created_at && <p style={{ color: 'var(--text-muted)', fontSize: '12px', opacity: 0.7 }}>{getRelativeTime(activity.created_at)}</p>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{activity.action}</p>
                    {activity.stage && <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: 'var(--border)', borderRadius: '4px', color: 'var(--text-muted)' }}>Stage {activity.stage}</span>}
                  </div>
                  {activity.notes && <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{activity.notes}</p>}
                </div>
                {activity.cost > 0 && <div style={{ color: 'var(--accent)', fontWeight: 500 }}>${activity.cost.toLocaleString()}</div>}
                {deleteConfirm === activity.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => deleteActivity(activity.id)} style={{ color: '#DC2626', fontSize: '14px', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Confirm</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ color: 'var(--text-muted)', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(activity.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete">✕</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
