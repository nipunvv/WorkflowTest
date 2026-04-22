# Post-Sign-In Redirect

## Purpose

Documents how `useRedirectOnSignIn` works, when it fires, and its known limitation regarding returning users.

**File:** `hooks/use-redirect-on-sign-in.ts`

## How it works

`useRedirectOnSignIn` is called in `ThemedRootStack` (inside `app/_layout.tsx`) on every render. It registers a `supabase.auth.onAuthStateChange` listener that filters for the `SIGNED_IN` event and calls `router.replace('/onboarding/step-1')`.

```ts
export function useRedirectOnSignIn() {
  const { replace } = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        replace('/onboarding/step-1' as never);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [replace]);
}
```

`replace` is used (not `push`) so the login screen is removed from the stack. The user cannot go Back to the login screen from onboarding.

## Event filtering

Supabase emits several auth events. The hook only acts on `SIGNED_IN`:

| Event | Hook action |
|---|---|
| `SIGNED_IN` | `replace('/onboarding/step-1')` |
| `INITIAL_SESSION` | Ignored (session restore on launch) |
| `TOKEN_REFRESHED` | Ignored |
| `SIGNED_OUT` | Ignored (the `Stack.Protected` guard in `_layout.tsx` handles routing back to login) |

This distinction is critical: `INITIAL_SESSION` fires on every cold start when a session is already in SecureStore. Without the filter, returning users would be redirected to onboarding on every app launch.

## Known limitation: no profile-completion gate

The hook sends **every** fresh sign-in to onboarding — including users who have already completed it. There is no profile-completion flag yet (no `profiles` table in Supabase, no local flag). As a result:

- **First sign-in:** correctly lands on onboarding.
- **Sign-out + sign-in again:** incorrectly lands back on onboarding.
- **Token refresh / session restore:** correctly does not redirect (filtered out above).

This is called out explicitly in the source code comment:

> "NOTE: This does not yet skip users who have already completed onboarding — that requires a profile-completion flag, tracked as a separate issue."

## Key files

| File | Role |
|---|---|
| `hooks/use-redirect-on-sign-in.ts` | Hook implementation |
| `hooks/__tests__/use-redirect-on-sign-in.test.ts` | Jest test suite |
| `app/_layout.tsx` | Calls `useRedirectOnSignIn()` |

## Test coverage

Tests in `hooks/__tests__/use-redirect-on-sign-in.test.ts` verify:
- Subscribes to auth events on mount
- Redirects on `SIGNED_IN`
- Does not redirect on `INITIAL_SESSION`, `TOKEN_REFRESHED`, `SIGNED_OUT`
- Unsubscribes on unmount

## Not shipped / follow-up

- **Profile-completion gate.** Once a `profiles` table exists with a `onboarding_complete` flag, the redirect logic should check that flag and skip onboarding for users who finished it. The hook (or `_layout.tsx`) would need to query Supabase before deciding where to route.

## Cross-refs

- `docs/architecture/authentication.md` — when `SIGNED_IN` fires in the OAuth flow
- `docs/architecture/routing.md` — `Stack.Protected` guards that handle `SIGNED_OUT`
- `docs/onboarding/step-1-basic-info.md` — the destination screen
