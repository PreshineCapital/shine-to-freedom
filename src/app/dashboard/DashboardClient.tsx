'use client'
// src/app/dashboard/DashboardClient.tsx
// Full interactive dashboard shell.
// Brand tokens match shine2freedom-v11 exactly.

import { useState, useEffect, useCallback } from 'react'

// ─── TYPES ───────────────────────────────────────────────────
type EnrollKey =
  | 'noskill'
  | 'transcription'
  | 'dataentry'
  | 'fullpackage'
  | 'va'
  | 'smm'
  | 'masterclass'

interface Vacancy {
  id: string
  title: string
  company: string
  type: 'foreign' | 'local'
  pay: string
  category: EnrollKey | 'free'
  tags: string[]
  apply: string
  premium?: boolean
}

interface Task {
  id: string
  label: string
  done: boolean
}

interface GuideStep {
  step: number
  title: string
  body: string
  action?: string
}

// ─── STATIC DATA ─────────────────────────────────────────────

const VACANCIES: Vacancy[] = [
  // FREE — visible to everyone
  {
    id: 'v1', title: 'Micro-Task Completer (SproutGigs)', company: 'SproutGigs',
    type: 'foreign', pay: '$0.25–$1.20 per task', category: 'free',
    tags: ['No Skill', 'Remote', 'Instant Pay'],
    apply: 'https://sproutgigs.com',
  },
  {
    id: 'v2', title: 'AI Data Labeler (Toloka)', company: 'Yandex / Toloka',
    type: 'foreign', pay: '$0.35–$0.80 per batch', category: 'free',
    tags: ['No Skill', 'Remote', 'Daily Tasks'],
    apply: 'https://toloka.ai',
  },
  // NO-SKILL unlocks these
  {
    id: 'v3', title: 'Search Engine Evaluator (OneForma)', company: 'Lionbridge / OneForma',
    type: 'foreign', pay: '$3–$8/hr', category: 'noskill',
    tags: ['No Skill', 'Remote', 'Weekly Pay'],
    apply: 'https://www.oneforma.com',
  },
  {
    id: 'v4', title: 'Map Analyst (Microworkers)', company: 'Microworkers',
    type: 'foreign', pay: '$0.50–$2.00 per task', category: 'noskill',
    tags: ['No Skill', 'Remote'],
    apply: 'https://microworkers.com',
  },
  {
    id: 'v5', title: 'Content Reviewer (Remote)', company: 'Confidential',
    type: 'local', pay: '₦40,000–₦70,000/mo', category: 'noskill',
    tags: ['Entry Level', 'Nigeria', 'Contract'],
    apply: 'https://t.me/Shinetofreedomsupport',
  },
  // TRANSCRIPTION unlocks
  {
    id: 'v6', title: 'General Transcriptionist (GoTranscript)', company: 'GoTranscript',
    type: 'foreign', pay: '$0.60–$1.10 per audio min', category: 'transcription',
    tags: ['Transcription', 'Remote', 'Flexible'],
    apply: 'https://gotranscript.com',
  },
  {
    id: 'v7', title: 'Legal Transcriptionist', company: 'TranscribeMe',
    type: 'foreign', pay: '$1.50–$2.20 per audio min', category: 'transcription',
    tags: ['Transcription', 'Higher Pay', 'Remote'],
    apply: 'https://transcribeme.com',
  },
  // DATA ENTRY unlocks
  {
    id: 'v8', title: 'Remote Data Entry Specialist', company: 'Clickworker',
    type: 'foreign', pay: '$350–$600/mo', category: 'dataentry',
    tags: ['Data Entry', 'Remote', 'Steady'],
    apply: 'https://clickworker.com',
  },
  {
    id: 'v9', title: 'Data Collection & Entry (Local)', company: 'NGO Partner',
    type: 'local', pay: '₦50,000–₦80,000/mo', category: 'dataentry',
    tags: ['Data Entry', 'Nigeria', 'Full-Time'],
    apply: 'https://t.me/Shinetofreedomsupport',
  },
  // VA unlocks
  {
    id: 'v10', title: 'Executive Virtual Assistant (US Startup)', company: 'Confidential',
    type: 'foreign', pay: '$800–$1,400/mo', category: 'va',
    tags: ['VA', 'Remote', 'Long-Term'],
    apply: 'https://t.me/Shinetofreedomsupport',
  },
  {
    id: 'v11', title: 'Social Media VA (UK E-commerce)', company: 'Confidential',
    type: 'foreign', pay: '$600–$900/mo', category: 'va',
    tags: ['VA', 'Social Media', 'Remote'],
    apply: 'https://t.me/Shinetofreedomsupport',
  },
  // SMM unlocks
  {
    id: 'v12', title: 'Social Media Manager (Nigerian Brand)', company: 'Lagos Startup',
    type: 'local', pay: '₦80,000–₦150,000/mo', category: 'smm',
    tags: ['SMM', 'Nigeria', 'Hybrid'],
    apply: 'https://t.me/Shinetofreedomsupport',
  },
  {
    id: 'v13', title: 'Content Creator & Strategist (Remote)', company: 'US Agency',
    type: 'foreign', pay: '$1,000–$1,800/mo', category: 'smm',
    tags: ['SMM', 'Strategy', 'Remote'],
    apply: 'https://t.me/Shinetofreedomsupport',
  },
  // Premium — subscribe weekly
  {
    id: 'v14', title: '⭐ Premium: High-Pay Remote Opportunity', company: 'Weekly Drop',
    type: 'foreign', pay: '$1,500–$3,000/mo', category: 'free',
    tags: ['Premium', 'Vetted', 'Weekly Drop'],
    apply: 'https://t.me/Shinetofreedomsupport',
    premium: true,
  },
  {
    id: 'v15', title: '⭐ Premium: Verified Client Connection', company: 'Weekly Drop',
    type: 'foreign', pay: 'Negotiated', category: 'free',
    tags: ['Premium', 'Client Direct', 'Weekly Drop'],
    apply: 'https://t.me/Shinetofreedomsupport',
    premium: true,
  },
]

const DAILY_TASKS: Task[] = [
  { id: 't1', label: 'Log in and complete 3 tasks on SproutGigs', done: false },
  { id: 't2', label: 'Check Toloka AI for new batches', done: false },
  { id: 't3', label: 'Review 1 new vacancy in the vault', done: false },
  { id: 't4', label: 'Read one section of your training guide', done: false },
  { id: 't5', label: 'Post in the community: share your win or question', done: false },
]

const GUIDE_STEPS: Record<string, GuideStep[]> = {
  noskill: [
    { step: 1, title: 'Create Your SproutGigs Account', body: 'Go to sproutgigs.com. Click Sign Up. Use a professional email — not a nickname. Verify immediately.', action: 'Open SproutGigs →' },
    { step: 2, title: 'Complete Your Profile Fully', body: 'A complete profile unlocks higher-paying tasks. Add a real photo, fill in your bio, and connect PayPal or Payoneer for payouts.', action: 'Continue →' },
    { step: 3, title: 'Filter Tasks by Category', body: 'Start with "Follow & Review" and "App Testing" — these pay fastest with zero skill. Avoid "Survey" tasks in week one (low pay, time-heavy).', action: 'Continue →' },
    { step: 4, title: 'Complete Your First 5 Tasks', body: 'Speed isn\'t the goal — accuracy is. One rejected task can limit your access to better-paying categories. Read every instruction before starting.', action: 'Continue →' },
    { step: 5, title: 'Request Your First Payout', body: 'SproutGigs pays to Payoneer, Airtm, or Wise. Set this up before you start — do not wait until you\'re ready to withdraw. Minimum payout is $5.', action: 'Mark Complete ✓' },
  ],
  transcription: [
    { step: 1, title: 'Set Up Your Transcription Tools', body: 'You need: noise-cancelling headphones (any affordable pair works), a foot pedal (optional but speeds you up), and Express Scribe (free version is fine to start).', action: 'Continue →' },
    { step: 2, title: 'Practice Your Accuracy First', body: 'GoTranscript tests accuracy before you can access real jobs. Target 99%+ accuracy — not speed. A 95% score will restrict you to low-paying files.', action: 'Continue →' },
    { step: 3, title: 'Pass the GoTranscript Entrance Test', body: 'Take the test at gotranscript.com/transcription-test. Read their style guide first — it covers formatting, speaker labels, and inaudible markers. This is what most beginners skip and then fail.', action: 'Open GoTranscript →' },
    { step: 4, title: 'Understand What $1.75/min Actually Means', body: 'A 10-minute audio file = $17.50. At 4 files per day (40 mins of audio), that\'s $70/day. Most beginners do 2 files per day starting out = $35/day = $700+ per month. This is why your training guide matters — speed comes from knowing the formatting rules before you start, not from typing faster.', action: 'Continue →' },
    { step: 5, title: 'Apply to TranscribeMe for Higher Pay', body: 'Once you have 2 weeks of GoTranscript history, apply to TranscribeMe ($1.50–$2.20/min). This is why your Shine To Freedom transcription training guide includes the exact application approach that gets accepted — not just where to apply.', action: 'Mark Complete ✓' },
  ],
  dataentry: [
    { step: 1, title: 'Master the Tools First', body: 'You need: Google Sheets (free), Microsoft Excel (basics only), and a typing speed of at least 40 WPM. Test your speed at keybr.com — do this before anything else.', action: 'Test Your Speed →' },
    { step: 2, title: 'Understand What Clients Actually Pay For', body: 'Data entry clients pay for accuracy and turnaround speed — not just typing. A file with 99% accuracy turns into repeat work. 95% accuracy turns into a bad review.', action: 'Continue →' },
    { step: 3, title: 'Set Up on Clickworker', body: 'Clickworker pays for data verification, product categorization, and form entry. Create your account, pass the qualification tests (they take 20 minutes), and you\'re live.', action: 'Open Clickworker →' },
    { step: 4, title: 'Your First ₦50,000 Month', body: 'At Clickworker\'s average pay + local Nigerian data entry roles (see your Vacancy Vault), consistent members reach ₦150,000–₦350,000/mo within 60 days. The training guide covers exactly how to combine both income streams for maximum output.', action: 'Continue →' },
    { step: 5, title: 'Apply to Local Listings in Your Vault', body: 'Your enrollment unlocks local Nigerian data entry roles in the Vacancy Vault. These pay ₦50,000–₦80,000/mo for 10–15hrs/week of remote work — combine with Clickworker.', action: 'Mark Complete ✓' },
  ],
}

const UNLOCK_LINKS: Record<string, string> = {
  noskill: 'https://paystack.shop/pay/noskilljob',
  transcription: 'https://paystack.shop/pay/transcriptionstarter',
  dataentry: 'https://paystack.shop/pay/dataentrystarter',
  fullpackage: 'https://paystack.shop/pay/fullstarter',
  va: 'https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20want%20to%20enroll%20in%20Virtual%20Assistant%20Training',
  smm: 'https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20want%20to%20enroll%20in%20Social%20Media%20Management',
  masterclass: 'https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20want%20to%20inquire%20about%20the%20Full%20Masterclass',
}

const TIER_LABELS: Record<string, string> = {
  noskill: 'No-Skill Jobs',
  transcription: 'Transcription',
  dataentry: 'Data Entry',
  fullpackage: 'Full Beginner Package',
  va: 'Virtual Assistant',
  smm: 'Social Media Management',
  masterclass: 'Full Masterclass',
}

const TIER_EARN: Record<string, string> = {
  noskill: '$0.25–$1.20/task',
  transcription: '$200–$400/mo',
  dataentry: '$150–$350/mo',
  fullpackage: 'Up to $400/mo combined',
  va: '$300–$1,000+/mo',
  smm: '$300–$1,200+/mo',
  masterclass: 'Multiple income streams',
}

// ─── COMPONENT ───────────────────────────────────────────────

interface Props {
  userEmail: string
  userName: string
  enrolled: string[]
}

export default function DashboardClient({ userEmail, userName, enrolled }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'vault' | 'guide' | 'progress'>('overview')
  const [guideModule, setGuideModule] = useState<string | null>(null)
  const [guideStepIdx, setGuideStepIdx] = useState(0)
  const [tasks, setTasks] = useState<Task[]>(DAILY_TASKS)
  const [streak, setStreak] = useState(0)
  const [points, setPoints] = useState(0)
  const [vacancyFilter, setVacancyFilter] = useState<'all' | 'foreign' | 'local'>('all')
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [challengeDaysDone, setChallengeDaysDone] = useState(3) // Demo: 3 of 14 days done

  // Persist state to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('s2f_dashboard')
    if (saved) {
      const d = JSON.parse(saved)
      if (d.tasks) setTasks(d.tasks)
      if (d.streak) setStreak(d.streak)
      if (d.points) setPoints(d.points)
      if (d.completedModules) setCompletedModules(d.completedModules)
      if (d.challengeDaysDone !== undefined) setChallengeDaysDone(d.challengeDaysDone)
    }
  }, [])

  const saveState = useCallback((update: Record<string, unknown>) => {
    const current = JSON.parse(localStorage.getItem('s2f_dashboard') ?? '{}')
    localStorage.setItem('s2f_dashboard', JSON.stringify({ ...current, ...update }))
  }, [])

  function toggleTask(id: string) {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    )
    setTasks(updated)
    saveState({ tasks: updated })
    // Award points for completion
    const task = tasks.find((t) => t.id === id)
    if (task && !task.done) {
      const newPoints = points + 10
      setPoints(newPoints)
      saveState({ points: newPoints })
    }
  }

  function markGuideComplete(module: string) {
    if (!completedModules.includes(module)) {
      const updated = [...completedModules, module]
      setCompletedModules(updated)
      const newPoints = points + 100
      setPoints(newPoints)
      setStreak((s) => s + 1)
      saveState({ completedModules: updated, points: newPoints, streak: streak + 1 })
    }
    setGuideModule(null)
    setGuideStepIdx(0)
  }

  const isEnrolled = (key: string) =>
    enrolled.includes(key) || enrolled.includes('fullpackage')

  const doneTasks = tasks.filter((t) => t.done).length
  const totalTasks = tasks.length
  const progressPct = Math.round((doneTasks / totalTasks) * 100)
  const challengePct = Math.round((challengeDaysDone / 14) * 100)
  const daysLeft = 14 - challengeDaysDone

  const filteredVacancies = VACANCIES.filter((v) => {
    if (vacancyFilter !== 'all' && v.type !== vacancyFilter) return false
    return true
  })

  return (
    <>
      <style>{`
        /* ── DASHBOARD GLOBAL ── */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: #070B14; color: #F4F2EC;
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        a { text-decoration: none; color: inherit; }
        button { cursor: pointer; border: none; font-family: inherit; }

        /* ── TOKENS ── */
        :root {
          --navy: #070B14; --navy2: #0C1322; --navy3: #121B30;
          --gold: #C9A84C; --gold-l: #F0D684; --gold-d: #8A6E22;
          --green: #00C46A; --green-d: #008F4E;
          --green-bg: rgba(0,196,106,.1); --green-line: rgba(0,196,106,.28);
          --cream: #F8F5EE; --cream-text: #1A1610; --cream-muted: #6B6354;
          --text: #F4F2EC; --muted: #8C93A8;
          --glass: rgba(255,255,255,.045); --glass-b: rgba(255,255,255,.09);
          --r16: 16px; --r24: 24px;
        }

        /* ── LAYOUT ── */
        .db-shell {
          display: grid;
          grid-template-columns: 230px 1fr;
          min-height: 100vh;
        }
        @media (max-width: 768px) {
          .db-shell { grid-template-columns: 1fr; }
          .db-sidebar { display: none; }
          .db-mobile-bar { display: flex !important; }
        }

        /* ── SIDEBAR ── */
        .db-sidebar {
          background: #0C1322;
          border-right: 1px solid rgba(255,255,255,.06);
          padding: 1.5rem 0;
          position: sticky; top: 0; height: 100vh;
          display: flex; flex-direction: column;
        }
        .db-logo {
          display: flex; align-items: center; gap: .55rem;
          padding: 0 1.25rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,.06);
          margin-bottom: 1.25rem;
        }
        .db-logo-mark {
          width: 28px; height: 28px; flex-shrink: 0;
        }
        .db-logo-text {
          font-size: .82rem; font-weight: 800; letter-spacing: .5px;
          background: linear-gradient(120deg, #C9A84C, #F0D684);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .db-nav { flex: 1; padding: 0 .75rem; }
        .db-nav-item {
          display: flex; align-items: center; gap: .65rem;
          padding: .7rem .85rem; border-radius: 10px;
          font-size: .84rem; font-weight: 500; color: var(--muted);
          cursor: pointer; transition: all .2s; margin-bottom: .2rem;
          background: none;
        }
        .db-nav-item:hover { color: var(--text); background: rgba(255,255,255,.04); }
        .db-nav-item.active {
          color: var(--gold-l);
          background: rgba(201,168,76,.1);
          border: 1px solid rgba(201,168,76,.2);
        }
        .db-nav-icon { font-size: 1rem; width: 20px; text-align: center; }

        .db-sidebar-footer {
          padding: 1rem 1rem 0;
          border-top: 1px solid rgba(255,255,255,.06);
        }
        .db-points-chip {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(201,168,76,.08); border: 1px solid rgba(201,168,76,.18);
          border-radius: 10px; padding: .65rem .85rem;
        }
        .db-points-label { font-size: .72rem; color: var(--muted); }
        .db-points-val {
          font-size: 1.05rem; font-weight: 800; color: var(--gold-l);
          font-family: 'Geist', 'Inter', sans-serif;
        }

        /* ── MOBILE NAV ── */
        .db-mobile-bar {
          display: none;
          position: sticky; top: 0; z-index: 100;
          background: rgba(12,19,34,.95); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,.06);
          padding: .75rem 1rem; justify-content: space-between; align-items: center;
        }
        .db-mobile-tabs {
          display: flex; gap: .5rem; overflow-x: auto;
        }
        .db-mobile-tab {
          font-size: .76rem; font-weight: 600; padding: .4rem .85rem;
          border-radius: 100px; white-space: nowrap; background: none;
          color: var(--muted); border: 1px solid rgba(255,255,255,.08);
        }
        .db-mobile-tab.active {
          background: rgba(201,168,76,.12); color: var(--gold-l);
          border-color: rgba(201,168,76,.3);
        }

        /* ── MAIN CONTENT ── */
        .db-main {
          padding: 2rem 2.5rem;
          overflow-y: auto;
        }
        @media (max-width: 768px) { .db-main { padding: 1.25rem 1rem; } }

        /* ── TOP BAR ── */
        .db-topbar {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
        }
        .db-greeting { font-size: .82rem; color: var(--muted); margin-bottom: .2rem; }
        .db-name { font-size: 1.5rem; font-weight: 800; color: var(--text); }
        .db-streak-badge {
          display: flex; align-items: center; gap: .5rem;
          background: rgba(201,168,76,.1); border: 1px solid rgba(201,168,76,.25);
          border-radius: 100px; padding: .45rem 1rem;
          font-size: .8rem; font-weight: 700; color: var(--gold-l);
        }

        /* ── CARDS ── */
        .db-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: var(--r24); padding: 1.5rem;
          transition: border-color .25s;
        }
        .db-card:hover { border-color: rgba(201,168,76,.2); }
        .db-card-gold { border-color: rgba(201,168,76,.25); background: rgba(201,168,76,.05); }
        .db-card-green { border-color: rgba(0,196,106,.25); background: rgba(0,196,106,.04); }
        .db-card-cream {
          background: var(--cream); border-color: rgba(0,0,0,.04);
          box-shadow: 0 16px 40px rgba(0,0,0,.35);
        }
        .db-card-locked {
          background: rgba(255,255,255,.02);
          border-color: rgba(255,255,255,.05);
          opacity: .75;
        }

        /* ── STAT ROW ── */
        .db-stat-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1rem; margin-bottom: 2rem;
        }
        @media (max-width: 900px) { .db-stat-grid { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 480px) { .db-stat-grid { grid-template-columns: 1fr; } }
        .db-stat { padding: 1.25rem; }
        .db-stat-val {
          font-family: 'Geist', 'Inter', sans-serif;
          font-size: 1.7rem; font-weight: 800; line-height: 1;
          margin-bottom: .3rem;
        }
        .db-stat-label { font-size: .74rem; color: var(--muted); }

        /* ── PROGRESS BAR ── */
        .progress-wrap { margin-top: .85rem; }
        .progress-bar-bg {
          height: 8px; border-radius: 100px;
          background: rgba(255,255,255,.07); overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%; border-radius: 100px;
          background: linear-gradient(90deg, var(--green-d), var(--green));
          transition: width .6s ease;
        }
        .progress-bar-fill.gold {
          background: linear-gradient(90deg, var(--gold-d), var(--gold-l));
        }
        .progress-label {
          display: flex; justify-content: space-between;
          font-size: .74rem; color: var(--muted); margin-top: .5rem;
        }

        /* ── CHALLENGE BANNER ── */
        .challenge-banner {
          background: linear-gradient(135deg, rgba(0,143,78,.15), rgba(0,196,106,.08));
          border: 1px solid var(--green-line);
          border-radius: var(--r24); padding: 1.5rem 2rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap; margin-bottom: 2rem;
        }
        .challenge-label { font-size: .7rem; color: var(--green); font-weight: 700; text-transform: uppercase; letter-spacing: .1em; margin-bottom: .3rem; }
        .challenge-title { font-size: 1.2rem; font-weight: 800; color: var(--text); }
        .challenge-sub { font-size: .82rem; color: var(--muted); margin-top: .25rem; }

        /* ── TASK LIST ── */
        .task-item {
          display: flex; align-items: center; gap: .85rem;
          padding: .85rem 1rem; border-radius: 12px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.06);
          margin-bottom: .55rem; cursor: pointer;
          transition: background .2s, border-color .2s;
        }
        .task-item:hover { background: rgba(255,255,255,.055); }
        .task-item.done { opacity: .55; }
        .task-check {
          width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,.18);
          display: flex; align-items: center; justify-content: center;
          transition: all .2s;
        }
        .task-item.done .task-check {
          background: var(--green); border-color: var(--green);
        }
        .task-label { font-size: .85rem; color: var(--text); flex: 1; }
        .task-item.done .task-label { text-decoration: line-through; color: var(--muted); }
        .task-pts { font-size: .7rem; font-weight: 700; color: var(--gold); }

        /* ── VACANCY VAULT ── */
        .vacancy-filter-bar {
          display: flex; gap: .55rem; margin-bottom: 1.25rem; flex-wrap: wrap;
        }
        .vf-btn {
          padding: .4rem 1rem; border-radius: 100px; font-size: .78rem;
          font-weight: 700; background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08); color: var(--muted);
          transition: all .2s;
        }
        .vf-btn.active {
          background: rgba(201,168,76,.12); color: var(--gold-l);
          border-color: rgba(201,168,76,.3);
        }
        .vacancy-card {
          padding: 1.25rem 1.5rem; border-radius: var(--r16);
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.07);
          margin-bottom: .75rem; transition: border-color .2s;
          position: relative; overflow: hidden;
        }
        .vacancy-card:hover { border-color: rgba(201,168,76,.25); }
        .vacancy-card.locked-card { opacity: .6; }
        .vc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: .5rem; }
        .vc-title { font-size: .95rem; font-weight: 800; color: var(--text); }
        .vc-company { font-size: .76rem; color: var(--muted); }
        .vc-pay {
          font-family: 'Geist', 'Inter', sans-serif;
          font-size: .95rem; font-weight: 800; color: var(--green);
          white-space: nowrap;
        }
        .vc-tags { display: flex; gap: .4rem; flex-wrap: wrap; margin: .6rem 0 .75rem; }
        .vc-tag {
          font-size: .65rem; font-weight: 700; padding: .18rem .6rem;
          border-radius: 100px; background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08); color: var(--muted);
        }
        .vc-tag.foreign { color: var(--gold-l); background: rgba(201,168,76,.1); border-color: rgba(201,168,76,.2); }
        .vc-tag.local { color: var(--green); background: var(--green-bg); border-color: var(--green-line); }
        .vc-tag.premium { color: #fff; background: linear-gradient(135deg, var(--gold-d), var(--gold)); border: none; }
        .vc-actions { display: flex; gap: .65rem; align-items: center; }
        .vc-apply {
          padding: .5rem 1.1rem; border-radius: 100px;
          background: var(--green-bg); border: 1px solid var(--green-line);
          color: var(--green); font-size: .78rem; font-weight: 800;
          transition: background .2s;
        }
        .vc-apply:hover { background: rgba(0,196,106,.18); }
        .vc-lock-btn {
          padding: .5rem 1.1rem; border-radius: 100px;
          background: rgba(201,168,76,.1); border: 1px solid rgba(201,168,76,.25);
          color: var(--gold-l); font-size: .78rem; font-weight: 800;
        }
        .vc-premium-overlay {
          position: absolute; inset: 0; background: rgba(7,11,20,.7);
          backdrop-filter: blur(4px); display: flex; align-items: center;
          justify-content: center; flex-direction: column; gap: .4rem;
        }
        .vc-premium-text { font-size: .82rem; font-weight: 700; color: var(--gold-l); }

        /* ── GUIDE STEPS ── */
        .guide-card {
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: var(--r24); padding: 2rem;
          margin-top: 1.5rem;
        }
        .guide-step-num {
          display: inline-flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, var(--gold-d), var(--gold));
          color: #070B14; font-weight: 800; font-size: .9rem;
          margin-bottom: 1rem;
        }
        .guide-step-title { font-size: 1.2rem; font-weight: 800; margin-bottom: .65rem; }
        .guide-step-body { font-size: .88rem; color: var(--muted); line-height: 1.8; margin-bottom: 1.5rem; }
        .guide-step-dots { display: flex; gap: .4rem; margin-bottom: 1.25rem; }
        .guide-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,.12);
        }
        .guide-dot.active { background: var(--gold); }
        .guide-dot.done { background: var(--green); }
        .guide-nav { display: flex; gap: .75rem; align-items: center; }
        .guide-btn {
          padding: .75rem 1.5rem; border-radius: 100px; font-weight: 700;
          font-size: .88rem;
        }
        .guide-btn.primary {
          background: linear-gradient(135deg, var(--gold-d), var(--gold), var(--gold-l));
          color: #070B14;
        }
        .guide-btn.ghost {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1); color: var(--muted);
        }

        /* ── FOMO UPSELL ── */
        .fomo-banner {
          background: linear-gradient(135deg, rgba(201,168,76,.12), rgba(201,168,76,.05));
          border: 1px solid rgba(201,168,76,.3);
          border-radius: var(--r16); padding: 1.25rem 1.5rem;
          display: flex; align-items: center; gap: 1.25rem;
          flex-wrap: wrap; margin-bottom: 1rem;
        }
        .fomo-text { flex: 1; min-width: 200px; }
        .fomo-title { font-size: .96rem; font-weight: 800; color: var(--text); margin-bottom: .25rem; }
        .fomo-desc { font-size: .8rem; color: var(--muted); line-height: 1.6; }
        .fomo-earn { font-size: .82rem; font-weight: 800; color: var(--green); margin-top: .3rem; }
        .fomo-btn {
          padding: .7rem 1.4rem; border-radius: 100px;
          background: linear-gradient(135deg, var(--gold-d), var(--gold));
          color: #070B14; font-weight: 800; font-size: .84rem; flex-shrink: 0;
        }

        /* ── ENROLLMENT STATUS ── */
        .enroll-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: .85rem; }
        .enroll-tile {
          padding: 1.25rem; border-radius: var(--r16);
          display: flex; flex-direction: column;
        }
        .enroll-tile-label { font-size: .76rem; font-weight: 700; color: var(--muted); margin-bottom: .35rem; }
        .enroll-tile-name { font-size: .95rem; font-weight: 800; }
        .enroll-tile-earn { font-size: .78rem; color: var(--green); font-weight: 700; margin-top: .2rem; }
        .enroll-tile-status {
          margin-top: .85rem; padding: .35rem .75rem; border-radius: 100px;
          font-size: .68rem; font-weight: 800; align-self: flex-start;
          text-transform: uppercase; letter-spacing: .06em;
        }
        .status-unlocked { background: var(--green-bg); color: var(--green); border: 1px solid var(--green-line); }
        .status-locked { background: rgba(255,255,255,.04); color: var(--muted); border: 1px solid rgba(255,255,255,.08); }

        /* ── POINTS HISTORY ── */
        .points-row { display: flex; align-items: center; justify-content: space-between; padding: .55rem 0; border-bottom: 1px solid rgba(255,255,255,.05); font-size: .82rem; }
        .points-row:last-child { border-bottom: none; }
        .pts-plus { color: var(--green); font-weight: 800; }

        /* ── UTIL ── */
        .section-head { margin-bottom: 1.25rem; }
        .section-eyebrow { font-size: .68rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--gold); margin-bottom: .35rem; }
        .section-title { font-size: 1.15rem; font-weight: 800; }
        .section-sub { font-size: .82rem; color: var(--muted); margin-top: .25rem; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 700px) { .two-col { grid-template-columns: 1fr; } }
        .gold-t { background: linear-gradient(120deg, #C9A84C, #F0D684); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .inline-link { color: var(--gold-l); font-weight: 700; text-decoration: underline; cursor: pointer; }
        .tag-pill { display: inline-block; font-size: .65rem; font-weight: 700; padding: .2rem .6rem; border-radius: 100px; background: rgba(255,255,255,.05); color: var(--muted); margin-right: .35rem; }
      `}</style>

      {/* ── MOBILE TOP BAR ── */}
      <div className="db-mobile-bar">
        <div style={{ fontSize: '.88rem', fontWeight: 800, color: 'var(--gold-l)' }}>S2F Dashboard</div>
        <div className="db-mobile-tabs">
          {(['overview','vault','guide','progress'] as const).map(tab => (
            <button key={tab} className={`db-mobile-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="db-shell">

        {/* ── SIDEBAR ── */}
        <aside className="db-sidebar">
          <div className="db-logo">
            <svg className="db-logo-mark" viewBox="0 0 100 100" fill="none">
              <path d="M50 80 C50 80 28 54 19 36 C15 28 14 22 15 18 C19 18 28 20 38 28 C46 35 50 48 50 58 Z" fill="#C9A84C"/>
              <path d="M50 80 C50 80 72 54 81 36 C85 28 86 22 85 18 C81 18 72 20 62 28 C54 35 50 48 50 58 Z" fill="#F0D684"/>
              <path d="M50 0 C51 13 53 21 63 23 C53 25 51 33 50 46 C49 33 47 25 37 23 C47 21 49 13 50 0 Z" fill="#00C46A"/>
            </svg>
            <span className="db-logo-text">SHINE TO FREEDOM</span>
          </div>

          <nav className="db-nav">
            {[
              { id: 'overview', icon: '⊞', label: 'Overview' },
              { id: 'vault', icon: '◈', label: 'Vacancy Vault' },
              { id: 'guide', icon: '▷', label: 'My Training' },
              { id: 'progress', icon: '◎', label: 'My Progress' },
            ].map(({ id, icon, label }) => (
              <button
                key={id}
                className={`db-nav-item ${activeTab === id ? 'active' : ''}`}
                onClick={() => setActiveTab(id as typeof activeTab)}
              >
                <span className="db-nav-icon">{icon}</span>
                {label}
              </button>
            ))}

            <div style={{ height: '1px', background: 'rgba(255,255,255,.06)', margin: '1rem .25rem' }} />

            <a href="/" className="db-nav-item">
              <span className="db-nav-icon">←</span>
              Back to Website
            </a>
            <a href="/auth/signout" className="db-nav-item">
              <span className="db-nav-icon">⊗</span>
              Sign Out
            </a>
          </nav>

          <div className="db-sidebar-footer">
            <div className="db-points-chip">
              <div>
                <div className="db-points-label">Your Points</div>
                <div className="db-points-val">{points.toLocaleString()} pts</div>
              </div>
              <div style={{ fontSize: '.65rem', color: 'var(--muted)', textAlign: 'right' }}>
                Use for<br />bonus content
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="db-main">

          {/* ── TOP BAR ── */}
          <div className="db-topbar">
            <div>
              <div className="db-greeting">Welcome back</div>
              <div className="db-name">
                {userName} <span style={{ color: 'var(--muted)', fontSize: '1rem' }}>·</span>{' '}
                <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--muted)' }}>{userEmail}</span>
              </div>
            </div>
            <div className="db-streak-badge">
              🔥 {streak}-day streak
              {streak >= 7 && <span style={{ color: 'var(--green)', marginLeft: '.35rem' }}>+50 pts bonus!</span>}
            </div>
          </div>

          {/* ══════════ OVERVIEW ══════════ */}
          {activeTab === 'overview' && (
            <>
              {/* 14-DAY CHALLENGE BANNER */}
              <div className="challenge-banner">
                <div>
                  <div className="challenge-label">Active Challenge</div>
                  <div className="challenge-title">Earn $100 in 14 Days</div>
                  <div className="challenge-sub">
                    Day {challengeDaysDone} of 14 — {daysLeft} days left.{' '}
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>
                      You&apos;re {daysLeft <= 3 ? 'almost there!' : `${daysLeft} days away from completing this challenge.`}
                    </span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-bar-bg" style={{ marginTop: '.85rem', maxWidth: '360px' }}>
                      <div className="progress-bar-fill" style={{ width: `${challengePct}%` }} />
                    </div>
                    <div className="progress-label" style={{ maxWidth: '360px' }}>
                      <span>{challengeDaysDone} days consistent</span>
                      <span>{challengePct}% complete</span>
                    </div>
                  </div>
                </div>
                <button className="fomo-btn" onClick={() => setActiveTab('guide')}>
                  Continue →
                </button>
              </div>

              {/* STAT GRID */}
              <div className="db-stat-grid">
                <div className="db-card db-stat">
                  <div className="db-stat-val" style={{ color: 'var(--green)' }}>{doneTasks}/{totalTasks}</div>
                  <div className="db-stat-label">Tasks done today</div>
                  <div className="progress-wrap">
                    <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progressPct}%` }} /></div>
                    <div className="progress-label"><span>Daily progress</span><span>{progressPct}%</span></div>
                  </div>
                  {doneTasks < totalTasks && (
                    <div style={{ fontSize: '.76rem', color: 'var(--gold-l)', marginTop: '.65rem', fontWeight: 700 }}>
                      Only {totalTasks - doneTasks} task{totalTasks - doneTasks !== 1 ? 's' : ''} left today →
                    </div>
                  )}
                  {doneTasks === totalTasks && (
                    <div style={{ fontSize: '.76rem', color: 'var(--green)', marginTop: '.65rem', fontWeight: 700 }}>
                      ✓ All done! +50 bonus points
                    </div>
                  )}
                </div>

                <div className="db-card db-stat">
                  <div className="db-stat-val" style={{ color: 'var(--gold-l)' }}>{points.toLocaleString()}</div>
                  <div className="db-stat-label">Points earned</div>
                  <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: '.5rem' }}>
                    Redeem for bonus content &amp; resources
                  </div>
                </div>

                <div className="db-card db-stat">
                  <div className="db-stat-val" style={{ color: 'var(--text)' }}>
                    {enrolled.length > 0 ? enrolled.length : '0'}
                  </div>
                  <div className="db-stat-label">Packages unlocked</div>
                  {enrolled.length === 0 && (
                    <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: '.5rem' }}>
                      Unlock a package to access training &amp; vacancies
                    </div>
                  )}
                </div>

                <div className="db-card db-stat">
                  <div className="db-stat-val" style={{ color: 'var(--text)' }}>
                    {completedModules.length}
                  </div>
                  <div className="db-stat-label">Training modules complete</div>
                  {completedModules.length > 0 && (
                    <div style={{ fontSize: '.74rem', color: 'var(--green)', marginTop: '.5rem', fontWeight: 700 }}>
                      +100 pts each — keep going
                    </div>
                  )}
                </div>
              </div>

              {/* TODAY'S TASKS */}
              <div className="two-col" style={{ marginBottom: '2rem' }}>
                <div>
                  <div className="section-head">
                    <div className="section-eyebrow">Daily Habits</div>
                    <div className="section-title">Today&apos;s Tasks</div>
                    <div className="section-sub">+10 pts per task · Complete all 5 for a +50 bonus</div>
                  </div>
                  {tasks.map((task) => (
                    <div key={task.id} className={`task-item ${task.done ? 'done' : ''}`} onClick={() => toggleTask(task.id)}>
                      <div className="task-check">
                        {task.done && <span style={{ color: '#fff', fontSize: '.7rem', fontWeight: 800 }}>✓</span>}
                      </div>
                      <span className="task-label">{task.label}</span>
                      <span className="task-pts">+10 pts</span>
                    </div>
                  ))}
                </div>

                {/* ENROLLMENT STATUS */}
                <div>
                  <div className="section-head">
                    <div className="section-eyebrow">My Access</div>
                    <div className="section-title">Packages Unlocked</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                    {(['noskill','transcription','dataentry','va','smm'] as EnrollKey[]).map((key) => {
                      const unlocked = isEnrolled(key)
                      return (
                        <div key={key} className={`db-card enroll-tile ${unlocked ? 'db-card-green' : 'db-card-locked'}`}>
                          <div className="enroll-tile-label">{unlocked ? 'Unlocked' : 'Locked'}</div>
                          <div className="enroll-tile-name">{TIER_LABELS[key]}</div>
                          <div className="enroll-tile-earn">{TIER_EARN[key]}</div>
                          {!unlocked && (
                            <a href={UNLOCK_LINKS[key]} target="_blank" rel="noreferrer"
                               className="enroll-tile-status status-locked"
                               style={{ marginTop: '.75rem', display: 'inline-block' }}>
                              Unlock →
                            </a>
                          )}
                          {unlocked && (
                            <span className="enroll-tile-status status-unlocked">Active</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* POINTS EXPLAINER */}
              <div className="db-card db-card-gold">
                <div className="section-head">
                  <div className="section-eyebrow">Points System</div>
                  <div className="section-title"><span className="gold-t">How to Earn &amp; Use Points</span></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {[
                    ['Complete a daily task', '+10 pts'],
                    ['Finish all 5 daily tasks', '+50 bonus'],
                    ['Complete a training module', '+100 pts'],
                    ['7-day streak', '+50 pts'],
                    ['Refer a new member', '+200 pts'],
                  ].map(([action, pts]) => (
                    <div key={action} className="points-row">
                      <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{action}</span>
                      <span className="pts-plus">{pts}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'rgba(201,168,76,.08)', borderRadius: '10px', padding: '1rem', fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--text)' }}>Redeem points for:</strong> bonus training resources,
                  premium vacancy early access, and exclusive S2F community perks.
                  Points cannot be redeemed for cash or used to unlock paid enrollment packages —
                  they are a loyalty reward, not a currency substitute.
                </div>
              </div>
            </>
          )}

          {/* ══════════ VACANCY VAULT ══════════ */}
          {activeTab === 'vault' && (
            <>
              <div className="section-head">
                <div className="section-eyebrow">Opportunity Vault</div>
                <div className="section-title">Vetted Jobs &amp; Earning Opportunities</div>
                <div className="section-sub">Updated weekly. Foreign-paying roles and local listings — unlock more by enrolling in a package.</div>
              </div>

              {/* PREMIUM SUBSCRIBE BANNER */}
              <div className="fomo-banner" style={{ background: 'linear-gradient(135deg, rgba(201,168,76,.14), rgba(201,168,76,.05))' }}>
                <div className="fomo-text">
                  <div className="fomo-title">⭐ Premium Weekly Drop</div>
                  <div className="fomo-desc">Every week our team researches and verifies the highest-paying, newest remote opportunities across global platforms. Subscribers get first access — before they fill up.</div>
                  <div className="fomo-earn">This week&apos;s drop: 2 roles, $1,500–$3,000/mo potential</div>
                </div>
                <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%27d%20like%20to%20subscribe%20to%20the%20weekly%20premium%20vacancy%20drop." target="_blank" rel="noreferrer" className="fomo-btn">
                  Subscribe →
                </a>
              </div>

              {/* FILTERS */}
              <div className="vacancy-filter-bar">
                {(['all','foreign','local'] as const).map((f) => (
                  <button key={f} className={`vf-btn ${vacancyFilter === f ? 'active' : ''}`} onClick={() => setVacancyFilter(f)}>
                    {f === 'all' ? 'All Roles' : f === 'foreign' ? 'Foreign Paying' : 'Local (Nigeria)'}
                  </button>
                ))}
              </div>

              {/* VACANCY LIST */}
              {filteredVacancies.map((v) => {
                const unlocked = v.category === 'free' || isEnrolled(v.category as string)
                const isPremium = v.premium === true

                return (
                  <div key={v.id} className={`vacancy-card ${!unlocked && !isPremium ? 'locked-card' : ''}`}>
                    {isPremium && (
                      <div className="vc-premium-overlay">
                        <div style={{ fontSize: '1.3rem' }}>⭐</div>
                        <div className="vc-premium-text">Premium Weekly Drop</div>
                        <div style={{ fontSize: '.76rem', color: 'var(--muted)' }}>Subscribe to access</div>
                        <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%27d%20like%20to%20subscribe%20to%20the%20premium%20weekly%20vacancy%20drop." target="_blank" rel="noreferrer" className="fomo-btn" style={{ marginTop: '.5rem', fontSize: '.76rem', padding: '.5rem 1rem' }}>
                          Subscribe
                        </a>
                      </div>
                    )}

                    <div className="vc-head">
                      <div>
                        <div className="vc-title">{v.title}</div>
                        <div className="vc-company">{v.company}</div>
                      </div>
                      <div className="vc-pay">{v.pay}</div>
                    </div>

                    <div className="vc-tags">
                      <span className={`vc-tag ${v.type}`}>{v.type === 'foreign' ? 'Foreign Pay' : 'Local (Nigeria)'}</span>
                      {v.tags.filter(t => t !== 'Foreign Pay' && t !== 'Local (Nigeria)').map(t => (
                        <span key={t} className={`vc-tag ${t === 'Premium' ? 'premium' : ''}`}>{t}</span>
                      ))}
                    </div>

                    <div className="vc-actions">
                      {unlocked ? (
                        <a href={v.apply} target="_blank" rel="noreferrer" className="vc-apply">
                          Apply Now →
                        </a>
                      ) : (
                        <>
                          <a href={UNLOCK_LINKS[v.category as EnrollKey] ?? '#'} target="_blank" rel="noreferrer" className="vc-lock-btn">
                            Unlock {TIER_LABELS[v.category as EnrollKey] ?? 'Package'} to Access →
                          </a>
                        </>
                      )}
                      {!unlocked && v.category !== 'free' && (
                        <div style={{ fontSize: '.74rem', color: 'var(--muted)' }}>
                          Earning potential: <strong style={{ color: 'var(--green)' }}>{TIER_EARN[v.category as EnrollKey]}</strong> after unlocking
                        </div>
                      )}
                    </div>

                    {/* FOMO: if locked, show training guide upsell */}
                    {!unlocked && v.category !== 'free' && !isPremium && (
                      <div style={{ marginTop: '.75rem', padding: '.75rem', background: 'rgba(201,168,76,.06)', borderRadius: '10px', fontSize: '.78rem', color: 'var(--muted)', lineHeight: 1.65 }}>
                        <strong style={{ color: 'var(--gold-l)' }}>Want to earn {v.pay}?</strong> Our{' '}
                        <strong style={{ color: 'var(--text)' }}>{TIER_LABELS[v.category as EnrollKey]} training</strong>{' '}
                        package includes the exact step-by-step guide, the platforms, and the client-finding strategy — so you show up ready, not guessing.{' '}
                        <a href={UNLOCK_LINKS[v.category as EnrollKey] ?? '#'} target="_blank" rel="noreferrer" style={{ color: 'var(--gold-l)', fontWeight: 700, textDecoration: 'underline' }}>
                          Unlock the package →
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* ══════════ TRAINING GUIDE ══════════ */}
          {activeTab === 'guide' && !guideModule && (
            <>
              <div className="section-head">
                <div className="section-eyebrow">My Training</div>
                <div className="section-title">Step-by-Step Earning Guides</div>
                <div className="section-sub">Click a module to open your guided walkthrough — one step at a time, nothing to read all at once.</div>
              </div>

              {(['noskill','transcription','dataentry'] as EnrollKey[]).map((key) => {
                const unlocked = isEnrolled(key)
                const done = completedModules.includes(key)
                const steps = GUIDE_STEPS[key] ?? []

                return (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <div className={`db-card ${!unlocked ? 'db-card-locked' : done ? 'db-card-green' : ''}`}
                         style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', padding: '1.25rem 1.5rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '.72rem', fontWeight: 700, color: unlocked ? (done ? 'var(--green)' : 'var(--gold-l)') : 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.25rem' }}>
                          {done ? '✓ Complete' : unlocked ? 'Ready' : 'Locked'}
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '.2rem' }}>{TIER_LABELS[key]}</div>
                        <div style={{ fontSize: '.8rem', color: 'var(--muted)' }}>{steps.length} steps · Earn up to {TIER_EARN[key]}</div>
                        {done && <div style={{ fontSize: '.78rem', color: 'var(--green)', fontWeight: 700, marginTop: '.3rem' }}>+100 pts earned</div>}
                      </div>

                      {/* Progress dots */}
                      {unlocked && (
                        <div style={{ display: 'flex', gap: '.35rem' }}>
                          {steps.map((_, i) => (
                            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: done ? 'var(--green)' : 'rgba(255,255,255,.12)' }} />
                          ))}
                        </div>
                      )}

                      {unlocked && !done && (
                        <button className="guide-btn primary" onClick={() => { setGuideModule(key); setGuideStepIdx(0) }}>
                          {completedModules.includes(key) ? 'Review Guide' : 'Start Guide →'}
                        </button>
                      )}
                      {done && (
                        <button className="guide-btn ghost" onClick={() => { setGuideModule(key); setGuideStepIdx(0) }}>
                          Review
                        </button>
                      )}
                      {!unlocked && (
                        <a href={UNLOCK_LINKS[key]} target="_blank" rel="noreferrer" className="vc-lock-btn">
                          Unlock to Access
                        </a>
                      )}
                    </div>

                    {/* FOMO upsell if locked */}
                    {!unlocked && (
                      <div className="fomo-banner" style={{ marginTop: '.5rem' }}>
                        <div className="fomo-text">
                          <div className="fomo-title">Don&apos;t try {TIER_LABELS[key]} without this guide</div>
                          <div className="fomo-desc">
                            Most beginners lose time guessing how platforms work. Our training guide covers the exact platforms, application methods, accuracy requirements, and payout setup — everything that matters before you start.
                          </div>
                          <div className="fomo-earn">Members with this guide earn {TIER_EARN[key]} consistently. Without it, most earn a fraction of that in the first 30 days.</div>
                        </div>
                        <a href={UNLOCK_LINKS[key]} target="_blank" rel="noreferrer" className="fomo-btn">
                          Unlock Guide →
                        </a>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* ══════════ GUIDE STEP VIEW ══════════ */}
          {activeTab === 'guide' && guideModule && (
            <>
              <button className="guide-btn ghost" style={{ marginBottom: '1.25rem', fontSize: '.82rem' }} onClick={() => { setGuideModule(null); setGuideStepIdx(0) }}>
                ← Back to Modules
              </button>

              <div className="section-head">
                <div className="section-eyebrow">{TIER_LABELS[guideModule] ?? guideModule} Guide</div>
                <div className="section-title">Step {guideStepIdx + 1} of {(GUIDE_STEPS[guideModule] ?? []).length}</div>
              </div>

              {(() => {
                const steps = GUIDE_STEPS[guideModule] ?? []
                const step = steps[guideStepIdx]
                if (!step) return null
                const isLast = guideStepIdx === steps.length - 1

                return (
                  <div className="guide-card">
                    {/* Dot progress indicator */}
                    <div className="guide-step-dots">
                      {steps.map((_, i) => (
                        <div key={i} className={`guide-dot ${i < guideStepIdx ? 'done' : i === guideStepIdx ? 'active' : ''}`} />
                      ))}
                    </div>

                    <div className="guide-step-num">{step.step}</div>
                    <div className="guide-step-title">{step.title}</div>
                    <div className="guide-step-body">{step.body}</div>

                    <div className="guide-nav">
                      {guideStepIdx > 0 && (
                        <button className="guide-btn ghost" onClick={() => setGuideStepIdx(i => i - 1)}>← Back</button>
                      )}
                      {!isLast && (
                        <button className="guide-btn primary" onClick={() => setGuideStepIdx(i => i + 1)}>
                          {step.action ?? 'Continue →'}
                        </button>
                      )}
                      {isLast && (
                        <button className="guide-btn primary" onClick={() => markGuideComplete(guideModule)}>
                          ✓ Mark Module Complete (+100 pts)
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()}
            </>
          )}

          {/* ══════════ PROGRESS TAB ══════════ */}
          {activeTab === 'progress' && (
            <>
              <div className="section-head">
                <div className="section-eyebrow">My Journey</div>
                <div className="section-title"><span className="gold-t">Progress &amp; Milestones</span></div>
                <div className="section-sub">Every action you take here builds toward a real income milestone. Here&apos;s where you stand.</div>
              </div>

              {/* MILESTONE PROGRESS */}
              {[
                { label: 'First $10 earned', target: 10, current: 3.50, unit: '$', color: 'var(--green)' },
                { label: 'First $50 earned', target: 50, current: 3.50, unit: '$', color: 'var(--gold-l)' },
                { label: 'First $100 earned', target: 100, current: 3.50, unit: '$', color: 'var(--gold-l)' },
                { label: '7-day consistency streak', target: 7, current: streak, unit: 'days', color: 'var(--green)' },
                { label: 'Training modules completed', target: 3, current: completedModules.length, unit: 'of 3', color: 'var(--gold-l)' },
              ].map(({ label, target, current, unit, color }) => {
                const pct = Math.min(100, Math.round((current / target) * 100))
                const remaining = Math.max(0, target - current)
                return (
                  <div key={label} className="db-card" style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.65rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{label}</div>
                        {remaining > 0 && (
                          <div style={{ fontSize: '.76rem', color: 'var(--muted)', marginTop: '.2rem' }}>
                            You&apos;re <strong style={{ color }}>{typeof remaining === 'number' ? (unit === '$' ? `$${remaining.toFixed(2)}` : `${remaining} ${unit}`) : remaining}</strong> away
                          </div>
                        )}
                        {remaining <= 0 && (
                          <div style={{ fontSize: '.76rem', color: 'var(--green)', fontWeight: 700, marginTop: '.2rem' }}>✓ Milestone reached!</div>
                        )}
                      </div>
                      <div style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: '1.1rem', fontWeight: 800, color }}>
                        {pct}%
                      </div>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill gold" style={{ width: `${pct}%`, background: `linear-gradient(90deg, var(--gold-d), ${color})` }} />
                    </div>
                  </div>
                )
              })}

              {/* LEVEL SYSTEM */}
              <div className="db-card db-card-gold" style={{ marginTop: '1.5rem' }}>
                <div className="section-eyebrow" style={{ marginBottom: '.5rem' }}>Your Level</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: '2.5rem', fontWeight: 800, color: 'var(--gold-l)', lineHeight: 1 }}>
                    L{Math.min(5, 1 + completedModules.length)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      {['', 'Beginner', 'Earner', 'Skilled Earner', 'Advanced Earner', 'Freedom Builder'][Math.min(5, 1 + completedModules.length)]}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '.2rem' }}>
                      Complete more training modules to level up
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                  {['L1 Beginner','L2 Earner','L3 Skilled Earner','L4 Advanced Earner','L5 Freedom Builder'].map((lv, i) => {
                    const active = i + 1 <= Math.min(5, 1 + completedModules.length)
                    return (
                      <div key={lv} style={{ padding: '.35rem .75rem', borderRadius: 100, fontSize: '.68rem', fontWeight: 700, background: active ? 'rgba(201,168,76,.15)' : 'rgba(255,255,255,.03)', border: `1px solid ${active ? 'rgba(201,168,76,.3)' : 'rgba(255,255,255,.06)'}`, color: active ? 'var(--gold-l)' : 'var(--muted)' }}>
                        {lv}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* STREAK REWARDS */}
              <div className="db-card" style={{ marginTop: '1rem' }}>
                <div className="section-eyebrow" style={{ marginBottom: '.5rem' }}>Streak Rewards</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: '.65rem' }}>
                  {[
                    { days: 3, reward: '+30 pts', label: '3-Day Streak' },
                    { days: 7, reward: '+50 pts', label: '7-Day Streak' },
                    { days: 14, reward: '+120 pts', label: '14-Day Streak' },
                    { days: 30, reward: 'Premium Drop', label: '30-Day Streak' },
                  ].map(({ days, reward, label }) => {
                    const reached = streak >= days
                    return (
                      <div key={days} style={{ padding: '.85rem', borderRadius: '16px', background: reached ? 'rgba(0,196,106,.08)' : 'rgba(255,255,255,.02)', border: `1px solid ${reached ? 'var(--green-line)' : 'rgba(255,255,255,.06)'}`, textAlign: 'center' }}>
                        <div style={{ fontFamily: "'Geist','Inter',sans-serif", fontSize: '1.4rem', fontWeight: 800, color: reached ? 'var(--green)' : 'var(--muted)', lineHeight: 1 }}>{days}</div>
                        <div style={{ fontSize: '.68rem', color: 'var(--muted)', margin: '.2rem 0' }}>{label}</div>
                        <div style={{ fontSize: '.74rem', fontWeight: 800, color: reached ? 'var(--green)' : 'var(--muted)' }}>{reached ? `✓ ${reward}` : reward}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

        </main>
      </div>
    </>
  )
}