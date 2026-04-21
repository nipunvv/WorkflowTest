---
title: "feat: Onboarding Step 1 — failing tests for TDD (RED, issue #2)"
type: feat
status: active
date: 2026-04-22
origin: https://github.com/nipunvv/WorkflowTest/issues/2
---

# feat: Onboarding Step 1 — failing tests for TDD (RED, issue #2)

## Overview

Write the failing Jest + RNTL test file and companion Maestro flow for `app/(onboarding)/step-1.tsx` **before** any implementation lands. This is the RED half of red/green for issue #2 only. A follow-up plan (GREEN) will implement the screen to make these tests pass.

This plan does **not** build the UI, pick a date-picker library's implementation code, add design tokens, or produce pixel-parity output — those all belong to the GREEN plan.

## Problem Frame

Issue #2 asks us to build the first of three post-signup onboarding screens (Basic Info). The repo's non-negotiable is strict TDD — tests must be written first and must fail for the right reason before any implementation is allowed to land. Following the pattern already established by [docs/plans/2026-04-21-001-feat-auth-sign-in-redesign-plan.md](./2026-04-21-001-feat-auth-sign-in-redesign-plan.md) (Unit 4 "RED"), this plan splits the TDD RED step into its own plan so the failing tests can be reviewed and committed as a standalone, spec-defining artifact.

The target screen collects First Name, Date of Birth, and Diagnosis Date (with a "Not sure" toggle that disables the diagnosis-date field). It advances to a Step 2 placeholder route on **Next** and returns via `router.back()` on **Back**. Design: Figma node `13:2` in file `CLEcJLTTd4L1JDDjc6KDwl`.

**Scope decisions made in planning:**

- **Route stub is in scope.** For the Jest test to import `../step-1` without a module-resolution error, a minimal stub must exist. The stub renders `null` (or a single empty `<View>`), so every UI-level assertion fails with "Unable to find …" rather than "Cannot find module". This matches the prior plan's RED pattern.
- **Route-group registration is in scope.** `app/_layout.tsx` must register `(onboarding)` under `Stack.Protected guard={isAuthed}`; without it, Expo Router won't resolve the route at all (and the dev-client build the Maestro flow runs against won't expose the screen). Per the issue, redirect-based-on-profile gating is a follow-up.
- **Date-picker library selection is deferred to GREEN.** The RED tests do not depend on the picker actually opening — they assert on the trigger field's presence, its disabled state, and its cleared value. That keeps us from installing a dependency we haven't used yet and from locking in the choice prematurely.
- **Design tokens are deferred to GREEN.** RED tests don't assert on colors or NativeWind class strings; they assert on behavior, roles, labels, and text.
- **Maestro YAML ships in this plan but is expected to fail** against a dev-client built from this branch (the stub renders nothing to assert against). It's the companion spec artifact; GREEN will turn it green.

## Requirements Trace (from issue #2)

- R1. **Render check** — step caption "Step 1 of 3", progress bar, H1 "Let's get to know you 👋", First Name input, Date of Birth input, Diagnosis Date input, "Not sure" toggle, Next button, Back link
- R2. **First Name behavior** — typing updates local state; the input reflects the typed value
- R3. **"Not sure" toggle behavior** — toggling ON disables the Diagnosis Date field and clears any previously selected value; toggling OFF re-enables it (value stays cleared)
- R4. **Next enablement** — Next is disabled until First Name is non-empty AND (DOB is set OR "Not sure" is ON)
- R5. **Next navigation** — tapping enabled Next navigates to `/onboarding/step-2`
- R6. **Back navigation** — tapping Back calls `router.back()`
- R7. **Accessibility** — every interactive element has `accessibilityLabel` + `accessibilityRole`
- R8. **E2E smoke** — `.maestro/onboarding-step-1.yaml`: fill name, pick DOB, toggle "Not sure", tap Next, assert navigation (deferred to execute against GREEN build, but the file is written here)
- R9. **No regression** — existing `login.test.tsx` and `launch.yaml` still pass

Only R1–R7 and R9 are asserted by this plan's tests. R8's YAML ships here; R8's passing run is a GREEN-plan gate. R5's "step-2 route exists" is satisfied by a stub route created in GREEN or a follow-up — this plan mocks `router.push` and asserts the call argument only.

## Scope Boundaries

- **NOT** implementing any UI beyond a no-op stub (no inputs, no toggle, no buttons wired).
- **NOT** installing a date-picker dependency (`@react-native-community/datetimepicker` or `react-native-modal-datetime-picker`). Choice is deferred to GREEN.
- **NOT** adding onboarding tokens to `tailwind.config.js`. RED asserts on behavior, not style.
- **NOT** creating `app/(onboarding)/step-2.tsx` or Step 3. Next navigation target is asserted by mocking `router.push` and checking its argument; no real Step 2 route is needed for the unit tests.
- **NOT** adding a routing gate that redirects authed-but-not-onboarded users into `(onboarding)`. Issue defers this. Tests assume the user can reach `(onboarding)/step-1` directly.
- **NOT** touching `lib/auth-context.tsx`, `lib/supabase.ts`, or the existing `(auth)` / `(tabs)` stacks.
- **NOT** reconciling Figma hex values with `DESIGN.md` (follow-up tracked by the prior auth plan).

## Context & Research

### Relevant Code and Patterns

- `app/(auth)/__tests__/login.test.tsx` — the first RNTL test file in the repo. Sets the canonical patterns for this one:
  - `SafeAreaProvider` wrapper with explicit `initialMetrics` so `useSafeAreaInsets` doesn't throw
  - `jest.mock('@/lib/auth-context', () => ({ useAuth: jest.fn() }))` factory + `jest.mocked(useAuth).mockReturnValue(...)` per test
  - `beforeEach` clears mocks + spies on `Alert.alert`; `afterEach` restores
  - `fireEvent.press` + `waitFor` for async flows
  - Queries by `screen.getByRole` / `getByText` / `getByTestId` — not `toJSON()` snapshots
- `app/(auth)/login.tsx` — shows the existing conventions to mirror in the GREEN implementation (NativeWind class tokens, `accessibilityRole` + `accessibilityLabel`, `Pressable`, `expo-image`). RED doesn't read these but the test file's expectations should line up with them.
- `app/_layout.tsx` — `Stack.Protected guard={isAuthed}` wraps `(tabs)` and `modal`. The new `(onboarding)` route goes alongside `(tabs)` (authed guard). `guard={!isAuthed}` wraps `(auth)`. Keep guard structure untouched; just add one `<Stack.Screen name="(onboarding)" options={{ headerShown: false }} />` line.
- `app/(auth)/_layout.tsx` — minimal stack pattern to copy for `(onboarding)/_layout.tsx`:

```
import { Stack } from 'expo-router';
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- `jest-setup.ts` — pre-mocks `expo-secure-store`, `expo-web-browser.openAuthSessionAsync`, `expo-linking`, `react-native-reanimated`. Does **not** mock `expo-router`. The new test file must mock `useRouter` locally.
- `.maestro/launch.yaml` — template for the new flow: `appId: com.workflowtest.app` + `clearState: true` + a chain of `assertVisible` / `tapOn` steps. `.maestro/config.yaml` sets the suite-level defaults; leave it alone.
- `tailwind.config.js` — contains the auth tokens (`bg-primary`, `text-heading`, etc.). RED does not touch it; GREEN will extend it.

### Figma Design (node `13:2`) — token values for future reference

GREEN will use these; RED only echoes the user-visible copy.

| Role | Hex | Notes |
|---|---|---|
| Page background | `#fff8f0` | cream, same as `bg-primary` |
| Step caption text | `#8c8073` | Inter Medium 14, same as `text-subtle` |
| Progress bar track | `rgba(156,175,136,0.2)` | sage tint |
| Progress bar fill | `#9caf88` | sage, 1/3 width, 6dp tall, 3dp radius |
| Card bg | `#ffffff` | 24dp radius, shadow `0 4 24 rgba(212,165,116,0.08)` |
| Card H1 | `#33291f` | Inter Bold 24 / 32 |
| Input label | `#736659` | Inter Medium 14, same as `text-body` |
| Input (active/filled) bg | `#faf7f5` | warm off-white |
| Input (active/filled) border | `#d4a574` | 1.5px, honey tan |
| Input (default) border | `#e0dbd6` | 1px, neutral warm |
| Input placeholder text | `#a6998c` | Inter Regular 16 |
| Toggle (ON) track | `#9caf88` | sage |
| Input (disabled) bg | `#f2f0ed` | warm gray, 50% opacity container |
| Input (disabled) border | `#e5e3e0` | |
| Input (disabled) placeholder | `#b2a699` | "Not applicable" |
| Next button bg | `#d4a574` | honey tan, 56dp, 16dp radius, shadow `0 4 16 rgba(212,165,116,0.3)` |
| Next button label | `#ffffff` | Inter Semi Bold 17 |
| Back link | `#8c8073` | Inter Medium 15, centered |

**Figma frame quirk:** The design shows the screen inside a 40dp rounded container — that's a preview artifact. On-device this is a full-bleed screen with safe-area insets. RED doesn't care; flagging for GREEN.

### Institutional Learnings

- `CLAUDE.md` non-negotiables: strictly TDD; never modify or delete an existing test to make it pass; never commit until the user says so.
- `CLAUDE.md` mobile stack: every string inside `<Text>`; no `TouchableOpacity`; no `{falsy && JSX}` leaks; use `Image` from `expo-image`; `gap` over `margin*`; destructure hook returns at the top of render (`const { push, back } = useRouter()`, not `router.push(…)`).
- The prior auth plan proved the testing harness works — the pre-mocks in `jest-setup.ts` cover the modules that transitively load during route import. `expo-router` is a new dependency we must mock here for the first time; its `useRouter` / `Link` / `Href` types are heavy and we want a lightweight factory mock.

### External References

- `@testing-library/react-native` 13.x — `screen.getByRole('switch')` is the idiomatic query for React Native's `Switch` / `accessibilityRole="switch"`; `getByLabelText` works when a label is wired via `accessibilityLabel`.
- Expo Router v6 — `useRouter()` returns `{ push, back, replace, ... }`; `router.back()` is a no-op when the stack has only one screen (safe to call).
- None needed for the date picker — RED does not exercise it.

## Key Technical Decisions

- **Stub strategy:** `app/(onboarding)/step-1.tsx` renders a single empty `<View testID="onboarding-step-1-screen" />` (nothing else). The test file imports and renders it, and every UI assertion fails with "Unable to find …". Using a plain `<View>` is preferable to `return null` because it guarantees the render itself doesn't throw (some RNTL queries assume a rendered tree).
- **`expo-router` mock strategy:** Mock `expo-router` locally in the test file (not globally in `jest-setup.ts`) — future screens may want different router behavior per-test. The mock exposes `useRouter: jest.fn()` returning an object with `push`, `back`, `replace`, `dismiss` all as `jest.fn()`. In `beforeEach`, swap in a fresh pair so `push`/`back` call-count assertions start clean.
- **Route registration is part of this plan.** It's one-line in `app/_layout.tsx`. Without it, the route doesn't resolve at all — dev-client users get a 404, Maestro asserts fail instantly. Keeping the registration with the failing tests (rather than in GREEN) means the skeleton is shippable as a single atomic RED commit.
- **No date-picker import in the stub.** The stub renders an empty `<View>`; no module import decisions are made here. This means the test file does **not** need to mock a picker module — tests assert on roles / labels / testIDs that GREEN will introduce, and those queries simply fail for now.
- **Test queries prefer role + label over text.** Example: `getByRole('switch', { name: /Not sure/i })` beats `getByText(/Not sure/i)` because it survives copy tweaks and enforces the accessibility requirement simultaneously. Where role is ambiguous (progress bar, card header), fall back to `getByTestId` with stable IDs the GREEN implementation will honor.
- **Assert "Next is disabled" via the Pressable's `accessibilityState.disabled`**, not by probing `props.disabled` directly — RN's `Pressable` forwards the flag both ways but the accessibility path is the contract we actually care about (and the one the issue's a11y criteria pins).
- **"Not sure" toggle is a `Switch` (role `switch`)**, not a custom `Pressable`. This is the idiomatic RN control for on/off and is accessible by default. GREEN will implement it; RED queries it by role.
- **Next navigates to `/onboarding/step-2`** — a string literal, not a typed route object. Expo Router's typed-routes experiment is enabled, but Step 2 doesn't exist yet, so we'll need a `{ pathname: '/onboarding/step-2' as any }` cast in GREEN. RED only asserts `mockPush` was called with a string matching `/onboarding/step-2/`.

## Open Questions

### Resolved During Planning

- **Include the route stub in this plan?** → Yes. Tests must fail for the right reason; that requires the import to resolve. Stub is a no-op `<View>` with a stable testID.
- **Include `app/_layout.tsx` registration in this plan?** → Yes. One-line change; without it the route is invisible.
- **Install a date-picker library now?** → No. Deferred to GREEN. RED tests don't open the picker.
- **Mock `expo-router` globally or per-file?** → Per-file, scoped to this test. Global mocking would couple future screens to this file's router shape.
- **Use `getByRole('switch')` or `getByLabelText('Not sure')` for the toggle?** → `getByRole('switch', { name: /Not sure/i })`. Role-first is the idiomatic RNTL query and also pins the a11y contract.
- **Assert Next's disabled state via `.props.disabled` or `accessibilityState.disabled`?** → `accessibilityState.disabled`. It's the contract the issue's a11y criteria care about; `.props.disabled` is an implementation detail.

### Deferred to Implementation (GREEN plan)

- Exact date-picker library choice and its mock shape (will need per-test mock once GREEN adds the import).
- Whether "Not sure" toggle state lives in `useState` or a `useReducer` — GREEN judgment call. Tests don't care.
- Exact Step 2 placeholder route shape (`stub screen that says "Step 2 coming soon"` vs. `Stack.Screen` with a no-op body) — RED mocks the target; GREEN wires it.
- Whether to extract `<ProgressIndicator />`, `<LabeledInput />`, `<LabeledDatePicker />` subcomponents during REFACTOR — decided after GREEN passes.

## Implementation Units

- [ ] **Unit 1: Route scaffolding — `(onboarding)` group, stub screen, `_layout.tsx`, root Stack registration**

**Goal:** Create the minimum Expo Router surface so `app/(onboarding)/step-1.tsx` is a resolvable, renderable route. The stub renders a single empty `<View>` with a stable testID; no UI, no inputs, no wiring. Register `(onboarding)` in the root stack under the authed guard so the dev-client build used by Maestro will expose the route.

**Requirements:** Unblocks Unit 2 (test imports must resolve); unblocks Unit 3 (Maestro flow reaches a screen that actually renders, even if empty).

**Dependencies:** None.

**Files:**
- Create: `app/(onboarding)/_layout.tsx`
- Create: `app/(onboarding)/step-1.tsx`
- Modify: `app/_layout.tsx` (add one `<Stack.Screen>` inside the existing authed `<Stack.Protected>`)

**Approach:**
- `_layout.tsx` mirrors `app/(auth)/_layout.tsx`: `<Stack screenOptions={{ headerShown: false }} />`. No provider, no guard — the authed guard is in the root layout.
- `step-1.tsx` default-exports `OnboardingStep1Screen` rendering `<View testID="onboarding-step-1-screen" />`. Import `View` from `react-native`. No other imports. No props.
- In `app/_layout.tsx`, inside the existing `<Stack.Protected guard={isAuthed}>` block, add `<Stack.Screen name="(onboarding)" options={{ headerShown: false }} />` immediately after the `(tabs)` screen line. Leave the `!isAuthed` guard block alone.

**Execution note:** This unit introduces no testable behavior. Its sole purpose is to make Units 2 and 3 executable and to let a dev-client launch the route manually. Treat it as RED scaffolding, not GREEN implementation.

**Patterns to follow:**
- `app/(auth)/_layout.tsx` for the child stack shape.
- The existing `app/_layout.tsx` `<Stack.Protected>` pattern for guard structure.

**Test scenarios:**
- Test expectation: none — stubs and route registration have no behavior to assert. Verified transitively by Unit 2's first test ("renders a `testID="onboarding-step-1-screen"` root"), which passes as soon as the stub resolves, and by a manual dev-client launch landing on an empty screen without a 404.

**Verification:**
- `npx tsc --noEmit` passes.
- `npx expo start` does not error on module resolution for `app/(onboarding)/step-1.tsx`.
- `npm run lint` clean.
- Existing `login.test.tsx` still passes (no regression).

- [ ] **Unit 2 (RED): Write the failing Jest + RNTL test file for Step 1**

**Goal:** Produce `app/(onboarding)/__tests__/step-1.test.tsx` covering every behavior called out in issue #2's acceptance criteria. Every test must **fail** against Unit 1's empty stub — the failure mode is the spec. No implementation changes in this unit. Land as its own atomic commit with the failing-test evidence recorded in the PR description.

**Requirements:** R1, R2, R3, R4, R5, R6, R7 (asserts); R9 (no regression in existing `login.test.tsx`).

**Dependencies:** Unit 1.

**Files:**
- Create: `app/(onboarding)/__tests__/step-1.test.tsx`

**Approach:**
- Mirror the harness from `app/(auth)/__tests__/login.test.tsx`: `SafeAreaProvider` wrapper with `initialMetrics`, `render` helper, `beforeEach(jest.clearAllMocks)`.
- Mock `expo-router` locally:

```
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Stack: { Screen: () => null },
  // Link + other exports not needed by this file; add if a render path reaches them.
}));
```

In each test (or in `beforeEach`), set `jest.mocked(useRouter).mockReturnValue({ push: mockPush, back: mockBack, replace: jest.fn(), dismiss: jest.fn(), dismissAll: jest.fn(), canGoBack: () => true, setParams: jest.fn(), navigate: jest.fn() })` with fresh `jest.fn()`s for `push`/`back`.
- Use `render`, `screen`, `fireEvent`, `waitFor` from `@testing-library/react-native`.
- Use role-based queries where possible (`getByRole('button', { name: ... })`, `getByRole('switch', { name: /Not sure/i })`, `getByRole('text' /* label */)` fallback via `getByLabelText`).
- Use `fireEvent.changeText(input, 'Angel')` for text input. Assume the First Name input is queryable by `getByLabelText(/First Name/i)` or `getByPlaceholderText(...)` — GREEN will wire `accessibilityLabel="First Name"`.
- Use `fireEvent(switchNode, 'valueChange', true)` or `fireEvent.press(switchNode)` for the toggle. RNTL supports both; prefer `valueChange` as it matches `Switch`'s event contract.
- For DOB setting in tests: expose a `testID="dob-field"` on the picker trigger, and have the test simulate picking a date by calling the `onChange` prop directly or — simpler — have GREEN expose a `testID="mock-dob-set"` affordance that RED can drive. RED's simplest path: assert behaviors that don't require opening the picker (e.g., "Next is disabled when DOB is not set; Next enables when a `testID="dob-field"` receives a synthetic `onChange` with a Date"). Test scenarios below pin the exact driving mechanism.
- Accessibility assertions: for each interactive node, assert `accessibilityRole` or `role` AND `accessibilityLabel` are truthy strings.

**Execution note:** RED only. Do NOT modify `step-1.tsx`, `_layout.tsx`, or `app/_layout.tsx` in this unit. Do NOT modify `jest-setup.ts`. Commit the failing tests as-is. Verify RED with `npm test` and paste the failing output into the PR description.

**Patterns to follow:**
- `app/(auth)/__tests__/login.test.tsx` — mock factory shape, `beforeEach` / `afterEach` cleanup, `SafeAreaProvider` wrapper, role + label queries.
- The `useAuth` mock factory pattern — when this file mocks `expo-router`, keep the factory generic so future onboarding screens can reuse it verbatim.

**Test scenarios:**

*Static render (R1, R7):*
- **Happy path — header caption:** `screen.getByText('Step 1 of 3')` is on screen.
- **Happy path — progress bar:** `screen.getByTestId('progress-bar')` is on screen AND has a child `testID="progress-fill"` whose `style.width` (or a proxied `accessibilityValue.now`) reflects 1/3 progress. (GREEN wires the testIDs; RED fails with "Unable to find element by testID: progress-bar".)
- **Happy path — H1:** `screen.getByText(/Let's get to know you/i)` is on screen.
- **Happy path — First Name input:** `screen.getByLabelText(/First Name/i)` is a `TextInput`.
- **Happy path — DOB input:** `screen.getByTestId('dob-field')` is on screen AND `screen.getByText(/Select date/i)` is visible when no DOB is set.
- **Happy path — Diagnosis Date input:** `screen.getByTestId('diagnosis-field')` is on screen.
- **Happy path — "Not sure" toggle:** `screen.getByRole('switch', { name: /Not sure/i })` is on screen; its initial `accessibilityState.checked` (or `props.value`) is `false`.
- **Happy path — Next button:** `screen.getByRole('button', { name: /^Next$/i })` is on screen.
- **Happy path — Back link:** `screen.getByRole('button', { name: /^Back$/i })` (or `accessibilityRole="link"`) is on screen.

*First Name input (R2):*
- **Happy path — typing updates value:** `fireEvent.changeText(getByLabelText(/First Name/i), 'Angel')` → the same input's `props.value` is `'Angel'` (or, via `getByDisplayValue('Angel')`, the value is reflected on screen).

*"Not sure" toggle (R3):*
- **Happy path — toggle ON disables diagnosis field:** Fire `valueChange(true)` on the Not Sure switch → `getByTestId('diagnosis-field').props.accessibilityState.disabled === true`.
- **Integration — toggle ON clears prior diagnosis value:** Given a test that drives the diagnosis field via `fireEvent(getByTestId('diagnosis-field'), 'onChangeDate', new Date('2024-01-01'))` (or whatever GREEN wires), the visible value is then `'2024-01-01'` (or its localized form). After firing `valueChange(true)` on the Not Sure switch, the diagnosis field shows `'Not applicable'` (or an empty value query via `getByDisplayValue` returns nothing).
- **Edge case — toggle OFF re-enables diagnosis field but does not restore prior value:** After ON → OFF cycle, `accessibilityState.disabled === false` AND no prior date value is visible (placeholder returns).
- **Edge case — toggle is independent of DOB:** Setting DOB, toggling Not Sure ON, then OFF — DOB remains set (asserted via `getByDisplayValue` or the visible date text).

*Next button enablement (R4):*
- **Edge case — initial state:** Next is disabled (`props.accessibilityState.disabled === true`) on first render with no fields filled.
- **Edge case — name-only:** After typing First Name with empty DOB and Not Sure OFF, Next remains disabled.
- **Edge case — DOB-only:** After setting DOB with empty First Name and Not Sure OFF, Next remains disabled.
- **Edge case — Not-Sure-only:** After toggling Not Sure ON with empty First Name, Next remains disabled.
- **Happy path — name + DOB:** After typing First Name AND setting DOB (Not Sure OFF), Next is enabled (`accessibilityState.disabled === false`).
- **Happy path — name + Not Sure:** After typing First Name AND toggling Not Sure ON (no DOB), Next is enabled.
- **Edge case — clearing name re-disables Next:** Typing name + setting DOB enables Next; then clearing the name field via `fireEvent.changeText(input, '')` disables Next again.

*Navigation (R5, R6):*
- **Happy path — Next navigates:** With a valid form (name + DOB), pressing Next → `mockPush` was called exactly once with a string containing `/onboarding/step-2/` (or, if GREEN uses an `Href` object, with `{ pathname: '/onboarding/step-2' }`).
- **Edge case — Next is a no-op when disabled:** With only First Name typed, pressing Next → `mockPush` was NOT called.
- **Happy path — Back calls router.back:** Pressing Back → `mockBack` was called exactly once.
- **Edge case — Back ignores form state:** With a valid form, pressing Back still only calls `mockBack`, not `mockPush`.

*Accessibility (R7):*
- First Name input, DOB trigger, Diagnosis trigger, Not Sure switch, Next button, Back link — each has `accessibilityRole` (or `role`) set AND `accessibilityLabel` set to a non-empty string.

**Verification:**
- `npx jest app/(onboarding)/__tests__/step-1.test.tsx` exits **non-zero** with every test case failing for the right reason: "Unable to find …" on role/text/testID queries, NOT module-resolution / import / syntax / runtime errors. Expected ~20 failing cases.
- `npx jest app/(auth)/__tests__/login.test.tsx` still passes — no regression in the existing suite.
- `npx tsc --noEmit` clean.
- `npm run lint` clean.
- Commit message references "RED — failing tests for onboarding step 1". No production code touched except the Unit 1 stub / layout / root registration.

- [ ] **Unit 3: Write the companion Maestro flow — `.maestro/onboarding-step-1.yaml`**

**Goal:** Ship the E2E smoke flow described by issue #2 in the same RED commit set, so the spec is complete and reviewable. The flow is expected to **fail** against any dev-client build of this branch (the stub renders nothing) — GREEN will make it pass. The file must be syntactically valid Maestro YAML and target the same `appId` as `launch.yaml`.

**Requirements:** R8 (artifact only; executed green in GREEN plan).

**Dependencies:** Unit 1 (so the route is at least registered — the dev-client build otherwise 404s before the flow can begin).

**Files:**
- Create: `.maestro/onboarding-step-1.yaml`

**Approach:**
- Header: `appId: com.workflowtest.app` (copy from `.maestro/launch.yaml`).
- Flow is sign-in-dependent. Option A: start from `launchApp: clearState: true` → sign in via the real OAuth path (Maestro can't drive the system sheet per `CLAUDE.md`) → unworkable. Option B: add a `- runFlow: file: ../flows/_authed.yaml` dependency — but no such harness exists in this repo yet. Option C: **assume the user is already signed in when running this flow** and invoke it manually from a dev-client with a live session (`launchApp` without `clearState` so the session persists). Pick C; document the precondition in a leading YAML comment.
- Flow body:
  1. `launchApp: {}` (no `clearState` — rely on persisted session)
  2. Navigate to the onboarding screen. Without deep-linking support wired in, use: `- openLink: workflowtest://onboarding/step-1` which Expo Router resolves once the route is registered (Unit 1). If this doesn't work on the dev-client, fall back to a manual navigation step before the flow starts (document in comment).
  3. `- assertVisible: "Step 1 of 3"`
  4. `- assertVisible: "Let's get to know you"` (no emoji — Maestro is fussy about non-ASCII matchers)
  5. `- tapOn: { id: "First Name" }` → `- inputText: "Angel"`
  6. `- tapOn: { id: "dob-field" }` → system date picker opens (off-platform, not Maestro-drivable) — comment that this step requires a mocked picker GREEN will wire via `testID`. Leave the step in, annotated.
  7. `- tapOn: { id: "diagnosis-not-sure" }` → toggles Not Sure ON
  8. `- assertVisible: "Not applicable"`
  9. `- tapOn: "Next"`
  10. `- assertVisible: "Step 2"` (placeholder — Step 2 is a follow-up issue; this assert is expected to need follow-up once the stub page text is known)

- Leading comment block explains:
  - The flow is RED-authored and is expected to fail on this branch.
  - Precondition: dev-client signed in (OAuth cannot be driven by Maestro).
  - Limitations: native date picker cannot be driven — step is annotated.
  - `appId` must be `com.workflowtest.app`; Expo Go is incompatible.

**Patterns to follow:**
- `.maestro/launch.yaml` — front matter + `launchApp` + `assertVisible` rhythm.
- `.maestro/README.md` — prose conventions for documenting flow preconditions and limitations.

**Test scenarios:**
- Test expectation: the YAML itself is the spec; executing it against a GREEN-implemented build is the passing test. RED verification is limited to syntactic validity + the file existing at the expected path.

**Verification:**
- `maestro test .maestro/onboarding-step-1.yaml --format junit --output /tmp/_ignore.xml` parses the file without a YAML error (may fail the flow itself against this branch — that's expected).
- `git diff` in this unit touches only `.maestro/onboarding-step-1.yaml`.
- `.maestro/launch.yaml` is unchanged (no regression).

## System-Wide Impact

- **Interaction graph:** Adds a new `(onboarding)` route group alongside `(tabs)` under the authed guard in `app/_layout.tsx`. No impact on `AuthProvider`, `SecureStore`, session refresh, or the `(auth)` ↔ `(tabs)` protection shape.
- **Error propagation:** N/A — the RED plan adds no error surfaces.
- **State lifecycle risks:** N/A — stub has no state. Mocked `expo-router` is scoped to the test file; no risk of leaking into `login.test.tsx`.
- **API surface parity:** N/A — no public APIs change.
- **Integration coverage:** Jest covers in-app behavior through the stub's future implementation; Maestro covers the E2E launch path on a dev-client. Real OAuth + the native date picker remain un-testable by Maestro per CLAUDE.md — GREEN should rely on Jest for the behavior-level contract.
- **Unchanged invariants:** `flowType: 'pkce'`, `detectSessionInUrl: false`, the SecureStore chunking adapter, the `AppState` refresh loop, `scheme: "workflowtest"`, `ios.bundleIdentifier: "com.workflowtest.app"`, `app.json` `expo.name: "Hi Honey"`, and the existing `(auth)` / `(tabs)` stacks. None change.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `jest.mock('expo-router', ...)` is too narrow and a render path hits an unmocked export, producing a runtime error instead of a matcher failure | Start from the `useRouter` + `Stack.Screen` subset listed in Unit 2's approach. If RED run surfaces `TypeError: X is not a function`, widen the mock factory — do NOT globalize it in `jest-setup.ts` (keeps future screens free to choose their own shape). |
| The test's behavioral assertions rely on GREEN honoring specific `testID`s (`progress-bar`, `progress-fill`, `dob-field`, `diagnosis-field`, `onboarding-step-1-screen`) — if GREEN drifts from those names the tests won't go green | Pin the testID list in Unit 2's test scenarios section (done above) and call it out explicitly in the RED PR description so the GREEN implementer has no ambiguity. Treat testIDs as a contract, not an implementation detail. |
| The DOB field is hard to drive from RNTL without knowing the picker library — tests that exercise "DOB is set" may be forced to use library-specific fire-event shapes | RED asserts DOB-dependent behavior by firing `fireEvent(getByTestId('dob-field'), 'onChangeDate', new Date(...))` — a synthetic event shape GREEN can honor regardless of picker library (wrap the picker and expose `onChangeDate` as a prop on a custom field component). Alternative path if that turns out awkward: expose a test-only imperative handle via a `testID="mock-dob-set"` `<Pressable>` that GREEN renders when a `__DEV__` flag is on — only adopt if the wrapper approach creates friction. |
| Route registration in `app/_layout.tsx` accidentally reorders or wraps the existing `(tabs)` / `modal` / `(auth)` declarations and breaks auth flow | Keep the diff to a single additive `<Stack.Screen name="(onboarding)" options={{ headerShown: false }} />` line inside the existing authed `<Stack.Protected>`; leave ordering of neighboring lines untouched. Run `maestro test .maestro/launch.yaml` after Unit 1 to confirm the existing flow still passes. |
| Maestro flow's `openLink: workflowtest://onboarding/step-1` fails to resolve on the dev-client if deep-link handling for `(onboarding)` routes needs explicit Expo Router config | Annotate the step with a "if this fails, navigate manually to Step 1 before running the flow" fallback comment. Deep-link wiring is not in scope for this plan; it's only relevant once Maestro runs GREEN anyway. |
| The issue mentions `router.back()` is a no-op when Step 1 is the stack root — the RED test asserts `mockBack` was called, which is true regardless of whether the real `back` pops or not | Accept this semantic: `router.back()` on the stack root is idempotent and still exercises the wiring. Document in the test with a one-line comment. |

## Documentation / Operational Notes

- **PR description:** paste the failing-test output from `npx jest app/(onboarding)/__tests__/step-1.test.tsx`. Keep the output targeted to failing tests only (`--silent` or `--json | jq` if needed).
- **Follow-up plan:** on merge, open a GREEN plan (`2026-04-??-002-feat-onboarding-step-1-green-plan.md`) that covers date-picker selection/install, tailwind token extension, the full Step 1 UI implementation, and the Step 2 stub route Next navigates to.
- **`CLAUDE.md`:** no update required — all conventions referenced here are already documented.
- **EAS:** no rebuild flag needed for a pure JS change. When GREEN lands and Maestro runs, a dev-client build of this branch is required; the existing `development` profile in `eas.json` covers that.
- **`.maestro/README.md`:** leave alone for this plan. Update in GREEN if Step 1's flow adds precondition patterns worth documenting.

## Sources & References

- **Origin issue:** [issue #2](https://github.com/nipunvv/WorkflowTest/issues/2)
- **Figma frame:** node `13:2` — https://www.figma.com/design/CLEcJLTTd4L1JDDjc6KDwl/Untitled?node-id=13-2
- **Prior RED-phase pattern:** [docs/plans/2026-04-21-001-feat-auth-sign-in-redesign-plan.md](./2026-04-21-001-feat-auth-sign-in-redesign-plan.md), Unit 4
- Related files:
  - `app/_layout.tsx`
  - `app/(auth)/_layout.tsx`
  - `app/(auth)/__tests__/login.test.tsx`
  - `app/(auth)/login.tsx`
  - `jest-setup.ts`
  - `.maestro/launch.yaml`
  - `.maestro/README.md`
  - `tailwind.config.js`
  - `CLAUDE.md`
  - `DESIGN.md`
- Related future plans / issues (not created yet): GREEN plan for issue #2 (date picker + UI + tokens); Onboarding Step 2 and Step 3 (separate issues); Supabase `profiles` migration (separate issue); routing gate for authed-but-not-onboarded users (separate issue).

## Verification (end-to-end for this plan)

1. **Type-check:** `npx tsc --noEmit` — clean across the new files.
2. **Lint:** `npm run lint` — clean.
3. **New failing tests:** `npx jest app/(onboarding)/__tests__/step-1.test.tsx` — fails with ~20 "Unable to find …" assertion failures. No syntax / import / runtime errors.
4. **No regression:** `npx jest app/(auth)/__tests__/login.test.tsx` — still passes.
5. **Full suite:** `npm test` — fails (expected, RED); ensure the only failures are in `step-1.test.tsx`.
6. **Maestro artifact validity:** `.maestro/onboarding-step-1.yaml` exists and parses; the RED flow is not executed against a dev-client in this plan.
7. **Existing Maestro flow:** `maestro test .maestro/launch.yaml` on the dev-client still passes (no regression in the auth flow).
8. **Manual dev-client smoke:** `npx expo start --dev-client` → sign in → navigate to `workflowtest://onboarding/step-1` or via in-app link → empty screen renders without a 404.

If any step fails unexpectedly (syntax error, import error in `step-1.test.tsx`, regression in `login.test.tsx`, 404 on the route), iterate on the failing unit before marking complete. **Do NOT edit tests to make them pass — per `CLAUDE.md`, never modify or delete an existing test to make it pass. A RED failure for the wrong reason means the test is wrong, not the spec.**
