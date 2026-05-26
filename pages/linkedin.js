import { useState } from 'react';
import Layout from '../components/Layout';
import { callClaude } from '../lib/claude';
import { PROFILE_TEXT } from '../lib/profile';

const PROMPT = (topic, goal) => `
You are a LinkedIn content strategist. Write a viral LinkedIn post for Kaif Akhter.

Topic: ${topic}
Goal: ${goal}

Return ONLY a JSON object:
{
  "post": "<the full LinkedIn post, 150-250 words, with line breaks, emojis used sparingly, ends with 3 relevant hashtags>",
  "hook": "<just the first 2 lines — the hook that makes people stop scrolling>",
  "why_it_works": "<one sentence on why this post will attract recruiters>",
  "best_time_to_post": "<best day and time to post this on LinkedIn>",
  "alt_post": "<a shorter 80-100 word alternative version of the same post>"
}

Rules:
- Write in first person as Kaif
- Make it genuine and story-driven, not salesy
- Mention one specific project or achievement from Kaif's profile
- Recruiters and hiring managers are the target audience
- Use the hook formula: challenge faced → action taken → result/lesson learned
- Include a question at the end to drive comments

Kaif's Profile:
${PROFILE_TEXT}
`;

const TOPICS = [
  'My RAG AI Assistant project',
  'Brain tumor detection research paper',
  'What I learned building with LangChain',
  'My journey from fresher to deploying live AI apps',
  'Lessons from the G20 Y20 Summit',
  'How I taught myself machine learning',
  'My job search experience',
  'Building full-stack AI apps as a fresher',
];

const GOALS = [
  'Attract recruiters to my profile',
  'Show off my technical skills',
  'Build my personal brand',
  'Get referrals from my network',
];

export default function LinkedInPosts() {
  const [topic, setTopic] = useState('');
  const [goal, setGoal] = useState('Attract recruiters to my profile');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  async function generate() {
    if (!topic.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try { setResult(await callClaude(PROMPT(topic, goal))); }
    catch (e) { setError(e.message); }
    setLoading(false);
  }

  function copy(text, key) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  }

  return (
    <Layout title="LinkedIn Post Generator">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">💼 LinkedIn Post Generator</h2>
          <p className="text-sm text-zinc-500 mt-1">Write posts that make recruiters come to <em>you</em>. Post once a week, minimum.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
          {/* Quick topic picks */}
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block">Quick topic ideas</label>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button key={t} onClick={() => setTopic(t)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${topic === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Custom topic */}
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Or write your own topic</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. What I learned from building X..."
              className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3.5 py-2.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
          </div>

          {/* Goal */}
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block">Goal of this post</label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map(g => (
                <button key={g} onClick={() => setGoal(g)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${goal === g ? 'bg-violet-600 border-violet-600 text-white' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-violet-400'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading || !topic.trim()}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {loading ? 'Writing your post...' : 'Generate LinkedIn Post'}
          </button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl p-4">{error}</div>}

        {result && (
          <div className="space-y-4 animate-slide-up">
            {/* Hook preview */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 p-5">
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">The Hook (first 2 lines)</div>
              <div className="text-sm font-medium text-indigo-800 dark:text-indigo-200 leading-relaxed italic">{result.hook}</div>
              <div className="text-xs text-indigo-500 mt-2">💡 {result.why_it_works}</div>
            </div>

            {/* Main post */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Full Post</div>
                  <div className="text-xs text-zinc-400 mt-0.5">📅 Post on: {result.best_time_to_post}</div>
                </div>
                <button onClick={() => copy(result.post, 'main')}
                  className="text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  {copied === 'main' ? '✓ Copied!' : 'Copy Post'}
                </button>
              </div>
              {/* LinkedIn card preview */}
              <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm">K</div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Kaif Akhter</div>
                    <div className="text-xs text-zinc-400">CS Student @ KIIT · AI/ML Developer</div>
                  </div>
                </div>
                <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{result.post}</div>
              </div>
            </div>

            {/* Alt version */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Shorter Version (80–100 words)</div>
                <button onClick={() => copy(result.alt_post, 'alt')}
                  className="text-xs px-3 py-1.5 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                  {copied === 'alt' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">{result.alt_post}</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
