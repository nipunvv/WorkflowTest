---
title: Use browser-based PKCE OAuth for Google sign-in
date: 2026-04-21
status: accepted
---

# 001. Use browser-based PKCE OAuth for Google sign-in

## Context

The app needs Google authentication. Two main approaches exist for React Native:

1. **Native Google Sign-In** (`@react-native-google-signin/google-signin`) — invokes the native Google SDK, stays in-app, returns a credential that is then exchanged with Supabase.
2. **Browser-based OAuth via Supabase** — redirects through `ASWebAuthenticationSession` (iOS) / Chrome Custom Tabs (Android), letting Supabase broker the Google OAuth flow using PKCE.

The repo uses Supabase as its auth provider. The Supabase JS client ships a first-party PKCE OAuth implementation. Using the native SDK would require managing the Google credential exchange separately, adding a native dependency that requires a dev-client build, and keeping client IDs in sync across platforms and the Supabase dashboard.

## Decision

Use Supabase's `signInWithOAuth({ provider: 'google' })` with `skipBrowserRedirect: true` and `flowType: 'pkce'`. Open the returned authorize URL in `WebBrowser.openAuthSessionAsync`, then exchange the `?code=` redirect param via `supabase.auth.exchangeCodeForSession(code)`.

Key configuration in `lib/supabase.ts`:
- `detectSessionInUrl: false` — the default `true` assumes a web URL; breaks React Native.
- `flowType: 'pkce'` — the default implicit flow is deprecated and incompatible with PKCE.

## Alternatives considered

- **Native Google Sign-In SDK** — rejected. Requires an additional native module, a separate Google Cloud client ID per platform, and manual Supabase credential exchange. More moving parts for no user-visible benefit at this stage.
- **Magic link / email OTP** — out of scope; issue required Google OAuth specifically.

## Consequences

- `WebBrowser.openAuthSessionAsync` is a JS-only dependency (no native rebuild needed for the auth flow itself).
- The redirect URL (`Linking.createURL('auth/callback')`) is runtime-dependent: `exp://...` in Expo Go (IP changes per network), `workflowtest://auth/callback` in a dev-client. Every distinct Expo Go LAN IP needs its own entry in Supabase's Redirect URL allowlist. Dev-client is strongly preferred for stable development.
- Supabase's `Site URL` must be set to a URL the app can handle — it is the fallback when `redirect_to` isn't in the allowlist.

## References

- `lib/auth-context.tsx` — `signInWithGoogle()` implementation
- `lib/supabase.ts` — `detectSessionInUrl: false`, `flowType: 'pkce'`
- `CLAUDE.md` — "Auth flow" and "OAuth redirect URL quirks" sections
- `docs/plans/2026-04-21-001-feat-auth-sign-in-redesign-plan.md`
- PR #1: https://github.com/nipunvv/WorkflowTest/pull/1
