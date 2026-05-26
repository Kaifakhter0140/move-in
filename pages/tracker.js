import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

const COLUMNS = [
  { id: 'applied',   label: 'Applied',    color: 'blue',   emoji: '📤' },
  { id: 'interview', label: 'Interview',  color: 'purple', emoji: '🧠' },
  { id: 'offer',     label: 'Offer',      color: 'green',  emoji: '🎉' },
  { id: 'rejected',  label: 'Rejected',   color: 'red',    emoji: '❌' },
];

const COL_STYLES = {
  blue:   { header: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  purple: { header: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  green:  { header: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  red:    { header: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
};

const EMPTY = { applied: [], interview: [], offer: [], rejected: [] };

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function Tracker() {
  const [cols, setCols] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', date: new Date().toISOString().slice(0, 10), link: '', notes: '' });
  const [drag, setDrag] = useState(null); // { id, from }
  const [dragOver, setDragOver] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('movein-tracker');
    if (saved) setCols(JSON.parse(saved));
  }, []);

  function save(next) {
    setCols(next);
    localStorage.setItem('movein-tracker', JSON.stringify(next));
  }

  function addCard() {
    if (!form.company.trim() || !form.role.trim()) return;
    const card = { id: genId(), ...form };
    save({ ...cols, applied: [card, ...cols.applied] });
    setForm({ company: '', role: '', date: new Date().toISOString().slice(0, 10), link: '', notes: '' });
    setShowForm(false);
  }

  function deleteCard(colId, cardId) {
    save({ ...cols, [colId]: cols[colId].filter(c => c.id !== cardId) });
  }

  function moveCard(fromCol, toCol, cardId) {
    const card = cols[fromCol].find(c => c.id === cardId);
    if (!card || fromCol === toCol) return;
    save({
      ...cols,
      [fromCol]: cols[fromCol].filter(c => c.id !== cardId),
      [toCol]: [card, ...cols[toCol]],
    });
  }

  const total = Object.values(cols).flat().length;

  return (
    <Layout title="Job Tracker">
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">📋 Job Tracker</h2>
            <p className="text-sm text-zinc-500 mt-0.5">{total} application{total !== 1 ? 's' : ''} tracked</p>
          </div>
          <button onClick={() => setShowForm(s => !s)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
            + Add Application
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 animate-slide-up">
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-4">New Application</div>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { key: 'company', placeholder: 'Company name *', label: 'Company' },
                { key: 'role',    placeholder: 'Role applied for *', label: 'Role' },
                { key: 'date',    placeholder: '', label: 'Applied Date', type: 'date' },
                { key: 'link',    placeholder: 'Job listing URL', label: 'Job Link' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-zinc-400 mb-1 block">{f.label}</label>
                  <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
                </div>
              ))}
            </div>
            <div className="mt-3">
              <label className="text-xs text-zinc-400 mb-1 block">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(v => ({ ...v, notes: e.target.value }))} placeholder="Any notes..." rows={2}
                className="w-full text-sm bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-2.5 focus:outline-none focus:border-indigo-400 placeholder-zinc-400" />
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={addCard} disabled={!form.company.trim() || !form.role.trim()}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors">
                Add to Applied
              </button>
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-sm rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Kanban */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map(col => {
            const style = COL_STYLES[col.color];
            const cards = cols[col.id] || [];
            return (
              <div key={col.id}
                onDragOver={e => { e.preventDefault(); setDragOver(col.id); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => {
                  if (drag) moveCard(drag.from, col.id, drag.id);
                  setDrag(null); setDragOver(null);
                }}
                className={`rounded-2xl border-2 transition-all min-h-40 ${dragOver === col.id ? `border-indigo-400 bg-indigo-50 dark:bg-indigo-900/10` : `${style.border} border-transparent`}`}
              >
                {/* Column header */}
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-2xl ${style.header}`}>
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span>{col.emoji}</span>
                    <span>{col.label}</span>
                  </div>
                  <span className="text-xs font-bold">{cards.length}</span>
                </div>

                {/* Cards */}
                <div className="p-2 space-y-2">
                  {cards.map(card => (
                    <div key={card.id}
                      draggable
                      onDragStart={() => setDrag({ id: card.id, from: col.id })}
                      onDragEnd={() => { setDrag(null); setDragOver(null); }}
                      className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 p-3 cursor-grab active:cursor-grabbing hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 truncate">{card.company}</div>
                          <div className="text-xs text-zinc-500 truncate">{card.role}</div>
                          <div className="text-xs text-zinc-400 mt-1">{card.date}</div>
                          {card.notes && <div className="text-xs text-zinc-400 mt-1 italic truncate">{card.notes}</div>}
                          {card.link && (
                            <a href={card.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                              className="text-xs text-indigo-500 hover:underline mt-1 block">View JD ↗</a>
                          )}
                        </div>
                        <button onClick={() => deleteCard(col.id, card.id)}
                          className="opacity-0 group-hover:opacity-100 text-zinc-300 dark:text-zinc-600 hover:text-red-400 text-xs flex-shrink-0 transition-opacity">✕</button>
                      </div>
                      {/* Quick move buttons */}
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {COLUMNS.filter(c => c.id !== col.id).map(c => (
                          <button key={c.id} onClick={() => moveCard(col.id, c.id, card.id)}
                            className="text-xs px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                            → {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="text-xs text-zinc-400 text-center py-6">Drop cards here</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
