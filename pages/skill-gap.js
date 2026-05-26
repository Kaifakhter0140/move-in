import { useState } from 'react';
import Layout from '../components/Layout';
import { callClaude } from '../lib/claude';
import { PROFILE_TEXT } from '../lib/profile';

const PROMPT = (jds) => `
You are a career strategist. Analyze these ${jds.length} job descriptions to identify skill gaps for Kaif.

Return ONLY a JSON object:
{
  "gap_skills": [
    {
      "skill": "<skill name>",
      "frequency": <how many JDs mention it, number>,
      "priority": "<High | Medium | Low>",
      "learn_in": "<realistic time to learn, e.g. '2 weeks', '1 month'>",
      "free_resource": "<best free resource to learn this: course, docs, YouTube channel>",
      "why_important": "<one sentence on why this matters for Kaif's target roles>"
    }
  ],
  "strengths": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "learning_order": ["skill1", "skill2", "skill3"],
  "weekly_plan": "<a simple 4-week learning plan in plain text>",
  "summary": "<2-3 sentence overview of Kaif's current gap situation>"
}

Sort gap_skills by frequency (highest first). Only include skills Kaif does NOT already have.

Kaif's Profile:
${PROFILE_TEXT}

Job Descriptions (${jds.length} total):
${jds.map((jd, i) => `--- JD ${i + 1} ---\n${jd}`).join('\n\n')}
`;

const PRIORITY_COLORS = {
  High:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Low:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function SkillGap() {
  const [jds, setJds] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function addJD() { if (jds.length < 7) setJds(j => [...j, '']); }
  function removeJD(i) { setJds(j => j.filter((_, idx) => idx !== i)); }
  function updateJD(i, val) { setJds(j => j.map((v, idx) => idx === i ? val : v)); }

  async function analyze() {
    const filled = jds.filter(j => j.trim());
    if (filled.length < 2) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await callClaude(PROMPT(filled))); }
    catch (e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <Layout title="Skill Gap Analyzer">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">📊 Skill Gap Analyzer</h2>
          <p className="text-sm text-zinc-500 mt-1">Paste 3–7 job descriptions you want. See exactly what skills to learn first.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          {jds.map((jd, i) => (
            <div key={i} className="relative">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-500">Job Description {i + 1}</span>
                {jds.length > 2 && (
                  <button onClick={() => removeJD(i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                )}
              </div>
              <textarea value={jd} onChange={e => updateJD(i, e.target.value)} placeholder={`Paste JD ${i + 1} here...`} rows={4}
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
            </div>
          ))}
          <div className="flex gap-3">
            {jds.length < 7 && (
              <button onClick={addJD} className="flex-1 py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors">
                + Add another JD
              </button>
            )}
            <button onClick={analyze} disabled={loading || jds.filter(j => j.trim()).length < 2}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {loading ? 'Analyzing...' : 'Analyze Gaps'}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl p-4">{error}</div>}

        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{result.summary}</p>
            </div>

            {/* Strengths */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">Your Current Strengths (These JDs Value)</div>
              <div className="flex flex-wrap gap-2">
                {result.strengths?.map(s => <span key={s} className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">{s}</span>)}
              </div>
            </div>

            {/* Gap skills */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Skills to Learn (sorted by frequency)</div>
              <div className="space-y-3">
                {result.gap_skills?.map((g, i) => (
                  <div key={i} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">{g.skill}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[g.priority]}`}>{g.priority}</span>
                      </div>
                      <div className="text-xs text-zinc-400">{g.frequency} of {jds.filter(j=>j.trim()).length} JDs · {g.learn_in}</div>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">{g.why_important}</p>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400">📚 {g.free_resource}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learn order + plan */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Learn In This Order</div>
                {result.learning_order?.map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{s}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-3">4-Week Learning Plan</div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{result.weekly_plan}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
