# docs/ index

One-line description of every file in this directory.

## decisions/

Architecture Decision Records for choices made during the project. Each file is a short ADR.

| File | Decision captured |
|---|---|
| `001-supabase-google-oauth-via-pkce.md` | Why PKCE OAuth via Supabase JS (not native Google SDK) |
| `002-secure-store-chunking-adapter.md` | Why a chunking adapter for iOS Keychain |
| `003-nativewind-over-stylesheet.md` | Why NativeWind over StyleSheet-only |
| `004-figma-tokens-diverge-from-designmd.md` | Current divergence between DESIGN.md and tailwind.config.js |
| `005-tdd-strict-red-first.md` | Strict red-first TDD policy |
| `006-datefield-wrapper-for-custom-synthetic-events.md` | Why DateField is a local wrapper component |
| `007-post-signin-redirect-signed-in-only.md` | Why useRedirectOnSignIn filters SIGNED_IN only |

## architecture/

| File | What it covers |
|---|---|
| `authentication.md` | OAuth flow end-to-end: button tap → Supabase PKCE URL → ASWebAuthenticationSession → code exchange → session stored in SecureStore |
| `secure-store-adapter.md` | Why the chunking adapter exists (iOS Keychain ~2KB limit) and how it splits values |
| `routing.md` | Expo Router v6 file-based routing, `(auth)` / `(tabs)` / `(onboarding)` groups, `Stack.Protected` guards |
| `state-management.md` | Global auth state via `AuthContext`; everything else is local `useState` |
| `session-refresh.md` | `AppState` listener in `app/_layout.tsx` driving Supabase token auto-refresh |
| `styling.md` | NativeWind v4 setup, Tailwind token registry, interplay with `StyleSheet.create()` and `DESIGN.md` |

## authentication/

| File | What it covers |
|---|---|
| `sign-in-screen.md` | The login screen: copy, layout, Google button, legal footer, loading + error states |

## onboarding/

| File | What it covers |
|---|---|
| `step-1-basic-info.md` | Shipped onboarding step 1: fields, validation logic, toggle behavior, accessibility, testID contracts |
| `post-signin-redirect.md` | `useRedirectOnSignIn` hook: how and when it fires, known limitation (no profile-completion gate) |

## development/

| File | What it covers |
|---|---|
| `setup.md` | Clone → install → `.env` → run; EAS build commands; simulator caveats |
| `project-structure.md` | Annotated tour of every top-level directory and key files |
| `testing.md` | Jest + RNTL conventions, `jest-setup.ts` mocks, Maestro limitations |
| `coding-conventions.md` | Summary of project rules; points to `CLAUDE.md` as authoritative source |

## plans/

Per-feature implementation plans authored before work begins.

| File | What it covers |
|---|---|
| `2026-04-21-001-feat-auth-sign-in-redesign-plan.md` | Auth sign-in screen redesign plan |
| `2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md` | Onboarding step 1 RED test plan |

## solutions/

Research and best-practice notes discovered during development.

| File | What it covers |
|---|---|
| `best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md` | TDD patterns for multi-screen React Native with RNTL |
