# Move-in — Kaif's AI Career Agent

A personal AI-powered job search dashboard with 10 tools to help land a job faster.
Powered by **Google Gemini API (completely free)**.

## Features

| Tool | What it does |
|------|-------------|
| 🎯 Job Scorer | Paste any JD → get fit score, verdict, skill gaps |
| ✍️ Resume Tailor | Rewrites resume bullets to match any JD (ATS-optimized) |
| 📬 Outreach Generator | LinkedIn message, email, follow-up, connection note |
| 🧠 Interview Prep | 10 likely questions + answers using your real projects |
| ❄️ Cold Email Strategy | Who to contact, how to find them, what to say |
| 📊 Skill Gap Analyzer | Paste 3–7 JDs → see exactly what to learn |
| 📋 Job Tracker | Kanban board: Applied → Interview → Offer → Rejected |
| 💼 LinkedIn Posts | Weekly posts that attract recruiters to you |
| ⭐ Resume Score | Score your resume + section feedback + fixes |
| ⚡ Dashboard | Daily checklist + stats + quick access to all tools |

---

## Deploy to Vercel in 5 Minutes

### Step 1 — Get your FREE Google Gemini API key
1. Go to https://aistudio.google.com
2. Sign in with your Google account (NO credit card needed)
3. Click **Get API Key** → **Create API key**
4. Copy the key (starts with `AIza...`)
5. Free tier: 1,500 requests/day — more than enough

### Step 2 — Push to GitHub
1. Create a new repo on github.com
2. Upload all these files (or use Git):

```bash
git init
git add .
git commit -m "Initial Move-in app"
git remote add origin https://github.com/YOUR_USERNAME/move-in.git
git push -u origin main
```

### Step 3 — Deploy on Vercel
1. Go to vercel.com and sign in with GitHub
2. Click **New Project** → import your `move-in` repo
3. Before clicking Deploy, click **Environment Variables**
4. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** paste your API key here
5. Click **Deploy**
6. Done! Your app is live.

---

## Run Locally

```bash
# Install dependencies
npm install

# Create your .env.local file
cp .env.example .env.local
# Open .env.local and paste your GEMINI_API_KEY

# Start dev server
npm run dev

# Open http://localhost:3000
```

---

## Project Structure

```
move-in/
├── pages/
│   ├── index.js          # Dashboard + Daily checklist
│   ├── scorer.js         # Job Scorer
│   ├── tailor.js         # Resume Tailor
│   ├── outreach.js       # Outreach Generator
│   ├── interview.js      # Interview Prep
│   ├── cold-email.js     # Cold Email Strategy
│   ├── skill-gap.js      # Skill Gap Analyzer
│   ├── tracker.js        # Job Tracker (Kanban)
│   ├── linkedin.js       # LinkedIn Post Generator
│   ├── resume-score.js   # Resume Score
│   └── api/
│       └── claude.js     # Secure Gemini API route
├── components/
│   └── Layout.js         # Sidebar + navigation
├── contexts/
│   └── ThemeContext.js   # Dark/light mode
├── lib/
│   ├── profile.js        # Kaif's profile (hardcoded)
│   └── claude.js         # API helper
└── styles/
    └── globals.css
```

---

## To Update Your Profile

Edit `lib/profile.js` and update `PROFILE_TEXT` with any new skills, projects, or experience.
All 10 tools automatically use the updated profile.

---

Built for Kaif Akhter · KIIT University 2026 · AI/ML Engineer
