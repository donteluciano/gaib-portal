'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type Priority = 'critical' | 'high' | 'medium';
type Category = 'gas_power' | 'water' | 'environmental' | 'fiber' | 'political' | 'site_physical';
type Status = 'pending' | 'asked' | 'answered';

interface QuestionDef {
  id: string;
  category: Category;
  question: string;
  whoAnswers: string;
  priority: Priority;
}

interface QuestionState {
  status: Status;
  answer: string;
  dbId?: string;
  dateAsked?: string;
}

const ddQuestions: QuestionDef[] = [
  // Gas & Power
  { id: 'gp1', category: 'gas_power', question: 'What is the nearest interstate gas transmission pipeline?', whoAnswers: 'Gas utility / Pipeline map', priority: 'critical' },
  { id: 'gp2', category: 'gas_power', question: 'What diameter and pressure is the nearest pipeline?', whoAnswers: 'Gas utility', priority: 'critical' },
  { id: 'gp3', category: 'gas_power', question: 'Is there capacity available on this pipeline?', whoAnswers: 'Gas utility', priority: 'critical' },
  { id: 'gp4', category: 'gas_power', question: 'What is the estimated cost of a gas lateral?', whoAnswers: 'Gas utility / Engineer', priority: 'high' },
  { id: 'gp5', category: 'gas_power', question: 'What is the nearest high-voltage transmission line (138kV+)?', whoAnswers: 'Electric utility / ISO map', priority: 'critical' },
  { id: 'gp6', category: 'gas_power', question: 'What is the available capacity at the nearest substation?', whoAnswers: 'Electric utility', priority: 'critical' },
  { id: 'gp7', category: 'gas_power', question: 'What interconnection queue position is available?', whoAnswers: 'ISO / RTO', priority: 'high' },
  { id: 'gp8', category: 'gas_power', question: 'What is the timeline for interconnection study?', whoAnswers: 'Electric utility', priority: 'high' },
  // Water
  { id: 'w1', category: 'water', question: 'What is the municipal water capacity (MGD)?', whoAnswers: 'Water authority', priority: 'critical' },
  { id: 'w2', category: 'water', question: 'Is there excess capacity for industrial use?', whoAnswers: 'Water authority', priority: 'critical' },
  { id: 'w3', category: 'water', question: 'What is the water rate structure?', whoAnswers: 'Water authority', priority: 'high' },
  { id: 'w4', category: 'water', question: 'Are there any water rights or allocation issues?', whoAnswers: 'Water authority / Legal', priority: 'high' },
  { id: 'w5', category: 'water', question: 'What is the wastewater discharge capacity?', whoAnswers: 'Sewer authority', priority: 'high' },
  // Environmental
  { id: 'e1', category: 'environmental', question: 'Has a Phase I ESA been completed?', whoAnswers: 'Seller / Environmental consultant', priority: 'critical' },
  { id: 'e2', category: 'environmental', question: 'Are there any RECs (Recognized Environmental Conditions)?', whoAnswers: 'Phase I report', priority: 'critical' },
  { id: 'e3', category: 'environmental', question: 'Is the site in an EPA attainment or non-attainment area?', whoAnswers: 'EPA database', priority: 'critical' },
  { id: 'e4', category: 'environmental', question: 'Are there any wetlands on or near the site?', whoAnswers: 'NWI map / Survey', priority: 'high' },
  { id: 'e5', category: 'environmental', question: 'Are there any endangered species concerns?', whoAnswers: 'USFWS database', priority: 'medium' },
  // Fiber
  { id: 'f1', category: 'fiber', question: 'What fiber providers have presence nearby?', whoAnswers: 'Fiber providers / Site visit', priority: 'high' },
  { id: 'f2', category: 'fiber', question: 'What is the distance to nearest fiber POI?', whoAnswers: 'Fiber provider', priority: 'high' },
  { id: 'f3', category: 'fiber', question: 'Is dark fiber available?', whoAnswers: 'Fiber provider', priority: 'medium' },
  // Political
  { id: 'p1', category: 'political', question: 'What is the mayor/council stance on data centers?', whoAnswers: 'Political research / EDO', priority: 'critical' },
  { id: 'p2', category: 'political', question: 'Are there any upcoming elections that could change leadership?', whoAnswers: 'Political research', priority: 'high' },
  { id: 'p3', category: 'political', question: 'Has the municipality approved similar projects?', whoAnswers: 'Planning dept / News', priority: 'high' },
  { id: 'p4', category: 'political', question: 'Are there active community opposition groups?', whoAnswers: 'News / Social media', priority: 'high' },
  // Site Physical
  { id: 's1', category: 'site_physical', question: 'What is the current zoning?', whoAnswers: 'Planning dept', priority: 'critical' },
  { id: 's2', category: 'site_physical', question: 'Is industrial/data center use permitted by-right?', whoAnswers: 'Planning dept', priority: 'critical' },
  { id: 's3', category: 'site_physical', question: 'What is the site topography and grade?', whoAnswers: 'Survey / Site visit', priority: 'high' },
  { id: 's4', category: 'site_physical', question: 'Are there existing structures requiring demolition?', whoAnswers: 'Site visit', priority: 'medium' },
  { id: 's5', category: 'site_physical', question: 'What is road access like (weight limits, access points)?', whoAnswers: 'Site visit / DOT', priority: 'high' },
];

const categoryLabels: Record<Category, string> = {
  gas_power: 'Gas & Power',
  water: 'Water',
  environmental: 'Environmental',
  fiber: 'Fiber',
  political: 'Political',
  site_physical: 'Site Physical',
};

const priorityStyles: Record<Priority, string> = {
  critical: 'bg-danger/20 text-danger border-danger/30',
  high: 'bg-warning/20 text-warning border-warning/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const statusStyles: Record<Status, { bg: string; text: string }> = {
  pending: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  asked: { bg: 'bg-warning/20', text: 'text-warning' },
  answered: { bg: 'bg-success/20', text: 'text-success' },
};

interface Props {
  siteId: string;
}

export default function DDQuestionsTab({ siteId }: Props) {
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>(
    Object.fromEntries(ddQuestions.map(q => [q.id, { status: 'pending' as Status, answer: '' }]))
  );
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Load answers from Supabase
  useEffect(() => {
    const loadAnswers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('dd_answers')
        .select('*')
        .eq('site_id', siteId);

      if (!error && data) {
        const loaded: Record<string, QuestionState> = { ...questionStates };
        data.forEach(row => {
          if (loaded[row.question_key] !== undefined) {
            loaded[row.question_key] = {
              dbId: row.id,
              status: row.status as Status || 'pending',
              answer: row.answer || '',
              dateAsked: row.updated_at?.split('T')[0],
            };
          }
        });
        setQuestionStates(loaded);
      }
      setLoading(false);
    };

    loadAnswers();
  }, [siteId]);

  // Save answer to Supabase
  const saveAnswer = useCallback(async (questionKey: string, state: QuestionState) => {
    setSaving(questionKey);
    
    if (state.dbId) {
      await supabase
        .from('dd_answers')
        .update({
          status: state.status,
          answer: state.answer,
          updated_at: new Date().toISOString(),
        })
        .eq('id', state.dbId);
    } else {
      const { data, error } = await supabase
        .from('dd_answers')
        .insert({
          site_id: siteId,
          question_key: questionKey,
          status: state.status,
          answer: state.answer,
        })
        .select()
        .single();

      if (!error && data) {
        setQuestionStates(prev => ({
          ...prev,
          [questionKey]: { ...prev[questionKey], dbId: data.id }
        }));
      }
    }
    
    setSaving(null);
  }, [siteId]);

  const updateQuestion = (id: string, field: 'status' | 'answer', value: string) => {
    const newState = {
      ...questionStates[id],
      [field]: value,
      dateAsked: field === 'status' && value !== 'pending' ? new Date().toISOString().split('T')[0] : questionStates[id].dateAsked,
    };
    setQuestionStates(prev => ({
      ...prev,
      [id]: newState
    }));
    
    // Debounce save
    setTimeout(() => saveAnswer(id, newState), 500);
  };

  const filteredQuestions = ddQuestions.filter(q => {
    if (filterCategory !== 'all' && q.category !== filterCategory) return false;
    if (filterPriority !== 'all' && q.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && questionStates[q.id]?.status !== filterStatus) return false;
    return true;
  });

  const groupedQuestions = filteredQuestions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<Category, QuestionDef[]>);

  const answeredCount = Object.values(questionStates).filter(q => q.status === 'answered').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-400">Loading DD questions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-white">Due Diligence Questions</h2>
          <p className="text-gray-400 text-sm mt-1">
            {answeredCount} of {ddQuestions.length} questions answered
            {saving && <span className="ml-2 text-gold">• Saving...</span>}
          </p>
        </div>
        <div className="w-32 bg-navy rounded-full h-2">
          <div 
            className="bg-gold h-2 rounded-full transition-all"
            style={{ width: `${(answeredCount / ddQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-navy-card rounded-xl">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | 'all')}
            className="bg-navy border border-navy-card text-white px-3 py-2 rounded-lg text-sm focus:border-gold outline-none"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
            className="bg-navy border border-navy-card text-white px-3 py-2 rounded-lg text-sm focus:border-gold outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
            className="bg-navy border border-navy-card text-white px-3 py-2 rounded-lg text-sm focus:border-gold outline-none"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="asked">Asked</option>
            <option value="answered">Answered</option>
          </select>
        </div>
      </div>

      {/* Questions by Category */}
      <div className="space-y-6">
        {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
          <div key={category} className="bg-navy-card border border-navy rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-navy bg-navy/50">
              <h3 className="text-lg font-serif text-white">{categoryLabels[category as Category]}</h3>
              <p className="text-gray-400 text-sm">
                {categoryQuestions.filter(q => questionStates[q.id]?.status === 'answered').length} of {categoryQuestions.length} answered
              </p>
            </div>
            <div className="divide-y divide-navy/50">
              {categoryQuestions.map((q) => (
                <div key={q.id} className="p-4 hover:bg-navy/20 transition-colors">
                  <div className="flex items-start gap-4">
                    <select
                      value={questionStates[q.id]?.status || 'pending'}
                      onChange={(e) => updateQuestion(q.id, 'status', e.target.value)}
                      className={`px-2 py-1 text-xs font-medium rounded border flex-shrink-0 ${statusStyles[questionStates[q.id]?.status || 'pending'].bg} ${statusStyles[questionStates[q.id]?.status || 'pending'].text}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="asked">Asked</option>
                      <option value="answered">Answered</option>
                    </select>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <p className={`text-white ${questionStates[q.id]?.status === 'answered' ? 'line-through opacity-60' : ''}`}>
                          {q.question}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded border flex-shrink-0 ${priorityStyles[q.priority]}`}>
                          {q.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">Ask: {q.whoAnswers}</p>
                      <textarea
                        value={questionStates[q.id]?.answer || ''}
                        onChange={(e) => updateQuestion(q.id, 'answer', e.target.value)}
                        placeholder="Enter answer..."
                        rows={2}
                        className="w-full px-3 py-2 bg-navy border border-navy-card rounded-lg text-white text-sm placeholder-muted focus:border-gold outline-none resize-none"
                      />
                      {questionStates[q.id]?.dateAsked && (
                        <p className="text-gray-400 text-xs">Last updated: {questionStates[q.id].dateAsked}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
