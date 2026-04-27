---
title: "feat: Add onboarding Step 2 symptoms screen (issue #3)"
type: feat
status: active
date: 2026-04-22
origin: https://github.com/nipunvv/WorkflowTest/issues/3
---

# feat: Add onboarding Step 2 symptoms screen (issue #3)

## Overview

Implement the second of three post-signup onboarding screens: a symptoms multi-select. The screen asks "What are your primary symptoms?" and presents six predefined chips in a wrapping grid. Users can select/deselect any combination; Next enables as soon as at least one is selected. Back returns to Step 1. Ships as a replacement for the existing placeholder at `app/(onboarding)/step-2.tsx`.

This is a pure UI + wiring + routing change. Auth, data persistence, and the Step 3 screen are out of scope.

## Problem Frame

Issue #3 wants Step 2 of the three-step onboarding flow. Step 1 (Basic Info) already ships and navigates to `/onboarding/step-2` via `router.push` — which currently resolves to a placeholder that says "Step 2 coming soon" (left behind by issue #2 as a stub). This plan replaces that placeholder with the real screen.

The screen collects a user's primary symptoms from a fixed list of six: Dry Eyes, Dry Mouth, Joint Pain, Fatigue, Brain Fog, Neuropathy. Persistence to Supabase is explicitly deferred — selection state lives in local `useState` only. A follow-up issue will introduce the `user_symptoms` schema and wire persistence end-to-end.

Design reference: Figma node `14:2` in file `CLEcJLTTd4L1JDDjc6KDwl`.

## Requirements Trace (from issue #3)

**Render:**
- R1. **Render:** step caption ("Step 2 of 3"), progress bar at ~2/3 fill, question ("What are your primary symptoms?"), helper text ("Select all that apply"), all six chips, Next button, Back link

**Interaction:**
- R2. **Multi-select chip behavior:** tapping a chip toggles its selected state; tapping a selected chip deselects it; multiple chips can be simultaneously selected
- R3. **Next enablement:** disabled when zero chips are selected; enabled when one or more are selected

**Navigation:**
- R4. **Next navigation:** tapping enabled Next navigates to `/onboarding/step-3`
- R5. **Back navigation:** tapping Back calls `router.back()`

**Accessibility & visual:**
- R6. **Accessibility:** every chip has `accessibilityRole="checkbox"`, `accessibilityLabel` (emoji-free), and `accessibilityState.checked` reflecting current selection
- R7. **Chip size stability:** selected-chip outer dimensions equal unselected-chip outer dimensions so the wrap layout does not reflow on toggle

**Quality gates:**
- R8. **E2E smoke (Maestro):** open Step 2 from Step 1, select two chips, deselect one, tap Next, assert navigation
- R9. **No regression** in Step 1 or the existing auth flow

## Scope Boundaries

- **NOT** implementing Step 3 (separate issue) — a minimal placeholder stub is added so `push('/onboarding/step-3')` doesn't 404 on dev-client
- **NOT** persisting selected symptoms (requires `profiles` / `user_symptoms` schema; follow-up issue)
- **NOT** allowing editable/custom symptoms — the six predefined chips are the full catalog
- **NOT** touching `lib/auth-context.tsx`, `lib/supabase.ts`, `app/_layout.tsx`, or the `(auth)` / `(tabs)` stacks
- **NOT** extracting a shared `<ProgressHeader step={n} total={3} />` component across Step 1 and Step 2. Extract after Step 3 ships and the duplication is concrete
- **NOT** resolving Step 1's `canProceed` ambiguity (DOB vs Not-sure bypass — tracked separately in `docs/onboarding/step-1-basic-info.md`)
- **NOT** fixing Step 1's existing `as never` route cast. New code in this plan uses `@ts-expect-error` per Pattern 5 in `docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md`, but leaves Step 1's older pattern alone. **Caveat:** this pattern has a known sequencing gotcha with Expo Router's type-gen — see the route-casting finding in the review section for discussion before committing to the directive

## Context & Research

### Relevant Code and Patterns

- **`app/(onboarding)/step-1.tsx`** — canonical pattern for a tokenized screen with `ScrollView` inside `SafeAreaView`, local `useState` form state, `canProceed` validation, `useRouter` destructured at the top of render (React Compiler requirement), and an `accessibilityState.disabled` pattern on the Next `Pressable`. Mirror the top-level layout (progress header, 36dp spacer, card, flex spacer, navigation).
- **`app/(onboarding)/step-2.tsx`** — current 22-line placeholder stub. This plan replaces it with the real screen.
- **`app/(onboarding)/__tests__/step-1.test.tsx`** — canonical RNTL harness for onboarding screens. Reuse the patterns: `SafeAreaProvider` wrapper with explicit `initialMetrics`, per-file `jest.mock('expo-router', ...)` factory with `useRouter: jest.fn()`, `beforeEach` resetting `mockPush` / `mockBack` to fresh `jest.fn()`s, role-based queries (`getByRole`, `getByLabelText`).
- **`docs/plans/2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md`** — structural reference; Step 1's plan established the RED-phase scaffolding pattern this plan reuses for Step 2.
- **`docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md`** — Patterns 1, 3, and 5 directly apply:
  - Pattern 1: RNTL `fireEvent` event-name normalization — always pass event names **without** the `on` prefix (e.g., `fireEvent.press(node)`, `fireEvent(node, 'changeDate', date)`). Writing `'onChangeDate'` makes RNTL look for `props.onOnChangeDate` and silently no-ops. For chips specifically, `fireEvent.press(chip)` is all that's needed — there is no custom synthetic event involved
  - Pattern 3: RED scaffolding must produce "Unable to find …" failures, not "Cannot find module …"
  - Pattern 5: Use `@ts-expect-error` (not `as never`) for typed-route strings that don't yet exist (`/onboarding/step-3`)
- **`app/_layout.tsx`** — `(onboarding)` group already registered under `Stack.Protected guard={isAuthed}`. No root-layout changes required.
- **`tailwind.config.js`** — current tokens reusable for Step 2. Config keys (left) and the corresponding NativeWind `className` usage (right — the `bg-`/`border-`/`text-` prefix is NativeWind's utility prefix, stacked on top of the semantic token name):
  - `bg-primary` → `className="bg-bg-primary"` (cream `#fff8f0`)
  - `bg-card` → `className="bg-bg-card"` (white, the card bg)
  - `bg-input` → `className="bg-bg-input"` (`#faf7f5`, also the chip-unselected bg)
  - `border-input-default` → `className="border-border-input-default"` (`#e0dbd6`, also the chip-unselected border)
  - `bg-progress-fill` → `className="bg-bg-progress-fill"` (`#9caf88`, also the chip-selected bg)
  - `bg-progress-track`, `bg-next`, `text-heading`, `text-subtle` — same double-prefix pattern
  - `boxShadow.card`, `boxShadow.next` exist but are **used as literal inline `style={{ boxShadow: '...' }}` strings** in `step-1.tsx`, NOT via `className="shadow-card"`. NativeWind's shadow utility emits legacy RN shadow props that don't apply Android elevation; inline CSS `boxShadow` strings cross-compile correctly on RN 0.76+.
  - New additions needed in Unit 2: chip-label text color (`#594d40`), chip selected-state shadow.
- **`.maestro/onboarding-step-1.yaml`** — pattern for the new `.maestro/onboarding-step-2.yaml`: `appId` header, precondition comment, `launchApp`, `openLink`, `assertVisible`, `tapOn` sequence.

### Institutional Learnings

- **`docs/decisions/006-datefield-wrapper-for-custom-synthetic-events.md`** — the wrapper-component pattern for test-driven custom events. Not required here: chips use standard `onPress`, so `fireEvent.press(chip)` covers them. Worth noting so the implementer doesn't reach for the wrapper pattern unnecessarily.
- **`docs/decisions/007-post-signin-redirect-signed-in-only.md`** — `useRedirectOnSignIn` bounces every sign-in to Step 1. This means testing onboarding end-to-end from a clean session always enters at Step 1 — acceptable; not in scope to fix.
- **`CLAUDE.md` non-negotiables** — strict TDD; never modify an existing test to make implementation pass; never commit until explicitly asked.
- **`CLAUDE.md` React Compiler compat** — destructure hook returns at the top of render (`const { push, back } = useRouter()`). Avoid dotting into objects inside JSX.
- **`CLAUDE.md` falsy-JSX rule** — use `count > 0 ? <X /> : null` or `!!count && <X />`, never `{count && <X />}`. The Next-enabled logic uses a boolean (`selected.size > 0`) so this is mostly moot, but flag if any `{selected.size && …}` slips in.

## Key Technical Decisions

- **Symptom catalog lives in `app/(onboarding)/symptoms.ts`** — a typed module exporting an ordered `SYMPTOMS` array with `{ id, emoji, label, accessibilityLabel }` entries. Rationale: (1) Step 3 may read the same catalog, (2) tests can import the catalog independently from the screen to assert length/content without rendering, (3) keeps the screen file focused on layout and state.
- **Selection state uses `useState<Set<SymptomId>>`** — `Set` has O(1) membership and toggle semantics. Updates must create a new `Set` to satisfy React identity checks: `setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; })`. An array would also work; `Set` is chosen for clarity. `SymptomId` is a TypeScript string-literal union derived from the catalog.
- **`SymptomChip` is a local (file-private) component inside `step-2.tsx`** — encapsulates unselected/selected styling, the +2dp padding offset for the no-border selected state, the `accessibilityRole="checkbox"` + `accessibilityState.checked` contract, and the shadow. Not extracted to `components/` yet; follows the pattern of `DateField` being co-located inside `step-1.tsx`. Extract later if Step 3 reuses chips.
- **Chip size stability — math is off in the issue spec; pick a fallback before GREEN.** Unselected outer width = content + 2×18 + 2×1 (border) = content + 38. Selected outer width with the issue's `paddingHorizontal: 20` + no border = content + 40 — **2dp wider**, not equal. For true size parity, the compensation should be +1dp per side (→ `paddingHorizontal: 19`), not +2dp. Also, font-weight switching from 500 to 600 widens text glyphs in Inter (Semi Bold vs Medium) — "Neuropathy" is measurably wider in 600, which is invisible to padding math. **Recommended approach (pick during GREEN, not inherited from issue):** keep a `1px transparent border` in the selected state instead of removing the border entirely. This sidesteps the arithmetic and the font-weight drift in one move. Padding stays identical across states (18/14). Fallback if the transparent-border approach looks off: explicit `minWidth` per chip sized for the Semi Bold measurement.
- **Next target route-casting is an open question** — Pattern 5 of the solutions doc advocates `@ts-expect-error` over `as never`. BUT: Unit 1 creates `app/(onboarding)/step-3.tsx`, and Expo Router's `.expo/types/router.d.ts` manifest regenerates whenever metro picks up file-tree changes. If regeneration runs before Unit 4's `tsc --noEmit`, `@ts-expect-error` becomes an "unused directive" error under `strict: true`. Three options, decide before GREEN:
  - (a) **`@ts-expect-error` + watch for regen** — loud when types catch up, but Unit 4 may need to remove the directive before its tsc passes. Matches Pattern 5 when types are stale.
  - (b) **`as never`** — silent opt-out; consistent with Step 1's existing pattern; won't break tsc regardless of regen state.
  - (c) **No cast; rely on type-gen** — run `npx expo start` once after Unit 1 lands to refresh the manifest, then `push('/onboarding/step-3')` compiles cleanly. Cleanest end state but depends on the implementer remembering the type-gen step.
  Step 1's existing `as never` stays untouched regardless.
- **No new root-layout changes** — `(onboarding)` group is already registered under the authed guard. The Step 3 placeholder added in this plan piggybacks on the existing registration.
- **Progress header stays inline in each step** — Step 2's progress bar differs from Step 1 only in `width: '66.666%'` and the caption string. Extracting a shared component now is premature; wait for Step 3 to see the actual duplication shape.
- **Symptom IDs are kebab-case strings** — `dry-eyes`, `dry-mouth`, `joint-pain`, `fatigue`, `brain-fog`, `neuropathy`. Matches existing naming style (route segments, test IDs) and maps cleanly to future database column values.
- **No chip pressed/active state styling** — chips render the same during finger-down as at rest. Visual feedback comes from the toggle state change on release. Matches Step 1's button precedent (Next / Back have no `onPressIn`/`onPressOut` feedback either). Keeps scope tight; add animated press states in a future polish pass if needed.
- **Next disabled state uses `opacity: 0.5` over the honey fill, matching Step 1's existing pattern.** Known limitation: `rgba(212,165,116,0.5)` over `#fff8f0` likely fails WCAG 1.4.3 contrast (3:1 minimum for large text). Accepted for this iteration to stay consistent with Step 1. Track a follow-up to introduce a proper `bg-next-disabled` token and apply it across all onboarding primary buttons together (Step 1, Step 2, future Step 3) rather than diverging one screen at a time.

## Open Questions

### Resolved During Planning

- **Where does the symptom catalog live?** → `app/(onboarding)/symptoms.ts` (colocated, typed, reusable).
- **What's the selection state shape?** → `Set<SymptomId>` via `useState`.
- **Do we extract `SymptomChip`?** → No, inline in `step-2.tsx`. Follow `DateField` precedent.
- **Do we extract `ProgressHeader` across steps?** → No, wait for Step 3.
- **Chip size stability strategy?** → 1px transparent border in the selected state (keeps padding constant at 18/14 across both states). Fallback to explicit `minWidth` if font-weight width drift still causes reflow. Issue's +2dp asymmetric-padding suggestion has off-by-one math and doesn't account for Inter Medium vs Semi Bold advance widths.
- **Route typing for `/onboarding/step-3`?** → Default (c): no cast; run `npx expo start` after Unit 1 to refresh the typed-routes manifest, then `push('/onboarding/step-3')` compiles cleanly. Fall back to (b) `as never` if type-gen proves flaky during GREEN.
- **Chip pressed/active state?** → None. Match Step 1 button precedent.
- **Next disabled visual?** → `opacity: 0.5`, match Step 1. Known WCAG 1.4.3 concern tracked as a cross-step follow-up.
- **Symptom IDs?** → kebab-case strings listed above.

### Deferred to Implementation

- **Exact `SymptomChip` internal structure** — whether the emoji + label share a single `Text` or split into two (e.g., for emoji font sizing). Decide during GREEN based on visual parity.
- **`accessibilityLabel` wording** — issue suggests "Dry eyes" (sentence case); the chip visible label is "Dry Eyes" (title case). Use sentence case for the accessibility label to match VoiceOver natural reading. Confirm on-device if it sounds off.
- **Whether a `testID="symptom-chip-<id>"` pattern is needed** — tests query chips by role + label; explicit `testID` only needed if the role query becomes ambiguous. Likely not — role-based queries should suffice.

## Implementation Units

- [ ] **Unit 1: Add symptom catalog module and Step 3 placeholder route**

**Goal:** Ship the two prerequisites the Step 2 screen depends on: a typed symptom catalog that the screen imports, and a minimal Step 3 placeholder so the Next button's `push('/onboarding/step-3')` resolves without a 404 on dev-client builds.

**Requirements:** Unblocks Unit 3 (tests can import the catalog) and Unit 4 (screen renders from the catalog; Next navigates to a real route).

**Dependencies:** None.

**Files:**
- Create: `app/(onboarding)/symptoms.ts`
- Create: `app/(onboarding)/step-3.tsx`

**Approach:**
- `symptoms.ts` exports:
  - A `SymptomId` type (string-literal union of the six IDs)
  - A `Symptom` type with `{ id: SymptomId; emoji: string; label: string; accessibilityLabel: string }`
  - A `SYMPTOMS: readonly Symptom[]` ordered exactly as the issue lists them
- `step-3.tsx` mirrors the current `step-2.tsx` stub: centered "Step 3 coming soon" text inside `SafeAreaView` + `View`. Four lines of logic, no state, no props. A leading comment states "Placeholder; real Step 3 tracked as a separate issue."

**Patterns to follow:**
- `app/(onboarding)/step-2.tsx` (current stub) for the placeholder shape and token usage.
- `app/(onboarding)/step-1.tsx` `DateField` type declaration style (inline `type` export) for `symptoms.ts` type syntax.

**Test scenarios:**
- Test expectation: none — the catalog is a typed-data module and the stub is a placeholder; no behavior to assert. Covered transitively by Unit 3's tests iterating over `SYMPTOMS.length` / labels, and by Unit 4's "Next navigates to `/onboarding/step-3`" assertion resolving to a real route on a dev-client.

**Verification:**
- `npx tsc --noEmit` clean — catalog types compile, stub types compile.
- `npm run lint` clean.
- A dev-client running this branch can manually navigate to `workflowtest://onboarding/step-3` and see "Step 3 coming soon" without a 404.

- [ ] **Unit 2: Extend `tailwind.config.js` with chip-specific tokens**

**Goal:** Add the two tokens that Step 2's chip component needs and that don't already exist in the config, while reusing existing tokens where the hex values match semantically.

**Requirements:** R1 (visual parity), enables R7 (size stability implemented via padding, which doesn't need tokens but benefits from consistent color tokens).

**Dependencies:** None.

**Files:**
- Modify: `tailwind.config.js`

**Approach:**
- Under `theme.extend.colors`, add `text-chip-label: "#594d40"` (chip label text, new).
- Under `theme.extend.boxShadow`, add `chip: "0 2px 8px rgba(156,175,136,0.25)"` (selected-chip soft sage shadow, new).
- **Reuse existing tokens** (no config change needed):
  - Chip unselected bg: `bg-input` (#faf7f5)
  - Chip unselected border: `border-input-default` (#e0dbd6)
  - Chip selected bg: `bg-progress-fill` (#9caf88) — semantic overlap; acceptable to share per the existing pattern where `accent-primary` and `bg-next` share #d4a574 (flagged but not yet consolidated per ADR 004)
  - Question and Back text colors: `text-heading` and `text-subtle` respectively
- Document the reuse choices inline with brief comments in the config.

**Test scenarios:**
- Test expectation: none — pure configuration, no behavioral change. Verified transitively via Unit 4 rendering and manual visual QA.

**Verification:**
- `npx tsc --noEmit` clean — `tailwind.config.js` is JS, not type-checked, but the config file should still parse.
- `npm run lint` clean.
- New token names resolve in NativeWind `className` usage (exercised by Unit 4's implementation).

- [ ] **Unit 3 (RED): Write failing Jest + RNTL tests for Step 2**

**Goal:** Produce `app/(onboarding)/__tests__/step-2.test.tsx` covering every behavior from R1–R7 and R9. Every test must fail against the current `step-2.tsx` stub — the failure mode is the spec. No implementation changes in this unit. Tests drive the contract that Unit 4 implements.

**Requirements:** R1, R2, R3, R4, R5, R6, R7 (assertions); R9 (no regression in Step 1 or hook tests).

**Dependencies:** Unit 1 (so `import { SYMPTOMS } from '../symptoms'` resolves in the test file).

**Files:**
- Create: `app/(onboarding)/__tests__/step-2.test.tsx`

**Approach:**
- Mirror the test harness from `app/(onboarding)/__tests__/step-1.test.tsx`:
  - `SafeAreaProvider` wrapper with explicit `initialMetrics` (top/bottom/left/right insets = 0; frame 393×852)
  - `renderScreen(ui = <OnboardingStep2Screen />)` helper
  - Per-file `jest.mock('expo-router', () => ({ useRouter: jest.fn(), Stack: { Screen: () => null, Protected: ({ children }: { children: React.ReactNode }) => children ?? null } }))`
  - `beforeEach` with `jest.clearAllMocks()`, fresh `mockPush` / `mockBack` `jest.fn()`s, and `jest.mocked(useRouter).mockReturnValue({...})` with all `Router` methods stubbed (including `dismissTo`, `canDismiss` to satisfy the type checker — see `step-1.test.tsx` for the full shape)
- Import the `SYMPTOMS` catalog from `../symptoms` to derive expected labels without hardcoding.
- Use role-based queries: `getByRole('button', { name: /^Next$/i })`, `getByRole('button', { name: /^Back$/i })`, `getByRole('checkbox', { name: /dry eyes/i })` etc.
- For the progress bar, query `getByTestId('progress-bar')` and `getByTestId('progress-fill')` (same testID contract Step 1 established).

**Execution note:** This is the RED half. Do NOT modify `step-2.tsx` in this unit. Verify RED with `npm test` — expect every new assertion to fail for the right reason: "Unable to find …" matchers, not "Cannot find module …", `TypeError`, or `SyntaxError`. Paste the failing output into the PR description.

**Patterns to follow:**
- `app/(onboarding)/__tests__/step-1.test.tsx` — harness, mock factory, query patterns.
- Pattern 1 from `docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md` — always pass event names without the `on` prefix.

**Test scenarios:**

*Static render (R1):*
- **Happy path — step caption:** `screen.getByText('Step 2 of 3')` is on screen.
- **Happy path — progress bar:** `getByTestId('progress-bar')` exists with a `testID="progress-fill"` child. (Do NOT assert on the fill's width string — Step 1 precedent is to assert testID presence only; width literal is GREEN's choice.)
- **Happy path — question:** `getByText(/What are your primary symptoms/i)` is on screen.
- **Happy path — helper text:** `getByText(/Select all that apply/i)` is on screen.
- **Happy path — six chips rendered:** For each `symptom` in `SYMPTOMS`, `getByRole('checkbox', { name: new RegExp(symptom.accessibilityLabel, 'i') })` returns a node.
- **Happy path — Next button:** `getByRole('button', { name: /^Next$/i })` on screen.
- **Happy path — Back link:** `getByRole('button', { name: /^Back$/i })` on screen. Unit 4's implementation spec mandates `accessibilityRole="button"` on Back (matching Step 1), so the test should enforce that — not accept `link` as a fallback.

*Chip toggle (R2):*
- **Happy path — single-chip toggle on:** Initial `accessibilityState.checked` is `false` on the Dry Eyes chip. After `fireEvent.press(chip)`, `accessibilityState.checked === true`.
- **Happy path — single-chip toggle off:** After pressing twice, `accessibilityState.checked === false` again.
- **Happy path — multi-select:** Press Dry Eyes and Fatigue. Both chips' `accessibilityState.checked === true` simultaneously.
- **Edge case — deselecting one of many:** With Dry Eyes and Fatigue both selected, pressing Fatigue again leaves Dry Eyes selected and Fatigue unselected.

*Next enablement (R3):*
- **Edge case — initial state:** Next is disabled (`accessibilityState.disabled === true`) on first render with zero chips selected.
- **Happy path — one chip selected enables Next:** After `fireEvent.press` on any single chip, Next is enabled (`accessibilityState.disabled === false`).
- **Edge case — deselecting last chip re-disables Next:** Select one chip, then deselect it. Next becomes disabled again.
- **Happy path — multiple chips still enables Next:** After selecting two chips, Next is enabled.

*Navigation (R4, R5):*
- **Happy path — Next press navigates:** With one chip selected, `fireEvent.press(next)` → `mockPush` called exactly once with a string or object whose `pathname` matches `/\/onboarding\/step-3/`.
- **Edge case — Next press is no-op when disabled:** With no chips selected, `fireEvent.press(next)` → `mockPush` NOT called.
- **Happy path — Back press:** `fireEvent.press(back)` → `mockBack` called exactly once. `mockPush` NOT called.

*Accessibility (R6):*
- **Happy path — every chip has role + label + state:** For each chip, assert `accessibilityRole === 'checkbox'`, `accessibilityLabel` is a non-empty string matching the catalog's `accessibilityLabel` field, and `accessibilityState.checked` is either `true` or `false` (not `undefined`).
- **Happy path — checked state reflects selection:** After toggling Dry Eyes on, the Dry Eyes chip's `accessibilityState.checked === true`; all other chips remain `false`.

*Additional coverage:*
- **Integration — tests against catalog ordering:** Assert the rendered chip order matches `SYMPTOMS` iteration order. Catches accidental re-ordering.
- **Edge case — whitespace-only state doesn't apply** (symptoms field has no text input), skipped.

**Verification:**
- `npx jest app/\(onboarding\)/__tests__/step-2.test.tsx` exits non-zero with every new test failing for the right reason.
- `npx jest app/\(onboarding\)/__tests__/step-1.test.tsx` still passes (no regression; Step 1's tests are untouched).
- `npx jest hooks/__tests__/use-redirect-on-sign-in.test.ts` still passes.
- `npx tsc --noEmit` clean — test file compiles, catalog imports resolve.
- `npm run lint` clean.

- [ ] **Unit 4 (GREEN): Implement `app/(onboarding)/step-2.tsx`**

**Goal:** Replace the current 22-line placeholder stub with the full Step 2 screen so every Unit 3 test turns green. Includes a local `SymptomChip` component. No test modifications.

**Requirements:** R1, R2, R3, R4, R5, R6, R7.

**Dependencies:** Unit 1 (catalog), Unit 2 (tokens), Unit 3 (tests in place to drive GREEN).

**Files:**
- Modify: `app/(onboarding)/step-2.tsx` (full rewrite of the placeholder)

**Approach:**
- Top-level layout matches Step 1: `<View className="flex-1 bg-bg-primary">` wrapping `<SafeAreaView edges={['top', 'bottom']}>` wrapping `<ScrollView keyboardShouldPersistTaps="handled">` with `contentContainerStyle` of `paddingTop: 28, paddingHorizontal: 28, paddingBottom: 32, flexGrow: 1`.
- Progress header block: "Step 2 of 3" caption (`text-subtle`, Inter Medium 14), then `<View testID="progress-bar" …>` containing `<View testID="progress-fill" style={{ width: '66.666%', … }}>`. Height 6dp, radius 3dp. Width reads as 2/3 fill per issue (~66%).
- 36dp spacer `<View style={{ height: 36 }} />`.
- Card block: `<View className="bg-bg-card" style={{ borderRadius: 24, borderCurve: 'continuous', paddingVertical: 28, paddingHorizontal: 24, gap: 24, boxShadow: '0 4px 24px rgba(212,165,116,0.08)' }}>`. (Use a literal inline string matching the `card` token value — `step-1.tsx` uses this pattern; `className="shadow-card"` emits iOS-only shadows and skips Android elevation.) Inside:
  - Question `<Text>` — Inter Bold 24 / lineHeight 32, `text-heading` color.
  - Helper `<Text>` — Inter Regular 14, `text-subtle`, 8dp below question (via `gap` on a wrapping `<View>` or inline marginTop).
  - Wrap grid: `<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>` mapping over `SYMPTOMS` to render `<SymptomChip symptom={s} selected={selected.has(s.id)} onToggle={...} />`.
- Flex spacer `<View style={{ flex: 1, minHeight: 40 }} />`.
- Navigation block: `<View style={{ gap: 16, alignItems: 'center', width: '100%' }}>`:
  - Next `<Pressable accessibilityRole="button" accessibilityLabel="Next" accessibilityState={{ disabled: !canProceed }} disabled={!canProceed} onPress={handleNext} …>` with `className="bg-bg-next"`, `height: 56, borderRadius: 16, borderCurve: 'continuous', boxShadow: '0 4px 16px rgba(212,165,116,0.3)', opacity: canProceed ? 1 : 0.5`. (Inline `boxShadow` string, same pattern as Step 1's Next button.) Label `<Text className="text-white" style={{ fontSize: 17, fontWeight: '600' }}>Next</Text>`.
  - Back `<Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back}>` with centered `<Text className="text-text-subtle" style={{ fontSize: 15, fontWeight: '500' }}>Back</Text>`.
- Router: `const { push, back } = useRouter()` destructured at top of render (React Compiler compat).
- State: `const [selected, setSelected] = useState<Set<SymptomId>>(new Set())`.
- Toggle handler: creates a new `Set` each call (preserves React identity). Memoization is handled by React Compiler; no `useCallback`.
- `canProceed = selected.size > 0`.
- `handleNext`: early-return if not `canProceed`, then `push('/onboarding/step-3')`. Route-casting choice is an open question — see Key Technical Decisions; default to option (c) (no cast, run `npx expo start` to regenerate types) unless that proves impractical during GREEN.

**Execution note:** GREEN half. Do NOT modify `step-2.test.tsx` — if a test fails, fix the implementation, not the test. Stay minimal: implement exactly what each test requires. Additional polish (animations, haptics) is out of scope.

**Technical design (SymptomChip):**

Inline component inside `step-2.tsx`. Frame as directional guidance:

```tsx
type SymptomChipProps = {
  symptom: Symptom;
  selected: boolean;
  onToggle: (id: SymptomId) => void;
};

function SymptomChip({ symptom, selected, onToggle }: SymptomChipProps) {
  // Pressable with accessibilityRole="checkbox", accessibilityState={{ checked: selected }},
  // accessibilityLabel={symptom.accessibilityLabel}
  // Unselected: bg-input, 1px border-input-default, paddingHorizontal 18, paddingVertical 14
  // Selected:   bg-progress-fill, no border, paddingHorizontal 20, paddingVertical 15, inline boxShadow '0 2px 8px rgba(156,175,136,0.25)'
  // Border radius 100, borderCurve 'continuous'
  // Label: inner <Text> showing `${emoji} ${label}`, color white (selected) or text-chip-label (unselected),
  //        fontSize 15, fontWeight '600' (selected) / '500' (unselected)
}
```

*This sketch is directional — see issue spec for exact color/padding/shadow values; do not copy-paste.*

**Patterns to follow:**
- `app/(onboarding)/step-1.tsx` for top-level layout, navigation block, `useState` + `useRouter` pattern, `accessibilityState` on Pressable.
- ADR 009 (`Stack.Protected`) — no changes; route is already gated.
- ADR 006 (DateField wrapper) — same co-location principle, but SymptomChip doesn't need the custom-event escape hatch (press is standard).

**Test scenarios:**
- Same scenarios from Unit 3 — this unit makes them pass, doesn't add new tests.
- No additional behavioral scenarios. Any new test idea that surfaces during GREEN goes in a follow-up commit, not this unit's commit.

**Verification:**
- `npx jest app/\(onboarding\)/__tests__/step-2.test.tsx` — all scenarios pass.
- `npm test` (full suite) — green, no regressions. Expected total after this unit: Step 1's 26 + Step 2's ~22 + login's 13 + redirect hook's 6 = ~67 tests.
- `npx tsc --noEmit` clean.
- `npm run lint` clean.
- `git diff` for this unit touches only `app/(onboarding)/step-2.tsx`.

- [ ] **Unit 5: Companion Maestro flow — `.maestro/onboarding-step-2.yaml`**

**Goal:** Ship the E2E smoke flow described in the issue. Expected to pass on a fresh dev-client build that includes Step 2 and a live Supabase session.

**Requirements:** R8.

**Dependencies:** Unit 4 (screen must render for the flow's assertions to resolve).

**Files:**
- Create: `.maestro/onboarding-step-2.yaml`

**Approach:**
- Header: `appId: com.workflowtest.app` (copy from `.maestro/launch.yaml` or `.maestro/onboarding-step-1.yaml`).
- Leading comment block documenting: RED→GREEN landed; requires dev-client build (no new native modules in this issue; the date-picker modules from issue #2 are still required but already present on any issue-#2-or-later build); requires live Supabase session; OAuth can't be driven by Maestro so sign-in is manual precondition.
- Flow body:
  1. `- launchApp: {}` (no `clearState`; rely on persisted session)
  2. `- openLink: workflowtest://onboarding/step-1` to enter the flow deterministically
  3. `- openLink: workflowtest://onboarding/step-2` to jump directly to Step 2 (Step 1 interaction is covered by its own flow; avoid duplicating it here). Pick ONE navigation strategy — do not leave two options in the shipped YAML.
  4. `- assertVisible: "Step 2 of 3"`
  5. `- assertVisible: "What are your primary symptoms?"`
  6. `- tapOn: "Dry Eyes"` — select first chip
  7. `- tapOn: "Fatigue"` — select second chip
  8. `- tapOn: "Dry Eyes"` — deselect first chip
  9. `- tapOn: "Next"`
  10. `- assertVisible: "Step 3 coming soon"` (match the full placeholder text from Unit 1's stub — substring match works but exact match prevents accidental matches from future screens containing "Step 3")

**Patterns to follow:**
- `.maestro/onboarding-step-1.yaml` for the comment structure, `appId` placement, precondition documentation, and the navigation-by-deep-link approach.

**Test scenarios:**
- Test expectation: the YAML itself is the spec; executing it against a GREEN-implemented dev-client build is the passing test. Static verification is syntactic validity + file existence.

**Verification:**
- The file parses as valid two-doc YAML (`python3 -c "import yaml, sys; list(yaml.safe_load_all(open('.maestro/onboarding-step-2.yaml')))"` returns without error).
- `git diff` for this unit touches only the new YAML file.
- `.maestro/onboarding-step-1.yaml` and `.maestro/launch.yaml` are unchanged (no regression).
- Manual execution on a dev-client with an active session: flow passes end-to-end.

## System-Wide Impact

- **Interaction graph:** Replaces `(onboarding)/step-2` route body. Adds `(onboarding)/step-3` as a placeholder stub. No changes to `AuthProvider`, `Stack.Protected`, root layout, the auth or tabs stacks, or `useRedirectOnSignIn`.
- **Error propagation:** N/A — this plan adds no error surfaces. `push()` / `back()` failures (e.g., route not registered) are not caught; acceptable per the existing Step 1 precedent.
- **State lifecycle risks:** Symptom selections live only in the screen's local `useState`. Leaving and re-entering the screen via Back → Next loses the selection. This matches the issue's "do not persist" directive. When persistence ships (follow-up), a Zustand store or a context will bridge state across screens.
- **API surface parity:** N/A — no public APIs change. `SYMPTOMS` and `SymptomId` are internal module exports; external consumers do not exist.
- **Integration coverage:** Jest covers all behavioral scenarios against the rendered component. Maestro covers the real navigation on a dev-client. OAuth and native date-picker paths are handled separately (not exercised by this flow).
- **Unchanged invariants:** `flowType: 'pkce'`, `detectSessionInUrl: false`, the SecureStore chunking adapter, the `AppState` refresh loop, `scheme: "workflowtest"`, `ios.bundleIdentifier: "com.workflowtest.app"`, `app.json` `expo.name: "Hi Honey"`, every existing tailwind token. None change. The `(onboarding)` route-group registration in `app/_layout.tsx` is unchanged; only the files inside change.

## Risks & Dependencies

| Risk | Mitigation |
|---|---|
| Chip size stability (issue's padding math is off by 1dp per side, and font-weight change widens glyphs independently) | Key Technical Decisions now recommends a 1px transparent border in the selected state to sidestep both problems. Visually QA on iPhone 17 during GREEN. If transparent-border approach still drifts due to font-weight width differences, fall back to an explicit `minWidth` per chip. Test assertions do not cover pixel dimensions — this is human-QA territory. |
| Emoji rendering divergence across platforms — 👁 (EYE U+1F441) and 🌫 (FOG U+1F32B) have weaker Android emoji-font coverage, may render as uncolored glyph or monochrome outline on older Android dev-clients | Flag during QA. If Android rendering is poor, substitute with the text-only `accessibilityLabel` on that platform via `Platform.select`, or switch to alternative emojis (e.g., 👀 for Dry Eyes). Not blocking on iOS-only delivery. |
| RN's `accessibilityRole="checkbox"` behavior is not identical across iOS VoiceOver and Android TalkBack. TalkBack may read the chip as "button" rather than "checkbox" despite the role prop | Verify on a TalkBack-enabled device in follow-up QA. Issue does not require Android parity yet (simulator-only delivery); flag as a known limitation in the PR description. |
| `Set<SymptomId>` identity bugs — forgetting `new Set(prev)` and instead mutating the existing Set causes React to skip re-renders because the reference didn't change | Toggle handler's implementation must always return a new `Set`. Easy to check during code review. Tests cover the toggle behavior, so a subtle identity bug would surface as failing assertions. |
| Typed-routes manifest regeneration is unpredictable between Unit 1 creating `step-3.tsx` and Unit 4 running `tsc --noEmit`. `@ts-expect-error` becomes an "unused directive" (tsc error under `strict: true`) once the manifest refreshes. `as never` silently suppresses but loses signal. | Key Technical Decisions now lists three options (a/b/c). Default to option (c) — no cast, run `npx expo start` once after Unit 1 to refresh types — unless the implementer hits friction during GREEN. |
| Step 3's placeholder stub might be mistaken for the real Step 3 during manual QA and shipped to users | Placeholder explicitly reads "Step 3 coming soon" and has a TODO-style leading comment. `CLAUDE.md` housekeeping section lists this as the standard pattern. Not a real risk in the pre-MVP stage; flagged for completeness. |

## Documentation / Operational Notes

- **PR description:** paste the Unit 3 RED failing-test output (target the `step-2.test.tsx` path to keep it scoped). Explicitly note that existing Step 1, login, and hook tests remain green.
- **`docs/onboarding/step-2-symptoms.md`:** tracked as a follow-up documentation task; not in scope for this plan. When it lands, mirror `docs/onboarding/step-1-basic-info.md`'s structure (catalog, toggle semantics, chip component, accessibility contract, known limitations).
- **`CLAUDE.md`:** after Step 2 lands, the routing tree section (Architecture → Routing layout) should list Step 2 as implemented and Step 3 as the current stub. Small follow-up in the same PR or the documentation PR that follows.
- **ADR updates:** no new ADRs required. ADR 006 (DateField wrapper pattern) and ADR 007 (post-sign-in redirect) remain accurate; this plan operates within their existing guidance.
- **Follow-up: `bg-next-disabled` token + WCAG 1.4.3.** `opacity: 0.5` over `#d4a574` on a `#fff8f0` cream background likely fails 3:1 contrast for large text. Ships consistent with Step 1 for now. File a follow-up to introduce a proper disabled-state token (desaturated or neutral fill) and apply it to Step 1 and Step 2 together in a single PR.
- **`docs/solutions/`:** if new non-obvious patterns surface during Unit 4 GREEN (e.g., a Set-identity bug fix, or a chip-sizing workaround), capture them via `/ce:compound` at the end of the feature.
- **EAS:** no rebuild required — no new native modules. OTA via `eas update` is **not yet wired up** in this repo (`expo-updates` is not installed per CLAUDE.md). Until OTA ships, distribution is either a fresh dev-client build or running locally via `npx expo start` against any dev-client that already includes the date-picker modules from issue #2.
- **Figma:** bookmark node `14:2` for the visual QA pass.

## Sources & References

- **Origin issue:** [issue #3](https://github.com/nipunvv/WorkflowTest/issues/3)
- **Figma frame:** node `14:2` — https://www.figma.com/design/CLEcJLTTd4L1JDDjc6KDwl/Untitled?node-id=14-2
- **Prior plan:** [docs/plans/2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md](2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md)
- **Solutions doc applied:** [docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md](../solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md)
- **Relevant ADRs:**
  - `docs/decisions/005-tdd-strict-red-first.md` — execution posture
  - `docs/decisions/006-datefield-wrapper-for-custom-synthetic-events.md` — wrapper precedent (not needed here, but same co-location principle)
  - `docs/decisions/009-stack-protected-guarded-routing.md` — route gating is unchanged
- **Related files:**
  - `app/(onboarding)/step-1.tsx`
  - `app/(onboarding)/step-2.tsx` (current stub)
  - `app/(onboarding)/__tests__/step-1.test.tsx`
  - `app/_layout.tsx`
  - `tailwind.config.js`
  - `jest-setup.ts`
  - `.maestro/onboarding-step-1.yaml`
  - `DESIGN.md`
  - `CLAUDE.md`
- **Related future work (not created yet):**
  - Onboarding Step 3 screen (separate issue)
  - Supabase `profiles` + `user_symptoms` migration
  - Persisting symptoms on Step 3 completion
  - Android TalkBack verification pass
  - `docs/onboarding/step-2-symptoms.md` documentation file

## Verification (end-to-end)

1. **Type-check:** `npx tsc --noEmit` clean across all changed files.
2. **Lint:** `npm run lint` clean.
3. **New failing tests (Unit 3 RED):** `npx jest app/\(onboarding\)/__tests__/step-2.test.tsx` fails with every assertion showing "Unable to find …".
4. **GREEN:** after Unit 4, the same command passes all assertions.
5. **Full suite (Unit 4 exit):** `npm test` — all suites green; no regressions in Step 1, login, or the redirect hook.
6. **Maestro artifact validity (Unit 5):** YAML parses; `.maestro/onboarding-step-1.yaml` and `launch.yaml` unchanged.
7. **Manual dev-client smoke:** `npx expo start --dev-client` → sign in → fill Step 1 → tap Next → Step 2 renders pixel-close to Figma → select and deselect chips → tap Next → Step 3 placeholder renders without crash.
8. **Back navigation:** from Step 2, Back returns to Step 1 with its state preserved (DOB/name still filled).

If any step fails, iterate on the failing unit before marking complete. Per `CLAUDE.md`'s non-negotiable: **never modify a test to make implementation pass**. A RED failure for the wrong reason means the spec or the scaffolding is wrong, not the test.
