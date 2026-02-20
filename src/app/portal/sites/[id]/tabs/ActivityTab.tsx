'use client';

import { useState } from 'react';

interface Activity {
  id: string;
  date: string;
  action: string;
  notes: string;
  cost: number;
  stage: number;
}

const initialActivities: Activity[] = [
  { id: '1', date: '2026-02-15', action: 'Site identified via CoStar listing', notes: 'Former manufacturing plant, 25 acres', cost: 0, stage: 1 },
  { id: '2', date: '2026-02-18', action: 'Initial site visit completed', notes: 'Good access, clear of structures, utility easements visible', cost: 500, stage: 1 },
  { id: '3', date: '2026-02-20', action: 'Option agreement executed', notes: '12-month option, $50K deposit, $1.5M strike price', cost: 50000, stage: 1 },
];

const stageHistory = [
  { stage: 1, name: 'Identified', enteredAt: '2026-02-15' },
  { stage: 2, name: 'Gas Confirmed', enteredAt: null },
  { stage: 3, name: 'Power Secured', enteredAt: null },
];

export default function ActivityTab() {
  const [activities, setActivities] = useState(initialActivities);
  const [newActivity, setNewActivity] = useState({ date: '', action: '', notes: '', cost: 0 });
  const [showForm, setShowForm] = useState(false);

  const addActivity = () => {
    if (!newActivity.date || !newActivity.action) return;
    setActivities([
      ...activities,
      { ...newActivity, id: Date.now().toString(), stage: 1 }
    ]);
    setNewActivity({ date: '', action: '', notes: '', cost: 0 });
    setShowForm(false);
  };

  const totalCosts = activities.reduce((sum, a) => sum + a.cost, 0);

  return (
    <div className="space-y-6">
      {/* Stage Timeline */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <h2 className="text-xl font-serif text-white mb-4">Stage Progression</h2>
        <div className="flex items-center gap-2">
          {stageHistory.map((stage, i) => (
            <div key={stage.stage} className="flex items-center">
              <div className={`flex flex-col items-center ${stage.enteredAt ? 'text-gold' : 'text-muted'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  stage.enteredAt ? 'bg-gold text-navy' : 'bg-navy-card border border-navy'
                }`}>
                  {stage.stage}
                </div>
                <p className="text-xs mt-2">{stage.name}</p>
                {stage.enteredAt && (
                  <p className="text-xs text-muted">{stage.enteredAt}</p>
                )}
              </div>
              {i < stageHistory.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${stage.enteredAt ? 'bg-gold' : 'bg-navy-card'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-navy-card border border-navy rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-serif text-white">Activity Log</h2>
            <p className="text-muted text-sm">{activities.length} entries • ${(totalCosts / 1000).toFixed(0)}K total costs</p>
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
                <label className="block text-sm text-muted mb-1">Date</label>
                <input
                  type="date"
                  value={newActivity.date}
                  onChange={(e) => setNewActivity({ ...newActivity, date: e.target.value })}
                  className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-muted mb-1">Action</label>
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
                  value={newActivity.cost}
                  onChange={(e) => setNewActivity({ ...newActivity, cost: parseInt(e.target.value) || 0 })}
                  className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-muted mb-1">Notes</label>
              <textarea
                value={newActivity.notes}
                onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                placeholder="Additional details..."
                rows={2}
                className="w-full bg-navy border border-navy-card rounded-lg px-3 py-2 text-white focus:border-gold outline-none resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addActivity}
                className="px-4 py-2 bg-gold hover:bg-gold-dark text-navy font-medium rounded-lg"
              >
                Add Entry
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
        <div className="space-y-4">
          {activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 bg-navy/30 rounded-lg">
              <div className="w-24 text-muted text-sm flex-shrink-0">{activity.date}</div>
              <div className="flex-1">
                <p className="text-white font-medium">{activity.action}</p>
                {activity.notes && <p className="text-muted text-sm mt-1">{activity.notes}</p>}
              </div>
              {activity.cost > 0 && (
                <div className="text-gold font-medium">${activity.cost.toLocaleString()}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
