import { useState } from 'react';
import Layout from '../components/Layout';
import { callClaude } from '../lib/claude';
import { PROFILE_TEXT } from '../lib/profile';

const PROMPT = (jd) => `
You are a career coach AI evaluating a job fit for Kaif Akhter.

Analyze the job description and return ONLY a JSON object with this exact structure:
{
  "score": <number 0-100>,
  "verdict": "<one of: Strong Match | Good Match | Partial Match | Low Match>",
  "summary": "<2-3 sentences plain English on fit>",
  "should_apply": <true or false>,
  "apply_reason": "<one clear sentence>",
  "matching_skills": ["skill1", "skill2", "skill3"],
  "missing_skills": ["skill1", "skill2"],
  "key_requirements": ["req1", "req2", "req3"],
  "salary_match": "<High / Medium / Low / Unknown>",
  "experience_match": "<Yes - entry level ok | Partial - may stretch | No - too senior>",
  "standout_tip": "<one specific tip to stand out for this role>"
}

Kaif's Profile:
${PROFILE_TEXT}

Job Description:
${jd}
`;

const VERDICT_STYLES = {
  'Strong Match': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'Good Match':   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Partial Match':'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Low Match':    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

function ScoreCircle({ score }) {
  const r = 40, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e4e4e7" strokeWidth="8" className="dark:stroke-zinc-700" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x="50" y="55" textAnchor="middle" fontSize="20" fontWeight="700" fill={color}>{score}</text>
    </svg>
  );
}

export default function JobScorer() {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function score() {
    if (!jd.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await callClaude(PROMPT(jd));
      setResult(data);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <Layout title="Job Scorer">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">🎯 Job Scorer</h2>
          <p className="text-sm text-zinc-500 mt-1">Paste any job description. Get a fit score, verdict, and whether to apply.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
            className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400"
          />
          <button
            onClick={score}
            disabled={loading || !jd.trim()}
            className="mt-3 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {loading ? 'Analyzing...' : 'Score This Job'}
          </button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm">{error}</div>}

        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Score header */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-6">
              <ScoreCircle score={result.score} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${VERDICT_STYLES[result.verdict]}`}>{result.verdict}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{result.summary}</p>
                <div className={`mt-3 text-sm font-medium px-3 py-2 rounded-lg inline-flex items-center gap-1.5 ${result.should_apply ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
                  {result.should_apply ? '✓ Apply' : '⚠ Think twice'} — {result.apply_reason}
                </div>
              </div>
            </div>

            {/* Grid details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wide">Your Matching Skills</div>
                <div className="flex flex-wrap gap-2">
                  {result.matching_skills?.map(s => (
                    <span key={s} className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="text-xs font-semibold text-red-500 dark:text-red-400 mb-3 uppercase tracking-wide">Skill Gaps</div>
                <div className="flex flex-wrap gap-2">
                  {result.missing_skills?.length
                    ? result.missing_skills.map(s => <span key={s} className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full">{s}</span>)
                    : <span className="text-xs text-zinc-400">No significant gaps!</span>
                  }
                </div>
              </div>
            </div>

            {/* Meta + tip */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-zinc-400 text-xs">Salary Match</span>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{result.salary_match}</div>
                </div>
                <div>
                  <span className="text-zinc-400 text-xs">Experience Level</span>
                  <div className="font-medium text-zinc-800 dark:text-zinc-200 mt-0.5">{result.experience_match}</div>
                </div>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3.5 text-sm text-indigo-700 dark:text-indigo-300">
                💡 <strong>Standout tip:</strong> {result.standout_tip}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
