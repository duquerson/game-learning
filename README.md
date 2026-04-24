# MicroLearn Platform

> Gamified microlearning platform for developers to learn JavaScript and TypeScript through flashcards. Users earn points, maintain daily streaks, and unlock badges as they progress.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account (free tier)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd microlearn-astro-vue

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env
```

Edit `.env` with your Supabase credentials (see **Environment Variables** below).

### Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase/seed.sql` (or `PR.md` Phase 0.2) to create tables
3. Seed cards and badges via SQL or admin panel

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321)

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Astro 5 (Islands Architecture) |
| **Components** | Vue 3 + Composition API |
| **State** | Pinia |
| **Styling** | TailwindCSS v4 |
| **Backend** | PostgreSQL (Supabase) |
| **Auth** | Supabase Auth |
| **Deployment** | Vercel / Netlify |

---

## ✨ Features

- 🔐 User authentication (register/login/logout with Google & GitHub OAuth)
- 🎯 Onboarding flow with topic selection
- 📚 Filterable card library by user topics
- 🧠 Two review modes: **Self-Assessment** & **Quiz**
- 📊 Points system with streak-based bonuses
- 🏅 Badge unlocking system (Basic / Intermediate / Advanced)
- 👤 User profile with progress statistics
- 🌓 Light/dark theme toggle
- 📱 Mobile-first responsive design

---

## 🎖️ Points & Badges

### Points (per correct answer)

| Difficulty | Points |
|------------|--------|
| Easy       | 10     |
| Medium     | 20     |
| Hard       | 30     |

### Streak Bonuses

- 🔥 3-day streak → **+5** bonus
- 🔥 5-day streak → **+15** bonus
- 🔥 Every 3rd day after 5 → **+5** bonus

### Badge Levels

- 🟢 **Basic** – Early achievements
- 🟡 **Intermediate** – Consistent progress
- 🔴 **Advanced** – Mastery milestones

Badge conditions include:
- `first_correct` – First correct answer
- `correct_streak` – Reach streak threshold
- `total_reviewed` – Review N cards
- `daily_streak` – Maintain streak days
- `topic_mastery` – Complete all cards in a topic
- `total_correct` – Accumulate correct answers
- `perfect_session` – 100% correct in a session
- `all_cards_mastery` – Complete all topics

---

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI (GlassCard, GlassButton, etc.)
│   ├── auth/         # Auth forms (Login, Register)
│   ├── onboarding/   # Topic selection
│   ├── cards/        # Review, Results, Library
│   ├── badges/       # Badge grid & items
│   └── profile/      # User profile
├── pages/            # Astro pages (SSR)
├── layouts/          # Page layouts (AppLayout, BaseLayout)
├── stores/           # Pinia stores (auth, user, review)
├── lib/              # Utilities (quiz, points, streak, badges, errors, supabase)
├── composables/      # Vue composables (useReviewSession, useTheme)
├── types/            # TypeScript definitions (app, database)
├── styles/           # Global CSS with Tailwind v4
└── middleware/       # Auth & onboarding redirect logic
```

---

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL (exposed to client) |
| `PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key (exposed to client) |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ | Service role key (server-side only) |

> ⚠️ **Security**: Never commit `.env` files. The service role key must **never** be exposed to the client bundle.

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
pnpm test:unit
```

Runs property-based tests for:
- Quiz option generation (uniqueness, correctness)
- Streak calculations (idempotency, monotonicity)
- Points & bonus logic

### E2E Tests (Playwright)

```bash
pnpm test:e2e
```

Covers critical user flows:
- Authentication
- Review sessions
- Badge unlocking

---

## 🚀 Deployment

### Vercel (Recommended)

1. Connect repository in Vercel dashboard
2. Add environment variables under **Settings → Environment Variables**
3. Deploy (auto-build on push)

### Manual Build

```bash
pnpm build   # Generates .vercel/output
pnpm preview # Preview production build
```

---

## 📜 License

MIT

---

## 🤝 Contributing

Contributions welcome! Please ensure:

- New features include unit tests
- Code follows existing TypeScript conventions
- No secrets or keys are committed
- Linting passes (`pnpm lint` – if configured)
