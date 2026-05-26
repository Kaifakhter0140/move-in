import { useState } from 'react';
import Layout from '../components/Layout';
import { callClaude } from '../lib/claude';
import { PROFILE_TEXT } from '../lib/profile';

const PROMPT = (resume) => `
You are an expert ATS resume reviewer and career coach. Score and analyze this resume.

Return ONLY a JSON object:
{
  "overall_score": <number 0-100>,
  "ats_score": <number 0-100>,
  "sections": {
    "summary":    { "score": <0-10>, "feedback": "<specific feedback>" },
    "skills":     { "score": <0-10>, "feedback": "<specific feedback>" },
    "projects":   { "score": <0-10>, "feedback": "<specific feedback>" },
    "education":  { "score": <0-10>, "feedback": "<specific feedback>" },
    "formatting": { "score": <0-10>, "feedback": "<specific feedback>" }
  },
  "top_strengths": ["strength1", "strength2", "strength3"],
  "critical_fixes": [
    { "issue": "<specific issue>", "fix": "<exact fix to make>" }
  ],
  "missing_sections": ["section1", "section2"],
  "ats_keywords_missing": ["keyword1", "keyword2", "keyword3"],
  "one_line_verdict": "<brutally honest one-sentence verdict on this resume>"
}

Be specific and actionable. Reference actual content from the resume.

Kaif's target roles: AI/ML Engineer, Data Scientist, GenAI Engineer, Full-Stack Developer
Kaif's level: Fresh Graduate

${resume ? `Resume submitted by user:\n${resume}` : `Use this profile as the resume to evaluate:\n${PROFILE_TEXT}`}
`;

function ScoreBar({ label, score, max = 10 }) {
  const pct = (score / max) * 100;
  const color = pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs text-zinc-500 flex-shrink-0">{label}</div>
      <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <div className="w-8 text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-right">{score}/{max}</div>
    </div>
  );
}

export default function ResumeScore() {
  const [resume, setResume] = useState('');
  const [useDefault, setUseDefault] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function score() {
    setLoading(true); setError(''); setResult(null);
    try { setResult(await callClaude(PROMPT(useDefault ? '' : resume))); }
    catch (e) { setError(e.message); }
    setLoading(false);
  }

  const overallColor = result
    ? result.overall_score >= 75 ? 'text-green-500' : result.overall_score >= 50 ? 'text-yellow-500' : 'text-red-500'
    : '';

  return (
    <Layout title="Resume Score">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">⭐ Resume Score</h2>
          <p className="text-sm text-zinc-500 mt-1">Get a detailed score, section-by-section feedback, and exact fixes.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
          <div className="flex gap-3">
            <button onClick={() => setUseDefault(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${useDefault ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400'}`}>
              Score my current resume
            </button>
            <button onClick={() => setUseDefault(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${!useDefault ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400'}`}>
              Paste a different resume
            </button>
          </div>

          {!useDefault && (
            <textarea value={resume} onChange={e => setResume(e.target.value)} placeholder="Paste your resume text here..." rows={10}
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
          )}

          {useDefault && (
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3.5 text-xs text-zinc-500">
              Using your current resume on file (Kaif Akhter · KIIT 2026 · AI/ML Engineer)
            </div>
          )}

          <button onClick={score} disabled={loading || (!useDefault && !resume.trim())}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {loading ? 'Scoring...' : 'Score My Resume'}
          </button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl p-4">{error}</div>}

        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Overall scores */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center gap-8 mb-5">
                <div className="text-center">
                  <div className={`text-5xl font-bold ${overallColor}`}>{result.overall_score}</div>
                  <div className="text-xs text-zinc-400 mt-1">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-indigo-500">{result.ats_score}</div>
                  <div className="text-xs text-zinc-400 mt-1">ATS Score</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 italic leading-relaxed">"{result.one_line_verdict}"</div>
                </div>
              </div>

              {/* Section bars */}
              <div className="space-y-2.5">
                {Object.entries(result.sections || {}).map(([key, val]) => (
                  <ScoreBar key={key} label={key.charAt(0).toUpperCase() + key.slice(1)} score={val.score} />
                ))}
              </div>
            </div>

            {/* Section feedback */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Section Feedback</div>
              <div className="space-y-3">
                {Object.entries(result.sections || {}).map(([key, val]) => (
                  <div key={key} className="flex gap-3">
                    <div className={`text-xs font-bold mt-0.5 w-4 flex-shrink-0 ${val.score >= 8 ? 'text-green-500' : val.score >= 6 ? 'text-yellow-500' : 'text-red-500'}`}>{val.score}</div>
                    <div>
                      <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 capitalize">{key}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{val.feedback}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">Top Strengths</div>
              <ul className="space-y-2">
                {result.top_strengths?.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="text-green-500 flex-shrink-0">✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical fixes */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-3">Critical Fixes</div>
              <div className="space-y-3">
                {result.critical_fixes?.map((f, i) => (
                  <div key={i} className="bg-red-50 dark:bg-red-900/10 rounded-xl p-3.5">
                    <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">⚠ {f.issue}</div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">→ {f.fix}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing keywords */}
            {result.ats_keywords_missing?.length > 0 && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-3">Add These ATS Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {result.ats_keywords_missing.map(k => (
                    <span key={k} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
