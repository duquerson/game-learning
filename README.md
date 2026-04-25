<div align="center">

# 🎓 Game Learning Platform

**A gamified microlearning platform for developers to master JavaScript and TypeScript through interactive flashcards**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Astro](https://img.shields.io/badge/Astro-6.1-blue)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/E2E%20Tests-Passing-brightgreen)](#-testing)

[Live Demo](#) • [Documentation](./docs/SETUP.md) • [Issues](#contributing)

</div>

---

## 📋 Overview

**Game Learning** is a cutting-edge educational platform that transforms learning into an engaging experience. Users solve code challenges through interactive flashcards, earn points, build streaks, and unlock badges—all while mastering JavaScript and TypeScript fundamentals.

Perfect for:
- 👨‍💻 Developers wanting to strengthen their coding foundation
- 🎯 Teams looking for skill assessment and improvement tools
- 📚 Educational institutions integrating gamification into curricula

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- Seamless user registration and login
- OAuth 2.0 integration (Google, GitHub)
- Secure session management with Supabase Auth
- Role-based access control (coming soon)

### 🎯 Adaptive Learning System
- **Self-Assessment Mode** – Review cards at your own pace
- **Quiz Mode** – Test knowledge with timed challenges
- **Smart Difficulty Scaling** – Questions adapt to your skill level
- **Spaced Repetition** – Optimized review scheduling

### 📊 Gamification Engine
- **Points System** – Earn points based on difficulty (Easy: 10, Medium: 20, Hard: 30)
- **Streak Tracking** – Maintain daily learning streaks with bonus multipliers
- **Achievement Badges** – Unlock 8+ badges across 3 tiers (Basic, Intermediate, Advanced)
- **Progress Dashboard** – Real-time statistics and performance analytics

### 🎨 User Experience
- **Mobile-First Design** – Fully responsive across all devices
- **Dark/Light Themes** – Seamless theme switching with persistence
- **Accessibility First** – WCAG 2.1 AA compliance, semantic HTML, ARIA attributes
- **Smooth Animations** – Delightful micro-interactions and transitions

### 📚 Content Management
- **Filterable Card Library** – Browse by language, difficulty, or topic
- **Rich Card Format** – Code snippets with syntax highlighting
- **Progress Tracking** – Visual indicators for completed vs. pending topics

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Astro 6 + Vue 3 | Islands Architecture for optimal performance |
| **Styling** | TailwindCSS v4 | Utility-first CSS with custom tokens |
| **State Management** | Pinia | Type-safe reactive state |
| **Backend** | PostgreSQL (Supabase) | Secure data persistence |
| **Authentication** | Supabase Auth | OAuth + JWT sessions |
| **Deployment** | Vercel | Edge computing & CDN |
| **Testing** | Playwright + Vitest | Comprehensive test coverage |

### Project Structure

```
game-learning/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication forms
│   │   ├── cards/         # Card review & library
│   │   ├── badges/        # Achievement display
│   │   ├── onboarding/    # Topic selection
│   │   ├── profile/       # User dashboard
│   │   └── ui/            # Reusable components
│   ├── pages/             # Route-based pages (Astro SSR)
│   ├── layouts/           # Page templates
│   ├── stores/            # Pinia state (auth, user, review)
│   ├── lib/               # Core logic (quiz, points, streaks, badges)
│   ├── composables/       # Vue composition functions
│   ├── types/             # TypeScript definitions
│   ├── styles/            # Global CSS & design system
│   └── middleware/        # Route protection & redirects
├── tests/
│   ├── e2e/               # End-to-end tests (Playwright)
│   ├── unit/              # Unit tests (Vitest)
│   └── security/          # Security & vulnerability tests
├── supabase/              # Database schema & migrations
├── docs/                  # User & developer documentation
└── public/                # Static assets
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **pnpm** 9.0+ (or npm/yarn)
- **Supabase** account ([free tier available](https://supabase.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/duquerson/game-learning.git
cd game-learning

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local

# 4. Configure your database
# Add your Supabase credentials to .env.local:
# PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database Setup

```bash
# Option 1: Using Supabase CLI
supabase start

# Option 2: Manual setup
# 1. Navigate to https://supabase.com and create a new project
# 2. In SQL Editor, run: supabase/schema.sql
# 3. Seed sample data: supabase/seed.sql
```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

---

## 🎮 Usage Guide

### Getting Started

1. **Register** – Create account with email or OAuth
2. **Onboarding** – Select your learning topics
3. **Learn** – Start reviewing cards in your dashboard
4. **Earn** – Unlock badges and maintain streaks
5. **Progress** – Check your stats on the profile page

### Review Modes

**Self-Assessment Mode**
- Review cards at your own pace
- Immediate feedback on answers
- No time pressure

**Quiz Mode**
- Timed challenges (30 seconds per question)
- Score tracking
- Difficulty-adjusted scoring

---

## 🎖️ Gamification System

### Points

| Difficulty | Base Points | With 3-Day Streak | With 5-Day Streak |
|-----------|------------|------------------|------------------|
| 🟢 Easy    | 10         | 15               | 25                |
| 🟡 Medium  | 20         | 25               | 35                |
| 🔴 Hard    | 30         | 35               | 45                |

### Badges (8 Total)

#### 🟢 Basic Tier
- **First Step** – Complete your first card review
- **Streak Starter** – Maintain a 3-day streak

#### 🟡 Intermediate Tier
- **Consistency Master** – Maintain a 5-day streak
- **Topic Expert** – Complete all cards in a topic
- **Session Perfectionist** – Achieve 100% on a review session

#### 🔴 Advanced Tier
- **Quiz Champion** – Accumulate 100 correct answers
- **Dedicated Learner** – Accumulate 500 total points
- **Platform Master** – Complete all topics

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
pnpm test:e2e

# Run in UI mode
pnpm test:e2e:ui

# Run with headed browser (see interactions)
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm test:e2e -- auth.spec.ts
```

### Security Tests

```bash
# Run security audit
pnpm test:security

# SQL Injection tests
pnpm test:sql-injection

# Tampering prevention tests
pnpm test:tampering
```

### Test Coverage

```bash
pnpm test:coverage
```

---

## 🔐 Environment Variables

```env
# Supabase (Required)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional
NODE_ENV=development
DEBUG=true
```

> ⚠️ **Security Notice**: Never commit `.env` files. Use `.env.example` as a template. The service role key must **never** be exposed in client-side code.

---

## 📖 Documentation

- [Setup Guide](./docs/SETUP.md) – Installation & configuration
- [Components](./docs/COMPONENTS.md) – Component library documentation
- [Accessibility](./docs/ACCESSIBILITY.md) – WCAG compliance details
- [Design Tokens](./docs/TOKENS.md) – Design system reference

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Use **TypeScript** for type safety
- Follow the **component structure** in `src/components/`
- Write tests for new features
- Ensure all tests pass before submitting PR
- Follow [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Core Web Vitals**: All green ✅
- **Bundle Size**: ~85KB gzipped
- **Time to Interactive**: <2.5s

---

## 📝 License

This project is licensed under the **MIT License** – see [LICENSE](./LICENSE) file for details.

---

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/duquerson/game-learning/issues)
- **Discussions**: [GitHub Discussions](https://github.com/duquerson/game-learning/discussions)
- **Email**: [contact@example.com](mailto:contact@example.com)

---

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Team/classroom management
- [ ] Custom card creation
- [ ] API for third-party integrations
- [ ] Mobile native app (React Native)
- [ ] AI-powered question generation
- [ ] Multiplayer challenges

---

<div align="center">

**Made with ❤️ by the Game Learning Team**

[⭐ Star us on GitHub](https://github.com/duquerson/game-learning) | [🐦 Follow us](https://twitter.com/gamelearning)

</div>

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
