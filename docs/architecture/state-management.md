# State Management

## Purpose

Describes how state is managed in the app. This is intentionally brief — the app is small and early-stage, and the state model is simple.

## Global state: AuthContext

There is exactly one piece of global state: the Supabase `Session` (or `null`) exposed by `AuthProvider` in `lib/auth-context.tsx`.

```ts
type AuthContextValue = {
  session: Session | null;
  user: User | null;     // derived from session?.user
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};
```

`AuthProvider` wraps the entire app in `app/_layout.tsx`. Any component can call `useAuth()` to read the session or trigger auth actions.

The `value` object is stabilized with `useMemo` keyed on `[session, loading]`. **Note:** `useMemo` is used here explicitly because `AuthContext` was written before the React Compiler was enabled and the value object needs to be stable across renders. New code should not reach for `useMemo` manually — the React Compiler handles memoization automatically.

## Local state

Everything else is local `useState` inside the component that owns it:

- `app/(auth)/login.tsx` — `submitting: boolean` (in-flight guard for the Google sign-in button)
- `app/(onboarding)/step-1.tsx` — `firstName`, `dateOfBirth`, `diagnosisDate`, `notSure` (all form fields)
- `DateField` component (inside `step-1.tsx`) — `pickerOpen: boolean` (controls the date picker modal visibility)

There are no reducers, no stores, no Zustand, no Redux. For a project this size, collocated `useState` is the right call.

## React Compiler

`app.json` enables `experiments.reactCompiler: true`. The compiler inserts memoization automatically at the component and hook level. As a result:

- **Do not write `React.memo`, `useMemo`, or `useCallback` by default.** The compiler handles it. Only reach for them when profiling shows the compiler missed a case.
- The one existing explicit `useMemo` in `auth-context.tsx` predates compiler enablement and is harmless.

## Not shipped

- No server state library (React Query, SWR, etc.)
- No Zustand, Jotai, or any third-party state library
- No Supabase real-time subscriptions

## Key files

| File | Role |
|---|---|
| `lib/auth-context.tsx` | `AuthProvider`, `AuthContext`, `useAuth()` |

## Cross-refs

- `docs/architecture/authentication.md` — how the session arrives in `AuthContext`
- `docs/architecture/session-refresh.md` — how the session stays fresh
