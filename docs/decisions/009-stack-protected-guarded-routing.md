---
title: Use Expo Router Stack.Protected guards for auth-gated route groups
date: 2026-04-21
status: accepted
---

# 009. Use Expo Router Stack.Protected guards for auth-gated route groups

## Context

The app has three route groups with different auth requirements:

- `(auth)/` — sign-in screen, only reachable when unauthenticated.
- `(tabs)/` — main app, only reachable when authenticated.
- `(onboarding)/` — post-sign-in onboarding flow, only reachable when authenticated.

Expo Router v6 introduced `Stack.Protected`, a declarative guard that conditionally includes a group of screens in the navigation stack based on a boolean. Without it, the common pattern is an effect-based redirect (`useEffect(() => { if (!session) router.replace('/login'); }, [session])`), which has a visible flash — the target screen renders briefly before the redirect fires.

## Decision

Wrap authed route groups in `<Stack.Protected guard={isAuthed}>` and the auth group in `<Stack.Protected guard={!isAuthed}>` inside `app/_layout.tsx`. The root layout renders `null` while `loading === true` (Supabase session hydration), preventing any flash.

```tsx
<Stack>
  <Stack.Protected guard={isAuthed}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
    <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
  </Stack.Protected>
  <Stack.Protected guard={!isAuthed}>
    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
  </Stack.Protected>
</Stack>
```

`(onboarding)` sits alongside `(tabs)` under the authed guard. Route-level "must complete onboarding first" gating is a separate concern handled by `useRedirectOnSignIn` (see ADR 007), not by the guard structure.

## Alternatives considered

- **Effect-based redirect** — visible flash on cold start; race-prone when session hydration is async.
- **Middleware / `_layout.tsx` per group** — more boilerplate; each group layout would need its own guard logic; harder to see the full auth shape at a glance.

## Consequences

- Auth routing is declared in one place (`app/_layout.tsx`) and is easy to audit.
- Adding a new protected route group is a single `<Stack.Screen>` line inside the appropriate `<Stack.Protected>` block.
- The `unstable_settings = { anchor: '(tabs)' }` export in `app/_layout.tsx` sets the default authed landing; this may need updating if `(tabs)` is ever replaced as the primary post-onboarding destination.

## References

- `app/_layout.tsx` — full `Stack.Protected` implementation
- `CLAUDE.md` — "Routing layout" section
- PR #1 and PR #6 for the (auth) and (onboarding) additions respectively
