import { useEffect, useState } from 'react'

// TODO(Noor): your GitHub username. Until it's set, the heat map shows random sample data.
const GITHUB_USER = ''
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// A year of made-up activity: seeded so it's the same on every load, with busy streaks.
function sampleYear() {
  let seed = 42
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const today = new Date()
  const days = []
  let streak = 0
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    if (streak > 0) streak--
    else if (rnd() < 0.05) streak = 3 + Math.floor(rnd() * 8)
    const busy = streak > 0 ? 0.75 : 0.18
    const level = rnd() < busy ? 1 + Math.floor(rnd() * (streak > 0 ? 4 : 2)) : 0
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    days.push({ date: iso, count: level ? level * 2 + Math.floor(rnd() * 3) : 0, level })
  }
  return days
}

// Last year of GitHub contributions, via a public proxy of the profile graph.
export default function Contributions() {
  const [days, setDays] = useState(() => (GITHUB_USER ? null : sampleYear()))
  useEffect(() => {
    if (!GITHUB_USER) return
    fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setDays(d.contributions))
      .catch(() => setDays([]))
  }, [])
  if (!days?.length) return null

  // Columns are weeks starting Sunday; pad the first week.
  const cells = [...Array(new Date(days[0].date).getUTCDay()).fill(null), ...days]
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  const total = days.reduce((n, d) => n + d.count, 0)

  return (
    <figure className="contrib">
      <p className="contrib-title">coding profile</p>
      <div className="contrib-scroll">
        <div className="contrib-grid" style={{ '--weeks': weeks.length }}>
          {weeks.map((w, i) => {
            const first = w.find(Boolean)
            const m = first && new Date(first.date).getUTCMonth()
            const prev = i > 0 && weeks[i - 1].find(Boolean)
            const label = first && (!prev || new Date(prev.date).getUTCMonth() !== m) ? MONTHS[m] : ''
            return (
              <div key={i} className="week">
                <span className="month">{label}</span>
                {w.map((d, j) => (
                  <i key={j} className={d ? `l${d.level}` : 'pad'} title={d ? `${d.count} on ${d.date}` : undefined} />
                ))}
              </div>
            )
          })}
        </div>
      </div>
      {GITHUB_USER && (
        <figcaption className="cmt">
          // {total} contributions in the last year · <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer">github.com/{GITHUB_USER}</a>
        </figcaption>
      )}
    </figure>
  )
}
