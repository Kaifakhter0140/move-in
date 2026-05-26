import { useState } from 'react';
import Layout from '../components/Layout';
import { callClaude } from '../lib/claude';
import { PROFILE_TEXT } from '../lib/profile';

const PROMPT = (jd) => `
You are a professional communication coach. Write outreach messages for Kaif applying to this job.

Return ONLY a JSON object:
{
  "linkedin_message": "<under 75 words, friendly, specific, ends with a question>",
  "email_subject": "<punchy, under 8 words>",
  "email_body": "<3 short paragraphs: hook, value proposition, call to action. Under 150 words total>",
  "follow_up_7days": "<short follow-up message if no reply in 7 days, under 50 words>",
  "cold_connect_note": "<LinkedIn connection request note, under 30 words>"
}

Kaif's Profile:
${PROFILE_TEXT}

Job Description:
${jd}
`;

const SECTIONS = [
  { key: 'linkedin_message',   label: 'LinkedIn Message',       icon: '💼', desc: 'Send after applying' },
  { key: 'email_subject',      label: 'Email Subject Line',     icon: '📧', desc: 'Use this as your email subject' },
  { key: 'email_body',         label: 'Email Body',             icon: '📝', desc: 'Full email to HR/recruiter' },
  { key: 'follow_up_7days',    label: 'Follow-up (7 days)',     icon: '🔁', desc: 'If no reply after a week' },
  { key: 'cold_connect_note',  label: 'Connection Request',     icon: '🤝', desc: 'LinkedIn connect note' },
];

export default function Outreach() {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  async function generate() {
    if (!jd.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await callClaude(PROMPT(jd))); }
    catch (e) { setError(e.message); }
    setLoading(false);
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <Layout title="Outreach Generator">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">📬 Outreach Generator</h2>
          <p className="text-sm text-zinc-500 mt-1">Get 5 ready-to-send messages — LinkedIn, email, follow-up, and connection note.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description here..." rows={7}
            className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
          <button onClick={generate} disabled={loading || !jd.trim()}
            className="mt-3 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {loading ? 'Writing messages...' : 'Generate All Messages'}
          </button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl p-4">{error}</div>}

        {result && (
          <div className="space-y-3 animate-slide-up">
            {SECTIONS.map(s => (
              <div key={s.key} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{s.icon} {s.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{s.desc}</div>
                  </div>
                  <button onClick={() => copy(result[s.key], s.key)}
                    className="text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    {copied === s.key ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3.5 whitespace-pre-wrap">
                  {result[s.key]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
