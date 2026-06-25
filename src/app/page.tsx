'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// ─────────────────────────────────────────────────────────────
// LEAD MAGNET DATA
// ─────────────────────────────────────────────────────────────
const leadMagnets: Record<string, { tag: string; title: string; file: string }> = {
  'remote-job-guide': {
    tag: 'Free Guide',
    title: 'The Remote Job Starter Guide',
    file: '01-remote-job-guide.pdf',
  },
  'cv-template': {
    tag: 'Free Template',
    title: 'The Global-Standard CV Template',
    file: '02-cv-template.pdf',
  },
  'wfh-checklist': {
    tag: 'Free Checklist',
    title: 'The Work-From-Home Readiness Checklist',
    file: '03-wfh-checklist.pdf',
  },
  'beginner-training': {
    tag: 'Free Training',
    title: "Your First $50: A Beginner's Training",
    file: '04-beginner-training.pdf',
  },
}

// ─────────────────────────────────────────────────────────────
// MATCH DATA
// ─────────────────────────────────────────────────────────────
const matchData: Record<string, { skills: { name: string; why: string; earn: string }[] }> = {
  creative: {
    skills: [
      { name: 'Graphics Design', why: 'You enjoy creating things — design work rewards a visual eye and turns ideas into income fast.', earn: '$200 – $1,500+/mo' },
      { name: 'Video Editing', why: 'Editing suits people who like shaping raw material into something polished — high demand, growing fast.', earn: '$300 – $2,000+/mo' },
      { name: 'AI Video Creation', why: 'A fast-rising creative skill — combine creativity with AI tools for quick turnaround work.', earn: '$300 – $2,500+/mo' },
    ],
  },
  logic: {
    skills: [
      { name: 'Vibe Coding (Full Stack Web Dev with AI)', why: 'You like systems and problem-solving — this skill is in the highest demand and pays the most.', earn: '$500 – $3,000+/mo' },
      { name: 'AI Automation', why: 'Perfect for organized minds — help businesses automate work using AI tools.', earn: '$400 – $2,500+/mo' },
      { name: 'Data Entry', why: 'A structured, detail-oriented skill that is easy to start and pairs well with our No-Skill Jobs platforms.', earn: '$150 – $350/mo' },
    ],
  },
  people: {
    skills: [
      { name: 'Virtual Assistant', why: 'You enjoy supporting people and managing tasks — VAs are always in demand by busy founders abroad.', earn: '$300 – $1,000+/mo' },
      { name: 'Customer Service', why: 'Great communication skills translate directly into steady remote support roles.', earn: '$250 – $1,000+/mo' },
      { name: 'Social Media Management', why: 'You connect well with people — managing brand voices and communities online comes naturally.', earn: '$300 – $1,200+/mo' },
    ],
  },
  growth: {
    skills: [
      { name: 'Digital Marketing', why: 'You like growing things — every business needs marketing, and skilled marketers are paid well.', earn: '$300 – $2,000+/mo' },
      { name: 'Affiliate Marketing', why: 'Selling and promoting comes naturally to you — start earning commissions with zero inventory.', earn: '$100 – $2,000+/mo' },
      { name: 'Personal Branding', why: 'You think about growth and visibility — building your own brand compounds across everything else you do.', earn: 'Compounds across every skill' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────
// MODULE-LEVEL FUNCTIONS (keep identical logic to v11 script)
// ─────────────────────────────────────────────────────────────
function showView(id: string, scrollServices?: boolean, skipHistory?: boolean) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'))
  const target = document.getElementById('view-' + id)
  if (!target) return
  target.classList.add('active')
  window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  document.querySelectorAll('#view-' + id + ' .sr').forEach((el) => {
    el.classList.remove('vis')
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('vis')))
  })
  if (scrollServices) {
    setTimeout(() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }), 50)
  }
  if (!skipHistory) {
    history.pushState({ view: id }, '', '#' + id)
  }
}

function inquireSkill(name: string) {
  const text = encodeURIComponent(`Hi, I'd like to enroll in ${name}. Please tell me the requirements, what's included, and the price.`)
  window.open(`https://t.me/Shinetofreedomsupport?text=${text}`, '_blank')
}

function revealPricing(id: string) {
  document.getElementById('reveal-' + id)?.classList.add('revealed')
}

function toggleBlog(el: HTMLElement) {
  el.closest('.blog-card')?.classList.add('open')
}

function resetMatch() {
  const quiz = document.getElementById('matchQuiz')
  const result = document.getElementById('matchResult')
  if (quiz) quiz.style.display = 'block'
  if (result) result.style.display = 'none'
}

function matchAnswer(_step: number, value: string) {
  const result = matchData[value]
  if (!result) return
  const quiz = document.getElementById('matchQuiz')
  const resultEl = document.getElementById('matchResult')
  const body = document.getElementById('matchResultBody')
  if (quiz) quiz.style.display = 'none'
  if (body) {
    body.innerHTML = result.skills.map((s) => `
      <div class="match-skill-row">
        <div style="flex:1;">
          <div class="match-skill-name">${s.name}</div>
          <div class="match-skill-why">${s.why}</div>
        </div>
        <div class="match-skill-earn">${s.earn}</div>
      </div>
    `).join('')
  }
  if (resultEl) resultEl.style.display = 'block'
}

function animateCounter(el: Element, target: number, suffix: string) {
  let count = 0
  const step = target / 60
  const t = setInterval(() => {
    count = Math.min(count + step, target)
    el.textContent = Math.floor(count).toLocaleString() + suffix
    if (count >= target) clearInterval(t)
  }, 25)
}

// Expose to window so inline onClick strings work if any remain
if (typeof window !== 'undefined') {
  ;(window as any).showView = showView
  ;(window as any).inquireSkill = inquireSkill
  ;(window as any).revealPricing = revealPricing
  ;(window as any).toggleBlog = toggleBlog
  ;(window as any).resetMatch = resetMatch
  ;(window as any).matchAnswer = matchAnswer
}

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Home() {
  const [lmActiveMagnet, setLmActiveMagnet] = useState<string | null>(null)
  const [lmUnlockedEmail, setLmUnlockedEmail] = useState<string | null>(null)

  function openLeadMagnet(id: string) {
    setLmActiveMagnet(id)
    setLmUnlockedEmail(null)
  }
  function closeLeadMagnet() {
    setLmActiveMagnet(null)
    setLmUnlockedEmail(null)
  }
  async function signInWithGoogleForLeadMagnet() {
    const supabase = createClientComponentClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google Sign-In Error:', error.message);
    }
  }

  useEffect(() => {
    ;(window as any).showView = showView
    ;(window as any).inquireSkill = inquireSkill
    ;(window as any).revealPricing = revealPricing
    ;(window as any).toggleBlog = toggleBlog
    ;(window as any).resetMatch = resetMatch
    ;(window as any).matchAnswer = matchAnswer

    // Scroll reveal
    const srObs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('vis') }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.sr').forEach((el) => srObs.observe(el))

    // Member counter
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animateCounter(e.target, 20000, '+'); counterObs.unobserve(e.target) }
      })
    })
    document.querySelectorAll('#memberCount').forEach((el) => counterObs.observe(el))

    // Header scroll tint
    const handleScroll = () => {
      const h = document.getElementById('mainHeader')
      if (h) h.style.background = window.scrollY > 60 ? 'rgba(7,11,20,.95)' : 'rgba(7,11,20,.75)'
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      const orb = document.querySelector('.glass-orb') as HTMLElement | null
      const grid = document.querySelector('.hero-grid3d') as HTMLElement | null
      if (orb) orb.style.transform = `translate(${x * 30}px, ${y * 30}px)`
      if (grid) grid.style.transform = `translateX(-50%) perspective(600px) rotateX(65deg) translate(${x * -20}px, ${y * -10}px)`
    }
    document.addEventListener('mousemove', handleMouseMove)

    // Back/forward button support
    const handlePopState = (e: PopStateEvent) => {
      const view = (e.state && e.state.view) || 'home'
      showView(view, false, true)
    }
    window.addEventListener('popstate', handlePopState)

    // Sync view to hash on load
    const hash = window.location.hash.replace('#', '')
    if (hash && document.getElementById('view-' + hash)) showView(hash, false, true)

    // Smooth scroll for anchor links
    const anchors = document.querySelectorAll('a[href^="#"]')
    const handleAnchor = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement
      const t = document.querySelector(a.getAttribute('href') || '')
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }) }
    }
    anchors.forEach((a) => a.addEventListener('click', handleAnchor))

    return () => {
      srObs.disconnect()
      counterObs.disconnect()
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('popstate', handlePopState)
      anchors.forEach((a) => a.removeEventListener('click', handleAnchor))
    }
  }, [])

  // ─────────────────────────────────────────────────────────────
  // JSX — mirrors v11 body exactly
  // class → className  |  onclick → onClick  |  for → htmlFor
  // HTML entities kept as-is inside JSX text nodes
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* MESH */}
      <div className="mesh" aria-hidden="true">
        <div className="mesh-orb m1"></div>
        <div className="mesh-orb m2"></div>
        <div className="mesh-orb m3"></div>
      </div>

      {/* HEADER */}
      <header id="mainHeader">
        <div className="nav-logo" onClick={() => showView('home')}>
          <svg viewBox="0 0 100 100" fill="none">
            <path d="M50 80 C50 80 28 54 19 36 C15 28 14 22 15 18 C19 18 28 20 38 28 C46 35 50 48 50 58 Z" fill="#C9A84C" />
            <path d="M50 80 C50 80 72 54 81 36 C85 28 86 22 85 18 C81 18 72 20 62 28 C54 35 50 48 50 58 Z" fill="#F0D684" />
            <path d="M50 0 C51 13 53 21 63 23 C53 25 51 33 50 46 C49 33 47 25 37 23 C47 21 49 13 50 0 Z" fill="#00C46A" />
          </svg>
          <span className="logo-text">SHINE TO FREEDOM</span>
        </div>
        <nav className="nav-links">
          <a onClick={() => showView('beginners')}>Beginners</a>
          <a onClick={() => showView('skills')}>Skills</a>
          <a onClick={() => showView('wealth')}>Wealth</a>
          <a onClick={() => showView('home', true)}>Services</a>
          <a href="https://t.me/Shinetofreedomsupport" target="_blank" rel="noreferrer" className="nav-cta">Talk to Us →</a>
        </nav>
      </header>

      {/* ═══════════════════════════════
          HOME VIEW
      ═══════════════════════════════ */}
      <div className="view active" id="view-home">

        {/* HERO */}
        <section className="hero">
          <div className="hero-grid3d" aria-hidden="true"></div>
          <div className="glass-orb"></div>
          <div className="hero-content">
            <div className="hero-badge"><div className="dot"></div>Africa&apos;s Leading Digital Freedom Platform</div>
            <h1>Freedom Starts<br />With <span className="gold-t">One Opportunity.</span></h1>
            <p className="hero-sub">Join thousands of Africans discovering new ways to <strong>earn, learn, and grow</strong> in the digital economy.</p>
            <div className="proof-strip">
              <div>
                <div className="proof-num" id="memberCount">0+</div>
                <div className="proof-label">Active Community<br />Members Across Africa</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#paths" className="btn-primary">Choose Your Path ↓</a>
              <a href="https://t.me/Shinetofreedomsupport" target="_blank" rel="noreferrer" className="btn-ghost">Talk to Us →</a>
            </div>
          </div>
        </section>

        {/* THREE PATHS */}
        <section className="section path-selector" id="paths">
          <div className="container">
            <div className="sr" style={{ textAlign: 'center' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>Your Journey Starts Here</div>
              <h2 className="title">Three Paths. One Destination.</h2>
              <p className="sub" style={{ margin: '0 auto' }}>Tap a path below for the full breakdown — pricing, what you get, and how to start.</p>
            </div>
            <div className="path-grid sr d1">
              <div className="glass path-tile pt-1" onClick={() => showView('beginners')}>
                <div className="pt-num">01</div>
                <div className="pt-icon icon-g">01</div>
                <h3>Beginners</h3>
                <p>No skill, no experience? Get verified access to global earning platforms that pay daily — guided step by step, with real tasks and real dollars.</p>
                <div className="pt-meta">
                  <span className="pt-tag tag-g">No Experience Needed</span>
                  <span className="pt-tag tag-g">Earn in $ &amp; ₦</span>
                </div>
                <div className="pt-cta">Start Earning Now <span className="pt-cta-arrow">→</span></div>
              </div>
              <div className="glass path-tile pt-2" onClick={() => showView('skills')}>
                <div className="pt-num">02</div>
                <div className="pt-icon icon-y">02</div>
                <h3>Learn &amp; Monetize a Skill</h3>
                <p>Master an in-demand digital skill with practical training, accountability, and direct guidance on how to land paying clients fast.</p>
                <div className="pt-meta">
                  <span className="pt-tag tag-y">12 Skills Available</span>
                  <span className="pt-tag tag-y">Job-Ready Training</span>
                </div>
                <div className="pt-cta">Earn Higher <span className="pt-cta-arrow">→</span></div>
              </div>
              <div className="glass path-tile pt-3" onClick={() => showView('wealth')}>
                <div className="pt-num">03</div>
                <div className="pt-icon icon-p">03</div>
                <h3>Wealth &amp; Investment</h3>
                <p>Put your money to work. From our Forex investment service to our Tipper Business logistics investment — build long-term wealth.</p>
                <div className="pt-meta">
                  <span className="pt-tag tag-p">50% Forex Returns</span>
                  <span className="pt-tag tag-p">Weekly Payouts</span>
                </div>
                <div className="pt-cta">Compound Your Money <span className="pt-cta-arrow">→</span></div>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-rule"></div>

        {/* SERVICES */}
        <section className="section" id="services">
          <div className="container">
            <div className="sr" style={{ textAlign: 'center' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>Additional Services</div>
              <h2 className="title">Look the Part. Get the Job.</h2>
              <p className="sub" style={{ margin: '0 auto' }}>A strong CV and profile makes employers take you seriously. Let us build yours professionally.</p>
            </div>
            <div className="svc-grid">
              <div className="glass svc-card sr d1">
                <div className="svc-icon">CV</div>
                <h3>CV Revamp</h3>
                <p>We upgrade your existing CV to a professional standard that stands out to local and international employers.</p>
                <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20need%20a%20CV%20Revamp" target="_blank" rel="noreferrer" className="btn-wa">Click to Revamp</a>
              </div>
              <div className="glass svc-card sr d2">
                <div className="svc-icon">In</div>
                <h3>LinkedIn &amp; Profile Revamp</h3>
                <p>We professionally optimize your LinkedIn and freelance profiles to attract clients and job opportunities daily.</p>
                <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20need%20a%20LinkedIn%20Profile%20Revamp" target="_blank" rel="noreferrer" className="btn-wa">Click to Revamp</a>
              </div>
              <div className="glass svc-card sr d3">
                <div className="svc-icon">New</div>
                <h3>Fresh CV Creation</h3>
                <p>Starting from scratch? We create a brand-new, professional CV tailored to your skills, goals, and target roles.</p>
                <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20need%20a%20fresh%20CV%20created" target="_blank" rel="noreferrer" className="btn-wa">Click to Get Started</a>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-rule"></div>

        {/* WHY CHOOSE US */}
        <section className="section">
          <div className="container">
            <div className="sr" style={{ textAlign: 'center' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>Why Shine to Freedom</div>
              <h2 className="title">Built on Trust. Proven by Results.</h2>
            </div>
            <div className="why-grid sr d1">
              <div className="glass why-card">
                <div className="why-icon">CAC</div>
                <h4>Officially Registered</h4>
                <p>Shine to Freedom Enterprises is CAC registered (BN 8331508) — a real, accountable business, not an anonymous page.</p>
              </div>
              <div className="glass why-card">
                <div className="why-icon">20K+</div>
                <h4>A Real Community</h4>
                <p>Over 20,000 members across Africa are already learning, earning, and growing with us — and sharing their results daily.</p>
              </div>
              <div className="glass why-card">
                <div className="why-icon">Wk</div>
                <h4>Gigs Updated Weekly</h4>
                <p>New tasks, platforms, and opportunities are added to your dashboard every week — so you&apos;re never working with stale information.</p>
              </div>
              <div className="glass why-card">
                <div className="why-icon">1:1</div>
                <h4>Real People, Real Support</h4>
                <p>Every step of the way, our team is reachable — to guide you, answer questions, and help you get unstuck.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-rule"></div>

        {/* LEAD MAGNET / FREE RESOURCES */}
        <section className="section" id="resources">
          <div className="container">
            <div className="sr" style={{ textAlign: 'center' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>Free Resources</div>
              <h2 className="title">Start With Something Free.</h2>
              <p className="sub" style={{ margin: '0 auto' }}>No payment, no obligation — just sign in with Google to instantly download. These are the same fundamentals our paid members build on.</p>
            </div>
            <div className="leadmagnet-grid sr d1">
              {[
                { id: 'remote-job-guide', tag: 'Free Guide', title: 'The Remote Job Starter Guide', desc: 'Where real remote jobs actually live, the 5 mistakes that get applications ignored, and a 7-day plan to your first application.', meta: '5 pages · PDF' },
                { id: 'cv-template', tag: 'Free Template', title: 'The Global-Standard CV Template', desc: 'An ATS-friendly CV structure built for remote and international applications, plus wording that gets African applicants taken seriously.', meta: '5 pages · PDF' },
                { id: 'wfh-checklist', tag: 'Free Checklist', title: 'The Work-From-Home Readiness Checklist', desc: "Everything to set up technically, financially, and mentally before you start — so avoidable problems don't derail your first weeks.", meta: '4 pages · PDF' },
                { id: 'beginner-training', tag: 'Free Training', title: "Your First $50: A Beginner's Training", desc: 'What online income really looks like week by week, how to choose your first task type, and a realistic path to your first payout.', meta: '5 pages · PDF' },
              ].map((m) => (
                <div key={m.id} className="leadmagnet-card">
                  <div className="lm-tag">{m.tag}</div>
                  <h3>{m.title}</h3>
                  <p>{m.desc}</p>
                  <div className="lm-meta">{m.meta}</div>
                  <button className="lm-unlock-btn" onClick={() => openLeadMagnet(m.id)}>Unlock Free Download</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* LEAD MAGNET MODAL */}
        {lmActiveMagnet && (
          <div className="lm-modal-overlay active" onClick={(e) => { if ((e.target as HTMLElement).classList.contains('lm-modal-overlay')) closeLeadMagnet() }}>
            <div className="lm-modal-card">
              <button className="lm-modal-close" onClick={closeLeadMagnet}>×</button>
              {!lmUnlockedEmail ? (
                <div id="lmModalGate">
                  <div className="lm-modal-badge">{leadMagnets[lmActiveMagnet]?.tag}</div>
                  <h3>{leadMagnets[lmActiveMagnet]?.title}</h3>
                  <p className="lm-modal-desc">Sign in with Google to unlock your free download instantly. No payment, no spam — just the resource.</p>
                  <button className="auth-btn-google" onClick={signInWithGoogleForLeadMagnet}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                  <p className="lm-modal-fineprint">By continuing, you agree to receive occasional updates from Shine To Freedom. Unsubscribe anytime.</p>
                </div>
              ) : (
                <div>
                  <div className="lm-modal-badge" style={{ background: 'rgba(0,196,106,.12)', color: 'var(--green)', borderColor: 'var(--green-line)' }}>Unlocked</div>
                  <h3>You&apos;re In! Your download is ready.</h3>
                  <p className="lm-modal-desc">Signed in as <span style={{ color: 'var(--text)', fontWeight: 700 }}>{lmUnlockedEmail}</span></p>
                  <a href={`/lead-magnets/${leadMagnets[lmActiveMagnet]?.file}`} className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', display: 'flex' }} download>Download PDF Now</a>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="gold-rule"></div>

        {/* TESTIMONIALS */}
        <section className="section">
          <div className="container">
            <div className="sr" style={{ textAlign: 'center' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>Real Members, Real Results</div>
              <h2 className="title">What Our Community Is Saying</h2>
            </div>
            <div className="testimonial-grid sr d1">
              <div className="testimonial-card">
                <div className="t-result">↑ First payout in 2 weeks</div>
                <div className="t-stars">★★★★★</div>
                <p className="t-text">&ldquo;I had zero experience and started with the No-Skill Jobs plan. Within two weeks I had completed my first tasks and gotten paid — it actually works.&rdquo;</p>
                <div className="t-author"><div className="t-avatar">A</div><div><div className="t-name">Amaka O.</div><div className="t-role">No-Skill Jobs member</div></div></div>
              </div>
              <div className="testimonial-card">
                <div className="t-result">↑ Paid for itself in month 1</div>
                <div className="t-stars">★★★★★</div>
                <p className="t-text">&ldquo;The Transcription package paid for itself in the first month. The training was clear and the platforms were exactly as described.&rdquo;</p>
                <div className="t-author"><div className="t-avatar">D</div><div><div className="t-name">David E.</div><div className="t-role">Transcription member</div></div></div>
              </div>
              <div className="testimonial-card">
                <div className="t-result">↑ Connected to real clients</div>
                <div className="t-stars">★★★★★</div>
                <p className="t-text">&ldquo;I already knew graphic design but had no clients. Shine to Freedom connected me to real clients I&apos;d never have found on my own. Game changer.&rdquo;</p>
                <div className="t-author"><div className="t-avatar">C</div><div><div className="t-name">Chioma N.</div><div className="t-role">Skills member</div></div></div>
              </div>
            </div>
          </div>
        </section>

        <div className="gold-rule"></div>

        {/* BLOG */}
        <section className="section" id="blog">
          <div className="container">
            <div className="sr" style={{ textAlign: 'center' }}>
              <div className="eyebrow" style={{ justifyContent: 'center' }}>From Our Team</div>
              <h2 className="title">Insights, Updates &amp; Scam Awareness</h2>
              <p className="sub" style={{ margin: '0 auto' }}>Stay informed — guides, platform updates, and how to protect yourself from scams in the digital income space.</p>
            </div>
            <div className="blog-grid sr d1">

              <div className="glass blog-card">
                <div className="blog-tag">Scam Awareness</div>
                <h4>5 Signs a &ldquo;Work From Home&rdquo; Offer Is a Scam</h4>
                <p>Learn the red flags scammers don&apos;t want you to know — before you hand over any money or personal information.</p>
                <div className="blog-full">
                  <p>Across Africa, thousands of people lose money every month to fake &ldquo;work from home&rdquo; offers. Most of these scams follow a pattern — and once you know it, you&apos;ll never fall for it again.</p>
                  <p><strong style={{ color: 'var(--text)' }}>1. They ask for money before you&apos;ve done any work.</strong> Legitimate platforms pay you for tasks completed — they don&apos;t charge you &ldquo;registration fees&rdquo; with no clear breakdown of what you&apos;re paying for.</p>
                  <p><strong style={{ color: 'var(--text)' }}>2. The income promises sound impossible.</strong> &ldquo;Earn $500 a day with zero effort&rdquo; is a red flag. Real digital income builds gradually — $5 to $20 a day to start is realistic; thousands overnight is not.</p>
                  <p><strong style={{ color: 'var(--text)' }}>3. They rush you to decide.</strong> &ldquo;Only 3 spots left!&rdquo; or countdown timers that reset are pressure tactics designed to stop you from thinking it through.</p>
                  <p><strong style={{ color: 'var(--text)' }}>4. No verifiable company information.</strong> A real business has a registration number, a real address, and people you can actually reach. If everything happens through one anonymous WhatsApp number with no other trace, be cautious.</p>
                  <p><strong style={{ color: 'var(--text)' }}>5. Payment only works one way.</strong> If you can put money in but withdrawals are always &ldquo;delayed&rdquo;, &ldquo;under review&rdquo;, or require yet another fee — that&apos;s the clearest sign of all.</p>
                  <p>At Shine to Freedom, every platform we share is one our own team has used and verified. We&apos;re CAC registered (BN 8331508), and our community of 20,000+ members is proof that what we share works.</p>
                </div>
                <div className="blog-actions">
                  <a href="#" className="svc-link blog-toggle" onClick={(e) => { e.preventDefault(); toggleBlog(e.currentTarget as HTMLElement) }}>Read More →</a>
                  <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%27d%20like%20to%20subscribe%20for%20more%20articles%20and%20updates." target="_blank" rel="noreferrer" className="cta-secondary">Subscribe for more articles</a>
                </div>
              </div>

              <div className="glass blog-card">
                <div className="blog-tag">Platform Update</div>
                <h4>This Week&apos;s New Platforms — What&apos;s Changed</h4>
                <p>A look at the newest additions to your No-Skill Jobs dashboard and what they pay.</p>
                <div className="blog-actions">
                  <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20what%27s%20new%20on%20the%20No-Skill%20Jobs%20dashboard%20this%20week%3F" target="_blank" rel="noreferrer" className="svc-link">Message us to find out →</a>
                </div>
              </div>

              <div className="glass blog-card">
                <div className="blog-tag">Guide</div>
                <h4>From Zero to Your First $100 — A Beginner&apos;s Roadmap</h4>
                <p>A simple, realistic plan for your first month on the platform — what to focus on and what to skip.</p>
                <div className="blog-full">
                  <p><strong style={{ color: 'var(--text)' }}>Week 1: Get set up, don&apos;t get distracted.</strong> Your only goal this week is to register on your 2–3 priority platforms and complete your profile fully. Don&apos;t try everything at once — half-finished signups are the #1 reason beginners give up.</p>
                  <p><strong style={{ color: 'var(--text)' }}>Week 2: Build your task rhythm.</strong> Pick one or two hours a day, same time if possible, and complete as many available tasks as you can in that window. Consistency matters more than long, irregular sessions.</p>
                  <p><strong style={{ color: 'var(--text)' }}>Week 3: Track what&apos;s working.</strong> Some platforms will pay faster or have more available tasks than others. By week 3 you&apos;ll know where your time is best spent — lean into that.</p>
                  <p><strong style={{ color: 'var(--text)' }}>Week 4: Your first withdrawal.</strong> Most members reach their first $20–$50 by the end of week 4 on No-Skill Jobs alone. If you added Transcription or Data Entry training, this number is often higher.</p>
                  <p>From here, the path to $100/month and beyond is mostly about repetition and adding a second income stream — which is exactly what our Full Beginner Package and Skills programs are designed for.</p>
                </div>
                <div className="blog-actions">
                  <a href="#" className="svc-link blog-toggle" onClick={(e) => { e.preventDefault(); toggleBlog(e.currentTarget as HTMLElement) }}>Read More →</a>
                  <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%27d%20like%20to%20subscribe%20for%20more%20articles%20and%20updates." target="_blank" rel="noreferrer" className="cta-secondary">Subscribe for more articles</a>
                </div>
              </div>

            </div>
          </div>
        </section>

        <div className="gold-rule"></div>

        {/* FREE COMMUNITY */}
        <section className="section">
          <div className="container" style={{ textAlign: 'center' }}>
            <div className="sr">
              <div className="eyebrow" style={{ justifyContent: 'center' }}>Free Community</div>
              <h2 className="title">Join Free. No Payment. Just Tap.</h2>
              <p className="sub" style={{ margin: '.4rem auto 2rem' }}>20,000+ members already inside. Daily alerts. Free guidance.</p>
              <a href="https://chat.whatsapp.com/EgEH5ESXg5WIyjkc8a1JNV?s=cl&p=i&ilr=2&amv=1" target="_blank" rel="noreferrer" className="btn-wa" style={{ fontSize: '1.05rem', padding: '1.05rem 2.4rem' }}>
                Join Our Free WhatsApp Community
              </a>
            </div>
          </div>
        </section>

      </div>{/* end view-home */}


      {/* ═══════════════════════════════
          BEGINNERS VIEW
      ═══════════════════════════════ */}
      <div className="view" id="view-beginners">
        <section className="detail-hero">
          <div className="container">
            <div className="back-link sr" onClick={() => showView('home')}>← Back to all paths</div>
            <div className="detail-badge sr" style={{ background: 'var(--green-bg)', border: '1px solid var(--green-line)', color: 'var(--green)' }}>Path 01 — Beginners</div>
            <h1 className="sr d1">Start Earning.<br /><span className="gold-t">No Experience Needed.</span></h1>
            <p className="sub sr d2">Access verified global platforms that pay real money in Naira and Dollars. Pick a plan, get trained, and start completing tasks — most members earn within their first week.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container">
            <div className="tier-grid sr">

              {/* NO-SKILL JOBS */}
              <div className="glass tier-card">
                <div className="tier-tag" style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-line)' }}>Platform Access</div>
                <h3>No-Skill Jobs</h3>
                <div className="tier-figure">Earn $0.15 – $1.20 per task</div>
                <p>Unlock real platforms, real tasks, real pay. No skill needed — just sign up and start.</p>
                <ul className="tier-list">
                  <li>Access to SproutGigs, Toloka AI, Microworkers &amp; more</li>
                  <li>See live tasks and exact dollar pay per task</li>
                  <li>Step-by-step platform sign-up guidance</li>
                  <li>Community + mentor support to keep you earning</li>
                  <li>Daily new task alerts in our guidance group</li>
                </ul>
                <div className="reveal-box" id="reveal-noskill">
                  <button className="btn-green tier-cta reveal-btn" onClick={() => revealPricing('noskill')}>Click to Enroll</button>
                  <div className="reveal-content">
                    <div className="price-row" style={{ marginBottom: '.75rem' }}>
                      <div className="tier-price">$10</div>
                      <div className="tier-price-ngn">/ ₦10,000 — one-time</div>
                    </div>
                    <div className="cta-pair">
                      <a href="https://paystack.shop/pay/noskilljob" target="_blank" rel="noreferrer" className="btn-green tier-cta">Unlock No-Skill Jobs — $10</a>
                      <a href="https://t.me/Shinetofreedomsupport" target="_blank" rel="noreferrer" className="cta-secondary">Message us about this first</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* TRANSCRIPTION */}
              <div className="glass tier-card">
                <div className="tier-tag" style={{ background: 'rgba(201,168,76,.12)', color: 'var(--gold-l)', border: '1px solid rgba(201,168,76,.25)' }}>Skill + Platforms</div>
                <h3>Transcription</h3>
                <div className="tier-figure">Earn $200 – $400/month</div>
                <p>Learn transcription from scratch — turn audio into income. Includes everything in No-Skill Jobs Access.</p>
                <ul className="tier-list">
                  <li>Full transcription training — beginner friendly</li>
                  <li>How to land transcription gigs as a complete beginner</li>
                  <li>✦ Includes all 10 earning platforms (No-Skill Jobs)</li>
                  <li>Earn $200–$400/month with consistent practice</li>
                  <li>Community support &amp; daily guidance</li>
                </ul>
                <div className="reveal-box" id="reveal-transcription">
                  <button className="btn-green tier-cta reveal-btn" onClick={() => revealPricing('transcription')}>Click to Enroll</button>
                  <div className="reveal-content">
                    <div className="price-row" style={{ marginBottom: '.75rem' }}>
                      <div className="tier-price">$15</div>
                      <div className="tier-price-ngn">/ ₦15,000 — one-time</div>
                    </div>
                    <div className="cta-pair">
                      <a href="https://paystack.shop/pay/transcriptionstarter" target="_blank" rel="noreferrer" className="btn-green tier-cta">Start Transcribing — $15</a>
                      <a href="https://t.me/Shinetofreedomsupport" target="_blank" rel="noreferrer" className="cta-secondary">I&apos;m interested — message us</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* DATA ENTRY */}
              <div className="glass tier-card">
                <div className="tier-tag" style={{ background: 'rgba(91,159,255,.12)', color: 'var(--blue)', border: '1px solid rgba(91,159,255,.25)' }}>Skill + Platforms</div>
                <h3>Data Entry</h3>
                <div className="tier-figure">Earn $150 – $350/month</div>
                <p>Learn data entry the right way — and exactly how to use it to earn on global platforms. Includes No-Skill Jobs Access.</p>
                <ul className="tier-list">
                  <li>Full data entry training — beginner friendly</li>
                  <li>How to land data entry gigs without experience</li>
                  <li>✦ Includes all 10 earning platforms (No-Skill Jobs)</li>
                  <li>Apply your skill on complete-task-and-earn platforms</li>
                  <li>Community support &amp; daily guidance</li>
                </ul>
                <div className="reveal-box" id="reveal-dataentry">
                  <button className="btn-green tier-cta reveal-btn" onClick={() => revealPricing('dataentry')}>Click to Enroll</button>
                  <div className="reveal-content">
                    <div className="price-row" style={{ marginBottom: '.75rem' }}>
                      <div className="tier-price">$15</div>
                      <div className="tier-price-ngn">/ ₦15,000 — one-time</div>
                    </div>
                    <div className="cta-pair">
                      <a href="https://paystack.shop/pay/dataentrystarter" target="_blank" rel="noreferrer" className="btn-green tier-cta">Start Earning — $15</a>
                      <a href="https://t.me/Shinetofreedomsupport" target="_blank" rel="noreferrer" className="cta-secondary">I&apos;m interested — message us</a>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* FULL PACKAGE */}
            <div className="glass tier-card featured sr d2" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'center' }}>
              <div>
                <div className="tier-tag" style={{ background: 'linear-gradient(135deg,var(--gold-d),var(--gold))', color: 'var(--navy)' }}>Best Value — Full Beginner Package</div>
                <h3 style={{ fontSize: '1.5rem' }}>Everything. One Package.</h3>
                <div className="tier-figure">Earn up to $400/month combined</div>
                <p style={{ marginBottom: '1rem' }}>Get trained in <strong style={{ color: 'var(--text)' }}>both Transcription and Data Entry</strong>, plus full access to your No-Skill Jobs — including how to use these skills to land jobs on complete-task-and-earn platforms that pay internationally.</p>
                <ul className="tier-list" style={{ marginBottom: 0 }}>
                  <li>Transcription training — full course</li>
                  <li>Data entry training — full course</li>
                  <li>All 10 earning platforms unlocked (No-Skill Jobs)</li>
                  <li>How to land remote client work using these skills</li>
                  <li>Priority community access + mentor support</li>
                  <li>Daily job &amp; gig alerts</li>
                </ul>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="reveal-box" id="reveal-fullpackage">
                  <button className="btn-primary tier-cta reveal-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => revealPricing('fullpackage')}>Click to Enroll</button>
                  <div className="reveal-content">
                    <div className="tier-price" style={{ fontSize: '3.4rem' }}>$25</div>
                    <div className="tier-price-ngn" style={{ marginBottom: '1.25rem' }}>/ ₦25,000 — one-time</div>
                    <div className="cta-pair">
                      <a href="https://paystack.shop/pay/fullstarter" target="_blank" rel="noreferrer" className="btn-primary tier-cta" style={{ width: '100%', justifyContent: 'center' }}>Get Full Package — $25</a>
                      <a href="https://t.me/Shinetofreedomsupport" target="_blank" rel="noreferrer" className="cta-secondary">I&apos;m interested — message us</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NO-SKILL JOBS DASHBOARD PREVIEW */}
            <div className="glass earn-dash sr d3">
              <div className="earn-dash-head">
                <div>
                  <h3>A Peek Inside Your No-Skill Jobs</h3>
                  <p>Real platforms. Real tasks. Real pay — shown exactly as you&apos;ll see them after unlocking access.</p>
                </div>
                <div className="locked-pill">Unlock with any plan above</div>
              </div>
              <div className="platform-grid">
                {[
                  { name: 'SproutGigs', badge: 'Active', high: false, tasks: [['Follow & review a brand page','$0.40'],['Test a mobile app (10 mins)','$1.20'],['Share a post to your status','$0.25']] },
                  { name: 'Toloka AI', badge: 'Active', high: false, tasks: [['Image labeling (per batch)','$0.80'],['Audio transcription (1 min)','$0.35'],['AI response review','$0.60']] },
                  { name: 'Microworkers', badge: 'Active', high: false, tasks: [['Sign up & verify account','$0.50'],['Search & click task','$0.15'],['Write a short product review','$1.00']] },
                ].map((p) => (
                  <div key={p.name} className="platform-card">
                    <div className="pc-head"><span className="pc-name">{p.name}</span><span className="pc-badge">{p.badge}</span></div>
                    <div className="pc-tasks">
                      {p.tasks.map(([t, pay]) => (
                        <div key={t} className="pc-task"><span className="pc-task-name">{t}</span><span className="pc-task-pay">{pay}</span></div>
                      ))}
                    </div>
                  </div>
                ))}
                {[
                  { name: 'OneForma', label: '+ 6 more high-pay platforms inside', tasks: [['Search evaluation tasks','$3–$8'],['Map & location verification','$2–$5'],['Voice recording projects','$5–$15']] },
                  { name: 'Platform #5', label: 'Unlock to reveal', tasks: [['Daily survey tasks','$1–$4'],['Content moderation','$2–$6'],['Translation micro-tasks','$3–$7']] },
                  { name: 'Platform #6', label: 'Unlock to reveal', tasks: [['Weekly bonus tasks','$5+'],['Referral earnings','$2 each'],['Premium task batches','$10+']] },
                ].map((p) => (
                  <div key={p.name} className="platform-card locked" style={{ position: 'relative' }}>
                    <div className="pc-head"><span className="pc-name">{p.name}</span><span className="pc-badge high">Higher Pay</span></div>
                    <div className="pc-tasks">
                      {p.tasks.map(([t, pay]) => (
                        <div key={t} className="pc-task"><span className="pc-task-name">{t}</span><span className="pc-task-pay">{pay}</span></div>
                      ))}
                    </div>
                    <div className="pc-lock-overlay">
                      <div className="pc-lock-icon">LOCKED</div>
                      <div className="pc-lock-text">{p.label}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
                <div className="cta-pair" style={{ maxWidth: '420px', margin: '0 auto' }}>
                  <a href="https://paystack.shop/pay/noskilljob" target="_blank" rel="noreferrer" className="btn-primary">Unlock My No-Skill Jobs — $10</a>
                  <a href="https://t.me/Shinetofreedomsupport" target="_blank" rel="noreferrer" className="cta-secondary">Message us for details first</a>
                </div>
              </div>

              <div className="glass payment-card sr d2" style={{ marginTop: '3rem' }}>
                <h3>Quick Links to Get Started</h3>
                <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>Tap any plan below to pay instantly and unlock — or message our team on Telegram first if you have questions.</p>
                <div className="payment-links">
                  <a href="https://paystack.shop/pay/noskilljob" target="_blank" rel="noreferrer" className="pay-link">No-Skill Jobs <span>$10 / ₦10,000</span></a>
                  <a href="https://paystack.shop/pay/transcriptionstarter" target="_blank" rel="noreferrer" className="pay-link">Transcription <span>$15 / ₦15,000</span></a>
                  <a href="https://paystack.shop/pay/dataentrystarter" target="_blank" rel="noreferrer" className="pay-link">Data Entry <span>$15 / ₦15,000</span></a>
                  <a href="https://paystack.shop/pay/fullstarter" target="_blank" rel="noreferrer" className="pay-link featured">Full Package <span>$25 / ₦25,000</span></a>
                </div>
                <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--green-bg)', border: '1px solid var(--green-line)', borderRadius: 'var(--r16)', fontSize: '.83rem', color: 'var(--muted)' }}>
                  Paying in a currency other than Naira, or have questions before you pay? Message us on <a href="https://t.me/Shinetofreedomsupport" target="_blank" rel="noreferrer" style={{ color: 'var(--text)', fontWeight: 700 }}>Telegram</a> — we&apos;ll guide you through it.
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>{/* end view-beginners */}


      {/* ═══════════════════════════════
          SKILLS VIEW
      ═══════════════════════════════ */}
      <div className="view" id="view-skills">
        <section className="detail-hero">
          <div className="container">
            <div className="back-link sr" onClick={() => showView('home')}>← Back to all paths</div>
            <div className="detail-badge sr" style={{ background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.25)', color: 'var(--gold-l)' }}>Path 02 — Learn &amp; Monetize a Skill</div>
            <h1 className="sr d1">Build a Skill That<br /><span className="gold-t">Can Pay You for Years.</span></h1>
            <p className="sub sr d2">We train you, hold you accountable, and connect you to real clients — not the overcrowded platforms where beginners get lost. Every skill comes with a guide, community, and job-finding tips.</p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container">
            <div className="sr">
              <div className="eyebrow">In Every Skill Package</div>
              <h2 className="title" style={{ fontSize: '1.9rem' }}>What You Get When You Enroll</h2>
            </div>
            <div className="included-grid sr d1">
              {[['01','Full Training Guide','Step-by-step learning material designed for absolute beginners — no prior experience assumed.'],['02','Community Accountability','Join others learning the same skill. Practical sessions, feedback, and motivation to keep going.'],['03','Where to Find Jobs','Direct guidance on where to find clients, how to market yourself, and how to price your work.'],['04','Income Strategy','Practical tips on turning your new skill into consistent monthly income — not just a certificate.']].map(([num, title, body]) => (
                <div key={num} className="glass inc-card">
                  <div className="inc-icon">{num}</div>
                  <h4>{title}</h4>
                  <p>{body}</p>
                </div>
              ))}
            </div>

            {/* SKILL MATCH TEASER */}
            <div className="glass sr d2" style={{ marginTop: '3.5rem', padding: '2.5rem', borderColor: 'rgba(0,196,106,.25)', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div className="eyebrow" style={{ color: 'var(--green)' }}>Not Sure Which Skill Fits You?</div>
                <h2 className="title" style={{ fontSize: '1.9rem' }}>Take Our Free Skill Match</h2>
                <p className="sub" style={{ marginBottom: 0, maxWidth: '560px' }}>Answer a few quick questions and our system will recommend the skills that fit you best — with the reasons why, and what you could realistically earn from each one.</p>
              </div>
              <button className="btn-primary" onClick={() => showView('skillmatch')} style={{ flexShrink: 0 }}>Take the Free Skill Match</button>
            </div>

            {/* FIXED PRICE SKILLS */}
            <div className="sr d2" style={{ marginTop: '3.5rem' }}>
              <div className="eyebrow">Fixed-Price Trainings</div>
              <h2 className="title" style={{ fontSize: '1.9rem' }}>Two Skills, Set Pricing</h2>
              <p className="sub">These two trainings have a fixed enrollment fee — everything else, message us for full details.</p>
            </div>
            <div className="tier-grid sr d3" style={{ gridTemplateColumns: 'repeat(2,1fr)', maxWidth: '760px' }}>
              <div className="glass tier-card">
                <div className="tier-tag" style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-line)' }}>Fixed Price</div>
                <h3>Virtual Assistant Training</h3>
                <div className="price-row"><div className="tier-price">$35</div><div className="tier-price-ngn">/ ₦35,000</div></div>
                <p>Become a remote VA — manage inboxes, schedules, and admin tasks for international clients.</p>
                <ul className="tier-list">
                  <li>Full VA training guide &amp; templates</li>
                  <li>Community accountability &amp; practicals</li>
                  <li>Where to find VA clients &amp; how to pitch</li>
                </ul>
                <div className="cta-pair">
                  <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%27m%20interested%20in%20Virtual%20Assistant%20Training%20(%2435%2F%E2%82%A635%2C000)." target="_blank" rel="noreferrer" className="btn-green tier-cta">Earn Higher — Enroll Now ($35)</a>
                </div>
              </div>
              <div className="glass tier-card">
                <div className="tier-tag" style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-line)' }}>Fixed Price</div>
                <h3>Social Media Management</h3>
                <div className="price-row"><div className="tier-price">$35</div><div className="tier-price-ngn">/ ₦35,000</div></div>
                <p>Learn to manage and grow social media accounts for brands and businesses — and get paid monthly.</p>
                <ul className="tier-list">
                  <li>Full SMM training guide &amp; content calendars</li>
                  <li>Community accountability &amp; practicals</li>
                  <li>Where to find clients &amp; how to pitch</li>
                </ul>
                <div className="cta-pair">
                  <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%27m%20interested%20in%20Social%20Media%20Management%20Training%20(%2435%2F%E2%82%A635%2C000)." target="_blank" rel="noreferrer" className="btn-green tier-cta">Earn Higher — Enroll Now ($35)</a>
                </div>
              </div>
            </div>

            {/* MORE SKILLS */}
            <div className="sr d1" style={{ marginTop: '3.5rem' }}>
              <div className="eyebrow">More Skills</div>
              <h2 className="title" style={{ fontSize: '1.9rem' }}>Message Us to Enroll</h2>
              <p className="sub">For every skill below, message our team — we&apos;ll explain requirements, what&apos;s included, and the current price.</p>
            </div>
            <div className="skill-grid sr d2">
              {[
                ['GD','Graphics Design','Logos, brand visuals & social graphics','Graphics Design'],
                ['CW','Content Writing','Blogs, emails & social content','Content Writing'],
                ['VE','Video Editing','Edit for creators, brands & businesses','Video Editing'],
                ['AI','AI Automation','Automate tasks & sell AI services','AI Automation Training'],
                ['DM','Digital Marketing','Run ads & grow brands online','Digital Marketing'],
                ['CS','Customer Service','Remote support for global businesses','Customer Service'],
                ['AM','Affiliate Marketing','Earn commissions promoting products','Affiliate Marketing'],
                ['PB','Personal Branding','Build a brand that attracts clients','Personal Branding'],
                ['AV','AI Video Creation','Create videos using AI tools','AI Video Creation'],
              ].map(([code, name, desc, skill]) => (
                <div key={code} className="glass skill-card" onClick={() => inquireSkill(skill)}>
                  <div className="skill-icon">{code}</div>
                  <h4>{name}</h4>
                  <p>{desc}</p>
                  <div className="skill-dm-tag">Message to Enroll</div>
                </div>
              ))}
              <div className="glass skill-card" onClick={() => inquireSkill('Vibe Coding: Full Stack Web Development with AI')} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '.85rem', right: '.85rem', background: 'linear-gradient(135deg,var(--green-d),var(--green))', color: '#04140C', fontSize: '.6rem', fontWeight: 800, padding: '.15rem .5rem', borderRadius: '100px' }}>HOT</div>
                <div className="skill-icon">VC</div>
                <h4>Vibe Coding</h4>
                <p>Full Stack Web Development with AI</p>
                <div className="skill-dm-tag">Message to Enroll</div>
              </div>
            </div>

            <p className="sr d3" style={{ marginTop: '1.5rem', fontSize: '.85rem', color: 'var(--muted)' }}>
              Don&apos;t see a skill you&apos;re interested in?{' '}
              <a href="mailto:support@shine2freedom.com" style={{ color: 'var(--gold-l)', fontWeight: 700 }}>Email us</a>{' '}
              or{' '}
              <a href="https://t.me/Shinetofreedomsupport" target="_blank" rel="noreferrer" style={{ color: 'var(--green)', fontWeight: 700 }}>message us</a>{' '}
              — we&apos;ll guide you on what&apos;s possible.
            </p>

            {/* ALREADY HAVE A SKILL */}
            <div className="glass sr d2" style={{ marginTop: '1.5rem', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', borderColor: 'rgba(0,196,106,.2)' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '.3rem' }}>Already Have a Skill?</h3>
                <p style={{ fontSize: '.83rem', color: 'var(--muted)' }}>If you&apos;ve learnt a skill before — anywhere — we can help you start earning from it. We connect you to the right places to earn, teach you different ways to monetize what you already know, and put you in front of the big-fish clients other platforms keep out of reach.</p>
              </div>
              <button className="btn-green" onClick={() => window.open('https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20already%20have%20a%20skill%20and%20want%20help%20earning%20from%20it.', '_blank')}>Earn Higher From What You Know</button>
            </div>

            {/* MASTERCLASS */}
            <div className="glass sr d2" style={{ marginTop: '3.5rem', padding: '2.5rem', display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem', alignItems: 'center', borderColor: 'rgba(139,107,224,.3)' }}>
              <div>
                <div className="tier-tag" style={{ background: 'linear-gradient(135deg,#5B3EB0,#8B6BE0)', color: '#fff' }}>Elite Program</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '.6rem' }}>Full Masterclass &amp; Experience Package</h3>
                <p style={{ fontSize: '.87rem', color: 'var(--muted)', lineHeight: 1.75, marginBottom: '1rem' }}>The ultimate transformation. Includes full skill training, a practical internship, real-time job vacancies (remote &amp; office roles), our client connection group, and advanced sales training — everything you need to go from learning to earning.</p>
                <ul className="tier-list" style={{ marginBottom: 0 }}>
                  <li>Full skill training in your chosen skill</li>
                  <li>Practical internship &amp; hands-on experience</li>
                  <li>Real-time job vacancies — remote &amp; office</li>
                  <li>Client connection group access</li>
                  <li>Advanced sales training</li>
                  <li>Guidance on multiple income streams from your skill</li>
                </ul>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '.4rem', color: 'var(--text)' }}>Price on Inquiry</div>
                <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>We&apos;ll share the current price and full breakdown when you message us.</p>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.open('https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20want%20to%20inquire%20about%20the%20Full%20Masterclass%20%26%20Experience%20Package.', '_blank')}>
                  Earn Higher — Ask About the Masterclass
                </button>
              </div>
            </div>

            {/* CLIENT CONNECTION */}
            <div className="glass sr d3" style={{ marginTop: '1.5rem', padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '.3rem' }}>Client Connection Group — Standalone Access</h3>
                <p style={{ fontSize: '.83rem', color: 'var(--muted)' }}>Already skilled? Register separately for our client connection group — daily tips, real-time vacancies, and direct leads. (Included free in the Full Masterclass Package.)</p>
              </div>
              <button className="btn-green" onClick={() => window.open('https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20want%20to%20register%20for%20the%20Client%20Connection%20Group.', '_blank')}>Ask About Pricing</button>
            </div>

          </div>
        </section>
      </div>{/* end view-skills */}


      {/* ═══════════════════════════════
          SKILL MATCH VIEW
      ═══════════════════════════════ */}
      <div className="view" id="view-skillmatch">
        <section className="detail-hero">
          <div className="container">
            <div className="back-link sr" onClick={() => showView('skills')}>← Back to Skills</div>
            <div className="detail-badge sr" style={{ background: 'var(--green-bg)', border: '1px solid var(--green-line)', color: 'var(--green)' }}>Free Skill Match</div>
            <h1 className="sr d1">Find the Skill<br /><span className="gold-t">Built for You.</span></h1>
            <p className="sub sr d2">Answer one quick question and our system will recommend the skills that fit you best — with the reasons why, and what you could realistically earn from each one.</p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container">
            <div className="glass sr" style={{ padding: '2.5rem', borderColor: 'rgba(0,196,106,.25)' }}>
              <div className="match-flow">
                {['Take the Match','Get Your Skill','Get Trained','Get Connected','Practical & Internship'].map((label, i) => (
                  <>
                    <div key={label} className="match-step">
                      <div className="match-step-num">{i + 1}</div>
                      <div className="match-step-label">{label}</div>
                    </div>
                    {i < 4 && <div key={`arrow-${i}`} className="match-arrow">→</div>}
                  </>
                ))}
              </div>
              <div id="matchQuiz">
                <p className="match-question">What kind of work feels most natural to you?</p>
                <div className="match-opts">
                  <button onClick={() => matchAnswer(1, 'creative')}>Creating things — visuals, videos, writing</button>
                  <button onClick={() => matchAnswer(1, 'logic')}>Solving problems, organizing, working with systems</button>
                  <button onClick={() => matchAnswer(1, 'people')}>Talking to people, managing relationships</button>
                  <button onClick={() => matchAnswer(1, 'growth')}>Selling, marketing, growing something</button>
                </div>
              </div>
              <div id="matchResult" style={{ display: 'none' }}>
                <div className="match-result-card">
                  <div className="eyebrow" style={{ color: 'var(--green)' }}>Your Best-Fit Skills</div>
                  <div id="matchResultBody"></div>
                  <p style={{ fontSize: '.85rem', color: 'var(--muted)', margin: '1.25rem 0 1.5rem' }}>Ready to turn this into income? We&apos;ll get you trained, connect you to places to earn with this skill, and teach you the different ways to monetize it.</p>
                  <button className="btn-primary" onClick={() => window.open('https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%20just%20took%20the%20Skill%20Match%20and%20want%20to%20start%20training.', '_blank')}>Start My Training Now</button>
                  <button className="cta-secondary" onClick={resetMatch} style={{ marginTop: '.75rem' }}>Take the match again</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>{/* end view-skillmatch */}


      {/* ═══════════════════════════════
          WEALTH VIEW
      ═══════════════════════════════ */}
      <div className="view" id="view-wealth">
        <section className="detail-hero">
          <div className="container">
            <div className="back-link sr" onClick={() => showView('home')}>← Back to all paths</div>
            <div className="detail-badge sr" style={{ background: 'rgba(139,107,224,.12)', border: '1px solid rgba(139,107,224,.25)', color: '#B49EEA' }}>Path 03 — Wealth &amp; Investment</div>
            <h1 className="sr d1">Stop Saving.<br /><span className="gold-t">Start Compounding.</span></h1>
            <p className="sub sr d2">Your money should work as hard as you do. From our Forex investment service to our Tipper Business logistics investment — we manage where your money goes and how it grows.</p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container">

            <div className="invest-grid sr">
              {[
                { ic: 'Fx', title: 'Forex Investment', body: <>Put your money into our managed Forex portfolio and earn <strong style={{ color: 'var(--gold-l)' }}>50% returns</strong> on your investment — fully managed by our team.</>, ret: '50% Returns', msg: 'Forex+Investment+option+under+Wealth+%26+Investment' },
                { ic: 'St', title: 'Stocks', body: 'Build a diversified portfolio across Nigerian and global markets, managed for steady growth.', ret: '15–40% Annual', msg: 'Stocks+Investment+option+under+Wealth+%26+Investment' },
                { ic: 'Re', title: 'Physical Assets', body: 'Land, property, and equipment. Income-generating assets that grow in value over time.', ret: 'Long-Term Growth', msg: 'Physical+Assets+Investment+option+under+Wealth+%26+Investment' },
              ].map((c) => (
                <div key={c.ic} className="glass invest-card">
                  <div className="ic">{c.ic}</div>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                  <div className="invest-ret">{c.ret}</div>
                  <div className="invest-cta" onClick={() => window.open(`https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%27m%20interested%20in%20the%20${c.msg}.%20Please%20tell%20me%20more.`, '_blank')}>Compound Your Money — Message Us</div>
                </div>
              ))}
            </div>

            {/* TRUST SECTION */}
            <div className="glass trust-section sr d2" style={{ marginTop: '3rem', padding: '2.75rem' }}>
              <div className="eyebrow" style={{ color: 'var(--gold-l)' }}>Before You Invest</div>
              <h2 className="title" style={{ fontSize: '1.9rem' }}>Why Should You Trust These Opportunities?</h2>
              <p className="sub" style={{ marginBottom: '2rem', maxWidth: '680px' }}>You shouldn&apos;t trust any investment simply because someone promises returns. Here&apos;s exactly how we think about it — and how we expect you to think about it too.</p>
              <div className="trust-intro">
                <div className="trust-q-num" style={{ marginBottom: '1rem' }}>01</div>
                <p>At Shine To Freedom, we believe opportunities should be evaluated on transparency, risk management, and long-term sustainability — not hype.</p>
                <p>Every opportunity shared through our investment pathway is reviewed based on factors such as business model viability, capital preservation, historical performance where available, and risk exposure. We prioritize education and informed decision-making, helping members understand both the opportunities and the risks involved.</p>
                <p>Our goal is not to convince people to invest blindly. Our goal is to help people make smarter financial decisions with access to research, guidance, and a community focused on responsible wealth creation.</p>
                <p style={{ color: 'var(--gold-l)', fontWeight: 700 }}>Financial freedom is built through knowledge, discipline, and sound opportunities — not shortcuts.</p>
              </div>
              <div className="trust-grid">
                {[
                  { num: '02', q: 'How are they evaluated?', a: "Each opportunity goes through a structured review covering four areas: business model viability (does the underlying activity actually generate the returns it claims to?), capital preservation (what happens to your principal if conditions change?), historical performance where verifiable data exists, and overall risk exposure relative to the return offered. Opportunities that can't be reasonably explained in plain terms don't make it onto the platform." },
                  { num: '03', q: 'Who evaluates them?', a: 'Every opportunity presented within our investment pathway undergoes an evaluation process led by our dedicated investment research team, who oversee investment research and opportunity analysis. The focus is not on chasing unrealistic returns, but on identifying opportunities that align with sound financial principles, risk awareness, and long-term growth.' },
                  { num: '04', q: 'What safeguards or principles do you follow?', a: "We follow three non-negotiable principles: transparency first (we explain how an opportunity actually makes money, in plain language, before we ever present it), no guaranteed-return promises (every opportunity is shared with honest context about risk — including the possibility of loss), and capital preservation over chasing yield (we favor opportunities with a credible plan to protect your principal over those promising the highest possible number)." },
                  { num: '05', q: 'What results or case studies can I verify?', a: 'We share verifiable member outcomes and performance updates directly through our investment community channel, where current and past members can speak to their own experience. We encourage you to ask questions, request current performance information, and speak with our team before committing any funds — we would rather you invest with full understanding than invest quickly.' },
                ].map((t) => (
                  <div key={t.num} className="trust-card">
                    <div className="trust-q-num">{t.num}</div>
                    <h4>{t.q}</h4>
                    <p>{t.a}</p>
                  </div>
                ))}
              </div>
              <div className="trust-disclaimer">
                <strong>A note on risk:</strong> All investments carry risk, including the potential loss of principal. Past performance and member results do not guarantee future returns. Shine To Freedom provides access, education, and guidance — the decision to invest, and the responsibility for that decision, remains yours. We encourage independent due diligence alongside any information we provide.
              </div>
            </div>

            {/* TIPPER */}
            <div className="glass tipper-section sr d2" style={{ marginTop: '3rem', padding: '3rem' }}>
              <div className="tipper-inner">
                <div>
                  <div className="eyebrow">Passive Income Opportunity</div>
                  <h2 className="title">Tipper Business<br /><span className="gold-t">Investment</span></h2>
                  <p className="sub" style={{ marginBottom: '1.5rem' }}>Earn reliable <strong style={{ color: 'var(--text)' }}>weekly or monthly returns</strong> by investing in our active logistics asset pool. Your money works in a real, physical business — no screen required.</p>
                  <div className="return-grid">
                    {[['Weekly','Return Option Available'],['Monthly','Return Option Available'],['Active','Logistics Asset Pool'],['Direct','WhatsApp Onboarding']].map(([val, lbl]) => (
                      <div key={val} className="glass return-stat"><div className="rs-val">{val}</div><div className="rs-lbl">{lbl}</div></div>
                    ))}
                  </div>
                  <p style={{ fontSize: '.86rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Message us to learn about the benefits, view current returns, and get started with enrollment.</p>
                  <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%27m%20interested%20in%20the%20Tipper%20Business%20Investment%20under%20Wealth%20%26%20Investment.%20Please%20tell%20me%20more%20about%20weekly%2Fmonthly%20returns." target="_blank" rel="noreferrer" className="btn-primary">Compound Your Money — Message to Enroll</a>
                </div>
                <div className="tipper-visual sr d3">
                  <div className="ring r1"></div>
                  <div className="ring r2"></div>
                  <div className="ring r3"></div>
                  <div className="truck-3d">Tipper</div>
                  <div className="return-badge rb1"><div className="rb-val">Weekly</div><div className="rb-lbl">Returns</div></div>
                  <div className="return-badge rb2"><div className="rb-val">Monthly</div><div className="rb-lbl">Returns</div></div>
                </div>
              </div>
            </div>

            <div className="glass payment-card sr d2" style={{ marginTop: '3rem' }}>
              <h3>Ready to Compound Your Money?</h3>
              <p style={{ fontSize: '.87rem', color: 'var(--muted)', lineHeight: 1.72, marginBottom: '1.25rem' }}>Message our team on Telegram to discuss amounts, currency, and how to get started — we&apos;ll guide you through every step personally.</p>
              <a href="https://t.me/Shinetofreedomsupport?text=Hi%2C%20I%27m%20interested%20in%20the%20Wealth%20%26%20Investment%20pathway.%20Please%20guide%20me%20on%20getting%20started." target="_blank" rel="noreferrer" className="btn-primary" style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>Compound Your Money — Message Us</a>
            </div>

          </div>
        </section>
      </div>{/* end view-wealth */}


      {/* ═══════════════════════════════
          TERMS VIEW
      ═══════════════════════════════ */}
      <div className="view" id="view-terms">
        <section className="detail-hero">
          <div className="container">
            <div className="back-link sr" onClick={() => showView('home')}>← Back to home</div>
            <div className="detail-badge sr" style={{ background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.25)', color: 'var(--gold-l)' }}>Legal</div>
            <h1 className="sr d1">Terms &amp; Conditions</h1>
            <p className="sub sr d2">Last updated: June 2026. Please read this carefully before making any payment to Shine To Freedom Enterprises.</p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container">
            <div className="legal-doc sr">
              <h3>1. Who We Are</h3>
              <p>Shine To Freedom Enterprises (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a CAC-registered Nigerian business (BN 8331508) operating shine2freedom.com and related community channels. These Terms govern your use of our website, your enrollment in any paid package, and any investment-related service we facilitate.</p>
              <h3>2. Nature of Our Services</h3>
              <p>We provide three categories of service: (a) access and training related to remote earning platforms (&quot;No-Skill Jobs&quot; and skill training packages), (b) skill development and client-connection guidance, and (c) facilitation of, and education about, wealth and investment opportunities (&quot;Wealth &amp; Investment pathway&quot;). We are an education, access, and facilitation platform — we are not a bank, a licensed investment advisor, or a securities dealer.</p>
              <h3>3. Payments</h3>
              <p>All payments for paid packages are processed through our listed Paystack payment links or through payment details shared directly by our team. We do not accept payment through unofficial channels, and you should never send money to any account or individual not explicitly confirmed by our official Telegram (t.me/Shinetofreedomsupport) or WhatsApp channels.</p>
              <p>Prices are listed in both USD and NGN where applicable. The NGN amount is the binding amount for Nigerian bank transfers; the USD amount applies to international payment methods. We reserve the right to update pricing at any time; the price in effect at the time of your payment applies to your enrollment.</p>
              <h3>4. Refund Policy</h3>
              <p>Because our paid packages grant immediate access to digital training material, platform guidance, and community access, <strong>all sales are final once access has been granted</strong>, except where required by applicable Nigerian consumer protection law. If you believe you were charged in error, or access was not delivered, contact us within 7 days of payment via Telegram with your payment reference, and we will investigate in good faith.</p>
              <h3>5. No Guaranteed Earnings</h3>
              <p>Any earning figures, ranges, or examples shown on this website are illustrative and based on real but individual experiences. They are not a guarantee of income. Your results depend on factors outside our control, including your effort, consistency, available time, and the policies of third-party platforms we do not own or operate.</p>
              <h3>6. Wealth &amp; Investment Pathway — Specific Terms</h3>
              <p>Opportunities shared through our Wealth &amp; Investment pathway carry financial risk, including the possible loss of principal. Any return figures shown are historical, illustrative, or target figures — not guarantees. Past performance does not predict future results.</p>
              <p>We are not a licensed financial advisor, broker-dealer, or portfolio manager under Nigerian or any other securities law. Nothing on this website constitutes formal financial advice. Where you require regulated financial advice, please consult a licensed professional.</p>
              <h3>7. Third-Party Platforms</h3>
              <p>We refer members to third-party earning platforms. We do not own, operate, or control these platforms, and we are not responsible for their policies, payment timelines, account suspensions, or any losses arising from your use of them.</p>
              <h3>8. Account &amp; Community Conduct</h3>
              <p>Access to paid communities and dashboards is for your personal use only and may not be shared, resold, or redistributed. We reserve the right to revoke access without refund where this is violated.</p>
              <h3>9. Limitation of Liability</h3>
              <p>To the fullest extent permitted by law, Shine To Freedom Enterprises shall not be liable for indirect, incidental, or consequential damages arising from your use of our services. Our total liability in any matter shall not exceed the amount you paid us for the specific package or service in question.</p>
              <h3>10. Changes to These Terms</h3>
              <p>We may update these Terms from time to time. Continued use of our services after changes are posted constitutes acceptance of the updated Terms.</p>
              <h3>11. Contact</h3>
              <p>For questions about these Terms, contact us at support@shine2freedom.com or via Telegram at t.me/Shinetofreedomsupport.</p>
            </div>
          </div>
        </section>
      </div>{/* end view-terms */}


      {/* ═══════════════════════════════
          PRIVACY VIEW
      ═══════════════════════════════ */}
      <div className="view" id="view-privacy">
        <section className="detail-hero">
          <div className="container">
            <div className="back-link sr" onClick={() => showView('home')}>← Back to home</div>
            <div className="detail-badge sr" style={{ background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.25)', color: 'var(--gold-l)' }}>Legal</div>
            <h1 className="sr d1">Privacy Policy</h1>
            <p className="sub sr d2">Last updated: June 2026. This explains what data we collect, why, and how we protect it — especially anything related to payments and your identity.</p>
          </div>
        </section>
        <section className="section" style={{ paddingTop: '1rem' }}>
          <div className="container">
            <div className="legal-doc sr">
              <h3>1. What Information We Collect</h3>
              <p>We collect information you provide directly, including: your name, email address, and phone number when you message us or sign in with Google; payment confirmation details when you enroll in a paid package; and any information you voluntarily share in community channels or with our support team.</p>
              <p>When you use Google Sign-In to access a free resource, we receive your name and email address from Google, which we use solely to deliver the resource and send occasional relevant updates.</p>
              <h3>2. What We Do Not Collect</h3>
              <p>We never ask for, and you should never share with us, your bank PIN, OTP (one-time password), card CVV, or full card number. Any message claiming to be from Shine To Freedom requesting these details is fraudulent and should be reported to us immediately.</p>
              <h3>3. How We Use Your Information</h3>
              <ul>
                <li>To deliver the digital resources, training, or platform access you&apos;ve requested or paid for</li>
                <li>To confirm and process payments through our payment partners (e.g. Paystack)</li>
                <li>To communicate with you about your enrollment, account, or support requests</li>
                <li>To send occasional updates about new opportunities, platforms, or resources — you may unsubscribe at any time</li>
                <li>To improve our services based on aggregate, anonymized usage patterns</li>
              </ul>
              <h3>4. Payment Data</h3>
              <p>We do not store your full card or bank details. Payments made through Paystack are processed directly by Paystack under their own security standards and privacy policy; we only receive confirmation that a payment was successful, along with a transaction reference.</p>
              <h3>5. Google Sign-In</h3>
              <p>When you use &quot;Continue with Google&quot; to unlock a free resource, we use Google&apos;s authentication service to verify your identity and obtain your name and email. We do not access your Google contacts, files, or any other Google account data. You can revoke this access at any time through your Google Account settings.</p>
              <h3>6. Third-Party Platforms</h3>
              <p>When we refer you to third-party earning platforms, any information you provide directly to those platforms is governed by their own privacy policies, not ours.</p>
              <h3>7. Data Sharing</h3>
              <p>We do not sell your personal information. We may share limited information with trusted service providers strictly to the extent necessary to deliver our services.</p>
              <h3>8. Data Security</h3>
              <p>We take reasonable technical and organizational measures to protect your information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
              <h3>9. Your Rights</h3>
              <p>You may request access to, correction of, or deletion of your personal information at any time by contacting support@shine2freedom.com.</p>
              <h3>10. Children&apos;s Privacy</h3>
              <p>Our services are not directed at individuals under 18. We do not knowingly collect information from minors.</p>
              <h3>11. Changes to This Policy</h3>
              <p>We may update this Privacy Policy periodically. The &quot;Last updated&quot; date at the top reflects the most recent revision.</p>
              <h3>12. Contact</h3>
              <p>For privacy questions or requests, contact us at support@shine2freedom.com or via Telegram at t.me/Shinetofreedomsupport.</p>
            </div>
          </div>
        </section>
      </div>{/* end view-privacy */}


      {/* FLOATING WA BUTTON */}
      <div className="wa-float">
        <a href="https://chat.whatsapp.com/EgEH5ESXg5WIyjkc8a1JNV?s=cl&p=i&ilr=2&amv=1" target="_blank" rel="noreferrer" className="wa-float-btn" title="Join Free WhatsApp Community">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo" style={{ marginBottom: '.1rem' }}>
              <svg viewBox="0 0 100 100" fill="none" width="24" height="24">
                <path d="M50 80 C50 80 28 54 19 36 C15 28 14 22 15 18 C19 18 28 20 38 28 C46 35 50 48 50 58 Z" fill="#C9A84C" />
                <path d="M50 80 C50 80 72 54 81 36 C85 28 86 22 85 18 C81 18 72 20 62 28 C54 35 50 48 50 58 Z" fill="#F0D684" />
                <path d="M50 0 C51 13 53 21 63 23 C53 25 51 33 50 46 C49 33 47 25 37 23 C47 21 49 13 50 0 Z" fill="#00C46A" />
              </svg>
              <span className="logo-text" style={{ fontSize: '.85rem' }}>SHINE TO FREEDOM</span>
            </div>
            <p>Africa&apos;s leading platform connecting people to global remote income, digital skill training, and financial freedom opportunities.</p>
            <a href="https://wa.me/2348067476608" target="_blank" rel="noreferrer" className="btn-wa" style={{ display: 'inline-flex', fontSize: '.8rem', padding: '.55rem 1.1rem' }}>WhatsApp: 0806 747 6608</a>
          </div>
          <div className="footer-col">
            <h4>Pathways</h4>
            <a onClick={() => showView('beginners')}>Beginners</a>
            <a onClick={() => showView('skills')}>Learn a Skill</a>
            <a onClick={() => showView('wealth')}>Wealth &amp; Invest</a>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <a onClick={() => showView('home')}>CV Revamp</a>
            <a onClick={() => showView('home')}>LinkedIn Revamp</a>
            <a onClick={() => showView('home')}>Fresh CV Creation</a>
            <a href="https://wa.me/2348067476608" target="_blank" rel="noreferrer">WhatsApp Us</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:support@shine2freedom.com">support@shine2freedom.com</a>
            <a href="https://wa.me/2348067476608" target="_blank" rel="noreferrer">WhatsApp: 0806 747 6608</a>
            <a href="https://shine2freedom.com" target="_blank" rel="noreferrer">shine2freedom.com</a>
            <a href="https://chat.whatsapp.com/EgEH5ESXg5WIyjkc8a1JNV?s=cl&p=i&ilr=2&amv=1" target="_blank" rel="noreferrer">Free WhatsApp Community</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 Shine To Freedom Enterprises. All rights reserved.</span>
          <span style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <a onClick={() => showView('terms')} style={{ color: 'var(--muted)', fontSize: '.75rem' }}>Terms &amp; Conditions</a>
            <a onClick={() => showView('privacy')} style={{ color: 'var(--muted)', fontSize: '.75rem' }}>Privacy Policy</a>
            <a href="https://chat.whatsapp.com/EgEH5ESXg5WIyjkc8a1JNV?s=cl&p=i&ilr=2&amv=1" target="_blank" rel="noreferrer" style={{ color: 'var(--muted)', fontSize: '.75rem' }}>Free Community</a>
            <a href="mailto:support@shine2freedom.com" style={{ color: 'var(--muted)', fontSize: '.75rem' }}>Email Us</a>
          </span>
        </div>
      </footer>
    </>
  )
}