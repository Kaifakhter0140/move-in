import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const NAV = [
  { href: '/',             label: 'Dashboard',     emoji: '⚡', desc: 'Home & daily checklist' },
  { href: '/scorer',       label: 'Job Scorer',    emoji: '🎯', desc: 'Score job fit' },
  { href: '/tailor',       label: 'Resume Tailor', emoji: '✍️',  desc: 'Tailor resume bullets' },
  { href: '/outreach',     label: 'Outreach',      emoji: '📬', desc: 'LinkedIn & email messages' },
  { href: '/interview',    label: 'Interview Prep',emoji: '🧠', desc: 'Likely questions + answers' },
  { href: '/cold-email',   label: 'Cold Email',    emoji: '❄️',  desc: 'Who to contact & how' },
  { href: '/skill-gap',    label: 'Skill Gap',     emoji: '📊', desc: 'Identify what to learn' },
  { href: '/tracker',      label: 'Job Tracker',   emoji: '📋', desc: 'Kanban board' },
  { href: '/linkedin',     label: 'LinkedIn Posts',emoji: '💼', desc: 'Attract recruiters' },
  { href: '/resume-score', label: 'Resume Score',  emoji: '⭐', desc: 'Score & fix your resume' },
];

export default function Layout({ children, title }) {
  const { dark, toggle } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`flex h-screen overflow-hidden ${dark ? 'dark' : ''}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 flex flex-col flex-shrink-0
        bg-white dark:bg-zinc-900
        border-r border-zinc-200 dark:border-zinc-800
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">M</div>
          <div>
            <div className="font-semibold text-zinc-900 dark:text-white text-sm tracking-wide">Move-in</div>
            <div className="text-xs text-zinc-400 dark:text-zinc-500">Kaif's Career Agent</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV.map(({ href, label, emoji }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                  text-sm font-medium transition-all duration-150
                  ${active
                    ? 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }
                `}>
                  <span className="w-5 text-center text-base">{emoji}</span>
                  <span>{label}</span>
                  {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>{dark ? '☀️' : '🌙'}</span>
            <span>{dark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          {/* Profile badge */}
          <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">K</div>
            <div>
              <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">Kaif Akhter</div>
              <div className="text-xs text-zinc-400">KIIT · 2026</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        {/* Top bar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <button
            className="lg:hidden p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full">AI Powered</span>
            <button onClick={toggle} className="hidden lg:flex items-center p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Page */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
