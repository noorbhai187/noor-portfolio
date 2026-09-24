import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Saves a portfolio contact message and mails it to Shaik via Resend.
// Lowercase: Resend's free tier only delivers to the account address, compared case-sensitively.
const TO = '23211a3249@bvrit.ac.in'
const FROM = Deno.env.get('CONTACT_FROM') ?? 'Portfolio <onboarding@resend.dev>'
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON' }, 400) }

  // Honeypot: bots fill the hidden field; pretend success.
  if (body.company) return json({ ok: true })

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const message = String(body.message ?? '').trim()
  if (!name || name.length > 100) return json({ error: 'Please enter your name.' }, 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return json({ error: 'Please enter a valid email.' }, 400)
  if (!message || message.length > 5000) return json({ error: 'Message must be 1 to 5000 characters.' }, 400)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  // ponytail: per-email rate limit only; add IP-based limiting if spam shows up.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await db.from('contact_messages').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', since)
  if ((count ?? 0) >= 3) return json({ error: 'Too many messages, please try again later.' }, 429)

  const { error } = await db.from('contact_messages').insert({ name, email, message })
  if (error) return json({ error: 'Could not save your message.' }, 500)

  const key = Deno.env.get('RESEND_API_KEY')
  if (!key) return json({ ok: true })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      html: `<p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}</p><p style="white-space:pre-wrap">${esc(message)}</p>`,
    }),
  })
  if (!res.ok) console.error('resend failed', res.status, await res.text())

  return json({ ok: true })
})
