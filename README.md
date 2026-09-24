# Shaik Noor Aien — portfolio

```
frontend/   React + Vite site (hero video, sections, contact form)
backend/    Supabase: contact edge function + database migration
hero-mp4/   Unused MP4 masters, kept out of frontend/public/ so they don't deploy
```

## Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in frontend/dist
```

Copy `frontend/.env.example` to `frontend/.env` and fill in the Supabase URL and anon key (Supabase → Project Settings → API). The contact form needs them.

## Backend

Already deployed to the Supabase project `qlbhpvjdtgbkzpdhzvuf`. To redeploy with the Supabase CLI:

```bash
cd backend
supabase functions deploy contact --project-ref qlbhpvjdtgbkzpdhzvuf
```

Secrets (set in Supabase → Edge Functions → Secrets): `RESEND_API_KEY` (required for email), `CONTACT_FROM` (optional, needs a verified Resend domain).
