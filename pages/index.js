import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const CHECKLIST = [
  { id: 'c1', text: 'Apply to 5 jobs on LinkedIn', tag: 'Apply' },
  { id: 'c2', text: 'Apply to 5 jobs on Naukri / Hirist', tag: 'Apply' },
  { id: 'c3', text: 'Message 5 recruiters after applying', tag: 'Outreach' },
  { id: 'c4', text: 'Refresh Naukri profile (boosts ranking)', tag: 'Profile' },
  { id: 'c5', text: 'Check Unstop for new AI/ML challenges', tag: 'Compete' },
  { id: 'c6', text: 'Post or engage once on LinkedIn', tag: 'Brand' },
  { id: 'c7', text: 'Follow up on applications older than 7 days', tag: 'Follow-up' },
  { id: 'c8', text: 'Score 3 new job descriptions with Job Scorer', tag: 'Tool' },
  { id: 'c9', text: 'Check 3 company career pages directly', tag: 'Apply' },
  { id: 'c10', text: 'Update Job Tracker with new applications', tag: 'Track' },
];

const FEATURES = [
  { href: '/scorer',       emoji: '🎯', label: 'Job Scorer',     desc: 'Paste a JD, get a fit score instantly' },
  { href: '/tailor',       emoji: '✍️',  label: 'Resume Tailor',  desc: 'Rewrite bullets for any job' },
  { href: '/outreach',     emoji: '📬', label: 'Outreach',       desc: 'LinkedIn & email messages' },
  { href: '/interview',    emoji: '🧠', label: 'Interview Prep', desc: 'Likely questions + your answers' },
  { href: '/cold-email',   emoji: '❄️',  label: 'Cold Email',     desc: 'Find who to contact & how' },
  { href: '/skill-gap',    emoji: '📊', label: 'Skill Gap',      desc: 'What to learn from top JDs' },
  { href: '/tracker',      emoji: '📋', label: 'Job Tracker',    desc: 'Kanban: Applied → Offer' },
  { href: '/linkedin',     emoji: '💼', label: 'LinkedIn Posts', desc: 'Posts that attract recruiters' },
  { href: '/resume-score', emoji: '⭐', label: 'Resume Score',   desc: 'Score your resume + fixes' },
];

const TAG_COLORS = {
  Apply:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Outreach:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Profile:   'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Compete:   'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Brand:     'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'Follow-up': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  Tool:      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Track:     'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const [checked, setChecked] = useState({});
  const [stats, setStats] = useState({ applied: 0, interviews: 0, offers: 0 });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const today = getToday();
    const saved = localStorage.getItem(`movein-checklist-${today}`);
    if (saved) setChecked(JSON.parse(saved));

    const tracker = localStorage.getItem('movein-tracker');
    if (tracker) {
      const cols = JSON.parse(tracker);
      const applied = (cols.applied?.length || 0) + (cols.interview?.length || 0) + (cols.offer?.length || 0) + (cols.rejected?.length || 0);
      const interviews = cols.interview?.length || 0;
      const offers = cols.offer?.length || 0;
      setStats({ applied, interviews, offers });
    }
  }, []);

  function toggle(id) {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem(`movein-checklist-${getToday()}`, JSON.stringify(next));
  }

  const done = Object.values(checked).filter(Boolean).length;

  return (
    <Layout title="Dashboard">
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Hero greeting */}
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 text-white">
          <div className="text-2xl font-semibold">{greeting}, Kaif 👋</div>
          <div className="text-indigo-100 text-sm mt-1">You have {10 - done} checklist items left today. Keep moving.</div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { label: 'Total Applied', value: stats.applied },
              { label: 'Interviews', value: stats.interviews },
              { label: 'Offers', value: stats.offers },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-indigo-100 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily checklist */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm">Daily Checklist</div>
              <div className="text-xs text-zinc-400">{done}/10 done</div>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${(done / 10) * 100}%` }}
              />
            </div>
            <div className="space-y-2">
              {CHECKLIST.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  <div className={`w-4 h-4 flex-shrink-0 rounded-full border-2 transition-all ${
                    checked[item.id]
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-zinc-300 dark:border-zinc-600 group-hover:border-indigo-400'
                  }`}>
                    {checked[item.id] && (
                      <svg viewBox="0 0 16 16" fill="white" className="w-full h-full p-0.5">
                        <path d="M13 4L6.5 11 3 7.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm flex-1 ${checked[item.id] ? 'line-through text-zinc-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {item.text}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[item.tag]}`}>
                    {item.tag}
                  </span>
                </button>
              ))}
            </div>
            {done === 10 && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center text-sm text-green-600 dark:text-green-400 font-medium">
                🎉 Full day completed! You're ahead of 99% of applicants.
              </div>
            )}
          </div>

          {/* Features grid */}
          <div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-100 text-sm mb-4">All Tools</div>
            <div className="grid grid-cols-2 gap-2.5">
              {FEATURES.map(f => (
                <Link key={f.href} href={f.href}>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer group">
                    <div className="text-xl mb-1.5">{f.emoji}</div>
                    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{f.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{f.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
