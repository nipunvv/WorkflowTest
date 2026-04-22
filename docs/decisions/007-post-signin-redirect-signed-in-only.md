---
title: Post-sign-in redirect fires on SIGNED_IN event only; profile gate deferred
date: 2026-04-22
status: accepted
---

# 007. Post-sign-in redirect fires on SIGNED_IN event only; profile gate deferred

## Context

After a user signs in, they should land on the onboarding flow (step 1) rather than the default tabs screen. The redirect must not fire on every app launch — returning users with an active session should land on their normal route, not be bounced to onboarding repeatedly.

Supabase's `onAuthStateChange` fires for multiple event types: `SIGNED_IN`, `INITIAL_SESSION` (session restore from storage on cold start), `TOKEN_REFRESHED`, `SIGNED_OUT`, `USER_UPDATED`, etc. A naive check on session presence (`if (session) redirect(...)`) triggers on `INITIAL_SESSION` and `TOKEN_REFRESHED` — bouncing every returning user to onboarding on every cold start.

## Decision

`hooks/use-redirect-on-sign-in.ts` subscribes to `onAuthStateChange` and redirects to `/onboarding/step-1` **only when the event is `SIGNED_IN`**. `INITIAL_SESSION` and `TOKEN_REFRESHED` are ignored.

The hook is called once, inside `ThemedRootStack` in `app/_layout.tsx`. It does **not** add a second subscriber — `AuthProvider` already holds the canonical `onAuthStateChange` subscription for session state. A second subscriber creates listener-ordering races; the hook uses a separate subscription only for the navigation side effect.

**Known limitation:** The hook does not check whether the user has already completed onboarding. Every explicit sign-in sends the user to step 1, even if they completed it in a prior session. Proper gating requires a `profiles.onboarding_completed` flag. The `profiles` table does not exist yet; this is tracked as a follow-up.

## Alternatives considered

- **Check session presence (`if (session) ...`)** — fires on `INITIAL_SESSION`; bounces returning users on every cold start.
- **Extend `AuthContext` to expose `lastAuthEvent`, derive redirect from shared state** — cleaner long-term (no second subscriber, no ordering race). Not done in PR #6 because `AuthContext` would need a breaking interface change. The solutions doc flags this as the preferred future shape.
- **Check `profiles.onboarding_completed` at redirect time** — the correct production approach. Deferred because the schema doesn't exist yet.

## Consequences

- Fresh sign-ins reliably land on step 1.
- Returning users on cold start are not affected.
- Users who have already completed onboarding are incorrectly bounced to step 1 on every sign-in (not sign-out/in cycles in normal usage, but visible in testing). This is a known gap commented in the hook source.
- When the `profiles` schema is added, this hook should be updated to check `onboarding_completed` and route accordingly.

## References

- `hooks/use-redirect-on-sign-in.ts` — implementation and NOTE comment
- `app/_layout.tsx` — `useRedirectOnSignIn()` call site
- `docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md` — Pattern 4 (auth-event filtering) and Pattern 6 (avoid parallel subscribers)
- PR #6: https://github.com/nipunvv/WorkflowTest/pull/6 — "Design decisions" and "Known limitations" sections
