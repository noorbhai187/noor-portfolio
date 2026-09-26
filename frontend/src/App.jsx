import { useEffect, useRef, useState } from 'react'
import Hero from './Hero.jsx'

// Fades a section up the first time it scrolls into view.
function Reveal({ as: Tag = 'section', className = '', ...props }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); io.disconnect() }
    }, { rootMargin: '0px 0px -12% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={`reveal ${className}`} {...props} />
}

const TABS = ['about', 'projects', 'experience', 'skills', 'contact']

function TopBar() {
  const [active, setActive] = useState('')
  const [light, setLight] = useState(() => document.documentElement.dataset.theme === 'light')
  const tabsRef = useRef(null)

  // Keep the current section's tab visible when the tab row scrolls (phones).
  useEffect(() => {
    const row = tabsRef.current, on = row?.querySelector('.on')
    if (on) row.scrollTo({ left: on.offsetLeft - row.clientWidth / 2 + on.clientWidth / 2, behavior: 'smooth' })
  }, [active])

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
    }, { rootMargin: '-45% 0px -50% 0px' })
    for (const id of ['top', ...TABS]) io.observe(document.getElementById(id))
    return () => io.disconnect()
  }, [])

  // Follow system theme changes until the visitor picks one with the toggle.
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      let saved = null
      try { saved = localStorage.getItem('theme') } catch { /* private mode */ }
      if (saved) return
      document.documentElement.dataset.theme = mq.matches ? 'dark' : 'light'
      setLight(!mq.matches)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function toggle() {
    const next = !light
    setLight(next)
    document.documentElement.dataset.theme = next ? 'light' : 'dark'
    try { localStorage.setItem('theme', next ? 'light' : 'dark') } catch { /* private mode */ }
  }

  return (
    <nav className="topbar">
      <span className="dots" aria-hidden="true"><i /><i /><i /></span>
      <span className="path">~/noor</span>
      <div className="tabs" ref={tabsRef}>
        <a className={`tab${active === 'top' || !active ? ' on' : ''}`} href="#top">README.md</a>
        {TABS.map((t) => (
          <a key={t} className={`tab${active === t ? ' on' : ''}`} href={`#${t}`}>{t}.md</a>
        ))}
      </div>
      <button className="lightbtn" onClick={toggle}>{light ? '☾ dark mode' : '☀ light mode'}</button>
    </nav>
  )
}

const EMAIL = '23211A3249@bvrit.ac.in'
const PHONE = '+91-9492861786'
const LINKEDIN = 'https://www.linkedin.com/in/shaik-noor-aien-08b254293/'
const GITHUB_URL = 'https://github.com/noorbhai187'
const INSTAGRAM = 'https://www.instagram.com/_invulnerable____/'
// Tapping the phone card opens a WhatsApp chat with a short greeting filled in.
const WHATSAPP = `https://wa.me/${PHONE.replace(/\D/g, '')}?text=${encodeURIComponent("Hi Noor, I found you through your portfolio.")}`

const ICON = {
  mail: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 6.5 8.5 6.5 8.5-6.5" /></svg>,
  phone: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3.2l1.6 4-2 1.3a11 11 0 0 0 4.9 4.9l1.3-2 4 1.6V17a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>,
  linkedin: <svg viewBox="0 0 24 24" aria-hidden="true" className="fill"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v10.75H3zM9.5 9.75h3.83v1.47h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13v7.21h-4v-6.39c0-1.52-.03-3.48-2.12-3.48-2.13 0-2.45 1.66-2.45 3.37v6.5h-4z" /></svg>,
  instagram: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.6" /></svg>,
  arrow: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg>,
  send: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-6 16-3-7z" /><path d="m11 13 9-9" /></svg>,
  check: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>,
}

const EDUCATION = [
  { what: 'B.Tech, Computer Science and Business Systems', where: 'B V Raju Institute of Technology, Narsapur', when: '2023 – present', logo: '/bvrit.png' },
]

// Cards in the projects grid. `image` is a screenshot in public/projects/; without one the
// card shows a typographic cover.
const PROJECTS = [
  {
    title: 'MediFind',
    date: 'September 2026',
    image: '/projects/medifind.jpg',
    text: 'Know which pharmacy counter near you actually has your medicine, who confirmed it and when, and hold it for an hour. A university design prototype: the search, holds and prescription checks run against a real database.',
    tags: ['HTML', 'JavaScript', 'Supabase'],
    website: 'https://noorbhai187.github.io/medifind/',
    source: 'https://github.com/noorbhai187/medifind',
  },
  {
    title: 'LineSight',
    date: 'September 2026 · NeuraX Hackathon 3.0',
    image: '/projects/linesight.jpg',
    text: 'Visual inspection and defect root-cause assistant. Ties each defective unit to the process conditions that produced it and what that costs per hour: 99.7% accept/reject accuracy on held-out data, running entirely in the browser.',
    tags: ['Python', 'scikit-learn', 'NumPy', 'SciPy'],
    website: 'https://noorbhai187.github.io/linesight/',
    source: 'https://github.com/noorbhai187/linesight',
  },
  {
    title: 'Traffic Signal RL',
    date: 'February 2026',
    cover: '2×2 grid · PPO agents',
    text: 'Multi-agent reinforcement learning for adaptive traffic signals. Each intersection in a 2×2 SUMO grid is a PPO agent that tunes its signal timing to vehicle density to reduce congestion.',
    tags: ['Python', 'SUMO', 'Ray RLlib', 'PyTorch'],
    source: 'https://github.com/noorbhai187/Traffic_Reinforcement_Model',
  },
  {
    title: 'WAMS 2026',
    date: '2026 · web developer · best student volunteer',
    cover: 'IEEE conference website',
    text: 'Designed and built the official conference website, wams2026.com: responsive UI, event listings and navigation, plus deployment, SEO and performance work.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    website: 'https://wams2026.com',
  },
  {
    title: 'UTSAV 2025',
    date: '2025 · web developer',
    cover: 'technical fest website',
    text: 'Official technical fest website for BVRIT, with event registration modules and a mobile-responsive design.',
    tags: ['HTML', 'CSS', 'JavaScript'],
  },
]

const GLOBE = <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" /></svg>
const GITHUB = <svg viewBox="0 0 24 24" aria-hidden="true" className="fill"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" /></svg>

const ROLES = [
  { what: 'Webmaster', where: 'IEEE BVRIT Student Branch', when: '2024 – present', note: 'Manage and maintain the official IEEE website.' },
  { what: 'Coordinator', where: "Institution's Innovation Council", when: '', note: 'Organise innovation events and student activities.' },
]

const ACHIEVEMENTS = [
  'Finalist and ₹10,000 cash prize, PALS innoWAH! 2026 at IIT Madras: one of 64 teams in the grand finale, from 272 that entered.',
  'Best Student Volunteer award and ₹10,000 cash prize, IEEE WAMS 2026, and built and deployed its website, wams2026.com.',
  'Hackathon finalist: dyslexia-friendly learning interface.',
  'Goalkeeper, college football team: inter-college winner and runner-up.',
]

const SKILLS = {
  programming: ['JavaScript', 'C++', 'Python'],
  data: ['SQL', 'Apache Spark'],
  web: ['HTML', 'CSS', 'JavaScript'],
  concepts: ['Data Structures & Algorithms', 'Reinforcement Learning basics'],
  tools: ['Git & GitHub', 'VS Code', 'Figma'],
  soft: ['Team collaboration', 'Communication', 'Problem solving', 'Time management'],
}

const CONTACTS = [
  { key: 'mail', label: 'email', value: EMAIL, href: `mailto:${EMAIL}` },
  { key: 'phone', label: 'call · whatsapp', value: '+91 94928 61786', href: WHATSAPP, external: true },
  { key: 'linkedin', label: 'linkedin', value: 'shaik-noor-aien', href: LINKEDIN, external: true },
  { key: 'github', label: 'github', value: 'noorbhai187', href: GITHUB_URL, external: true },
  { key: 'instagram', label: 'instagram', value: '@_invulnerable____', href: INSTAGRAM, external: true },
]

function ContactLinks() {
  return (
    <ul className="contacts">
      {CONTACTS.map((c) => (
        <li key={c.key}>
          <a
            className={`contact contact-${c.key}`}
            href={c.href}
            aria-label={`${c.label}: ${c.value}`}
            title={`${c.label}: ${c.value}`}
            {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
          >
            {c.key === 'github' ? GITHUB : ICON[c.key]}
          </a>
        </li>
      ))}
    </ul>
  )
}

function ContactForm() {
  const [status, setStatus] = useState({ state: 'idle', msg: '' })
  const [chars, setChars] = useState(0)

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setStatus({ state: 'sending', msg: '' })
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(data),
      })
      const out = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(out.error || 'Something went wrong.')
      form.reset()
      setChars(0)
      setStatus({ state: 'sent', msg: "Message sent. I'll get back to you soon." })
    } catch (err) {
      setStatus({ state: 'error', msg: `${err.message} You can also email ${EMAIL}.` })
    }
  }

  const busy = status.state === 'sending'
  return (
    <form className="form" onSubmit={onSubmit}>
      <div className="form-bar" aria-hidden="true">
        <span className="dots"><i /><i /><i /></span>
        <span>~/noor/new_message.md</span>
      </div>
      <div className="form-fields">
        <label className="field">
          <span>name</span>
          <input name="name" required maxLength={100} autoComplete="name" placeholder="Your name" disabled={busy} />
        </label>
        <label className="field">
          <span>email</span>
          <input name="email" type="email" required maxLength={200} autoComplete="email" placeholder="you@example.com" disabled={busy} />
        </label>
        <label className="field full">
          <span>message <em>{chars}/5000</em></span>
          <textarea name="message" required maxLength={5000} rows={9} placeholder="What are you building?" disabled={busy} onChange={(e) => setChars(e.target.value.length)} />
        </label>
        {/* honeypot: hidden from people, bots fill it */}
        <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <div className="full form-foot">
          <p className={`form-status ${status.state}`} role="status" aria-live="polite">
            {status.state === 'sent' && ICON.check}
            {status.msg || <span className="cmt">// lands straight in my inbox</span>}
          </p>
          <button className="send" type="submit" disabled={busy}>
            {busy ? <><i className="spin" />sending</> : <>send message{ICON.send}</>}
          </button>
        </div>
      </div>
    </form>
  )
}

export default function App() {
  return (
    <>
      <TopBar />
      <Hero />
      <main>
        <Reveal id="about">
          <p className="label">about</p>
          <h2>Hi, I'm Noor.</h2>
          <p className="tag">Computer Science student building production websites and intelligent systems.</p>
          <p className="sub">
            <span className="cmt">// </span>I've shipped the WAMS 2026 and UTSAV 2025 websites, and I'm interested in scalable web apps and AI-based systems, while sharpening my problem-solving and software development skills.
          </p>
          <ol className="rows edu">
            {EDUCATION.map((e) => (
              <li key={e.what}>
                {e.logo ? <img className="logo" src={e.logo} alt="" width="72" height="26" loading="lazy" /> : <span className="num">~</span>}
                <span><b>{e.what}</b><br /><span className="dim">{e.where}</span></span>
                <span className="meta">{e.when}</span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal id="projects">
          <p className="label">projects</p>
          <h2>What I've built.</h2>
          <p className="sub"><span className="cmt">// </span>From hackathon builds to production websites. Here are a few favourites.</p>
          <div className="projects">
            {PROJECTS.map((p) => (
              <article key={p.title} className="project">
                {p.image
                  ? <img className="shot" src={p.image} alt={`${p.title} screenshot`} loading="lazy" width="960" height="540" />
                  : <div className="shot cover" aria-hidden="true"><b>{p.title}</b><span>// {p.cover}</span></div>}
                <div className="project-body">
                  <h3>{p.title}</h3>
                  <p className="date">{p.date}</p>
                  <p className="dim" title={p.text}>{p.text}</p>
                  <ul className="chips">{p.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                  <div className="project-links">
                    {p.website && <a className="pbtn" href={p.website} target="_blank" rel="noreferrer">{GLOBE}Website</a>}
                    {p.source && <a className="pbtn" href={p.source} target="_blank" rel="noreferrer">{GITHUB}Source</a>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal id="experience">
          <p className="label">experience</p>
          <h2>Positions &amp; wins.</h2>
          <ol className="rows">
            {ROLES.map((r) => (
              <li key={r.what}>
                <span className="num">&gt;</span>
                <div>
                  <b>{r.what}</b><span className="dim"> · {r.where}</span>
                  <p className="dim note">{r.note}</p>
                </div>
                <span className="meta">{r.when}</span>
              </li>
            ))}
          </ol>
          <p className="cmt sublabel"># achievements</p>
          {/* innoWAH facts: Deccan Chronicle, 29 Mar 2026. WAMS facts: BVRIT, Telangana Today and SME Street, Jun 2026. */}
          <div className="features">
            <article className="feature">
              <p className="feature-tag">finalist · ₹10,000 prize · iit madras</p>
              <h3>PALS innoWAH! 2026</h3>
              <p>
                The innovation challenge run by PALS, the PanIIT Alumni Leadership Series of IIT alumni. The
                2026 theme was <em>“Engineering Solutions with Bytes and Bolts”</em>: 272 teams from 62
                institutes entered, and 64 teams from 47 colleges across five states made the grand finale at
                IIT Madras on 28–29 March. Our team was one of them and won a ₹10,000 cash prize.
              </p>
              <dl className="feature-stats">
                <div><dt>272</dt><dd>teams entered</dd></div>
                <div><dt>64</dt><dd>finalists</dd></div>
                <div><dt>₹10k</dt><dd>cash prize</dd></div>
              </dl>
            </article>
            <article className="feature">
              <p className="feature-tag">best student volunteer · ₹10,000 prize · bvrit</p>
              <h3>IEEE WAMS 2026</h3>
              <p>
                The 5th IEEE Wireless, Antenna &amp; Microwave Symposium, hosted at BVRIT, Narsapur, covering
                6G, antenna systems, microwave engineering and AI. I built and ran the official website,
                wams2026.com, volunteered through the symposium, and received the Best Student Volunteer award with a ₹10,000 cash prize.
              </p>
              <dl className="feature-stats">
                <div><dt>1,059</dt><dd>papers submitted</dd></div>
                <div><dt>18</dt><dd>countries</dd></div>
                <div><dt>₹10k</dt><dd>cash prize</dd></div>
              </dl>
            </article>
          </div>
          <ul className="wins">{ACHIEVEMENTS.map((a) => <li key={a}>{a}</li>)}</ul>
        </Reveal>

        <Reveal id="skills">
          <p className="label">skills</p>
          <h2>The toolbox.</h2>
          <div className="grid">
            {Object.entries(SKILLS).map(([group, items]) => (
              <div key={group} className="cell">
                <p className="cmt"># {group}</p>
                <p>{items.join(', ')}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal id="contact">
          <p className="label">contact</p>
          <h2>Say hi.</h2>
          <p className="sub"><span className="cmt">// </span>Open to internships, web projects and anything with a pipeline in it.</p>
          <div className="contact-grid">
            <ContactLinks />
            <ContactForm />
          </div>
        </Reveal>
      </main>
      <footer className="foot">
        <span className="cmt">// </span>drawn by hand, scrolled by you. © {new Date().getFullYear()} Shaik Noor Aien
      </footer>
    </>
  )
}
