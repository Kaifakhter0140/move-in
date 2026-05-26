import { useState } from 'react';
import Layout from '../components/Layout';
import { callClaude } from '../lib/claude';
import { PROFILE_TEXT } from '../lib/profile';

const PROMPT = (company, role, size) => `
You are a strategic career coach. Kaif wants to reach out directly to people at ${company} for a ${role} role. Company size: ${size}.

Return ONLY a JSON object:
{
  "strategy_summary": "<2-sentence cold outreach strategy for this company size and role>",
  "who_to_contact": [
    {
      "title": "<job title to target>",
      "why": "<why this person is the right contact>",
      "how_to_find": "<exactly how to find them on LinkedIn or elsewhere>"
    }
  ],
  "linkedin_search_query": "<exact LinkedIn search query to find the right person>",
  "cold_message": "<a personalized cold LinkedIn message from Kaif, under 100 words, specific to the company>",
  "cold_email": "<a cold email body, 3 short paragraphs, professional but direct>",
  "email_subject": "<subject line for cold email>",
  "best_time_to_reach": "<when to send — day of week and time of day>",
  "do_list": ["do1", "do2", "do3"],
  "dont_list": ["dont1", "dont2"]
}

Kaif's Profile:
${PROFILE_TEXT}
`;

const SIZE_OPTIONS = ['Startup (1–50)', 'Mid-size (51–500)', 'Large (500+)', 'MNC / Enterprise'];

export default function ColdEmail() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [size, setSize] = useState('Mid-size (51–500)');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  async function generate() {
    if (!company.trim() || !role.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await callClaude(PROMPT(company, role, size))); }
    catch (e) { setError(e.message); }
    setLoading(false);
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <Layout title="Cold Email Strategy">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">❄️ Cold Email Strategy</h2>
          <p className="text-sm text-zinc-500 mt-1">Find exactly who to contact, what to say, and how. Bypass the apply button.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Company Name</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Meesho, Razorpay..."
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Role You Want</label>
              <input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. ML Engineer, Data Scientist..."
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Company Size</label>
            <div className="flex gap-2 flex-wrap">
              {SIZE_OPTIONS.map(s => (
                <button key={s} onClick={() => setSize(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${size === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={generate} disabled={loading || !company.trim() || !role.trim()}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {loading ? 'Building strategy...' : 'Build Cold Outreach Strategy'}
          </button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl p-4">{error}</div>}

        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Strategy */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">Strategy</div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{result.strategy_summary}</p>
              <div className="mt-3 text-xs text-zinc-400">🕐 Best time: {result.best_time_to_reach}</div>
            </div>

            {/* Who to contact */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-3">Who to Contact</div>
              <div className="space-y-3">
                {result.who_to_contact?.map((c, i) => (
                  <div key={i} className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3.5">
                    <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{c.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">{c.why}</div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">📍 {c.how_to_find}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
                🔍 <strong>LinkedIn search:</strong> {result.linkedin_search_query}
              </div>
            </div>

            {/* Messages */}
            {[
              { label: 'Cold LinkedIn Message', key: 'cold_message' },
              { label: 'Email Subject', key: 'email_subject' },
              { label: 'Cold Email Body', key: 'cold_email' },
            ].map(item => (
              <div key={item.key} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">{item.label}</span>
                  <button onClick={() => copy(result[item.key], item.key)}
                    className="text-xs px-2.5 py-1 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    {copied === item.key ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3.5 leading-relaxed whitespace-pre-wrap">{result[item.key]}</div>
              </div>
            ))}

            {/* Do/Don't */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Do This', key: 'do_list', color: 'green' },
                { label: "Don't Do This", key: 'dont_list', color: 'red' },
              ].map(({ label, key, color }) => (
                <div key={key} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
                  <div className={`text-xs font-semibold text-${color}-600 dark:text-${color}-400 uppercase tracking-wide mb-3`}>{label}</div>
                  <ul className="space-y-2">
                    {result[key]?.map((item, i) => (
                      <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300 flex gap-2">
                        <span className={`text-${color}-500 flex-shrink-0`}>{color === 'green' ? '✓' : '✗'}</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
