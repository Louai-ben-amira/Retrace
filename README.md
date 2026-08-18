# Retrace

Learn English through stories — built for Arabic speakers.

## Stack
- **Next.js 14** (App Router)
- **Clerk** — authentication
- **Prisma + PostgreSQL** — database
- **OpenAI API** — AI story generation, vocab tagging, grammar explanations
- **Stripe** — subscriptions
- **ElevenLabs** — TTS audio
- **Tailwind CSS** — styling

---

## Getting started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.local` and fill in your keys:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Railway / Supabase / local Postgres |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` | clerk.com → your app → API keys |
| `OPENAI_API_KEY` | platform.openai.com |
| `ELEVENLABS_API_KEY` | elevenlabs.io |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `STRIPE_PRO_PRICE_ID` | dashboard.stripe.com |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → Blob |
| `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` + `VAPID_EMAIL` + `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` |
| `CRON_SECRET` | Any long random string — authenticates the daily push cron |
| `NEXT_PUBLIC_APP_URL` | Your public origin, e.g. `https://retrace.app` |

### 3. Set up database
```bash
npm run db:push     # push schema to DB
npm run db:generate # generate Prisma client
npm run db:seed     # seed 3 starter stories
```

### 4. Configure Clerk

In the Clerk dashboard:
- Enable **Email/Password** and **Google OAuth** sign-in methods
- Add a webhook pointing to `https://your-domain.com/api/webhooks/clerk` with events: `user.created`, `user.updated`, `user.deleted`
- Add `CLERK_WEBHOOK_SECRET` to your `.env.local`
- Set redirect URLs: sign-in → `/library`, sign-up → `/library`

### 5. Make yourself an admin

After signing up, run this once in psql or Prisma Studio:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

### 6. Run dev server
```bash
npm run dev
# → http://localhost:3000
```

---

## Project structure

```
app/
  (auth)/         → Login, register (Clerk)
  (app)/          → Authenticated app (library, progress, settings)
  admin/          → Admin CMS (stories, users, analytics)
  api/            → All API routes
  page.tsx        → Landing page

components/
  ui/             → Button, Badge, Card, Input, Spinner, AppNav
  progress/       → StoryCard
  admin/          → StoryForm, StoryEditForm, PublishToggle

lib/
  db.ts           → Prisma singleton
  ai.ts           → OpenAI client (story gen, vocab tagging, grammar, translation)
  fuzzy.ts        → Typing match algorithm
  scoring.ts      → XP + score calculation
  utils.ts        → Helpers

prisma/
  schema.prisma   → Full DB schema
  seed.ts         → 3 starter stories
```

---

## Deploying

### Daily "word of the day" push
`vercel.json` schedules `GET /api/push/send-daily` at 09:00 UTC. The route accepts either
`Authorization: Bearer $CRON_SECRET` (how Vercel Cron calls it) or a signed-in admin
session (manual trigger). **Set `CRON_SECRET` in your Vercel project env or the cron will
be rejected with 401.**

### Offline mode
`public/sw.js` caches the app shell, Next build assets and synthesised audio, and serves
`/offline` when a navigation fails with nothing cached. Bump `VERSION` in that file when
you change caching behaviour — old caches are dropped on activate.

### Database
`Line.grammarNotes` is a JSON map keyed by locale. If you are upgrading from the older
`grammarNote String?` column, run `npm run db:push` — existing notes are not migrated and
will simply be regenerated per language on first request.
