# Session Refresh

## Purpose

Explains how the app keeps Supabase access tokens fresh in React Native, where automatic background refresh does not work.

## The problem

Supabase JS's default `autoRefreshToken: true` schedules a token refresh using `setTimeout`. In React Native, `setTimeout` does not fire when an app is backgrounded on iOS. A user who leaves the app for longer than the access token TTL (default: 1 hour) returns to find their session silently expired, causing API calls to fail with 401s.

## The solution

`app/_layout.tsx` installs an `AppState` listener at module scope (outside the component, so it persists) and inside a `useEffect` for the initial state:

```ts
// Module-scope listener — installed once on import, persists across renders.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

// Inside ThemedRootStack: seed the refresh loop on initial mount if already active.
useEffect(() => {
  if (AppState.currentState === 'active') {
    supabase.auth.startAutoRefresh();
  }
}, []);
```

`startAutoRefresh()` tells the Supabase client to begin scheduling refresh calls. `stopAutoRefresh()` pauses the loop. When the app returns to the foreground (`active`), refresh resumes immediately.

## Key files

| File | Role |
|---|---|
| `app/_layout.tsx` | Both the module-scope listener and the `useEffect` seed call |
| `lib/supabase.ts` | `autoRefreshToken: true` enables the refresh machinery that `start/stop` control |

## Gotchas

- The module-scope `AppState.addEventListener` is never cleaned up (it lives for the process lifetime). This is intentional — the listener must survive component unmounts.
- `startAutoRefresh` / `stopAutoRefresh` are idempotent; calling them multiple times is safe.
- This does not help if the device clock drifts significantly or if network is unavailable when the token expires. In that case the user will need to sign in again.

## Cross-refs

- `docs/architecture/authentication.md` — session creation and storage
- `docs/architecture/secure-store-adapter.md` — where the refreshed session is persisted
