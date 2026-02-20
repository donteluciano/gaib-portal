'use client';

import { useState } from 'react';

type Priority = 'critical' | 'high' | 'medium';
type Category = 'gas_power' | 'water' | 'environmental' | 'fiber' | 'political' | 'site_physical';

interface Question {
  id: string;
  category: Category;
  question: string;
  whoAnswers: string;
  priority: Priority;
  asked: boolean;
  answer: string;
  dateAsked: string | null;
}

const ddQuestions: Question[] = [
  // Gas & Power
  { id: 'gp1', category: 'gas_power', question: 'What is the nearest interstate gas transmission pipeline?', whoAnswers: 'Gas utility / Pipeline map', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'gp2', category: 'gas_power', question: 'What diameter and pressure is the nearest pipeline?', whoAnswers: 'Gas utility', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'gp3', category: 'gas_power', question: 'Is there capacity available on this pipeline?', whoAnswers: 'Gas utility', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'gp4', category: 'gas_power', question: 'What is the estimated cost of a gas lateral?', whoAnswers: 'Gas utility / Engineer', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 'gp5', category: 'gas_power', question: 'What is the nearest high-voltage transmission line (138kV+)?', whoAnswers: 'Electric utility / ISO map', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'gp6', category: 'gas_power', question: 'What is the available capacity at the nearest substation?', whoAnswers: 'Electric utility', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'gp7', category: 'gas_power', question: 'What interconnection queue position is available?', whoAnswers: 'ISO / RTO', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 'gp8', category: 'gas_power', question: 'What is the timeline for interconnection study?', whoAnswers: 'Electric utility', priority: 'high', asked: false, answer: '', dateAsked: null },
  // Water
  { id: 'w1', category: 'water', question: 'What is the municipal water capacity (MGD)?', whoAnswers: 'Water authority', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'w2', category: 'water', question: 'Is there excess capacity for industrial use?', whoAnswers: 'Water authority', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'w3', category: 'water', question: 'What is the water rate structure?', whoAnswers: 'Water authority', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 'w4', category: 'water', question: 'Are there any water rights or allocation issues?', whoAnswers: 'Water authority / Legal', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 'w5', category: 'water', question: 'What is the wastewater discharge capacity?', whoAnswers: 'Sewer authority', priority: 'high', asked: false, answer: '', dateAsked: null },
  // Environmental
  { id: 'e1', category: 'environmental', question: 'Has a Phase I ESA been completed?', whoAnswers: 'Seller / Environmental consultant', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'e2', category: 'environmental', question: 'Are there any RECs (Recognized Environmental Conditions)?', whoAnswers: 'Phase I report', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'e3', category: 'environmental', question: 'Is the site in an EPA attainment or non-attainment area?', whoAnswers: 'EPA database', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'e4', category: 'environmental', question: 'Are there any wetlands on or near the site?', whoAnswers: 'NWI map / Survey', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 'e5', category: 'environmental', question: 'Are there any endangered species concerns?', whoAnswers: 'USFWS database', priority: 'medium', asked: false, answer: '', dateAsked: null },
  // Fiber
  { id: 'f1', category: 'fiber', question: 'What fiber providers have presence nearby?', whoAnswers: 'Fiber providers / Site visit', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 'f2', category: 'fiber', question: 'What is the distance to nearest fiber POI?', whoAnswers: 'Fiber provider', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 'f3', category: 'fiber', question: 'Is dark fiber available?', whoAnswers: 'Fiber provider', priority: 'medium', asked: false, answer: '', dateAsked: null },
  // Political
  { id: 'p1', category: 'political', question: 'What is the mayor/council stance on data centers?', whoAnswers: 'Political research / EDO', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 'p2', category: 'political', question: 'Are there any upcoming elections that could change leadership?', whoAnswers: 'Political research', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 'p3', category: 'political', question: 'Has the municipality approved similar projects?', whoAnswers: 'Planning dept / News', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 'p4', category: 'political', question: 'Are there active community opposition groups?', whoAnswers: 'News / Social media', priority: 'high', asked: false, answer: '', dateAsked: null },
  // Site Physical
  { id: 's1', category: 'site_physical', question: 'What is the current zoning?', whoAnswers: 'Planning dept', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 's2', category: 'site_physical', question: 'Is industrial/data center use permitted by-right?', whoAnswers: 'Planning dept', priority: 'critical', asked: false, answer: '', dateAsked: null },
  { id: 's3', category: 'site_physical', question: 'What is the site topography and grade?', whoAnswers: 'Survey / Site visit', priority: 'high', asked: false, answer: '', dateAsked: null },
  { id: 's4', category: 'site_physical', question: 'Are there existing structures requiring demolition?', whoAnswers: 'Site visit', priority: 'medium', asked: false, answer: '', dateAsked: null },
  { id: 's5', category: 'site_physical', question: 'What is road access like (weight limits, access points)?', whoAnswers: 'Site visit / DOT', priority: 'high', asked: false, answer: '', dateAsked: null },
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

export default function DDQuestionsTab() {
  const [questions, setQuestions] = useState(ddQuestions);
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [showAskedOnly, setShowAskedOnly] = useState(false);

  const filteredQuestions = questions.filter(q => {
    if (filterCategory !== 'all' && q.category !== filterCategory) return false;
    if (filterPriority !== 'all' && q.priority !== filterPriority) return false;
    if (showAskedOnly && !q.asked) return false;
    return true;
  });

  const groupedQuestions = filteredQuestions.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as Record<Category, Question[]>);

  const toggleAsked = (id: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, asked: !q.asked, dateAsked: !q.asked ? new Date().toISOString().split('T')[0] : null } : q
    ));
  };

  const updateAnswer = (id: string, answer: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, answer } : q));
  };

  const askedCount = questions.filter(q => q.asked).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-white">Due Diligence Questions</h2>
          <p className="text-gray-400 text-sm mt-1">
            {askedCount} of {questions.length} questions answered
          </p>
        </div>
        <div className="w-32 bg-navy rounded-full h-2">
          <div 
            className="bg-gold h-2 rounded-full transition-all"
            style={{ width: `${(askedCount / questions.length) * 100}%` }}
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
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAskedOnly}
            onChange={(e) => setShowAskedOnly(e.target.checked)}
            className="w-4 h-4 bg-navy border-navy-card rounded text-gold focus:ring-gold"
          />
          <span className="text-gray-400 text-sm">Show answered only</span>
        </label>
      </div>

      {/* Questions by Category */}
      <div className="space-y-6">
        {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
          <div key={category} className="bg-navy-card border border-navy rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-navy bg-navy/50">
              <h3 className="text-lg font-serif text-white">{categoryLabels[category as Category]}</h3>
              <p className="text-gray-400 text-sm">
                {categoryQuestions.filter(q => q.asked).length} of {categoryQuestions.length} answered
              </p>
            </div>
            <div className="divide-y divide-navy/50">
              {categoryQuestions.map((q) => (
                <div key={q.id} className="p-4 hover:bg-navy/20 transition-colors">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleAsked(q.id)}
                      className={`w-6 h-6 rounded border-2 flex-shrink-0 mt-1 flex items-center justify-center transition-colors ${
                        q.asked ? 'bg-success border-success' : 'border-muted hover:border-gold'
                      }`}
                    >
                      {q.asked && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <p className={`text-white ${q.asked ? 'line-through opacity-60' : ''}`}>
                          {q.question}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded border flex-shrink-0 ${priorityStyles[q.priority]}`}>
                          {q.priority}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">Ask: {q.whoAnswers}</p>
                      <textarea
                        value={q.answer}
                        onChange={(e) => updateAnswer(q.id, e.target.value)}
                        placeholder="Enter answer..."
                        rows={2}
                        className="w-full px-3 py-2 bg-navy border border-navy-card rounded-lg text-white text-sm placeholder-muted focus:border-gold outline-none resize-none"
                      />
                      {q.dateAsked && (
                        <p className="text-gray-400 text-xs">Answered: {q.dateAsked}</p>
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
