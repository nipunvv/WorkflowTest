# Hi Honey

A React Native + Expo mobile app for personal health and symptom tracking. Built with Expo Router, NativeWind, and Supabase.

**Status:** Pre-MVP. Two screens shipped — sign-in (Google OAuth) and onboarding step 1 (Basic Info). The core auth infrastructure, routing guards, and TDD harness are in place.

## Getting started

**Prerequisites:** Node 18+, npm, Xcode (for iOS simulator).

```bash
git clone https://github.com/nipunvv/WorkflowTest.git
cd WorkflowTest
npm install
cp .env.example .env   # fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY
npx expo start         # opens in Expo Go or dev-client
```

To use the onboarding flow (which includes a native date picker), you need a dev-client build:

```bash
npx eas build --platform ios --profile development
npx eas build:run -p ios --latest
npx expo start --dev-client
```

## Project structure

```
app/
  _layout.tsx          # AuthProvider, Stack.Protected guards, AppState refresh
  (auth)/              # Sign-in screen (unauthenticated)
  (tabs)/              # Main app tabs (authenticated)
  (onboarding)/        # Onboarding flow (authenticated, post-sign-in)
hooks/
  use-redirect-on-sign-in.ts   # Fires on SIGNED_IN → /onboarding/step-1
lib/
  auth-context.tsx     # AuthProvider, useAuth, signInWithGoogle, signOut
  supabase.ts          # Supabase client (PKCE, ChunkedSecureStoreAdapter)
  secure-store-adapter.ts  # iOS Keychain chunking (2KB limit workaround)
components/            # Shared UI components
docs/
  index.md             # Docs directory map
  plans/               # Feature planning docs
  solutions/           # Learnings and patterns from past work
  decisions/           # Architecture Decision Records (ADRs)
.maestro/              # E2E Maestro YAML flows
```

## Commands

```bash
# Dev server
npx expo start                       # Expo Go or dev-client
npx expo start --dev-client          # force dev-client

# Tests
npm test                             # Jest + RNTL (all tests)
npm run test:watch                   # watch mode
npx jest path/to/file.test.ts        # single file
npx jest -t "partial test name"      # single test

# Code quality
npm run lint                         # ESLint (expo lint)
npm run format                       # Prettier + Tailwind class sort
npx tsc --noEmit                     # type-check

# EAS builds
npx eas build --platform ios --profile development   # cloud build (simulator)
npx eas build:run -p ios --latest                    # install latest build on sim

# E2E (dev-client build must be installed and running)
maestro test .maestro/
```

## Documentation

| File | What it covers |
|---|---|
| `CLAUDE.md` | Non-negotiables, mobile stack rules, architecture notes, gotchas — read before touching any code |
| `DESIGN.md` | Design tokens: colors, typography, spacing, shadows, motion |
| `docs/index.md` | Full map of the `docs/` directory |
| `docs/decisions/` | Architecture Decision Records (ADRs) |
| `docs/plans/` | Per-feature TDD planning docs |
| `docs/solutions/` | Patterns and learnings from past work |

## Status and roadmap

| Area | Status |
|---|---|
| Google OAuth sign-in | Shipped (PR #1) |
| Onboarding Step 1 — Basic Info | Shipped (PR #6) |
| Onboarding Steps 2 & 3 | Not started |
| Persist onboarding data to Supabase | Not started (no `profiles` schema yet) |
| Profile-gated redirect (skip onboarding for returning users) | Not started — tracked follow-up |
| OTA updates (`eas update`) | Not wired — `expo-updates` not installed |
