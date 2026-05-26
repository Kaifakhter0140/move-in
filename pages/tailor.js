import { useState } from 'react';
import Layout from '../components/Layout';
import { callClaude } from '../lib/claude';
import { PROFILE_TEXT } from '../lib/profile';

const PROMPT = (jd) => `
You are an expert ATS-optimized resume writer. Rewrite Kaif's resume content for this specific job.

Return ONLY a JSON object:
{
  "headline": "<one-line resume headline tailored to this role>",
  "summary": "<2-sentence professional summary tailored to this job>",
  "tailored_bullets": [
    "<bullet using STAR format, starts with strong action verb, quantified where possible>",
    "<bullet>",
    "<bullet>",
    "<bullet>",
    "<bullet>"
  ],
  "ats_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "skills_to_highlight": ["skill1", "skill2", "skill3"],
  "skills_to_remove": ["skill you should deprioritize for this role"],
  "tip": "<one specific actionable tip for this application>"
}

Rules:
- Every bullet must start with a past tense action verb (Built, Developed, Engineered, etc.)
- Include numbers and impact wherever possible
- Make it pass ATS for the given JD
- Draw from Kaif's real projects and experience only

Kaif's Profile:
${PROFILE_TEXT}

Job Description:
${jd}
`;

export default function ResumeTailor() {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  async function tailor() {
    if (!jd.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await callClaude(PROMPT(jd))); }
    catch (e) { setError(e.message); }
    setLoading(false);
  }

  function copy(text, label) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  const CopyBtn = ({ text, label }) => (
    <button onClick={() => copy(text, label)}
      className="text-xs px-2.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
      {copied === label ? '✓ Copied' : 'Copy'}
    </button>
  );

  return (
    <Layout title="Resume Tailor">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">✍️ Resume Tailor</h2>
          <p className="text-sm text-zinc-500 mt-1">Paste a job description. Get ATS-optimized resume content written for that exact role.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description here..." rows={7}
            className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
          <button onClick={tailor} disabled={loading || !jd.trim()}
            className="mt-3 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {loading ? 'Rewriting...' : 'Tailor My Resume'}
          </button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl p-4">{error}</div>}

        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Headline */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Resume Headline</span>
                <CopyBtn text={result.headline} label="headline" />
              </div>
              <div className="text-base font-semibold text-zinc-800 dark:text-zinc-100">{result.headline}</div>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Professional Summary</span>
                <CopyBtn text={result.summary} label="summary" />
              </div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{result.summary}</div>
            </div>

            {/* Bullets */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Tailored Bullets</span>
                <CopyBtn text={result.tailored_bullets?.join('\n')} label="bullets" />
              </div>
              <div className="space-y-2.5">
                {result.tailored_bullets?.map((b, i) => (
                  <div key={i} className="flex gap-2.5 text-sm">
                    <span className="text-indigo-500 mt-0.5 flex-shrink-0">•</span>
                    <span className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords + Skills */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3 uppercase tracking-wide">Add These ATS Keywords</div>
                <div className="flex flex-wrap gap-2">
                  {result.ats_keywords?.map(k => <span key={k} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full">{k}</span>)}
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wide">Highlight These Skills</div>
                <div className="flex flex-wrap gap-2">
                  {result.skills_to_highlight?.map(s => <span key={s} className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">{s}</span>)}
                </div>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800 p-4 text-sm text-amber-800 dark:text-amber-300">
              💡 <strong>Pro tip:</strong> {result.tip}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
