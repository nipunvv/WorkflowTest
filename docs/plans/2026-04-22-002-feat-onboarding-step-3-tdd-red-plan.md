---
title: "feat: Onboarding Step 3 — failing tests for TDD (RED, issue #4)"
type: feat
status: completed
date: 2026-04-22
origin: https://github.com/nipunvv/WorkflowTest/issues/4
---

# feat: Onboarding Step 3 — failing tests for TDD (RED, issue #4)

## Overview

Write the failing Jest + RNTL test file and companion Maestro flow for `app/(onboarding)/step-3.tsx` **before** any implementation lands. This is the RED half of red/green for issue #4 only. A follow-up plan (GREEN) will implement the Preferred Language screen to make these tests pass.

This plan does **not** build the UI, install new dependencies, extend design tokens, or produce pixel-parity output — those all belong to the GREEN plan.

## Problem Frame

Issue #4 is the last of three post-signup onboarding screens: **Step 3 — Preferred Language**. The screen asks "Preferred Language? 🌍" with a helper note, and offers two single-select radio rows (🇺🇸 English, 🇨🇳 简体中文). The step indicator reads "Step 3 of 3" with the progress bar at 100%. Tapping **Get Started 🎉** completes onboarding and calls `router.replace('/(tabs)')` (not `push`) so Back from `(tabs)` cannot return to onboarding. Tapping **Back** calls `router.back()` (returns to Step 2).

The repo's non-negotiable is strict TDD — tests must be written first and must fail for the right reason before any implementation is allowed to land. This plan follows the RED-as-its-own-commit pattern already established by [docs/plans/2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md](./2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md).

**Scope decisions made in planning:**

- **Route stub is in scope.** For the Jest test to import `../step-3` without a module-resolution error, a minimal stub must exist. The stub renders a single `<View testID="onboarding-step-3-screen" />`, so every UI-level assertion fails with "Unable to find …" rather than "Cannot find module …". Broken-import failures are broken RED (see [docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md](../solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md), Guidance §3).
- **Route-group registration is already in place.** `app/_layout.tsx` already registers `(onboarding)` under `Stack.Protected guard={isAuthed}` (added in PR #6 for Step 1). No change needed there.
- **Design tokens are deferred to GREEN.** RED tests don't assert on colors or NativeWind class strings; they assert on behavior, roles, labels, and text.
- **Step 2 → Step 3 wiring is OUT of scope.** Issue #4 mentions "Wire the Next button on Step 2 to push `/onboarding/step-3`" as its own checkbox. That wiring is a GREEN concern for this issue AND a follow-up to the still-unimplemented Step 2 (current `step-2.tsx` is a placeholder with no Next button). This RED plan does not touch `step-2.tsx`.
- **Language catalog shape is deferred to GREEN.** The issue calls for a typed constant (`code`, flag emoji, native name, english name). RED queries language rows by text and role — not by the shape of the catalog. Where the catalog lives (inline vs. `languages.ts`) is a GREEN judgment call.
- **Maestro YAML ships in this plan but is expected to fail** against a dev-client built from this branch (the stub renders nothing to assert against). It's the companion spec artifact; GREEN will turn it green.

## Requirements Trace (from issue #4)

- R1. **Render check** — step caption "Step 3 of 3", progress bar (100% fill), "Preferred Language? 🌍" question, "You can change this later in settings" helper, both language rows (English + 简体中文), Get Started button, Back link.
- R2. **Default selection** — English is pre-selected on mount.
- R3. **Mutual exclusion** — tapping 简体中文 selects it and deselects English; only one row is selected at any time.
- R4. **Get Started navigation** — tapping Get Started calls `router.replace('/(tabs)')` (exactly once, with the right argument) and does NOT call `router.push`.
- R5. **Back navigation** — tapping Back calls `router.back()` (exactly once) and does NOT call `router.replace` or `router.push`.
- R6. **Accessibility — radio contract** — each row has `accessibilityRole="radio"` with `accessibilityState.selected` reflecting its state; the two-row group is wrapped in a container with `accessibilityRole="radiogroup"` and a non-empty `accessibilityLabel` (e.g., "Preferred language").
- R7. **E2E smoke** — `.maestro/onboarding-step-3.yaml`: launch app → deep-link into Step 3 → tap 简体中文 → tap Get Started → assert landing on `(tabs)`. (Deferred to execute against GREEN build; the file is written here.)
- R8. **No regression** — existing `login.test.tsx`, `step-1.test.tsx`, and `.maestro/launch.yaml` continue to pass.

Only R1–R6 and R8 are asserted by this plan's Jest tests. R7's YAML ships here; R7's passing run is a GREEN-plan gate.

## Scope Boundaries

- **NOT** implementing any UI beyond a no-op stub (no question, no rows, no buttons wired).
- **NOT** touching `app/(onboarding)/step-2.tsx`. Step 2's Next-button wiring to `/onboarding/step-3` is a GREEN concern (for issue #4) and also tracked against the Step 2 issue.
- **NOT** extending `tailwind.config.js` with any Step 3-specific tokens. RED asserts on behavior, not style; GREEN will reuse existing sage / cream / tan tokens (and extend only where the shared palette doesn't cover the selected-row tint).
- **NOT** persisting language selection. Supabase `profiles` persistence is explicitly out of scope per the issue; RED queries only in-memory state.
- **NOT** setting up i18n (`i18n-js`, `react-i18next`, translation files). Hard-coded English copy is what renders; the helper-text promise ("You can change this later in settings") is a future feature, not something RED asserts is functional.
- **NOT** adding a language-selection `testID` convention beyond `language-row-en` / `language-row-zh-CN` (named in Unit 2). If GREEN prefers `testID="language-option-en"`, RED must be updated; this plan pins the testIDs so that doesn't happen.
- **NOT** adding an onboarding-completed gate. Issue's "routing gate that sends authed-but-not-onboarded users through (onboarding)" is explicitly out of scope.
- **NOT** touching `lib/auth-context.tsx`, `lib/supabase.ts`, or the existing `(auth)` / `(tabs)` / Step 1 stacks.

## Context & Research

### Relevant Code and Patterns

- `app/(onboarding)/step-1.tsx` — the shipped GREEN implementation from PR #6. Mirrors the screen shape RED expects for Step 3: `ScrollView` + `SafeAreaView` root, progress-bar + testIDs (`progress-bar`, `progress-fill`), card with shadow, primary `Pressable` with `accessibilityRole="button"` + `accessibilityLabel`, centered Back `Pressable`. GREEN for Step 3 should closely mirror this layout.
- `app/(onboarding)/__tests__/step-1.test.tsx` — the canonical RNTL test file in this repo. Test harness to copy verbatim for Step 3:
  - Local `jest.mock('expo-router', () => ({ useRouter: jest.fn(), Stack: { Screen: () => null, Protected: ({children}) => children ?? null } }))`
  - `SafeAreaProvider` wrapper with explicit `initialMetrics`
  - `beforeEach` resets `jest.clearAllMocks`, recreates fresh `mockPush` / `mockBack` / `mockReplace` as `jest.fn()`, and calls `jest.mocked(useRouter).mockReturnValue(...)` with the full router shape (including `replace: mockReplace` this time — Step 1's test didn't exercise `replace`; Step 3 does).
  - Role + label queries over text queries; `getByTestId` for non-semantic elements (progress bar).
- `app/(onboarding)/step-2.tsx` — still a placeholder stub ("Step 2 coming soon"). Do NOT modify here. The "wire Step 2's Next button to Step 3" checkbox in issue #4 depends on Step 2's real UI shipping first; RED assumes Step 2 is not yet real.
- `app/(onboarding)/_layout.tsx` — already exists, nothing to change.
- `app/_layout.tsx` — already registers `<Stack.Screen name="(onboarding)" options={{ headerShown: false }} />` under the authed `<Stack.Protected>`. Nothing to change.
- `jest-setup.ts` — pre-mocks `expo-secure-store`, `expo-web-browser`, `expo-linking`, `react-native-reanimated`. Does NOT mock `expo-router` (intentional — per-file). Does NOT mock any picker module. Leave alone.
- `.maestro/launch.yaml` — template for the new flow (`appId: com.workflowtest.app`, `launchApp`, `assertVisible` rhythm).
- `.maestro/onboarding-step-1.yaml` — template for the precondition comment block (user must be signed in; Maestro cannot drive ASWebAuthenticationSession).
- `tailwind.config.js` — already carries the sage / cream / tan / text-ramp tokens GREEN will reuse. RED does not extend it.

### Figma Design (node `15:2`) — token values for GREEN

GREEN will consume these; RED only echoes the user-visible copy.

| Role | Hex | Notes |
|---|---|---|
| Page background | `#fff8f0` | cream, already `bg-primary` |
| Step caption | `#8c8073` | Inter Medium 14, already `text-subtle` |
| Progress bar track | `rgba(156,175,136,0.2)` | sage tint, already `bg-progress-track` |
| Progress bar fill | `#9caf88` | sage, **100%** width (was 33% on Step 1), 6dp tall, 3dp radius |
| Card bg | `#ffffff` | already `bg-card`, 24dp radius, shadow `0 4 24 rgba(212,165,116,0.08)` (`shadow-card`) |
| Question H1 | `#33291f` | Inter Bold 24 / 32, already `text-heading` |
| Helper text | `#8c8073` | Inter Regular 14, already `text-subtle` |
| Row (unselected) bg | `#faf7f5` | already `bg-input` |
| Row (unselected) border | `#e5e0db` | 1px — slightly off from `border-input-default` (`#e0dbd6`); GREEN to decide whether to add a new `border-row-default` token or reuse the closest match. RED doesn't care. |
| Row (selected) bg | `rgba(156,175,136,0.12)` | sage tint (new token — likely `bg-row-selected`) |
| Row (selected) border | `#9caf88` | 2px sage (reuse `bg-progress-fill` color) |
| Radio (unselected) ring | `#c5beb6` or similar warm gray | 22dp diameter, 2px ring. GREEN to pick. |
| Radio (selected) ring+dot | `#9caf88` | 22dp diameter, 2px ring, centered 10dp dot |
| Row row native-name text | `#33291f` | Inter Semi Bold 16, already `text-heading` |
| Row english-name text | `#8c8073` | Inter Regular 13, already `text-subtle` |
| Get Started bg | `#d4a574` | already `bg-next` |
| Get Started label | `#ffffff` | Inter Semi Bold 17 |
| Get Started emoji | n/a | 🎉 18dp, 8dp gap from the label |
| Get Started shadow | `0 4 16 rgba(212,165,116,0.3)` | already `shadow-next` |
| Back link | `#8c8073` | Inter Medium 15, centered |

**Selected-border stability note (per issue #4 implementation notes):** unselected rows use a 1px border, selected rows use 2px — without a compensating padding adjustment the outer frame would jitter 1dp on selection change. GREEN will either (a) keep 2px on both with a transparent color when unselected or (b) shave 1dp of padding when selected. RED does not assert on layout stability; GREEN should spot-check visually.

### Institutional Learnings

- [docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md](../solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md) — captured from PR #6's RED → GREEN. Key rules that apply here:
  - **§1 RNTL event names:** `fireEvent(node, 'press', ...)` → `props.onPress`. Never write `fireEvent(node, 'onPress', ...)` (resolves to `props.onOnPress`, silent no-op). Only relevant if this file ends up needing a synthetic event; for Step 3 the interactions are standard `fireEvent.press`.
  - **§3 RED scaffolding:** every failure must read "Unable to find …", NOT "Cannot find module …" or "TypeError". A stub `<View testID="onboarding-step-3-screen" />` is the minimum. Verification grep in Unit 2.
  - **§5 `@ts-expect-error` over `as never`:** `replace('/(tabs)')` routes to an existing route group — typed routes should handle it without a suppression. If TS complains, prefer `@ts-expect-error` with a comment to `as never`. (Step 1's GREEN used `as never` for `/onboarding/step-2`; don't repeat that anti-pattern here.)
  - **§6 Don't spawn parallel `onAuthStateChange` subscribers:** Step 3 does not interact with auth state, so this only matters as background context. GREEN should not add listeners in `step-3.tsx`.
- `CLAUDE.md` non-negotiables: strictly TDD; never modify or delete a test to make it pass; every string inside `<Text>`; no `TouchableOpacity`; no `{falsy && JSX}` leaks; destructure hook returns at render top (`const { replace, back } = useRouter()`).
- `CLAUDE.md` "DateField wrapper pattern for custom synthetic events" — not needed here; Step 3's interactions (press) map cleanly to existing RN primitives.
- `CLAUDE.md` `DESIGN.md` divergence note: 11 onboarding-step-1 tokens in tailwind are Figma-derived, not from `DESIGN.md`'s ramp. Continue the same approach — GREEN may add 1–2 new tokens for Step 3 (selected-row bg + border) but should try to reuse first.

### External References

- `@testing-library/react-native` 13.x — `getByRole('radio', { name: /.../ })` is the idiomatic query for a `Pressable` with `accessibilityRole="radio"` and a matching `accessibilityLabel`. `getByRole('radiogroup')` similarly resolves a container with `accessibilityRole="radiogroup"`.
- React Native accessibility docs — `accessibilityState: { selected: boolean }` is the WAI-ARIA equivalent the a11y tree exposes to VoiceOver / TalkBack; asserting on `node.props.accessibilityState.selected` mirrors what an assistive-tech user experiences.
- Expo Router v6 — `replace('/(tabs)')` is a valid path (route-group segments in parentheses are supported). If typed routes flag it during GREEN, use `@ts-expect-error` with a reason, not `as never`.

## Key Technical Decisions

- **Stub strategy:** `app/(onboarding)/step-3.tsx` renders `<View testID="onboarding-step-3-screen" />`. Nothing else. No language rows, no buttons. The test file's imports resolve; every UI assertion fails with "Unable to find …".
- **`expo-router` mock strategy:** Mock locally in `step-3.test.tsx` — copy the factory from `step-1.test.tsx` verbatim, including `Stack.Screen` and `Stack.Protected` no-op stubs so any incidental module import resolves. Expose `useRouter: jest.fn()`; `beforeEach` injects fresh `mockPush` / `mockBack` / `mockReplace` / `mockDismiss` / `mockDismissAll` / `mockNavigate` / etc.
- **`replace` is the assertion target for Get Started** — not `push`. The issue's acceptance criterion is "user cannot Back into onboarding afterwards", which only `router.replace` guarantees.
- **Test assertion uses `router.replace('/(tabs)')` literal match** — not a loose regex. Issue #4 is explicit: "On Get Started, use `router.replace('/(tabs)')`". Pinning the exact string catches accidental drift to `/(tabs)/index`, `/`, or similar. If GREEN discovers `/(tabs)` doesn't compile under typed routes, the fix is a `@ts-expect-error`, not a rewrite of the test.
- **Language rows queried by `accessibilityRole="radio"` + name regex**, not by testID. Role-first: survives copy tweaks, enforces the a11y contract, and matches the way an AT user navigates the screen. Fallback: `getByText(/English/i)` / `getByText(/简体中文/i)` for the display check only.
- **Default-selection assertion uses `accessibilityState.selected`**, not a CSS/class check. The a11y state is what the user experiences; the visual style is a GREEN implementation detail.
- **Mutual-exclusion assertion is a pair of observations**, not a computed invariant — assert English `selected=true`, zh-CN `selected=false` → tap zh-CN → assert English `selected=false`, zh-CN `selected=true`. Simple, direct, no derived boolean arithmetic.
- **Radiogroup container is queried by `getByRole('radiogroup')`** (matches the WAI-ARIA role GREEN will set via `accessibilityRole="radiogroup"`). The container's `accessibilityLabel` is asserted to be a non-empty string but the exact text isn't pinned — GREEN can decide between "Preferred language" and "Language options" without breaking RED.
- **No `waitFor` or async flows expected.** Step 3 has no network call, no modal opening, no deferred state transitions. Tests are synchronous.
- **TestIDs pinned in this plan:** `onboarding-step-3-screen` (stub root), `progress-bar`, `progress-fill`. Language rows DO NOT receive testIDs — they're queried by role + name. Get Started and Back are queried by role + name. This keeps the testID surface minimal and forces GREEN to honor the a11y contract.
- **Maestro precondition mirrors Step 1's flow:** user must already be signed in (OAuth cannot be driven), dev-client build required (appId `com.workflowtest.app`, not Expo Go). Deep-link URL: `workflowtest://onboarding/step-3`.

## Open Questions

### Resolved During Planning

- **Include step-2 Next-button wiring in this RED?** → No. Step 2 is still a placeholder (no Next button to wire). The issue's "replaces the placeholder route introduced by issue #3" language presumes Step 2 has shipped; it hasn't. Defer the step-2 wiring to (a) whichever issue implements real Step 2, or (b) Step 3 GREEN if Step 2 has shipped by then. RED scope is step-3 only.
- **Pin the Get-Started target as `/(tabs)` literal, a regex, or an object shape?** → Literal string `/(tabs)`. The issue is explicit; loose matching would miss drift.
- **Assert default selection via `accessibilityState.selected` or a visual testID like `language-row-en-selected`?** → `accessibilityState.selected`. Visual-state testIDs are GREEN implementation leakage; a11y state is the real contract.
- **Query rows by role or testID?** → Role + name. TestID fallback only if role proves unstable (not expected here).
- **Mock expo-router globally in `jest-setup.ts` now that two screens need it?** → No. Keep the mock per-file. Future onboarding / tabs screens may want different router shapes (e.g., `useLocalSearchParams`, `Link` component behavior) and forcing a global shape is premature abstraction.
- **Include an accessibility "every element has role + label" sweep test like Step 1's?** → Yes, adapted — the sweep covers the two rows (role=radio), the radiogroup container (role=radiogroup), the Get Started button (role=button), and Back (role=button or link).
- **Test an edge case where tapping the already-selected English row is a no-op?** → Not asserted. The issue says "single-select" but doesn't specify idempotence. Either behavior (no-op vs. confirming re-selection) satisfies the literal contract. Leave flexibility for GREEN.

### Deferred to Implementation (GREEN plan)

- Exact new token names for selected-row bg / border (or whether to add them at all vs. inline `style={{ backgroundColor: 'rgba(156,175,136,0.12)' }}`).
- Whether the language catalog lives inline in `step-3.tsx` or in `app/(onboarding)/languages.ts`. Either satisfies the issue's "typed constant, not hardcoded inline" rule.
- Whether to extract `<LanguageRow />` as a sub-component or keep it inline. Decide after GREEN passes.
- Whether the radio indicator is a pure-view ring + dot or an SVG. Pure-view is simpler and matches the rest of the onboarding UI.
- Whether to use `Gesture.Tap()` + Reanimated shared values for press feedback (per `CLAUDE.md` animations guidance) or rely on `Pressable`'s `onPressIn`/`onPressOut`. Defer until visual polish — out of scope for the core interaction.
- Step 2 → Step 3 wiring (see Open Question above — belongs in whichever plan ships real Step 2).

## Implementation Units

- [x] **Unit 1: Route scaffolding — `app/(onboarding)/step-3.tsx` stub**

**Goal:** Create the minimum Expo Router surface so `app/(onboarding)/step-3.tsx` is a resolvable, renderable route. The stub renders a single empty `<View>` with a stable testID; no UI, no rows, no wiring. The `(onboarding)` group is already registered in `app/_layout.tsx`, so no root-layout change is needed.

**Requirements:** Unblocks Unit 2 (test imports must resolve); unblocks Unit 3 (Maestro flow reaches a screen that renders, even if empty).

**Dependencies:** None.

**Files:**
- Create: `app/(onboarding)/step-3.tsx`

**Approach:**
- `step-3.tsx` default-exports `OnboardingStep3Screen` rendering `<View testID="onboarding-step-3-screen" />`. Import `View` from `react-native`. No other imports. No props.
- Do NOT modify `app/(onboarding)/_layout.tsx` (no change needed — the file-based router picks up `step-3.tsx` automatically).
- Do NOT modify `app/_layout.tsx` (already registers the `(onboarding)` stack).
- Do NOT modify `app/(onboarding)/step-2.tsx`.

**Execution note:** RED scaffolding only. Zero behavior to assert.

**Patterns to follow:**
- `app/(onboarding)/step-2.tsx` currently contains a placeholder-copy stub with a shipped layout; for Step 3's RED stub, strip it back even further — no text, no copy, just a testID'd `<View>`. Step 2's "coming soon" text is a different category of stub (visible to users on a dev-client); Step 3's stub exists purely so tests resolve.

**Test scenarios:**
- Test expectation: none — stubs have no behavior to assert. Verified transitively by Unit 2's first test case ("stub root is on screen"), which passes as soon as the import resolves, and by manual dev-client deep-link verification.

**Verification:**
- `npx tsc --noEmit` passes.
- `npx expo start` does not error on module resolution for `app/(onboarding)/step-3.tsx`.
- `npm run lint` clean.
- Existing tests (`login.test.tsx`, `step-1.test.tsx`) still pass.

- [x] **Unit 2 (RED): Write the failing Jest + RNTL test file for Step 3**

**Goal:** Produce `app/(onboarding)/__tests__/step-3.test.tsx` covering every behavior called out in issue #4's acceptance criteria. Every test must **fail** against Unit 1's empty stub — the failure mode is the spec. No implementation changes in this unit. Land as its own atomic commit.

**Requirements:** R1, R2, R3, R4, R5, R6 (asserts); R8 (no regression).

**Dependencies:** Unit 1.

**Files:**
- Create: `app/(onboarding)/__tests__/step-3.test.tsx`

**Approach:**
- Mirror the harness from `app/(onboarding)/__tests__/step-1.test.tsx` verbatim:
  - Import `fireEvent`, `render`, `screen` from `@testing-library/react-native`.
  - `jest.mock('expo-router', () => ({ useRouter: jest.fn(), Stack: { Screen: () => null, Protected: ({children}: {children: unknown}) => children ?? null } }))`.
  - `SafeAreaProvider` wrapper with `initialMetrics` constant.
  - `renderScreen()` helper.
  - `beforeEach` clears mocks and sets fresh `mockPush` / `mockBack` / `mockReplace` (plus the rest of the router shape as `jest.fn()`).
- Use role-based queries: `getByRole('radio', { name: /English/i })`, `getByRole('radio', { name: /简体中文|Simplified Chinese/i })`, `getByRole('radiogroup')`, `getByRole('button', { name: /Get Started/i })`, `getByRole('button', { name: /^Back$/i })` with a `getByRole('link', { name: /^Back$/i })` fallback (Step 1's test accepts either — mirror that).
- For the question and helper text: `getByText(/Preferred Language/i)` and `getByText(/You can change this later in settings/i)`. Emoji 🌍 is fine in text content but not required for the matcher.
- For the progress bar: `getByTestId('progress-bar')` + `getByTestId('progress-fill')` — the same testIDs Step 1 uses. GREEN will wire both. Assert the fill exists (width is a style value; Step 1's tests don't pin exact width and neither should we — RED asserting "100%" would be testing presentation, which is not Step 1's convention either).

**Execution note:** RED only. Do NOT modify `step-3.tsx`. Do NOT modify `jest-setup.ts`. Verify RED with `npm test` and paste the failing output into the PR description.

**Patterns to follow:**
- `app/(onboarding)/__tests__/step-1.test.tsx` — router mock factory, `beforeEach` / `jest.clearAllMocks`, `SafeAreaProvider` wrapper, `renderScreen` helper, role + label queries.
- `app/(auth)/__tests__/login.test.tsx` — original pattern reference.

**Test scenarios:**

*Static render (R1):*
- **Happy path — header caption:** `screen.getByText('Step 3 of 3')` is on screen.
- **Happy path — progress bar:** `screen.getByTestId('progress-bar')` is on screen AND `screen.getByTestId('progress-fill')` exists inside it. (No assertion on exact width — style-value brittleness; Step 1's tests set the same precedent.)
- **Happy path — question headline:** `screen.getByText(/Preferred Language/i)` is on screen.
- **Happy path — helper text:** `screen.getByText(/You can change this later in settings/i)` is on screen.
- **Happy path — English row present:** `screen.getByRole('radio', { name: /English/i })` is on screen.
- **Happy path — 简体中文 row present:** `screen.getByRole('radio', { name: /简体中文|Simplified Chinese/i })` is on screen. (Name regex accepts either the native or the english translation so GREEN has flexibility on which it uses as `accessibilityLabel`.)
- **Happy path — radiogroup wrapper:** `screen.getByRole('radiogroup')` is on screen AND its `accessibilityLabel` is a non-empty string.
- **Happy path — Get Started button:** `screen.getByRole('button', { name: /Get Started/i })` is on screen.
- **Happy path — Back link:** `screen.queryByRole('link', { name: /^Back$/i }) ?? screen.getByRole('button', { name: /^Back$/i })` is on screen. (Accept either role to match Step 1's flexibility.)

*Default selection (R2):*
- **Happy path — English pre-selected on mount:** `getByRole('radio', { name: /English/i }).props.accessibilityState.selected === true`.
- **Happy path — 简体中文 not selected on mount:** `getByRole('radio', { name: /简体中文|Simplified Chinese/i }).props.accessibilityState.selected === false`.

*Mutual exclusion (R3):*
- **Happy path — tapping 简体中文 selects it:** After `fireEvent.press(getByRole('radio', { name: /简体中文|Simplified Chinese/i }))`, that row's `accessibilityState.selected` is `true`.
- **Happy path — tapping 简体中文 deselects English:** Same press, English row's `accessibilityState.selected` is `false`.
- **Edge case — tapping English after 简体中文 re-selects English and deselects 简体中文:** Press zh-CN, then press English; English `selected=true`, zh-CN `selected=false`.
- **Edge case — only one row is selected at any time:** After each press in the sequence above, assert that exactly one of the two rows has `selected=true` (count via `.filter(r => r.props.accessibilityState.selected).length === 1`).

*Get Started navigation (R4):*
- **Happy path — tapping Get Started calls `router.replace('/(tabs)')`:** After `fireEvent.press(getByRole('button', { name: /Get Started/i }))`, `mockReplace` was called exactly once with the string `'/(tabs)'` (exact literal match). Fallback: if GREEN passes an `Href` object, accept `{ pathname: '/(tabs)' }` — mirror Step 1's Next navigation test.
- **Edge case — Get Started does NOT call `router.push`:** Same press, `mockPush` was not called. (Catches "implementer used `push` instead of `replace`" drift.)
- **Edge case — Get Started does NOT call `router.back`:** Same press, `mockBack` was not called.

*Back navigation (R5):*
- **Happy path — tapping Back calls `router.back()`:** `mockBack` was called exactly once.
- **Edge case — Back does NOT call `router.replace` or `router.push`:** Same press, neither was called.

*Accessibility (R6):*
- **Happy path — each row has `role=radio` + non-empty label:** For both English and 简体中文 rows: `props.accessibilityRole === 'radio'` (or `props.role === 'radio'`), `props.accessibilityLabel` is a truthy string, and `props.accessibilityState.selected` is a boolean (not undefined).
- **Happy path — radiogroup wrapper has `role=radiogroup` + non-empty label:** The wrapper's `accessibilityRole === 'radiogroup'` (or `role === 'radiogroup'`) and `accessibilityLabel` is truthy.
- **Happy path — every interactive element exposes role + label:** Adapted sweep from Step 1: English radio, zh-CN radio, Get Started button, Back link each have a role and a non-empty `accessibilityLabel`.

**Verification:**
- `npx jest "app/(onboarding)/__tests__/step-3.test.tsx"` exits **non-zero** with every test case failing for the right reason: "Unable to find …" on role/text/testID queries, NOT module-resolution / import / syntax / runtime errors. Expected ~17 failing cases.
- `npx jest "app/(onboarding)/__tests__/step-3.test.tsx" 2>&1 | grep -E "Cannot find module|TypeError|ReferenceError"` returns **no lines** (per `docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md` §3 verification rule).
- `npx jest "app/(auth)/__tests__/login.test.tsx" "app/(onboarding)/__tests__/step-1.test.tsx"` still passes — no regression.
- `npx tsc --noEmit` clean.
- `npm run lint` clean.
- Commit message references "RED — failing tests for onboarding step 3". No production code touched except the Unit 1 stub.

- [x] **Unit 3: Write the companion Maestro flow — `.maestro/onboarding-step-3.yaml`**

**Goal:** Ship the E2E smoke flow described by issue #4 in the same RED commit set, so the spec is complete and reviewable. The flow is expected to **fail** against any dev-client build of this branch (the stub renders nothing) — GREEN will make it pass. Syntactically valid YAML, `appId: com.workflowtest.app`.

**Requirements:** R7 (artifact only; executed green in GREEN plan).

**Dependencies:** Unit 1 (so the route resolves on the dev-client without a 404).

**Files:**
- Create: `.maestro/onboarding-step-3.yaml`

**Approach:**
- Header: `appId: com.workflowtest.app`.
- Leading comment block mirrors `.maestro/onboarding-step-1.yaml`:
  - RED-authored, expected to fail on this branch.
  - Precondition: dev-client signed in; Maestro cannot drive Google OAuth inside ASWebAuthenticationSession.
  - Limitation: a production run would reach Step 3 via Step 1 → Step 2 → Step 3 navigation chain. Since Step 2 is still a placeholder with no Next button, this flow deep-links directly to `workflowtest://onboarding/step-3` and does NOT exercise the Step 2 → Step 3 wiring. That wiring is tracked separately.
  - Limitation: `router.replace('/(tabs)')` lands on the default tab (Home). After Get Started, the flow asserts visible tab-screen copy (e.g., "Home", or whatever `(tabs)/index.tsx` renders on cold load). Exact assertion text is a best-guess; GREEN may need to tweak once verified against the build.
- Flow body:
  1. `- launchApp: {}` (no `clearState` — rely on persisted session).
  2. `- openLink: workflowtest://onboarding/step-3`.
  3. `- assertVisible: "Step 3 of 3"`.
  4. `- assertVisible: "Preferred Language"` (no emoji — Maestro is fussy about non-ASCII matchers; the question text "Preferred Language" appears whether or not the 🌍 emoji renders).
  5. `- assertVisible: "English"`.
  6. `- tapOn: "简体中文"` — switches language to Simplified Chinese. Note: if Maestro struggles with CJK matching on some devices, fall back to `- tapOn: { text: "Simplified Chinese" }` (english translation) which is visually adjacent on the row. Document the fallback in a comment.
  7. `- tapOn: "Get Started"`.
  8. `- assertVisible: "Welcome"` — placeholder assertion; actual tab content TBD. If `(tabs)/index.tsx`'s visible copy is different, GREEN updates this line. The assertion's purpose is to verify "we landed outside onboarding"; any tabs-side string suffices.

- Document that `maestro test .maestro/onboarding-step-3.yaml` is expected to fail against this branch (the stub renders nothing to assert against) and that GREEN makes it pass.

**Patterns to follow:**
- `.maestro/launch.yaml` — front matter + `launchApp` rhythm.
- `.maestro/onboarding-step-1.yaml` — precondition + limitation comment block conventions.

**Test scenarios:**
- Test expectation: the YAML itself is the spec; executing it against a GREEN-implemented build is the passing test. RED verification is limited to YAML parsing validity + the file existing at the expected path.

**Verification:**
- `maestro test .maestro/onboarding-step-3.yaml` parses the file without a YAML error (may fail the flow itself — that's expected on this branch).
- `git diff` in this unit touches only `.maestro/onboarding-step-3.yaml`.
- `.maestro/launch.yaml` and `.maestro/onboarding-step-1.yaml` are unchanged (no regression).

## System-Wide Impact

- **Interaction graph:** Adds a new screen to the existing `(onboarding)` route group. No change to root layout, auth guards, `AuthProvider`, `SecureStore` adapter, session refresh, or the `(auth)` ↔ `(tabs)` protection shape.
- **Error propagation:** N/A — the RED plan adds no error surfaces.
- **State lifecycle risks:** N/A — the stub has no state. The mocked `expo-router` is scoped to the test file; no risk of leaking into `step-1.test.tsx` or `login.test.tsx`.
- **API surface parity:** N/A — no public APIs change.
- **Integration coverage:** Jest covers in-app behavior through the stub's future implementation; Maestro covers the E2E launch path on a dev-client. The Step 2 → Step 3 link is NOT covered by this plan (Step 2 is still placeholder); it's tracked as a follow-up for whichever issue ships real Step 2.
- **Unchanged invariants:** `flowType: 'pkce'`, `detectSessionInUrl: false`, the SecureStore chunking adapter, the `AppState` refresh loop, `scheme: "workflowtest"`, `ios.bundleIdentifier: "com.workflowtest.app"`, `app.json` `expo.name`, and the existing `(auth)` / `(tabs)` / Step 1 / Step 2-placeholder stacks. None change.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| The `'/(tabs)'` literal in the Get Started assertion breaks under Expo Router typed routes (route-group segments in parentheses may not resolve in the manifest until rebuild) | Pin the string in the test. If GREEN's typed-routes check flags `replace('/(tabs)')`, the fix is a `@ts-expect-error` in GREEN's code — never a regex softening in the RED test. The test pins the contract; the implementation adapts. |
| Row query by `getByRole('radio', { name: /简体中文|Simplified Chinese/i })` is ambiguous — does `accessibilityLabel` contain the native name, the english name, both, or neither? | The regex accepts either, so GREEN has flexibility. If GREEN uses a compound label ("简体中文 Simplified Chinese"), the regex still matches. If GREEN decides to use only `"Chinese"` — the test fails, which is correct (RED pins the language-identification contract). |
| Maestro CJK character tap (`tapOn: "简体中文"`) may be flaky on some Android devices due to font fallback | Document an english-translation fallback in a comment; if the real run proves flaky, GREEN swaps to the ASCII path. RED verification doesn't run the flow, so this doesn't block the RED commit. |
| The Maestro flow's `assertVisible: "Welcome"` after Get Started may not match actual `(tabs)/index.tsx` copy | Mark it as a best-guess placeholder in a comment; update in GREEN once the real cold-load text is observed. Purpose is to verify navigation left onboarding — any tabs-side string satisfies. |
| Duplicate testIDs between Step 1 and Step 3 (`progress-bar`, `progress-fill`) cause a collision if both screens render in the same tree | Impossible in practice — Step 1 and Step 3 are sibling screens in the same Stack; only one renders at a time. Confirmed by Step 1's test using the same testIDs without issue. |
| RED tests pass against the stub for the wrong reason (e.g., if the stub accidentally had a `<Text>Step 3 of 3</Text>` leftover from a copy-paste) | Unit 1's stub is deliberately minimal — just a testID'd `<View>`. Code review should confirm the stub is truly empty before merging the RED commit. |
| `fireEvent.press` on a Pressable row wired to `accessibilityRole="radio"` doesn't trigger `onPress` because RN's role normalization rewrote something | Unlikely per RNTL 13.x semantics (`press` → `onPress` is the standard path), but if it surfaces, the fix is in GREEN (wire the Pressable's `onPress` to the selection setter) — not a test rewrite. |
| Issue #4's Step 2 → Step 3 checkbox gets interpreted as in-scope for this RED plan | Explicitly stated as OUT of scope in Scope Boundaries and again in Open Questions. Review the scope boundary before starting Unit 1. |

## Documentation / Operational Notes

- **PR description:** paste the failing-test output from `npx jest "app/(onboarding)/__tests__/step-3.test.tsx"`. Keep it targeted to failing tests (`--silent` if noisy).
- **Follow-up plan:** on merge, open a GREEN plan (`2026-04-??-NNN-feat-onboarding-step-3-green-plan.md`) that covers the full Step 3 UI implementation, any new tokens needed (selected-row bg + border), and the Step 2 → Step 3 wiring if Step 2 has shipped by then.
- **`CLAUDE.md`:** no update required for this RED plan — conventions are already documented. GREEN may want to extend the onboarding-step token list if new tokens are added.
- **EAS:** no rebuild flag needed for a pure-JS change. When Maestro runs against GREEN, the existing dev-client build works (no new native modules).
- **`.maestro/README.md`:** leave alone for this plan.

## Sources & References

- **Origin issue:** [issue #4](https://github.com/nipunvv/WorkflowTest/issues/4)
- **Figma frame:** node `15:2` — https://www.figma.com/design/CLEcJLTTd4L1JDDjc6KDwl/Untitled?node-id=15-2
- **Prior RED-phase pattern:** [docs/plans/2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md](./2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md)
- **Institutional learning:** [docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md](../solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md)
- Related files:
  - `app/_layout.tsx`
  - `app/(onboarding)/_layout.tsx`
  - `app/(onboarding)/step-1.tsx`
  - `app/(onboarding)/step-2.tsx`
  - `app/(onboarding)/__tests__/step-1.test.tsx`
  - `app/(auth)/__tests__/login.test.tsx`
  - `jest-setup.ts`
  - `.maestro/launch.yaml`
  - `.maestro/onboarding-step-1.yaml`
  - `.maestro/README.md`
  - `tailwind.config.js`
  - `CLAUDE.md`
  - `DESIGN.md`
- Related future plans / issues (not created yet): GREEN plan for issue #4 (UI + wiring + any new tokens); real Step 2 screen (separate issue); Supabase `profiles` onboarding persistence (separate issue); onboarding-gate redirect for authed-but-not-onboarded users (separate issue); i18n infrastructure (separate issue).

## Verification (end-to-end for this plan)

1. **Type-check:** `npx tsc --noEmit` — clean across the new files.
2. **Lint:** `npm run lint` — clean.
3. **New failing tests:** `npx jest "app/(onboarding)/__tests__/step-3.test.tsx"` — fails with ~17 "Unable to find …" assertion failures. No syntax / import / runtime errors.
4. **RED signal quality:** `npx jest "app/(onboarding)/__tests__/step-3.test.tsx" 2>&1 | grep -E "Cannot find module|TypeError|ReferenceError"` — no matches.
5. **No regression — existing unit tests:** `npx jest "app/(auth)/__tests__/login.test.tsx" "app/(onboarding)/__tests__/step-1.test.tsx"` — both still pass.
6. **Full suite:** `npm test` — fails (expected, RED); ensure the only failures are in `step-3.test.tsx`.
7. **Maestro artifact validity:** `.maestro/onboarding-step-3.yaml` exists and parses; the RED flow is not executed against a dev-client in this plan.
8. **Existing Maestro flows:** `.maestro/launch.yaml` and `.maestro/onboarding-step-1.yaml` unchanged (no regression).
9. **Manual dev-client smoke (optional):** `npx expo start --dev-client` → sign in → deep-link `workflowtest://onboarding/step-3` → empty screen renders without a 404.

If any step fails unexpectedly (syntax error in `step-3.test.tsx`, regression in `step-1.test.tsx` or `login.test.tsx`, 404 on the route), iterate on the failing unit before marking complete. **Do NOT edit tests to make them pass — per `CLAUDE.md`, never modify or delete an existing test to make it pass. A RED failure for the wrong reason means the test is wrong, not the spec.**
