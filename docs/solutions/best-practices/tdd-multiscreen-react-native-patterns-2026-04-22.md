---
title: Non-obvious patterns from a RED → GREEN React Native TDD feature
date: 2026-04-22
category: docs/solutions/best-practices
module: onboarding
problem_type: best_practice
component: testing_framework
severity: medium
related_components:
  - authentication
  - development_workflow
  - tooling
applies_when:
  - Writing RED-phase RNTL tests for a new multi-screen feature
  - Firing custom synthetic events on components wrapping Pressable
  - Wiring post-sign-in navigation side effects off Supabase auth state
  - Adding placeholder routes under expo-router typed routes
tags:
  - react-native
  - expo-router
  - rntl
  - supabase-auth
  - tdd
  - typed-routes
  - onboarding
---

# Non-obvious patterns from a RED → GREEN React Native TDD feature

## Context

PR #6 added Onboarding Step 1 (basic info: first name, date of birth, diagnosis date with a "Not sure" toggle) and a post-sign-in redirect hook in this Expo Router + Supabase app. It was the first multi-screen feature here written strictly RED → GREEN per `CLAUDE.md`'s non-negotiables. Several patterns surfaced during the RED → GREEN transition that weren't discoverable from public docs or type errors alone — they required reading RNTL source, tracing event-handler walk behavior, and reasoning about listener ordering inside `AuthProvider`.

The gaps worth capturing:

- `fireEvent(node, 'onChangeDate', date)` silently did nothing — RNTL re-prefixes `on`. The surface symptom was downstream assertion failures that looked like real bugs.
- React Native's `Pressable` doesn't accept arbitrary custom event props, so the naive "just add `onChangeDate` to the `Pressable`" attempt fails TypeScript. The idiomatic fix (a wrapper component) turns out to also be the correct way to expose a synthetic event hook to RNTL.
- RED tests initially failed with `Cannot find module …` rather than `Unable to find element …`. That's not a useful RED signal.
- Adding a second `onAuthStateChange` listener for navigation side effects created ordering races against `AuthProvider`'s own subscriber.
- `@ts-expect-error` vs `as never` came up when step-2 hadn't been scaffolded yet but step-1 needed to navigate to it.

## Guidance

### 1. RNTL `fireEvent` event names: strip the `on` prefix

RNTL v13's `getEventHandlerName` (see `node_modules/@testing-library/react-native/build/event-handler.js`) converts an event name into a prop lookup with:

```js
const getEventHandlerName = (eventName) =>
  `on${capitalizeFirstLetter(eventName)}`;
```

So `fireEvent(node, 'changeDate', arg)` resolves to `props.onChangeDate`. Writing `fireEvent(node, 'onChangeDate', arg)` resolves to `props.onOnChangeDate`, which doesn't exist — the call silently no-ops.

```tsx
// Wrong — resolves to props.onOnChangeDate, never fires
fireEvent(getByTestId('dob-field'), 'onChangeDate', new Date('1990-06-01'));

// Right — resolves to props.onChangeDate
fireEvent(getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
```

The shorthands hide this by construction — `fireEvent.changeText(input, 'hi')` and `fireEvent.press(btn)` internally pass `'changeText'` and `'press'`, never `'onChangeText'`. The generic `fireEvent(node, name, arg)` form is where the foot-gun lives — and that's also where you end up for custom synthetic events.

### 2. Expose custom synthetic events via a thin wrapper component

`Pressable`, `View`, and friends have fixed prop types. Adding `onChangeDate` directly to a `Pressable` is a TypeScript error: `Property 'onChangeDate' does not exist on type PressableProps`. But RNTL's `findEventHandler` walks **up** from the matched node (by `testID`, role, etc.) until it finds a prop matching the resolved handler name. That means a parent component declaring the prop is sufficient — the prop doesn't have to live on the queried node itself.

```tsx
// app/(onboarding)/step-1.tsx
type DateFieldProps = {
  testID: string;
  accessibilityLabel: string;
  value: Date | null;
  onChangeDate: (d: Date) => void;
  disabled?: boolean;
  placeholder: string;
  disabledPlaceholder?: string;
};

function DateField({ testID, accessibilityLabel, value, onChangeDate, disabled, placeholder }: DateFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={() => setPickerOpen(true)}
      >
        <Text>{value ? formatDate(value) : placeholder}</Text>
      </Pressable>
      <DateTimePickerModal
        isVisible={pickerOpen}
        mode="date"
        onCancel={() => setPickerOpen(false)}
        onConfirm={(d) => { setPickerOpen(false); onChangeDate(d); }}
      />
    </>
  );
}
```

Test:

```tsx
fireEvent(getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
```

Flow: RNTL finds the `Pressable` by `testID="dob-field"`, walks up, finds `onChangeDate` declared on the `DateField` wrapper's props, calls it. The prop is wired to the real `DateTimePickerModal` callback in production, so the same prop serves both the test affordance and the real wiring — no test-only dead code.

Think of this as "test affordance as first-class prop": the prop has a real runtime use AND happens to be a clean synthetic event target for tests.

### 3. RED-phase tests need enough scaffolding to produce real RED signals

A RED test that fails with `Cannot find module '../step-1'` is broken, not RED. So is `TypeError: X is not a function`, `ReferenceError`, or any failure caused by the spec file not even loading. A useful RED failure names the missing behavior: `Unable to find an element with testID: progress-bar`.

The RED commit must include:

1. A minimal stub — enough for the test file to import and render without crashing:

   ```tsx
   // app/(onboarding)/step-1.tsx
   import { View } from 'react-native';
   export default function OnboardingStep1Screen() {
     return <View testID="onboarding-step-1-screen" />;
   }
   ```

2. Route registration in `app/_layout.tsx` (so `Stack.Protected` + typed routes resolve the path):

   ```tsx
   <Stack.Protected guard={isAuthed}>
     <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
     <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
   </Stack.Protected>
   ```

3. Any type/import plumbing the test file needs — shared fixtures, module mocks (e.g., `jest.mock('expo-router', () => ({ useRouter: jest.fn(), Stack: { Screen: () => null, Protected: ({children}) => children }}))`).

Once scaffolded, every failure should read `Unable to find …` — spec gaps, not setup gaps.

**Verification rule before committing RED:**

```bash
npx jest app/\(onboarding\)/__tests__/step-1.test.tsx 2>&1 | grep -E "Unable to find|TypeError|ReferenceError|Cannot find module"
# Expect only "Unable to find …" lines.
# If you see "Cannot find module …", "TypeError", or "ReferenceError",
# the RED is broken — add scaffolding, re-run, commit.
```

This is the difference between "the test is waiting for the implementation" (good RED) and "the test couldn't start" (broken RED — next person on the branch has no signal to work from).

### 4. Supabase `onAuthStateChange`: filter the event type, not just session presence

`onAuthStateChange` fires for multiple event types: `SIGNED_IN`, `INITIAL_SESSION`, `TOKEN_REFRESHED`, `SIGNED_OUT`, `USER_UPDATED`, `PASSWORD_RECOVERY`, `MFA_CHALLENGE_VERIFIED`. If your post-sign-in navigation effect listens for "session went from null to non-null", it will also fire on every cold start where the session hydrates from secure storage — bouncing returning users to onboarding step 1 on every app launch.

```ts
// Wrong — fires on INITIAL_SESSION and TOKEN_REFRESHED too
supabase.auth.onAuthStateChange((_event, session) => {
  if (session) replace('/onboarding/step-1');
});

// Better — discriminate by event type
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_IN') {
    replace('/onboarding/step-1' as never);
  }
});
```

**Caveat — event-type filtering isn't sufficient for "first-login only".** Some Supabase client branches fire `SIGNED_IN` during session restore (not just explicit sign-in), under specific session/user-proxy conditions flagged during PR #6's adversarial review. For a hard guarantee that onboarding runs once per user, back the check with server state:

```ts
const { data: profile } = await supabase
  .from('profiles')
  .select('onboarding_completed')
  .eq('id', session.user.id)
  .single();

replace(profile?.onboarding_completed ? '/(tabs)' : '/onboarding/step-1');
```

Treat the auth event as the trigger, and the server flag as the authority. This repo hasn't added the `profiles` table yet (it's tracked as a follow-up); until it does, the in-repo `useRedirectOnSignIn` in `hooks/use-redirect-on-sign-in.ts` unconditionally bounces every `SIGNED_IN`. Known gap — comment in the hook flags it.

### 5. `@ts-expect-error` over `as never` for routes that don't exist yet

During iterative TDD, step-1 often needs to navigate to step-2 before step-2 is on disk. Expo Router v6 typed routes will flag `push('/onboarding/step-2')` until the file exists and the route manifest regenerates.

```tsx
// Bad — silently opts OUT of type checking forever
push('/onboarding/step-2' as never);

// Good — suppression fails LOUDLY once typed routes pick up the route,
// which is your signal to delete the comment
// @ts-expect-error — step-2 route not yet in typed routes manifest
push('/onboarding/step-2');
```

`as never` is a hammer: it disables checking on that argument regardless of future code. If you rename the route or typo the path, TS is silent; you learn at runtime. `@ts-expect-error` is self-cleaning — when the underlying error goes away (route gets typed), the suppression itself becomes an error, and TS tells you to remove it.

(Note: `hooks/use-redirect-on-sign-in.ts` and `app/(onboarding)/step-1.tsx` in this repo still use `as never`. Code review flagged it. Next time, prefer `@ts-expect-error`.)

### 6. Don't spawn parallel `onAuthStateChange` subscribers

`AuthProvider` (`lib/auth-context.tsx`) already holds the canonical `onAuthStateChange` subscription for session state. Adding a second subscriber — say, a new hook for navigation side effects — creates a listener-ordering race. The nav listener may fire before the context-state listener, so `Stack.Protected guard={isAuthed}` still sees the stale `session` value from context when the redirect tries to route.

```tsx
// Anti-pattern: a second subscriber, ordering race vs AuthProvider
useEffect(() => {
  const { data } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') replace('/onboarding/step-1' as never);
  });
  return () => data.subscription.unsubscribe();
}, [replace]);

// Better: extend AuthContext to surface the last event, and derive side effects
// from the shared state.
const { session, lastAuthEvent } = useAuth();
useEffect(() => {
  if (lastAuthEvent === 'SIGNED_IN' && session) {
    replace('/onboarding/step-1' as never);
  }
}, [lastAuthEvent, session, replace]);
```

If the auth context doesn't currently expose the event, extend it — one subscription, one source of truth, no ordering surprises.

(Note: PR #6 shipped with the anti-pattern. Security + adversarial reviewers both flagged it. Consolidation is tracked as a follow-up.)

## Why This Matters

- **Silent test no-ops destroy trust in the suite.** The `onChangeDate` misnaming failure pattern is invisible: the test runs, the handler doesn't fire, downstream assertions fail with "expected to see X" — the same failure shape you'd get from a genuinely broken implementation. Hours can disappear chasing a production bug that doesn't exist.
- **Wrapper-component synthetic events keep the TDD loop smooth.** Without them, the choices are: (a) hack `Pressable`'s types, (b) use refs + imperative handles (heavy for a date field), or (c) skip unit coverage and lean on Maestro (which can't drive native pickers anyway). The wrapper pattern keeps RNTL tests fast and real.
- **"RED with broken imports" is a wasted commit.** It doesn't tell the GREEN author what the spec actually is — they have to re-read the test to figure out what the missing component should look like, because the failure message is about module resolution, not behavior.
- **Auth-event mis-filtering is a user-facing regression.** Bouncing returning users to onboarding is the kind of bug that gets caught in production, not CI — the cold-start path isn't hit in typical test flows.
- **`as never` and duplicate subscribers are "works now, breaks quietly later" patterns.** The cost of doing it right the first time is a few extra characters.

## When to Apply

- Writing RNTL tests that use `fireEvent(node, name, arg)` with a custom event name — always double-check the emitted name vs the prop it should resolve to.
- Building any component that needs a custom event hook not supported by the underlying RN primitive's prop types (date pickers, signature pads, custom selectors, swipe controls).
- Authoring TDD commits where the RED phase precedes the file/route existing.
- Wiring post-auth navigation in any Supabase + React Native app.
- Navigating to a route that hasn't been scaffolded yet in a typed-routes (Expo Router v6+) setup.
- Considering adding a second `onAuthStateChange` listener for any reason — default answer is "no, derive from context."

## Examples

### Example A — RNTL event-name fix (PR #6 RED → GREEN)

Broken test (silent no-op, downstream assertions fail confusingly):

```tsx
it('enables Next after a DOB is selected', async () => {
  const { getByTestId, getByRole } = render(<OnboardingStep1Screen />);
  fireEvent(getByTestId('dob-field'), 'onChangeDate', new Date('1990-06-01'));
  // Next button stays disabled — not because DOB is unset, but because
  // fireEvent never dispatched anything.
  await waitFor(() => {
    expect(getByRole('button', { name: /next/i })).toBeEnabled();
  });
});
```

Fixed (one-character class of fix, huge signal change):

```tsx
fireEvent(getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
```

Editing the test here was legitimate: the *contract* (the component exposes `onChangeDate: (d: Date) => void`) didn't change — only the broken API call to RNTL did. `CLAUDE.md`'s "never modify tests to make them pass" rule is about spec-level assertions, not broken API calls.

### Example B — Wrapper component exposing `onChangeDate`

Before (doesn't compile, can't be tested via `fireEvent`):

```tsx
// Inside the screen
<Pressable
  testID="dob-field"
  onChangeDate={setDob} // TS error: no such prop on Pressable
  onPress={() => setPickerOpen(true)}
>
  <Text>{dob ? formatDate(dob) : 'Select date'}</Text>
</Pressable>
```

After (see `app/(onboarding)/step-1.tsx` in PR #6):

```tsx
// Wrapper component owns the modal AND exposes the synthetic event as a prop
<DateField
  testID="dob-field"
  accessibilityLabel="Date of Birth"
  value={dateOfBirth}
  onChangeDate={setDateOfBirth}
  placeholder="Select date"
/>
```

```tsx
// app/(onboarding)/__tests__/step-1.test.tsx
fireEvent(getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
expect(getByRole('button', { name: /^Next$/i })).toBeEnabled();
```

### Example C — RED scaffolding checklist in action

Before (broken RED — single failure, useless message):

```
FAIL  app/(onboarding)/__tests__/step-1.test.tsx
  ● Test suite failed to run
    Cannot find module '../step-1' from 'app/(onboarding)/__tests__/step-1.test.tsx'
```

After adding a stub at `app/(onboarding)/step-1.tsx` that exports `<View testID="onboarding-step-1-screen" />`, plus the route registration in `app/_layout.tsx` and the `expo-router` mock in the test file:

```
FAIL  app/(onboarding)/__tests__/step-1.test.tsx
  ✗ renders the "Step 1 of 3" header caption
      Unable to find an element with text: Step 1 of 3
  ✗ renders the progress bar with a fill element
      Unable to find an element with testID: progress-bar
  ✗ renders the First Name text input with an accessible label
      Unable to find an element with accessibility label: /First Name/i
  ✗ renders the Date of Birth field with a "Select date" placeholder
      Unable to find an element with testID: dob-field
  ✗ renders the Next button
      Unable to find an element with role: button, name: /^Next$/i
  …26 total failures, all of this shape
```

That second output is RED: every failure names a specific piece of UI the spec requires. GREEN becomes a concrete to-do list.

### Example D — `@ts-expect-error` vs `as never` (decay behavior)

Scenario: step-1 navigates to step-2, which doesn't exist yet.

```tsx
// Variant 1: as never — type-checks forever, even after step-2 exists
push('/onboarding/step-2' as never);
// Later, someone typos:
push('/onboarding/stp-2' as never); // still compiles, runtime 404
```

```tsx
// Variant 2: @ts-expect-error — self-cleaning
// @ts-expect-error — route not yet in typed routes manifest
push('/onboarding/step-2');
// Once step-2 is scaffolded, the NEXT tsc run fails:
//   Unused '@ts-expect-error' directive.
// That's the compiler telling you to delete the comment. Now `push` is typed.
// Typos are caught: push('/onboarding/stp-2') → TS error, no @ts-expect-error covering it.
```

### Example E — auth-event filter + server-side authority

```ts
// In lib/auth-context.tsx — existing subscription; extend it to surface the event
const { data } = supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  setLastAuthEvent(event);
});
```

```tsx
// In app/_layout.tsx or an onboarding gate — single effect, single source of truth
const { session, lastAuthEvent } = useAuth();
const { replace } = useRouter();

useEffect(() => {
  if (lastAuthEvent !== 'SIGNED_IN' || !session) return;
  (async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single();
    // @ts-expect-error — onboarding routes not yet in typed routes manifest
    replace(profile?.onboarding_completed ? '/(tabs)' : '/onboarding/step-1');
  })();
}, [lastAuthEvent, session, replace]);
```

One subscription, one effect, one source of truth. `SIGNED_IN` is the trigger; `profiles.onboarding_completed` is the authority.

## Related

- `lib/auth-context.tsx` — canonical `onAuthStateChange` owner; extend this instead of adding parallel subscribers.
- `hooks/use-redirect-on-sign-in.ts` — the anti-pattern this doc warns against (parallel subscriber + `as never`). Left in place intentionally; consolidation tracked as a follow-up.
- `app/(onboarding)/step-1.tsx` — reference for the `DateField` wrapper pattern.
- `app/(onboarding)/__tests__/step-1.test.tsx` — reference for the RNTL event-name + `expo-router` mock + `SafeAreaProvider` test harness.
- `node_modules/@testing-library/react-native/build/event-handler.js` — authoritative source for `fireEvent` name resolution (`on${Capitalize(name)}`).
- `CLAUDE.md` — mobile stack non-negotiables (TDD discipline, RN primitive rules, React Compiler constraints).
- PR #6: https://github.com/nipunvv/WorkflowTest/pull/6 — where these lessons surfaced.
