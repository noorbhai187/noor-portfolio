import { useEffect, useRef, useState } from 'react'
import Pipeline from './Pipeline.jsx'
import Contributions from './Contributions.jsx'

const COUNT = 314
const VIDEO_SCREENS = 5.5 // scroll length of the video, in viewport heights
const PIN_SCREENS = 1.1 // extra scroll with the last frame pinned while the diagram draws
const INSET = 0.007 // some frames carry a thin black bar top and bottom; crop it
const FADE_MS = 200 // cross-fade when the theme's frame set swaps in
const INTRO = 0.07 // scroll progress over which the avatar box grows into the full-screen video
// Same frames, timing and names in both sets. `paper`: last frames' background (fills around
// the shrunken frame on phones). `bg`: page/first-frame background, around the avatar box.
const THEMES = {
  light: { dir: '', paper: '#F1F0EB', bg: '#FBFBF6', ring: 'rgba(29,29,27,0.16)' },
  dark: { dir: '/dark', paper: '#151718', bg: '#141517', ring: 'rgba(233,230,221,0.2)' },
}
// Where to centre the crop (fraction of frame width) over scroll progress p, measured from
// his t-shirt in every frame: walks left to the desk, sits (framed a bit left to keep the
// laptop in view), then stands centred after the page-peel. Matters on narrow screens.
const FOCUS = [[0, 0.72], [0.019, 0.73], [0.038, 0.66], [0.058, 0.57], [0.077, 0.51], [0.096, 0.475],
  [0.115, 0.53], [0.134, 0.59], [0.9, 0.6], [0.939, 0.55], [0.975, 0.5], [1, 0.5]]
function focusAt(p) {
  let i = 1
  while (i < FOCUS.length - 1 && FOCUS[i][0] < p) i++
  const [p0, f0] = FOCUS[i - 1], [p1, f1] = FOCUS[i]
  return f0 + (f1 - f0) * Math.min(1, Math.max(0, (p - p0) / (p1 - p0)))
}
const lerpRect = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t, h: a.h + (b.h - a.h) * t })

// Falling meteor lines: shown over the intro and, as shooting stars, over the night scene.
// Deterministic positions so renders match.
const METEORS = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100 + 8}%`,
  top: `${(i * 53) % 60 - 20}%`,
  animationDelay: `${((i * 1.7) % 7).toFixed(2)}s`,
  animationDuration: `${(4 + ((i * 2.3) % 4)).toFixed(2)}s`,
}))

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t) => t * t * (3 - 2 * t)
const frameUrl = (theme, set, i) => `${THEMES[theme].dir}/frames-${set}/f_${String(i + 1).padStart(4, '0')}.webp`
const themeNow = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export default function Hero() {
  const root = useRef(null)
  const sticky = useRef(null)
  const canvas = useRef(null)
  const [reduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const el = root.current
    const box = sticky.current
    const cv = canvas.current
    const ctx = cv.getContext('2d')
    const set = innerWidth * devicePixelRatio >= 1600 ? 1920 : 1280
    const store = { light: { frames: new Array(COUNT) }, dark: { frames: new Array(COUNT) } }
    let theme = themeNow()
    let alive = true
    let gen = 0 // bumps on theme switch so the old set stops loading
    let shown = null, fade = null, idx = 0

    const introEl = el.querySelector('.intro')
    let W = 0, H = 0, dpr = 1, top = 0, total = 1, narrow = false, introTop = 0
    let cur = null, target = 0, raf = 0, last = 0, lastKey = ''

    const tag = (img, t) => { img.theme = t; return img }
    function stillFor(t) {
      const s = store[t]
      if (!s.still) {
        s.still = tag(new Image(), t)
        s.still.src = `${THEMES[t].dir}/${reduced ? 'final' : 'poster'}.jpg`
        s.still.decode().then(() => { lastKey = ''; kick() }, () => {})
      }
      return s.still
    }

    // ---- loading: only the active theme's set. Frames near the current one first,
    // then coarse-to-fine so any scroll position has a near frame.
    const load = (t, i) => new Promise((res) => {
      if (store[t].frames[i]) return res(true)
      const img = tag(new Image(), t)
      img.src = frameUrl(t, set, i)
      img.decode().then(() => { store[t].frames[i] = img; res(true); kick() }, () => res(false))
    })

    async function loadAll(t, from) {
      const g = ++gen
      const order = [], seen = new Set()
      const push = (i) => { if (i >= 0 && i < COUNT && !seen.has(i)) { seen.add(i); order.push(i) } }
      push(from)
      for (let k = 1; k < 20; k++) { push(from + k); push(from - k) }
      for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < COUNT; i += step) push(i)
      let next = 0
      const worker = async () => { while (alive && g === gen && next < order.length) await load(t, order[next++]) }
      await Promise.all(Array.from({ length: 6 }, worker))
    }

    function nearest(frames, i, reach = COUNT) {
      for (let k = 0; k < reach; k++) {
        if (frames[i - k]) return frames[i - k]
        if (frames[i + k]) return frames[i + k]
      }
      return null
    }

    // New set's frame if it's close; otherwise keep the other set's frame so nothing blanks.
    function pick() {
      if (reduced) return stillFor(theme)
      const other = theme === 'dark' ? 'light' : 'dark'
      const near = (reach) => nearest(store[theme].frames, idx, reach) || nearest(store[other].frames, idx, reach)
      return near(4) || near(COUNT) || (stillFor(theme).naturalWidth ? stillFor(theme) : store[other].still)
    }

    function onTheme() {
      const t = themeNow()
      if (t === theme) return
      theme = t
      if (reduced) stillFor(t)
      else loadAll(t, idx)
      lastKey = ''
      kick()
    }

    // ---- layout
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2)
      W = box.clientWidth
      H = box.clientHeight
      narrow = matchMedia('(max-aspect-ratio: 6/5)').matches // same breakpoint as styles.css
      introTop = introEl.offsetTop // phones: the intro card's top edge, the box must fit above it
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
      top = el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(box).top) || 0)
      total = Math.max(1, el.offsetHeight - H)
      lastKey = ''
      target = clamp(scrollY - top, 0, total)
      // Lay out synchronously so the overlay positions exist before the first paint.
      if (raf) kick()
      else tick(performance.now())
    }

    // Cover the viewport around a horizontal focus point. On narrow screens, during the
    // pinned diagram section, shrink the frame toward the top so the diagram fits below.
    function place(fx, t) {
      const s = Math.max(W / 16, H / 9)
      let w = 16 * s, h = 9 * s
      let x = clamp(W / 2 - fx * w, W - w, 0), y = (H - h) / 2
      if (t > 0) {
        const h2 = H * 0.44, w2 = (h2 * 16) / 9
        const x2 = W / 2 - 0.5 * w2, y2 = H * 0.14
        x += (x2 - x) * t; y += (y2 - y) * t; w += (w2 - w) * t; h += (h2 - h) * t
      }
      return { x, y, w, h }
    }

    // Opening state: the video sits in a small rounded box (top right on desktop, top centre
    // on phones), cropped to his head and chest. Returns the box and where the frame is drawn.
    function avatar() {
      // Desktop: text + box share a centred 1280px-wide column (matches .intro's --tl in CSS).
      const edge = Math.max(clamp(W * 0.05, 16, 72), (W - 1280) / 2)
      // Phones: the box takes whatever height is left above the intro card (16px clear of it),
      // centred in that space, so the two never overlap however tall the card gets.
      const S = narrow
        ? clamp(Math.min(W * 0.56, H * 0.3, introTop - 32), 80, W)
        : Math.min(W * 0.34, H * 0.62, 560)
      const x = narrow ? (W - S) / 2 : W - edge - S
      const y = narrow ? Math.max(8, (introTop - 16 - S) / 2) : (H - S) / 2 // desktop: centred beside the intro text
      const fw = S / 0.36, fh = (fw * 9) / 16 // box spans ~36% of the frame width
      return { edge, clip: { x, y, w: S, h: S }, img: { x: x + S / 2 - 0.7 * fw, y: y - 0.005 * fh, w: fw, h: fh } }
    }

    // Blend the shrunken frame's edges into the fill so no seam shows: one gradient,
    // paper at both ends and clear between, covers two opposite edges in a single fill.
    function feather(r, paper) {
      const b = Math.min(48, r.h / 6)
      const band = (x0, y0, x1, y1, len) => {
        const g = ctx.createLinearGradient(x0, y0, x1, y1)
        g.addColorStop(0, paper)
        g.addColorStop(b / len, paper + '00')
        g.addColorStop(1 - b / len, paper + '00')
        g.addColorStop(1, paper)
        return g
      }
      if (r.y > 0) { ctx.fillStyle = band(0, r.y, 0, r.y + r.h, r.h); ctx.fillRect(0, r.y, W, r.h) }
      if (r.x > 0) { ctx.fillStyle = band(r.x, 0, r.x + r.w, 0, r.w); ctx.fillRect(r.x, 0, r.w, H) }
    }

    function tick(now) {
      raf = 0
      const dt = last ? Math.min(now - last, 64) : 16
      last = now
      cur = cur == null ? target : cur + (target - cur) * (1 - Math.exp(-dt / 90))
      if (Math.abs(target - cur) < 0.5) cur = target

      const vLen = (total * VIDEO_SCREENS) / (VIDEO_SCREENS + PIN_SCREENS)
      const p = reduced ? 1 : clamp(cur / vLen)
      const d = reduced ? 1 : clamp((cur - vLen) / (total - vLen))
      const fx = focusAt(p)
      let r = place(fx, narrow ? ease(clamp(d / 0.35)) : 0)
      // Box starts growing as the intro text starts fading (p 0.02), so they never overlap.
      const t0 = reduced ? 1 : ease(clamp((p - 0.02) / INTRO))
      const a = avatar()
      let clip = null
      if (t0 < 1) {
        clip = lerpRect(a.clip, { x: 0, y: 0, w: W, h: H }, t0)
        r = lerpRect(a.img, r, t0)
      }
      // Intro text is sized to the box's resting position, so it fades without reflowing.
      el.style.setProperty('--bx', `${a.clip.x.toFixed(1)}px`)
      el.style.setProperty('--edge', `${a.edge.toFixed(1)}px`)

      el.style.setProperty('--p', p.toFixed(4))
      el.style.setProperty('--d', d.toFixed(4))
      el.style.setProperty('--fx', `${r.x.toFixed(1)}px`)
      el.style.setProperty('--fy', `${r.y.toFixed(1)}px`)
      el.style.setProperty('--fw', `${r.w.toFixed(1)}px`)
      el.style.setProperty('--fh', `${r.h.toFixed(1)}px`)
      el.dataset.night = p > 0.61 && p < 0.92 ? '1' : '0'

      idx = Math.round(p * (COUNT - 1))
      const img = pick()
      const dims = (m) => (m && m.complete ? [m.naturalWidth, m.naturalHeight] : [0, 0])
      const [iw, ih] = dims(img)

      let fading = false
      if (iw) {
        if (shown && shown.theme !== img.theme && !fade) fade = { from: shown, start: now }
        const k = fade ? clamp((now - fade.start) / FADE_MS) : 1
        const key = `${img.src}|${k}|${r.x}|${r.y}|${r.w}|${W}|${H}|${t0}`
        if (key !== lastKey) {
          lastKey = key
          const paper = THEMES[img.theme || theme].paper
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
          ctx.imageSmoothingQuality = 'high'
          const T = THEMES[img.theme || theme]
          if (clip) {
            ctx.fillStyle = T.bg
            ctx.fillRect(0, 0, W, H)
            ctx.save()
            ctx.beginPath()
            ctx.roundRect(clip.x, clip.y, clip.w, clip.h, 22 * (1 - t0))
            ctx.clip()
          } else if (r.w < W || r.h < H || r.x > 0 || r.y > 0) { ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H) }
          const paint = (m, [w, h2]) => ctx.drawImage(m, 0, h2 * INSET, w, h2 * (1 - 2 * INSET), r.x, r.y, r.w, r.h)
          if (k < 1) { paint(fade.from, dims(fade.from)); ctx.globalAlpha = k }
          paint(img, [iw, ih])
          ctx.globalAlpha = 1
          if (clip) {
            ctx.restore()
            ctx.globalAlpha = 1 - t0
            ctx.strokeStyle = T.ring
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.roundRect(clip.x + 0.75, clip.y + 0.75, clip.w - 1.5, clip.h - 1.5, 22 * (1 - t0))
            ctx.stroke()
            ctx.globalAlpha = 1
          } else if (r.x > 0 || r.y > 0) feather(r, paper)
        }
        if (k < 1) fading = true
        else fade = null
        shown = img
      }

      if (cur !== target || fading) raf = requestAnimationFrame(tick)
      else last = 0
    }

    function kick() { if (alive && !raf) raf = requestAnimationFrame(tick) }
    function onScroll() { target = clamp(scrollY - top, 0, total); kick() }

    const ro = new ResizeObserver(resize)
    ro.observe(box)
    ro.observe(el)
    ro.observe(introEl) // card height changes (fonts, heat map) move the box
    addEventListener('scroll', onScroll, { passive: true })
    const mo = new MutationObserver(onTheme)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    resize()
    stillFor(theme)
    if (!reduced) loadAll(theme, 0)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      mo.disconnect()
      removeEventListener('scroll', onScroll)
    }
  }, [reduced])

  return (
    <header id="top" ref={root} className={`hero${reduced ? ' reduced' : ''}`}>
      <div ref={sticky} className="hero-sticky">
        <canvas ref={canvas} className="hero-canvas" aria-hidden="true" />
        <div className="meteors" aria-hidden="true">
          {METEORS.map((m, i) => <span key={i} style={m} />)}
        </div>

        <div className="overlay">
          <div className="line intro" style={{ '--a': -1, '--b': 0.045 }}>
            <h1 className="name">hi, i'm Noor<span className="cur">▋</span></h1>
            <p className="lede">Software developer. I build production websites and intelligent systems, and I'm getting into data engineering.</p>
            <p className="status"><i aria-hidden="true" />Available · open to internships and freelance web projects</p>
            <Contributions />
          </div>

          <p className="line story" style={{ '--a': 0.28, '--b': 0.42 }}>
            Pipelines, queries, and the long quiet stretch where it finally runs clean.
          </p>
          <p className="line story" style={{ '--a': 0.42, '--b': 0.56 }}>
            Building systems, breaking bugs, and occasionally working for a Diet Coke.
          </p>
          <p className="line story night" style={{ '--a': 0.67, '--b': 0.9 }}>
            The screen is the only light left on.
          </p>

          <div className="line outro" style={{ '--a': 0.97, '--b': 99 }}>
            <p className="name">Shaik Noor Aien<span className="cur">▋</span></p>
            <p className="role"><span className="cmt">// </span>Software Developer | Aspiring Data Engineer</p>
          </div>

          <Pipeline still={reduced} />

          <div className="scroll-hint" aria-hidden="true">
            <span>scroll</span>
            <i />
          </div>
        </div>
        <div className="hero-fade" />
      </div>
    </header>
  )
}
