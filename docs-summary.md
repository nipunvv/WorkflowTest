# Documentation Sprint — Summary

Team ran 2025-04-22 after PR #6 merge. Team lead: main session. Teammates: Documentation Engineer (Sonnet) and Project Context Updater (Sonnet). API Reference Writer skipped — this is a Supabase-backed mobile client with no HTTP surface of its own.

## Files Created (25 new, 2 modified)

### `docs/` — feature + architecture + development (Documentation Engineer, 14 files, ~1450 lines)

| File | Lines | Purpose |
|---|---|---|
| `docs/index.md` | 67 | Scanning index for all docs |
| `docs/architecture/authentication.md` | 145 | PKCE OAuth flow + mermaid sequence diagram |
| `docs/architecture/routing.md` | 125 | Expo Router v6 groups + mermaid route tree |
| `docs/architecture/secure-store-adapter.md` | 68 | iOS Keychain chunking (`.0`/`.1`/`.count` scheme) |
| `docs/architecture/session-refresh.md` | 51 | `AppState` → `startAutoRefresh`/`stopAutoRefresh` |
| `docs/architecture/state-management.md` | 57 | `AuthContext` is essentially all global state |
| `docs/architecture/styling.md` | 117 | NativeWind v4 tokens + DESIGN.md divergence |
| `docs/authentication/sign-in-screen.md` | 108 | `login.tsx` spec: layout, states, legal links |
| `docs/onboarding/step-1-basic-info.md` | 179 | Full Step 1 spec + validation + testID contracts |
| `docs/onboarding/post-signin-redirect.md` | 81 | `useRedirectOnSignIn` hook and its limitation |
| `docs/development/setup.md` | 120 | Clone → install → env → run → EAS |
| `docs/development/project-structure.md` | 151 | Annotated repo tree |
| `docs/development/testing.md` | 136 | Jest+RNTL patterns, Maestro limits |
| `docs/development/coding-conventions.md` | 71 | Pointer to CLAUDE.md + summary |

### `docs/decisions/` — ADRs (Project Context Updater, 9 files, ~400 lines)

| ADR | Title |
|---|---|
| 001 | Supabase Google OAuth via PKCE (not native SDK) |
| 002 | SecureStore chunking adapter (iOS Keychain 2KB limit) |
| 003 | NativeWind v4 + Tailwind v3.4; StyleSheet as fallback |
| 004 | Figma hex tokens in `tailwind.config.js`; DESIGN.md reconciliation deferred |
| 005 | Strict RED-first TDD; tests never modified to pass |
| 006 | `DateField` wrapper for testable custom synthetic events (RNTL tree-walk pattern) |
| 007 | Post-sign-in redirect filters `SIGNED_IN` only; profile gate deferred |
| 008 | EAS simulator-only dev-client builds (no Apple Developer account) |
| 009 | `Stack.Protected guard={isAuthed}` for auth-gated route groups |

### Entry-point files modified (Project Context Updater)

| File | Change |
|---|---|
| `CLAUDE.md` | Additive audit: added post-sign-in redirect subsection, updated routing tree to include `(onboarding)/`, enumerated current token counts (9 auth + 11 onboarding + 3 shadows), added DateField wrapper pattern note, added per-file `expo-router` mock rule + RED scaffolding rule, added Maestro flow + dev-client rebuild warnings. No rewrites. |
| `README.md` | Replaced `create-expo-app` default boilerplate with 96-line project README (description, getting started, structure, commands, docs links, roadmap). |

## Discrepancies Surfaced (These Are Real)

Flagged across feature docs and ADRs. None are blockers; all are tracked openly rather than buried.

1. **`canProceed` ambiguity (Onboarding Step 1).** The validation rule `firstName ∧ (DOB ∨ notSure)` encodes "Not sure" (a diagnosis-date toggle) as a DOB bypass. The test locks in this behavior with an explicit comment flagging the ambiguity. Product intent is unresolved. Documented in `docs/onboarding/step-1-basic-info.md`.

2. **Legal URLs are placeholders.** `login.tsx` uses `https://example.com/terms` and `https://example.com/privacy`. Flagged in `docs/authentication/sign-in-screen.md`. Replace before any App Store submission.

3. **`expo-auth-session` is installed but unused.** The auth flow uses Supabase JS + `expo-web-browser` directly. Either remove the dep or document an intended use.

4. **Styling token divergence from `DESIGN.md`.** `tailwind.config.js` uses a flatter naming scheme than `DESIGN.md`'s semantic aliases (`BG/Primary`, `Text/Secondary`, etc.). Some hex values remain inline in component styles rather than tokens. Documented in `docs/architecture/styling.md` and formalized in ADR 004 (reconciliation deferred).

5. **No profile-completion gate on post-sign-in redirect.** `useRedirectOnSignIn` bounces every `SIGNED_IN` event to `/onboarding/step-1`, including returning users who've already completed onboarding. Adversarial review in PR #6 also flagged that some Supabase branches fire `SIGNED_IN` on session restore. Documented in ADR 007, `docs/onboarding/post-signin-redirect.md`, and `docs/onboarding/step-1-basic-info.md`. Requires a `profiles.onboarding_completed` flag to fully resolve.

6. **Stale `CLAUDE.md` routing tree (now corrected).** Pre-sprint, `CLAUDE.md` listed only `(auth)`, `(tabs)`, and `modal.tsx`. `(onboarding)/` existed in code. Corrected during the audit pass.

## Inputs the Prompt Referenced That Don't Exist in This Repo

The spawn prompt assumed a larger-project workflow. The following inputs were absent; agents worked from actual evidence instead:

- ❌ `prd.md`
- ❌ `architecture-final.md`
- ❌ `qa-report.md`
- ❌ per-teammate `DECISIONS.md` files

**Evidence used instead:** source code (`app/`, `hooks/`, `lib/`, `components/`), the 2 existing plan docs (`docs/plans/*.md`), the solutions doc (`docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md`), `gh pr view 1` and `gh pr view 6` (merged PR descriptions), `CLAUDE.md`, `DESIGN.md`, and code comments.

## Scope Calibration Applied

The prompt suggested "300–800 line files" and broad domain folders. Both would have been dishonest for a ~1466-LOC pre-MVP with 2 shipped screens. The team:

- Wrote files at their natural length (40–180 lines each), refusing to pad
- Grouped docs only by **shipped** features: `authentication/`, `onboarding/`. No speculative domain folders (`symptom_tracking/`, `patient_care/`, etc.)
- Skipped the API reference writer entirely — no HTTP surface exists; all "APIs" are Supabase SDK calls
- Kept ADR count at 9 — one per genuinely-made architectural decision with shipped evidence

## What's NOT Documented (Intentional Gaps)

- Step 2 / Step 3 onboarding (not shipped yet)
- Symptom logging, trigger identification, insights (not shipped)
- Profile persistence (`profiles` table migration is a separate tracked issue)
- Production deploy workflow (currently simulator-only)
- Android-specific behavior beyond `CLAUDE.md` gotchas (iOS-first development currently)

These are signalled in the docs where relevant ("not shipped", "follow-up") rather than silently omitted.

## Recommended Follow-Ups

1. Resolve the `canProceed` ambiguity with product. Either confirm the current behavior or update both the rule and the test.
2. Decide whether `expo-auth-session` stays (document intent) or goes (remove dep).
3. Replace placeholder legal URLs before any external preview.
4. Open the profile-gate issue explicitly (currently implicit in hook comments).
5. Run `docs/solutions/` on each future PR's learnings — this directory is now indexed in `CLAUDE.md` for discovery.
