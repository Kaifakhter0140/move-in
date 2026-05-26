import { useState } from 'react';
import Layout from '../components/Layout';
import { callClaude } from '../lib/claude';
import { PROFILE_TEXT } from '../lib/profile';

const PROMPT = (jd) => `
You are an expert technical interviewer. Generate interview prep for Kaif based on this job description.

Return ONLY a JSON object:
{
  "questions": [
    {
      "type": "<Technical | Behavioral | HR | System Design>",
      "question": "<interview question>",
      "kaif_answer": "<suggested answer using Kaif's real projects and experience, 2-4 sentences, specific and confident>"
    }
  ]
}

Generate exactly 10 questions: 4 technical, 3 behavioral, 2 HR, 1 system design.
Make answers reference Kaif's real projects (RAG assistant, Knowledge Architect, brain tumor detection research).
Answers should sound natural, not robotic.

Kaif's Profile:
${PROFILE_TEXT}

Job Description:
${jd}
`;

const TYPE_COLORS = {
  Technical:     'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Behavioral:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  HR:            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  'System Design': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
};

export default function InterviewPrep() {
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  async function prep() {
    if (!jd.trim()) return;
    setLoading(true); setError(''); setResult(null); setExpanded({});
    try { setResult(await callClaude(PROMPT(jd))); }
    catch (e) { setError(e.message); }
    setLoading(false);
  }

  return (
    <Layout title="Interview Prep">
      <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">🧠 Interview Prep</h2>
          <p className="text-sm text-zinc-500 mt-1">Get 10 likely interview questions with tailored answers using your real projects.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description here..." rows={7}
            className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 p-3.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
          <button onClick={prep} disabled={loading || !jd.trim()}
            className="mt-3 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {loading ? 'Generating questions...' : 'Prepare Me for This Interview'}
          </button>
        </div>

        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm rounded-xl p-4">{error}</div>}

        {result?.questions && (
          <div className="space-y-3 animate-slide-up">
            <div className="text-xs text-zinc-400 font-medium px-1">Click any question to reveal the suggested answer</div>
            {result.questions.map((q, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <button
                  onClick={() => setExpanded(e => ({ ...e, [i]: !e[i] }))}
                  className="w-full text-left px-5 py-4 flex items-start gap-3"
                >
                  <span className="text-xs font-bold text-zinc-400 mt-0.5 flex-shrink-0">Q{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[q.type]}`}>{q.type}</span>
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100 leading-relaxed">{q.question}</div>
                  </div>
                  <span className="text-zinc-400 mt-0.5 flex-shrink-0 text-xs">{expanded[i] ? '▲' : '▼'}</span>
                </button>
                {expanded[i] && (
                  <div className="px-5 pb-4">
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed border-l-4 border-indigo-400">
                      <div className="text-xs font-semibold text-indigo-500 mb-2 uppercase tracking-wide">Suggested Answer</div>
                      {q.kaif_answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
