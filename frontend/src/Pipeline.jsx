// Hand-drawn pipeline: Data → Processing → Database → Analytics, then a bar-chart doodle.
// Every stroke draws itself from --d (0→1 across the pinned section); see .ink in styles.css.

// Wobble, rolled once at import: the paths below are module constants, so every
// stroke keeps its own slight off-true for the life of the page.
const j = (n = 2.2) => (Math.random() - 0.5) * n * 2
const f = (n) => n.toFixed(1)

// A wobbly line as a quadratic curve with a slightly displaced midpoint.
function line(x1, y1, x2, y2, wob = 2.5) {
  return `M${f(x1 + j(1))} ${f(y1 + j(1))} Q${f((x1 + x2) / 2 + j(wob))} ${f((y1 + y2) / 2 + j(wob))} ${f(x2 + j(1))} ${f(y2 + j(1))}`
}

// A box sketched twice around, the second pass looser, with overshooting corners.
function box(x, y, w, h) {
  const pass = (o) => {
    const c = [[x + j(o), y + j(o)], [x + w + j(o), y + j(o)], [x + w + j(o), y + h + j(o)], [x + j(o), y + h + j(o)]]
    let d = `M${f(c[0][0] - 3)} ${f(c[0][1] + j(1))}`
    for (let i = 1; i <= 4; i++) {
      const [ax, ay] = c[i - 1], [bx, by] = c[i % 4]
      d += ` Q${f((ax + bx) / 2 + j(1.8))} ${f((ay + by) / 2 + j(1.8))} ${f(bx + j(1))} ${f(by + j(1))}`
    }
    return d
  }
  return `${pass(1.5)} ${pass(3)}`
}

function arrow(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1)
  const head = (s) => {
    const t = a + Math.PI + s * 0.5
    return line(x2, y2, x2 + 13 * Math.cos(t), y2 + 13 * Math.sin(t), 0.8)
  }
  return { shaft: line(x1, y1, x2, y2, 4), head: `${head(1)} ${head(-1)}`, route: `M${x1} ${y1} L${x2} ${y2}` }
}

const BW = 150, BH = 72
const BOXES = [
  { label: 'Data', x: 18, y: 28 },
  { label: 'Processing', x: 252, y: 28 },
  { label: 'Database', x: 252, y: 178 },
  { label: 'Analytics', x: 18, y: 178 },
].map((b, i) => ({ ...b, path: box(b.x, b.y, BW, BH), s: 0.06 + i * 0.09 }))

const ARROWS = [
  arrow(176, 64, 240, 64),
  arrow(327, 108, 327, 168),
  arrow(240, 214, 176, 214),
].map((a, i) => ({ ...a, s: 0.44 + i * 0.07 }))

const BASE = line(28, 344, 176, 344, 1.5)
const BARS = [24, 44, 34, 62].map((h, i) => {
  const x = 46 + i * 32
  return line(x, 344, x + j(1), 344 - h, 1.2) + ' ' + line(x + 18, 344 - h + j(2), x + 18, 344, 1.2) + ' ' + line(x - 1, 344 - h, x + 19, 344 - h + j(2), 1)
})

export default function Pipeline({ still }) {
  return (
    <svg className="pipeline" viewBox="0 0 420 360" role="img" aria-label="Data flows to Processing, then Database, then Analytics">
      <defs>
        <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
      </defs>

      <g filter="url(#ink)">
        {BOXES.map((b) => (
          <g key={b.label}>
            <path className="ink" pathLength="1" d={b.path} style={{ '--s': b.s, '--l': 0.13 }} />
            <text className="box-label" x={b.x + BW / 2} y={b.y + BH / 2 + 9} style={{ '--s': b.s + 0.07 }}>
              {b.label}
            </text>
          </g>
        ))}
        {ARROWS.map((a, i) => (
          <g key={i}>
            <path className="ink" pathLength="1" d={a.shaft} style={{ '--s': a.s, '--l': 0.06 }} />
            <path className="ink" pathLength="1" d={a.head} style={{ '--s': a.s + 0.05, '--l': 0.03 }} />
          </g>
        ))}
        <path className="ink thin" pathLength="1" d={BASE} style={{ '--s': 0.66, '--l': 0.05 }} />
        {BARS.map((d, i) => (
          <path key={i} className="ink thin" pathLength="1" d={d} style={{ '--s': 0.7 + i * 0.035, '--l': 0.05 }} />
        ))}
      </g>

      {!still && (
        <g className="pulses">
          {ARROWS.map((a, i) => (
            <circle key={i} r="5">
              <animateMotion dur="1.2s" begin={`-${i * 0.4}s`} repeatCount="indefinite" path={a.route} />
            </circle>
          ))}
        </g>
      )}
    </svg>
  )
}
