# Dutch — Language Learning App

## Overview
A Dutch language learning web app with interactive flashcards for vocabulary (A1–B2 CEFR levels), grammar rules, and irregular verbs. Features trilingual RU/EN/UA interface, text-to-speech, glassmorphism + Google-accent design, light/dark theme, and a donation modal.

## Architecture
- **Frontend**: React + Vite, wouter routing, TanStack Query, Tailwind CSS, Framer Motion
- **Backend**: Express.js + Drizzle ORM + PostgreSQL
- **Auth**: Custom email/password authentication with bcrypt hashing, express-session + connect-pg-simple
- **Email**: Gmail integration via Replit connector — sends welcome email on registration
- **PWA**: Installable on mobile (manifest.json, service worker, app icons)
- **Styling**: Glassmorphism + Google accent colors (#4285F4, #EA4335, #FBBC05, #34A853)

## Pages & Routes
- `/` — Landing page (logged-out) / redirect to `/words` (logged-in)
- `/words` — Flashcard vocabulary study (Learn/Add Word/Learned/Repeat modes) with A1–B2 level filters
- `/rules` — Grammar rules list
- `/verbs` — Irregular verbs table/study mode
- `/context` — Context search: search Dutch words and see example sentences from the database (290+ seeded), with live debounced search, in-memory caching, iOS-style UI

## Key Files
- `shared/schema.ts` — DB schema: words, rules, verbs, context_sentences tables + re-exports auth models
- `shared/models/auth.ts` — Users (with password, nickname) and sessions tables
- `server/auth.ts` — Custom email/password auth (register, login, logout, session management)
- `server/gmail.ts` — Gmail integration for sending welcome emails (Replit connector)
- `client/src/hooks/use-auth.ts` — React hook for auth state
- `client/src/pages/landing.tsx` — Landing page for logged-out users
- `server/routes.ts` — API routes + seed data
- `server/storage.ts` — Database storage layer (IStorage interface)
- `server/context-seed.ts` — 290 Dutch→English example sentences for context search
- `client/src/pages/words.tsx` — Words page with flashcard modes
- `client/src/pages/context.tsx` — Context search page (iOS-style search bar, live results)
- `client/src/components/layout.tsx` — Layout with sidebar (desktop) + bottom nav (mobile)
- `client/src/components/flashcard.tsx` — Flashcard component
- `client/src/lib/i18n.tsx` — Trilingual EN/RU/UA translations
- `client/src/index.css` — Theme variables, glass utilities, level buttons

## Data Model
- **words**: id, dutch, translation, translationRu, translationEn, translationUk, knownCount, isLearned, level, isUserAdded, wrongCount, repeatKnownCount, inRepeatList
- **rules**: id, title, explanation, difficulty
- **verbs**: id, infinitive, pastSingular, pastParticiple, translation, example, isLearned
- **context_sentences**: id, dutch, english, level

## Navigation
- Desktop: sidebar with nav links + heart donate button in header area
- Mobile: top header (logo + donate heart + lang toggle + theme toggle) + bottom nav (Words, Grammar, Verbs, Context)

## Behavior Notes
- **Learn mode**: One ✅ tap marks word as learned immediately; ❌ increments `wrongCount`
- **Repeat tab**: Two sub-modes — "Weak Words" (wrongCount > 0) and "My List" (inRepeatList=true)
  - ✅ increments `repeatKnownCount`; at 5 → graduated to Learned
  - ❌ resets `repeatKnownCount` to 0 and increments `wrongCount`
  - Progress dots (1–5) shown above flashcard
- `isAnimating` lock prevents double-taps during save
- Learned tab has independent A1/A2/B1/B2 level filter
- **Add Word auto-translate**: `/api/translate?word=X` calls MyMemory API (NL→EN, NL→RU, NL→UK in parallel)
  - 500ms debounce on Dutch input, client-side Map cache, loading spinner in translation field
  - Form shows only one translation field matching current language (RU/EN/UA)
  - Manual edits are respected and not overwritten
  - No API key needed (MyMemory free tier, server-side only)
- **Flashcard back**: Shows translation matching current language (EN→translationEn, RU→translationRu, UA→translationUk with fallback to translationRu)
- Context search uses `/api/context?q=WORD` with PostgreSQL ILIKE matching
- Results cached client-side in Map for instant repeat queries
- Stripe test key configured for donation modal
