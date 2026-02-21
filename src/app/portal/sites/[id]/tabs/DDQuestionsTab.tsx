'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

type Priority = 'critical' | 'high' | 'medium';
type Category = 'gas_power' | 'water' | 'environmental' | 'fiber' | 'political' | 'site_physical';
type Status = 'pending' | 'asked' | 'answered';

interface QuestionDef { id: string; category: Category; question: string; whoAnswers: string; priority: Priority; }
interface QuestionState { status: Status; answer: string; dbId?: string; dateAsked?: string; }

const ddQuestions: QuestionDef[] = [
  { id: 'gp1', category: 'gas_power', question: 'What is the nearest interstate gas transmission pipeline?', whoAnswers: 'Gas utility / Pipeline map', priority: 'critical' },
  { id: 'gp2', category: 'gas_power', question: 'What diameter and pressure is the nearest pipeline?', whoAnswers: 'Gas utility', priority: 'critical' },
  { id: 'gp3', category: 'gas_power', question: 'Is there capacity available on this pipeline?', whoAnswers: 'Gas utility', priority: 'critical' },
  { id: 'gp4', category: 'gas_power', question: 'What is the estimated cost of a gas lateral?', whoAnswers: 'Gas utility / Engineer', priority: 'high' },
  { id: 'gp5', category: 'gas_power', question: 'What is the nearest high-voltage transmission line (138kV+)?', whoAnswers: 'Electric utility / ISO map', priority: 'critical' },
  { id: 'w1', category: 'water', question: 'What is the municipal water capacity (MGD)?', whoAnswers: 'Water authority', priority: 'critical' },
  { id: 'w2', category: 'water', question: 'Is there excess capacity for industrial use?', whoAnswers: 'Water authority', priority: 'critical' },
  { id: 'e1', category: 'environmental', question: 'Has a Phase I ESA been completed?', whoAnswers: 'Seller / Environmental consultant', priority: 'critical' },
  { id: 'e2', category: 'environmental', question: 'Are there any RECs (Recognized Environmental Conditions)?', whoAnswers: 'Phase I report', priority: 'critical' },
  { id: 'e3', category: 'environmental', question: 'Is the site in an EPA attainment or non-attainment area?', whoAnswers: 'EPA database', priority: 'critical' },
  { id: 'f1', category: 'fiber', question: 'What fiber providers have presence nearby?', whoAnswers: 'Fiber providers / Site visit', priority: 'high' },
  { id: 'f2', category: 'fiber', question: 'What is the distance to nearest fiber POI?', whoAnswers: 'Fiber provider', priority: 'high' },
  { id: 'p1', category: 'political', question: 'What is the mayor/council stance on data centers?', whoAnswers: 'Political research / EDO', priority: 'critical' },
  { id: 'p2', category: 'political', question: 'Has the municipality approved similar projects?', whoAnswers: 'Planning dept / News', priority: 'high' },
  { id: 's1', category: 'site_physical', question: 'What is the current zoning?', whoAnswers: 'Planning dept', priority: 'critical' },
  { id: 's2', category: 'site_physical', question: 'Is industrial/data center use permitted by-right?', whoAnswers: 'Planning dept', priority: 'critical' },
];

const categoryLabels: Record<Category, string> = { gas_power: 'Gas & Power', water: 'Water', environmental: 'Environmental', fiber: 'Fiber', political: 'Political', site_physical: 'Site Physical' };
const priorityStyles: Record<Priority, { bg: string; text: string; border: string }> = {
  critical: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
  high: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  medium: { bg: '#DBEAFE', text: '#1D4ED8', border: '#BFDBFE' },
};
const statusStyles: Record<Status, { bg: string; text: string }> = {
  pending: { bg: '#F3F4F6', text: '#6B7280' },
  asked: { bg: '#FEF3C7', text: '#B45309' },
  answered: { bg: '#DCFCE7', text: '#16A34A' },
};

interface Props { siteId: string; }

export default function DDQuestionsTab({ siteId }: Props) {
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>(Object.fromEntries(ddQuestions.map(q => [q.id, { status: 'pending' as Status, answer: '' }])));
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const loadAnswers = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('dd_answers').select('*').eq('site_id', siteId);
      if (!error && data) {
        const loaded: Record<string, QuestionState> = { ...questionStates };
        data.forEach(row => { if (loaded[row.question_key] !== undefined) loaded[row.question_key] = { dbId: row.id, status: row.status as Status || 'pending', answer: row.answer || '', dateAsked: row.updated_at?.split('T')[0] }; });
        setQuestionStates(loaded);
      }
      setLoading(false);
    };
    loadAnswers();
  }, [siteId]);

  const saveAnswer = useCallback(async (questionKey: string, state: QuestionState) => {
    setSaving(questionKey);
    if (state.dbId) {
      await supabase.from('dd_answers').update({ status: state.status, answer: state.answer, updated_at: new Date().toISOString() }).eq('id', state.dbId);
    } else {
      const { data, error } = await supabase.from('dd_answers').insert({ site_id: siteId, question_key: questionKey, status: state.status, answer: state.answer }).select().single();
      if (!error && data) setQuestionStates(prev => ({ ...prev, [questionKey]: { ...prev[questionKey], dbId: data.id } }));
    }
    setSaving(null);
  }, [siteId]);

  const updateQuestion = (id: string, field: 'status' | 'answer', value: string) => {
    const newState = { ...questionStates[id], [field]: value, dateAsked: field === 'status' && value !== 'pending' ? new Date().toISOString().split('T')[0] : questionStates[id].dateAsked };
    setQuestionStates(prev => ({ ...prev, [id]: newState }));
    setTimeout(() => saveAnswer(id, newState), 500);
  };

  const filteredQuestions = ddQuestions.filter(q => {
    if (filterCategory !== 'all' && q.category !== filterCategory) return false;
    if (filterStatus !== 'all' && questionStates[q.id]?.status !== filterStatus) return false;
    return true;
  });

  const groupedQuestions = filteredQuestions.reduce((acc, q) => { if (!acc[q.category]) acc[q.category] = []; acc[q.category].push(q); return acc; }, {} as Record<Category, QuestionDef[]>);
  const answeredCount = Object.values(questionStates).filter(q => q.status === 'answered').length;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}><p style={{ color: 'var(--text-muted)' }}>Loading DD questions...</p></div>;

  const inputStyle = { width: '100%', padding: '8px 12px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', resize: 'none' as const };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>Due Diligence Questions</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{answeredCount} of {ddQuestions.length} questions answered {saving && <span style={{ marginLeft: '8px', color: 'var(--accent)' }}>• Saving...</span>}</p>
        </div>
        <div style={{ width: '128px', backgroundColor: 'var(--border)', borderRadius: '9999px', height: '8px' }}>
          <div style={{ height: '8px', borderRadius: '9999px', backgroundColor: 'var(--accent)', width: `${(answeredCount / ddQuestions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-card)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Category:</span>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as Category | 'all')} style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '14px' }}>
            <option value="all">All Categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Status:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Status | 'all')} style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '8px 12px', borderRadius: '8px', fontSize: '14px' }}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="asked">Asked</option>
            <option value="answered">Answered</option>
          </select>
        </div>
      </div>

      {/* Questions by Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
          <div key={category} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-card)', backgroundColor: 'var(--bg-primary)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Georgia, serif' }}>{categoryLabels[category as Category]}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{categoryQuestions.filter(q => questionStates[q.id]?.status === 'answered').length} of {categoryQuestions.length} answered</p>
            </div>
            <div>
              {categoryQuestions.map((q) => (
                <div key={q.id} style={{ padding: '16px 24px', borderTop: '1px solid var(--border-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <select value={questionStates[q.id]?.status || 'pending'} onChange={(e) => updateQuestion(q.id, 'status', e.target.value)} style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 500, borderRadius: '4px', border: '1px solid', backgroundColor: statusStyles[questionStates[q.id]?.status || 'pending'].bg, color: statusStyles[questionStates[q.id]?.status || 'pending'].text, borderColor: statusStyles[questionStates[q.id]?.status || 'pending'].bg, flexShrink: 0 }}>
                      <option value="pending">Pending</option>
                      <option value="asked">Asked</option>
                      <option value="answered">Answered</option>
                    </select>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                        <p style={{ color: 'var(--text-primary)', textDecoration: questionStates[q.id]?.status === 'answered' ? 'line-through' : 'none', opacity: questionStates[q.id]?.status === 'answered' ? 0.6 : 1 }}>{q.question}</p>
                        <span style={{ padding: '4px 8px', fontSize: '12px', fontWeight: 500, borderRadius: '4px', border: '1px solid', backgroundColor: priorityStyles[q.priority].bg, color: priorityStyles[q.priority].text, borderColor: priorityStyles[q.priority].border, flexShrink: 0 }}>{q.priority}</span>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Ask: {q.whoAnswers}</p>
                      <textarea value={questionStates[q.id]?.answer || ''} onChange={(e) => updateQuestion(q.id, 'answer', e.target.value)} placeholder="Enter answer..." rows={2} style={inputStyle} />
                      {questionStates[q.id]?.dateAsked && <p style={{ color: 'var(--text-muted)', fontSize: '12px', opacity: 0.7 }}>Last updated: {questionStates[q.id].dateAsked}</p>}
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
