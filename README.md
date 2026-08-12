# Retrace

Learn English through stories — built for Arabic speakers.

## Stack
- **Next.js 14** (App Router)
- **Clerk** — authentication
- **Prisma + PostgreSQL** — database
- **OpenAI API** — AI story generation & vocab tagging
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
  ai.ts           → Anthropic client (story gen + vocab tagging)
  fuzzy.ts        → Typing match algorithm
  scoring.ts      → XP + score calculation
  utils.ts        → Helpers

prisma/
  schema.prisma   → Full DB schema
  seed.ts         → 3 starter stories
```

---

## Phase 2 (next): Core learning loop

The story reader, typing exercise, audio playback, and streak tracking live in Phase 2.
Files to build:
- `app/(app)/story/[id]/page.tsx` — reader UI
- `components/reader/LineReader.tsx` — line display + translation toggle
- `components/reader/LineInput.tsx` — typing exercise
- `components/audio/AudioPlayer.tsx` — ElevenLabs playback
- `hooks/useReader.ts` — state machine
- `hooks/useAudio.ts` — audio management
- `app/api/audio/[lineId]/route.ts` — TTS generation + cache
