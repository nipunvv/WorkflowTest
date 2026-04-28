---
title: "feat: Replace onboarding Step 2 with Goals screen (issue #10, supersedes #3)"
type: feat
status: active
date: 2026-04-28
origin: https://github.com/nipunvv/WorkflowTest/issues/10
---

# feat: Replace onboarding Step 2 with Goals screen (issue #10, supersedes #3)

## Overview

Replace the existing Step 2 (Symptoms) screen with the redesigned Step 2 (Goals) screen per Figma node `170:2`. The screen asks "What matters most to you right now?" and renders six vertically stacked goal cards (five preset + one "Other"). Selecting "Other" expands the row to reveal a free-text input. Next is enabled with at least one selection. The flow is now four steps total, so Step 1's progress indicator updates from "Step 1 of 3" → "Step 1 of 4" (33.3% → 25%) AND Step 3's progress indicator updates from "Step 3 of 3" → "Step 3 of 4" (100% → 75%) for visual coherence across the flow.

**Important context (post-PR-#9):** Issue #10 was written when Step 3 was a stub. PR #9 (merged 2026-04-28) replaced the stub with a real "Preferred Language?" screen and added `app/(onboarding)/complete.tsx` as the post-onboarding placeholder. This plan therefore in-scopes Step 3 caption + bar updates (small one-line changes) using the same logic the issue applied to Step 1 — keeping the indicators consistent across the flow.

This is a pure UI + wiring + routing change. Auth, persistence, and the Step 3/Step 4 screens remain out of scope.

## Problem Frame

Issue #10 supersedes the now-merged issue #3. The Figma changed materially: the question (goals, not symptoms), the layout (vertical card-stacked rows with leading emoji + trailing checkbox indicator instead of pill-shaped wrapping chips), the count (4 steps instead of 3), and the new "Other" expand-on-select pattern. The existing Step 2 implementation, its tests, and the symptoms catalog are all artifacts of the superseded design and need to be removed or replaced.

The Step 3 stub (`app/(onboarding)/step-3.tsx`) already exists from the prior round and is reused unchanged. Step 1 needs a one-line caption + width adjustment so the indicators stay coherent across the flow.

Persistence to a `profiles` table, validation that "Other" requires non-empty text, and animated expand/collapse polish are all explicitly deferred to follow-up issues.

Design reference: Figma node `170:2` in file `CLEcJLTTd4L1JDDjc6KDwl` (https://www.figma.com/design/CLEcJLTTd4L1JDDjc6KDwl/Untitled?node-id=170-2).

## Requirements Trace (from issue #10)

**Render:**
- R1. **Step 2 render:** "Step 2 of 4" caption, ~50% progress fill, H1 "What matters most to you right now?", helper "Select all that apply — we'll personalize your experience", six rows in the specified order, Next button, Back link
- R2. **Step 1 indicator update:** caption shows "Step 1 of 4"; progress fill is 25% wide
- R2b. **Step 3 indicator update:** caption shows "Step 3 of 4"; progress fill is 75% wide (added in-scope post-PR-#9 — see Overview)

**Interaction:**
- R3. **Multi-select goal behavior:** tapping a row toggles its selection; tapping a selected row deselects it; multiple rows can be selected simultaneously
- R4. **"Other" expand-on-select:** selecting the "Other" row toggles its checked state and reveals a TextInput below the row header; deselecting clears its checked state, hides the input, AND clears any typed text (re-selecting later starts with an empty input); typing into the input updates local state
- R5. **Next enablement:** disabled when zero rows are selected; enabled when at least one row is selected (including "Other"-only with empty text)

**Navigation:**
- R6. **Next navigation:** tapping enabled Next navigates to `/onboarding/step-3`
- R7. **Back navigation:** tapping Back calls `router.back()` (returns to Step 1)

**Accessibility:**
- R8. **Row a11y:** every goal row has `accessibilityRole="checkbox"`, a non-empty `accessibilityLabel`, and `accessibilityState.checked` reflecting selection
- R9. **"Other" input a11y:** the expanded TextInput exposes a non-empty `accessibilityLabel`

**Visual stability:**
- R10. **Border-width swap stability:** the 1px → 2px border change on selection must NOT cause the row to jump 1dp in either dimension (use a transparent 2px border on unselected, OR padding compensation)

**Quality gates:**
- R11. **E2E smoke (Maestro):** open Step 2 from Step 1, select two preset goals, deselect one, expand "Other", type a value, tap Next, assert navigation to Step 3
- R12. **No regression** in Step 1 form behavior, the auth flow, or the Step 1 RNTL suite

## Scope Boundaries

- **NOT** implementing Step 3 or Step 4 (separate issues) — Step 3's stub at `app/(onboarding)/step-3.tsx` already exists and is reused unchanged. Navigation to it uses the typed-routes form `'/(onboarding)/step-3'` with `@ts-expect-error` if the manifest hasn't picked it up (see Unit 5 and Pattern 5 in the TDD multi-screen guide).
- **NOT** preserving symptoms-era tests when replacing Step 2. Issue #10 changes product behavior: the symptoms multi-select is being **removed** from the flow and goals replaces it. Tests for the old behavior are deleted because the behavior they covered no longer exists in the product, not to make a broken implementation pass. This is a feature pivot, consistent with CLAUDE.md's TDD discipline (see Institutional Learnings for the full rationale).
- **NOT** persisting selected goals or the "Other" text — Supabase `profiles` schema and migration are deferred to a follow-up
- **NOT** validating that "Other"-only selection requires non-empty text — Next is allowed to enable with empty "Other" text per the issue
- **NOT** adding animation to the "Other" row expand/collapse — instant expand is the agreed-upon shipping behavior
- **NOT** touching `lib/auth-context.tsx`, `lib/supabase.ts`, `app/_layout.tsx`, or the `(auth)` stack
- **NOT** extracting a shared `<ProgressHeader step={n} total={4} />` across Step 1 and Step 2 — duplicate the inline progress header for now; extract once Step 3/Step 4 ship and the duplication is concrete (consistent with the rationale in the superseded plan)
- **NOT** adding a routing gate that redirects authed-but-not-onboarded users into `(onboarding)` — tracked separately, blocked on the `profiles` table
- **NOT** retroactively fixing Step 1's existing `as never` route cast (separate cleanup follow-up). New code in this plan uses `@ts-expect-error` per Pattern 5 in the TDD multi-screen guide

## Context & Research

### Relevant Code and Patterns

- **`app/(onboarding)/step-1.tsx`** — canonical pattern for a tokenized screen with `ScrollView` inside `SafeAreaView`, `keyboardShouldPersistTaps="handled"`, `useRouter` destructured at top of render (React Compiler requirement), inline `boxShadow` strings (not NativeWind `shadow-*` classes — see token note below), and `accessibilityState.disabled` on the Next `Pressable`. Mirror the top-level layout shape: progress header, spacer, card, flex spacer, navigation block.
- **`app/(onboarding)/step-2.tsx`** — currently the symptoms screen from the superseded issue #3. Replaced wholesale by this plan; its 6-chip wrap-grid layout, `SymptomChip` component, and `import './symptoms'` are all removed.
- **`app/(onboarding)/step-3.tsx`** — **was a 22-line stub when issue #10 was authored; replaced by PR #9 with a real "Preferred Language?" screen (227 lines, language radio-group, "Get Started" → `/(onboarding)/complete`).** Push from Step 2 still lands at the same `/onboarding/step-3` route. This plan touches step-3.tsx ONLY in Unit 3 to update its caption from "Step 3 of 3" to "Step 3 of 4" + bar 100% → 75%; no other Step 3 changes.
- **`app/(onboarding)/symptoms.ts`** — existing typed catalog file from the superseded design. Deleted; replaced by `goals.ts` with a different shape (no `accessibilityLabel` field — labels are emoji-free already; type ID is the row's stable identity).
- **`app/(onboarding)/__tests__/step-1.test.tsx`** — canonical RNTL harness for onboarding screens. Patterns to reuse verbatim: `SafeAreaProvider` wrapper with explicit `initialMetrics`, per-file `jest.mock('expo-router', ...)` factory with `useRouter: jest.fn()`, `beforeEach` resetting `mockPush` / `mockBack` to fresh `jest.fn()`s, role-based queries (`getByRole`, `getByLabelText`).
- **`app/(onboarding)/__tests__/step-2.test.tsx`** — symptoms-era tests. Replaced wholesale; shape (suite organization, query helpers, navigation pathname regex) is reused but every assertion changes.
- **`docs/plans/2026-04-22-002-feat-onboarding-step-2-symptoms-plan.md`** — structural reference for plan shape, sequencing, and RED-phase verification rules. The superseded plan's "remove the Step 2 stub from Maestro flow" sequence informed this plan's "replace .maestro/onboarding-step-2.yaml" unit.
- **`docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md`** — Patterns 1, 3, and 5 directly apply:
  - Pattern 1: RNTL `fireEvent` event-name normalization — always pass event names **without** the `on` prefix. For goal rows, `fireEvent.press(row)` is sufficient. For the "Other" TextInput, `fireEvent.changeText(input, 'value')` is the right call (no manual synthetic event needed).
  - Pattern 3: RED scaffolding rule — every test failure must read "Unable to find …" not "Cannot find module …". Since `step-2.tsx` already exists (with the symptoms impl), tests rewritten for goals will fail with proper "Unable to find" messages out of the box. No additional scaffolding needed.
  - Pattern 5: Use `@ts-expect-error` (not `as never`) for typed-route strings the manifest hasn't picked up yet (`/onboarding/step-3` already exists, but the typed-routes form `/(onboarding)/step-3` may still need suppression — see existing step-2.tsx line 65).
- **`app/_layout.tsx`** — `(onboarding)` group already registered under `Stack.Protected guard={!!session}`. No root-layout changes required.
- **`tailwind.config.js`** — most tokens reusable as-is. Config keys (left) and corresponding NativeWind `className` usage (right):
  - `bg-primary` → `className="bg-bg-primary"` (cream `#fff8f0`)
  - `bg-card` → `className="bg-bg-card"` (white)
  - `bg-input` → `className="bg-bg-input"` (`#faf7f5`, unselected goal row bg)
  - `bg-next` → `className="bg-bg-next"` (`#d4a574`, Next button bg)
  - `bg-progress-track`, `bg-progress-fill`, `border-input-default`, `border-input-active`, `text-heading`, `text-subtle`, `text-placeholder` — same double-prefix pattern
  - `boxShadow.card`, `boxShadow.next` exist but are **used as literal inline `style={{ boxShadow: '...' }}` strings** (see step-1.tsx), NOT via `className="shadow-*"`. NativeWind's shadow utility emits legacy RN shadow props that miss Android elevation; inline `boxShadow` strings cross-compile correctly on RN 0.76+.
  - `text-chip-label` (`#594d40`) was added for the symptoms chip label only. Removed in the cleanup unit since the goals row uses `text-text-heading` instead.
  - **New additions** required by this plan: `bg-goal-selected` (`rgba(156,175,136,0.12)`) and `border-indicator-unselected` (`#d1c9c2`).
- **`.maestro/onboarding-step-2.yaml`** — symptoms-era smoke flow. Replaced wholesale; the structure (`appId` header, precondition comment, `launchApp`, `openLink`, `assertVisible`, `tapOn`) is reused but the asserted strings and tap targets all change.

### Institutional Learnings

- **`docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md`** — applies wholesale. Patterns 1 (RNTL event normalization), 3 (RED scaffolding), and 5 (`@ts-expect-error` over `as never`) are directly relevant. The wrapper-component-as-test-affordance pattern (Pattern 2) does **not** apply here — goal rows don't need a custom synthetic event hook. Standard `fireEvent.press` and `fireEvent.changeText` cover the test surface.
- **CLAUDE.md test-modification clarification:** the rule "never modify or delete an existing test to make it pass" applies to the discipline of keeping tests honest about *the same product behavior*. Issue #10 changes product behavior — symptoms multi-select is being **removed** from the onboarding flow and replaced by goals. The symptoms tests are not being deleted to make a broken implementation pass; they are being deleted because the behavior they test no longer exists in the product. This is a feature pivot, not a TDD violation. The new goals tests are written first (RED), and only then is the new implementation written (GREEN) — the discipline holds for the new behavior.

### External References

None required. The Figma design is fully translated into the issue body's spec. No external library research needed — all primitives (`View`, `Pressable`, `ScrollView`, `TextInput`, `SafeAreaView`) are already in use. No new native modules are added; the existing dev-client build (post-PR #6) covers everything in this plan.

## Key Technical Decisions

- **Catalog file: `app/(onboarding)/goals.ts`** — typed `GoalOption[]` constant with five preset entries (id, emoji, label). The "Other" row is distinct enough (different state shape: a boolean toggle plus a string) that it lives directly in the screen component rather than inside the catalog. The catalog covers only the preset goals; "Other" is hardcoded as the sixth row in JSX.
  - **Rationale:** mixing "Other" into the same `GoalOption[]` array forces every catalog consumer to special-case it (the "is this the Other row?" check appears in toggle handling, render, persistence, etc.). Keeping "Other" separate from the typed list of preset goals matches its semantically distinct state shape.
- **Selection state shape: `useState<Set<GoalId>>` for presets + `useState<boolean>` for "Other" + `useState<string>` for the Other text.** Three small `useState` hooks beat a `useReducer` for this surface area.
  - **Rationale:** the issue suggests "useState<Set<GoalId>> (or equivalent reducer)". For five preset goals + an Other toggle + a free-text field, a reducer is overkill. Three useState hooks read cleanly and the render derivation (`canProceed = presets.size > 0 || otherSelected`) is a one-liner.
- **Border-width stability: padding compensation, matching PR #9's `LanguageRow` precedent.** The selected state has a 2px solid `bg-bg-progress-fill` border; the unselected state has a 1px solid `#e0dbd6` border (preserving the spec's visual weights). To keep outer geometry constant across the swap, asymmetric padding compensates for the 1dp border delta:
  - Unselected: `borderWidth: 1`, `paddingHorizontal: 18`, `paddingVertical: 13` (matches the issue's `12/18` spec for the unselected row, with 1dp added to vertical to match step-3's row height)
  - Selected: `borderWidth: 2`, `paddingHorizontal: 17`, `paddingVertical: 12` (1dp less padding on each side absorbs the 1dp extra border, keeping outer geometry identical)
  - **Codebase pattern:** `app/(onboarding)/step-3.tsx` LanguageRow (lines 14–73) uses exactly this approach: `borderWidth: selected ? 2 : 1` paired with `paddingHorizontal: selected ? 17 : 18` and `paddingVertical: selected ? 19 : 20`. Mirror those exact ratios.
  - **Why this beats equal-2px borders:** preserves the spec's visual border weights (1px unselected reads as designed, 2px selected reads as the heavier "selected" affordance), and matches the established codebase pattern. PR #9 settled this question for the project.
- **"Other" expand: render the TextInput conditionally inside the same Pressable container.** When `otherSelected` is true, the row's container expands its height naturally (flex column layout) and renders a TextInput as the second child. When false, only the row header (emoji + label + indicator) renders. No animation; instant show/hide.
  - **`keyboardShouldPersistTaps="handled"`** on the parent ScrollView is critical here — without it, tapping outside the input dismisses the keyboard but also intercepts the tap, so the user has to tap twice to deselect "Other" while the keyboard is up.
- **Typed-route navigation: `push('/(onboarding)/step-3')`** with `@ts-expect-error` if the typed-routes manifest hasn't picked up the route. Existing step-2.tsx already uses this pattern; the goals impl preserves it.
- **Step 1 progress update: inline edits, not extraction.** Two literal changes: caption text and progress-fill `width`. No shared component yet (see Scope Boundaries).

## Open Questions

### Resolved During Planning

- **Q: Does Next enable when only "Other" is selected with empty text?**
  - A: Yes, per issue: *"when 'Other' is the only selection, the text field is allowed to be empty in this issue — input validation for the 'Other' text is a follow-up"*. Test scenarios in Unit 5 encode this.
- **Q: Does deselecting "Other" preserve or clear the typed text?**
  - A: Clear it, per issue: *"deselecting collapses it and clears any typed text"*. Test scenario in Unit 5 covers re-selecting "Other" and confirming the input is empty.
- **Q: Where does the "Other" text persist (or not)?**
  - A: Local state only this issue; persistence is a follow-up.
- **Q: What's the right RED → GREEN sequencing given the existing symptoms tests pass today?**
  - A: Replace `step-2.test.tsx` first (the new tests will all fail RED against the existing symptoms screen), then replace `step-2.tsx` with the goals impl (GREEN). Then delete `symptoms.ts` (no longer imported by anything). This produces a clean RED commit (every failure reads "Unable to find …") followed by a GREEN commit. Step 1 indicator update is a separate small unit in parallel.
- **Q: Does the catalog file need to mirror `symptoms.ts`'s `accessibilityLabel` field?**
  - A: No. The symptoms catalog had emoji-prefixed visible labels and emoji-free a11y labels. The goals layout puts the emoji in a separate `<Text>` from the label, so the visible label is already emoji-free and serves as the a11y label directly. Catalog shape: `{ id, emoji, label }`. Cleaner.

### Deferred to Implementation

- **Exact px-perfect width values** — the issue specifies "169dp of 337dp" for the progress fill; the existing pattern uses percentage strings (`width: '50%'` for 1/2 fill). Either works; pick whichever lands cleaner against the rest of the inline styles. Document the choice in the GREEN commit message.
- **Whether the row container is `Pressable` directly or a `Pressable` containing a `View` for the inner column** — depends on how cleanly the conditional TextInput slots in. Implementation discovers; either is correct.
- *(Resolved by review: testIDs are no longer deferred — Unit 5 declares `testID="goal-row-other"` on the OtherRow Pressable and `testID="goal-other-input"` on the TextInput so Unit 6's Maestro flow can target them stably. RNTL tests still query by `accessibilityRole` + name regex; the testIDs are Maestro affordances, not RNTL ones.)*

## Implementation Units

- [ ] **Unit 1: Add new design tokens to `tailwind.config.js`**

**Goal:** Add the two new tokens required by the goal-row visual spec so the GREEN-phase impl has them available.

**Requirements:** R1 (selected-row visual)

**Dependencies:** None

**Files:**
- Modify: `tailwind.config.js`

**Approach:**
- Under `theme.extend.colors`, add a new section commented `// Onboarding Step 2 (Goals) tokens (from issue #10).`
- Add `"bg-goal-selected": "rgba(156,175,136,0.12)"` and `"border-indicator-unselected": "#d1c9c2"`
- Leave the existing `text-chip-label` token in place for now (deletion happens in Unit 7 cleanup, after the symptoms code is fully gone — order matters because deletion before symptoms.ts is removed leaves a dangling reference)

**Patterns to follow:**
- Existing token naming convention in `tailwind.config.js` (kebab-case keys, double-prefix at use site: `bg-bg-goal-selected`, `border-border-indicator-unselected`)

**Test scenarios:**
- Test expectation: none — pure config addition with no behavioral change. Tokens are exercised indirectly via Unit 5's GREEN render (which uses `className="bg-bg-goal-selected"` and `className="border-border-indicator-unselected"` and would visually break if the token didn't resolve).

**Verification:**
- `npm run lint` passes
- `npx tsc --noEmit` passes
- `grep -E "bg-goal-selected|border-indicator-unselected" tailwind.config.js` shows both keys

---

- [ ] **Unit 2: Add `app/(onboarding)/goals.ts` typed catalog**

**Goal:** Define the typed five-preset-goal catalog the screen and tests will import.

**Requirements:** R1, R3 (a stable list of selectable goals)

**Dependencies:** None

**Files:**
- Create: `app/(onboarding)/goals.ts`

**Approach:**
- Mirror the shape of `symptoms.ts` (typed `id` union, `as const satisfies readonly Goal[]` array) but drop the `accessibilityLabel` field — the visible `label` is already emoji-free.
- Five entries in this exact order, ids kebab-cased to match the route-segment convention:
  1. `find-symptom-triggers` — 🔍 — "Find my symptom triggers"
  2. `improve-energy` — ⚡ — "Improve my daily energy"
  3. `understand-protocol` — 📋 — "Understand my protocol"
  4. `capture-everything` — 📊 — "Capture everything in one place"
  5. `coordinate-care-team` — 🤝 — "Coordinate with my care team"
- Export `GoalId` (union), `Goal` (type), and `GOALS` (the readonly array).
- "Other" is intentionally NOT in the catalog — see Key Technical Decisions.

**Patterns to follow:**
- `app/(onboarding)/symptoms.ts` for the `as const satisfies readonly Goal[]` pattern

**Test scenarios:**
- Catalog contract — exposes exactly five goals
- Catalog contract — every goal has a unique id
- Catalog contract — every goal has a unique non-empty label
- Catalog contract — every goal has a non-empty emoji
  - These four scenarios live in `app/(onboarding)/__tests__/step-2.test.tsx` (Unit 4) under a top-level `describe('GOALS catalog — contract', ...)` block, mirroring the symptoms catalog test shape.

**Verification:**
- `npx tsc --noEmit` passes
- `grep -E "GOALS|GoalId" app/\\(onboarding\\)/goals.ts` shows the exports

---

- [ ] **Unit 3: Update Step 1 AND Step 3 progress indicators (3 → 4)**

**Goal:** Update Step 1 and Step 3 captions + progress-fill widths so the indicators stay coherent across the now-4-step flow. Update both screens' RNTL tests AND the Step 3 Maestro flow assertion in lockstep.

**Requirements:** R2, R2b, R12

**Dependencies:** None (independent of Units 1–2)

**Files:**
- Modify: `app/(onboarding)/step-1.tsx`
- Modify: `app/(onboarding)/__tests__/step-1.test.tsx`
- Modify: `app/(onboarding)/step-3.tsx`
- Modify: `app/(onboarding)/__tests__/step-3.test.tsx`
- Modify: `.maestro/onboarding-step-3.yaml`

**Approach:**
- In `step-1.tsx` (line 126): change `Step 1 of 3` literal to `Step 1 of 4`; change progress-fill `width: '33.333%'` (line 143) to `width: '25%'`.
- In `step-1.test.tsx` (line 52, 54): change the assertion `screen.getByText('Step 1 of 3')` to `screen.getByText('Step 1 of 4')`. Also update the surrounding test description comment.
- In `step-3.tsx` (line 105): change `Step 3 of 3` literal to `Step 3 of 4`; change progress-fill `width: '100%'` (line 124) to `width: '75%'`.
- In `step-3.test.tsx` (line 73, 75): change the assertion `screen.getByText('Step 3 of 3')` to `screen.getByText('Step 3 of 4')`. Update the test description comment.
- In `.maestro/onboarding-step-3.yaml` (line 38): change `assertVisible: "Step 3 of 3"` to `assertVisible: "Step 3 of 4"`.
- Use percentage notation (`'25%'`, `'75%'`) to match the existing inline-style pattern across screens.
- No other Step 1 / Step 3 changes — form behavior, language selection, navigation all stay identical.

**Execution note:** Update the test assertions and the screen literals in the same commit per screen. These are coordinated label-text changes, not behavioral changes — the existing tests already cover behavior. (Adversarial reviewer flagged this as bypassing RED → GREEN; the project owner accepted that interpretation when scope-locking the plan in this session.)

**Patterns to follow:**
- Existing `text-text-subtle` typography on the caption (no change to font/spacing)
- Existing `width: 'NN%'` inline-style pattern on the fill (no change to bar height/radius)
- Existing test-description format in step-1.test.tsx and step-3.test.tsx (mirror exactly)

**Test scenarios:**
- Happy path — Step 1 renders the "Step 1 of 4" caption (replaces existing "Step 1 of 3" assertion)
- Happy path — Step 3 renders the "Step 3 of 4" caption (replaces existing "Step 3 of 3" assertion)
- Edge case — no width assertions are added; the bar geometry is visual-only and any regression will be caught by Maestro re-runs and manual verification

**Verification:**
- `npx jest app/\\(onboarding\\)/__tests__/step-1.test.tsx app/\\(onboarding\\)/__tests__/step-3.test.tsx` passes (full Step 1 + Step 3 suites green)
- Manual: open Step 1 and Step 3 in the simulator and confirm captions + bar widths look right
- The Step 3 Maestro flow (`maestro test .maestro/onboarding-step-3.yaml`) still passes (assertion now matches "Step 3 of 4")

---

- [ ] **Unit 4: Replace Step 2 RED tests for the Goals screen**

**Goal:** Wholesale rewrite `app/(onboarding)/__tests__/step-2.test.tsx` to express the new goals behavior. After this commit, the Step 2 suite is fully RED against the existing symptoms implementation — every failure reads "Unable to find …" (the goals UI doesn't exist yet).

**Requirements:** R1, R3, R4, R5, R6, R7, R8, R9 — every behavioral requirement has a corresponding test

**Dependencies:** Unit 2 (`goals.ts` must exist before tests import `GOALS`/`GoalId`)

**Files:**
- Modify (rewrite): `app/(onboarding)/__tests__/step-2.test.tsx`

**Approach:**
- Keep the test harness skeleton from the existing file:
  - `jest.mock('expo-router', ...)` factory at module scope
  - `initialMetrics` constant + `renderScreen` helper wrapping `<SafeAreaProvider>`
  - `beforeEach` resetting `mockPush` / `mockBack`
- Replace all import statements: `import { GOALS } from '../goals'` (replacing the symptoms import)
- Replace the `getChip` helper with `getGoalRow(label: string)` that queries `getByRole('checkbox', { name: new RegExp(label, 'i') })`
- Reorganize `describe` blocks to match the new requirements grouping (see Test scenarios below)
- All assertions changed; no symptoms references remain in this file after the rewrite

**Execution note:** This is the RED commit. Run `npx jest app/\\(onboarding\\)/__tests__/step-2.test.tsx` after writing and confirm every failure reads "Unable to find …" (not module-resolution errors). The symptoms-era impl will fail every goal-row, Other-row, expand/collapse, and goal-specific caption/H1 assertion — that is the intended RED state. The Next/Back button render assertions may pass against the symptoms impl since both screens render those elements; that overlap is expected and not a defect.

**Patterns to follow:**
- `app/(onboarding)/__tests__/step-1.test.tsx` (RNTL harness, `SafeAreaProvider`, role-based queries)
- Pattern 1 from `tdd-multiscreen-react-native-patterns-2026-04-22.md` — `fireEvent.press(row)` and `fireEvent.changeText(input, value)`, never `'onPress'` or `'onChangeText'`
- Existing pathname regex from the navigation test: `expect(pathname).toMatch(/\/\(?onboarding\)?\/step-3/);` (preserves the typed-routes-form vs URL-form ambiguity)

**Test scenarios:**

**`describe('GOALS catalog — contract')`** (R1 prerequisite):
- Happy path — exposes exactly 5 preset goals
- Edge case — every goal has a unique id (Set comparison)
- Edge case — every goal has a unique non-empty label
- Edge case — every goal has a non-empty emoji

**`describe('OnboardingStep2Screen — static render')`** (R1):
- Happy path — renders the "Step 2 of 4" caption
- Happy path — renders the progress bar with a fill element (testIDs `progress-bar`, `progress-fill`)
- Happy path — renders the H1 "What matters most to you right now?"
- Happy path — renders the helper text matching `/Select all that apply/i`
- Happy path — renders all 5 preset goal rows by their visible label
- Happy path — renders the "Other" row
- Happy path — renders the Next button
- Happy path — renders the Back link/button

**`describe('OnboardingStep2Screen — preset goal toggle')`** (R3):
- Happy path — tapping a preset goal row toggles its checked state from false → true
- Happy path — tapping a selected preset goal deselects it (true → false)
- Integration — supports multiple preset goals selected simultaneously
- Edge case — deselecting one preset leaves other selected presets intact

**`describe('OnboardingStep2Screen — Other row expand/collapse')`** (R4):
- Happy path — initial render: "Other" is unchecked and the input is NOT in the tree (`queryByPlaceholderText(/Tell us what matters to you/i)` returns null)
- Happy path — tapping "Other" reveals the TextInput with placeholder "Tell us what matters to you…"
- Happy path — typing into the "Other" input updates its displayed value
- Edge case — deselecting "Other" hides the TextInput
- Edge case — deselecting "Other" clears any typed text (re-selecting "Other" shows an empty input, not the previously typed value)
- Integration — selecting "Other" while a preset goal is also selected does not deselect the preset

**`describe('OnboardingStep2Screen — Next enablement')`** (R5):
- Edge case — Next is disabled on initial render (no selections)
- Happy path — Next is enabled after selecting one preset goal
- Happy path — Next is enabled when only "Other" is selected (even with empty text — encodes the explicit issue decision)
- Edge case — Next stays enabled when multiple goals (presets + Other) are selected
- Edge case — deselecting the last selection re-disables Next

**`describe('OnboardingStep2Screen — navigation')`** (R6, R7):
- Happy path — tapping Next with at least one selection navigates to `/onboarding/step-3` (regex-matched per existing pattern)
- Edge case — tapping Next with no selection does nothing (`mockPush` not called)
- Happy path — tapping Back calls `router.back()` exactly once
- Edge case — tapping Back never calls `push` (no forward navigation leaked)

**`describe('OnboardingStep2Screen — accessibility')`** (R8, R9):
- Happy path — every preset goal row exposes `accessibilityRole="checkbox"`, a non-empty `accessibilityLabel`, and a boolean `accessibilityState.checked`
- Happy path — the "Other" row exposes `accessibilityRole="checkbox"`, a non-empty `accessibilityLabel`, and a boolean `accessibilityState.checked`
- Happy path — when the "Other" input is visible, it exposes a non-empty `accessibilityLabel`
- Edge case — only the selected rows report `accessibilityState.checked === true`

**Verification:**
- `npx jest app/\\(onboarding\\)/__tests__/step-2.test.tsx 2>&1 | grep -E "Cannot find module|TypeError|ReferenceError"` returns no matches (RED is properly scaffolded — no setup-time errors)
- `npx jest app/\\(onboarding\\)/__tests__/step-2.test.tsx 2>&1 | grep -E "Unable to find"` returns matches for every goal-specific behavior assertion (proper "missing UI" RED signals — Next/Back render assertions will not be in this list since both screens render those elements)
- The symptoms-era catalog tests (`SYMPTOMS catalog — contract`) no longer exist in the file
- `npx tsc --noEmit` passes

---

- [ ] **Unit 5: Replace Step 2 implementation with the Goals screen (GREEN)**

**Goal:** Wholesale rewrite `app/(onboarding)/step-2.tsx` to implement the goals screen, satisfying every assertion from Unit 4. After this commit, the Step 2 suite is fully GREEN.

**Requirements:** R1, R3, R4, R5, R6, R7, R8, R9, R10

**Dependencies:** Unit 1 (tokens), Unit 2 (catalog), Unit 4 (RED tests must exist and be failing)

**Files:**
- Modify (rewrite): `app/(onboarding)/step-2.tsx`

**Approach:**
- Top of file: `import { GOALS, type GoalId } from './goals'` (replaces `symptoms` import)
- Component-level state:
  - `const [selectedPresets, setSelectedPresets] = useState<Set<GoalId>>(new Set())`
  - `const [otherSelected, setOtherSelected] = useState(false)`
  - `const [otherText, setOtherText] = useState('')`
  - `const canProceed = selectedPresets.size > 0 || otherSelected`
- Handlers:
  - `handleTogglePreset(id)` — clones the Set, adds or removes the id, sets state
  - `handleToggleOther()` — toggles `otherSelected`; on the off transition, also clears `otherText`
  - `handleNext()` — early-return when `!canProceed`, then `push('/(onboarding)/step-3')` (with `@ts-expect-error` if needed for the typed-routes manifest)
- Top-level layout (mirrors step-1.tsx):
  - `<View className="flex-1 bg-bg-primary">` outer
  - `<SafeAreaView className="flex-1" edges={['top', 'bottom']}>`
  - `<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingTop: 28, paddingHorizontal: 28, paddingBottom: 32 }}>`
  - Header block: caption "Step 2 of 4", progress bar (h:6, radius:3, `bg-bg-progress-track`) with fill at 50% width (`width: '50%'`)
  - 12dp spacer (per spec; differs from Step 1's 36dp spacer between header and card)
  - Card block: `bg-bg-card`, radius 24, padding 20/24, `gap: 16`, inline `boxShadow: '0 4px 24px rgba(212,165,116,0.08)'`
    - Question block (`gap: 8`): H1 + helper
    - Goal options list (`flexDirection: 'column', gap: 8`): five `<GoalRow />` for presets + one `<OtherRow />`
  - Flex spacer (`flex: 1, minHeight: 16`) per the spec's 16dp top padding before nav
  - Navigation block (`gap: 16, alignItems: 'center'`): Next `Pressable` + Back `Pressable`
- **`<GoalRow />` internal component** (kept inline; not extracted to its own file unless reuse emerges) — **mirror the structure of `LanguageRow` in `app/(onboarding)/step-3.tsx` (lines 14–73)**:
  - Props: `{ goal: Goal, selected: boolean, onToggle: (id: GoalId) => void }`
  - Renders a `Pressable` with `accessibilityRole="checkbox"`, `accessibilityLabel={goal.label}`, `accessibilityState={{ checked: selected }}`
  - Layout: `flexDirection: 'row', alignItems: 'center'`, `gap: 14`
  - Border + padding (padding-compensation pattern from PR #9 LanguageRow):
    - `borderWidth: selected ? 2 : 1`
    - `borderColor: selected ? '#9caf88' : '#e0dbd6'`
    - `paddingHorizontal: selected ? 17 : 18`, `paddingVertical: selected ? 12 : 13` (the 1dp delta on each side absorbs the 1dp extra border, keeping outer geometry constant on toggle)
    - `borderRadius: 16`, `borderCurve: 'continuous'`
  - Background: `backgroundColor: selected ? 'rgba(156,175,136,0.12)' : '#faf7f5'` (literal values; equivalent to the new `bg-goal-selected` token + existing `bg-bg-input` if NativeWind class composition is preferred)
  - Children: emoji `<Text style={{ fontSize: 22 }}>{goal.emoji}</Text>`, label `<Text style={{ fontSize: 16, fontWeight: selected ? '600' : '500' }} className="text-text-heading">{goal.label}</Text>` wrapped in a `<View style={{ flex: 1 }}>` so wrapping labels don't push the indicator off-screen, indicator (24dp circle: white bg + `#d1c9c2` 1.5px border when unselected; `bg-bg-progress-fill` fill + white ✓ when selected)
- **`<OtherRow />` internal component:**
  - Same row geometry as `GoalRow` (selected vs unselected styling identical)
  - Props: `{ selected: boolean, otherText: string, onToggle: () => void, onChangeText: (s: string) => void }`
  - **`testID="goal-row-other"`** on the Pressable (Maestro affordance — load-bearing, not internal detail)
  - When `selected`, the Pressable's child column ALSO renders a TextInput below the header row. Layout shifts the row to `flexDirection: 'column'` with the header still as a row inside it, and the input as a sibling beneath
  - TextInput: white bg, `border-border-input-active` 1.5px border, radius 12, height 48, paddingHorizontal 16, placeholder "Tell us what matters to you…", `accessibilityLabel="Other goal text"`, **`testID="goal-other-input"`** (Maestro affordance), value `otherText`, `onChangeText`
- Next button: 56dp height, `bg-bg-next`, `alignItems: 'center'`, `justifyContent: 'center'`, label white Inter Semi Bold 17, `disabled={!canProceed}`, `accessibilityState={{ disabled: !canProceed }}`, `opacity: canProceed ? 1 : 0.5`, inline `boxShadow: '0 4px 16px rgba(212,165,116,0.3)'`
- Back link: same `accessibilityRole="button"`, `text-text-subtle`, font-weight 500

**Execution note:** GREEN. After implementing, `npx jest app/\\(onboarding\\)/__tests__/step-2.test.tsx` passes 100% with no test modifications.

**Patterns to follow:**
- `app/(onboarding)/step-1.tsx` for the screen-level layout, ScrollView/SafeAreaView wrapping, and the Next/Back navigation block
- Existing step-2.tsx (the symptoms version) for the chip-style accessibility-state pattern (`accessibilityRole="checkbox"` + `accessibilityState={{ checked }}`)
- Inline `style={{ boxShadow: '...' }}` over NativeWind `shadow-*` classes (cross-RN-platform reasons documented in the superseded plan)

**Test scenarios:** see Unit 4 — this unit makes those tests green.

**Verification:**
- `npx jest app/\\(onboarding\\)/__tests__/step-2.test.tsx` passes (full Step 2 suite green; 0 failures)
- `npx jest app/\\(onboarding\\)/__tests__/step-1.test.tsx` still passes (regression check on Unit 3's literal change)
- `npx tsc --noEmit` passes
- `npm run lint` passes
- Manual on iPhone 17 simulator: rows render with leading emoji + label + trailing indicator; tapping a preset row swaps the visual state with no 1dp jump; tapping "Other" expands the row and reveals the input; tapping Back returns to Step 1; tapping Next with a selection lands on the Step 3 stub
- VoiceOver verification (manual, one pass): each row announces "checkbox, [label], unchecked|checked"; the "Other" input announces its label

---

- [ ] **Unit 6: Replace `.maestro/onboarding-step-2.yaml` with the Goals smoke flow**

**Goal:** Update the Maestro E2E flow to exercise the new goals screen end-to-end, including the "Other" expand interaction.

**Requirements:** R11

**Dependencies:** Unit 5 (the Goals impl must exist for the flow to interact with)

**Files:**
- Modify (rewrite): `.maestro/onboarding-step-2.yaml`

**Approach:**
- Keep the file's preconditions header (appId, dev-client requirement, signed-in-user requirement) — same constraints as the symptoms flow
- Drop the symptoms-era assertions (`"Step 2 of 3"`, `"What are your primary symptoms?"`, `"Dry Eyes"`, `"Fatigue"`)
- Add the goals-era flow:
  1. `launchApp: {}`
  2. `openLink: workflowtest://onboarding/step-2`
  3. `assertVisible: "Step 2 of 4"`
  4. `assertVisible: "What matters most to you right now?"`
  5. `tapOn: "Find my symptom triggers"` (by visible label substring)
  6. `tapOn: "Improve my daily energy"`
  7. Deselect one to exercise the toggle-off path: `tapOn: "Improve my daily energy"`
  8. Expand "Other": `tapOn: "Other"`
  9. Type into the input: `tapOn: { id: "goal-other-input" }` (testID declared in Unit 5) + `inputText: "Better sleep"`
  10. `tapOn: "Next"`
  11. `assertVisible: "Preferred Language"` (the real Step 3 screen heading after PR #9; was previously a "Step 3 coming soon" stub)

**Patterns to follow:**
- `.maestro/onboarding-step-1.yaml` for the precondition header and `appId` declaration
- The existing `.maestro/onboarding-step-2.yaml` (symptoms version) for the structure (`launchApp` → `openLink` → `assertVisible` → `tapOn` sequence)

**Test scenarios:**
- Test expectation: none in Jest — Maestro flows are E2E and validated by running `maestro test .maestro/onboarding-step-2.yaml` against a dev-client build with an authed Supabase session

**Verification:**
- Manual: `maestro test .maestro/onboarding-step-2.yaml` against a booted iOS sim with a dev-client build installed and an authed session — flow passes end-to-end
- The existing `.maestro/onboarding-step-1.yaml` flow still passes with the updated "Step 2" assertion (its line 51 currently reads `assertVisible: "Step 2"` which substring-matches "Step 2 of 4" — no change required)

---

- [ ] **Unit 7: Cleanup — delete `symptoms.ts` and the orphaned `text-chip-label` token**

**Goal:** Remove the symptoms-era artifacts that no code references after Unit 5 lands.

**Requirements:** Hygiene; no requirement directly maps. Removes dead code that would otherwise rot.

**Dependencies:** Unit 5 (no code may import `./symptoms` after this lands), Unit 6 (no Maestro flow may reference symptoms)

**Files:**
- Delete: `app/(onboarding)/symptoms.ts`
- Modify: `tailwind.config.js` (remove the `"text-chip-label": "#594d40"` color entry plus its `// Onboarding Step 2 tokens (from issue #3).` comment, AND remove the `chip: "0 2px 8px rgba(156,175,136,0.25)"` entry from the `boxShadow` block — both tokens were used only by the symptoms chip and have no className or inline-string consumer after Unit 5 lands)

**Approach:**
- Run `grep -rn "from './symptoms'\\|from '../symptoms'\\|symptoms.ts" app/ .maestro/ docs/` to confirm no references remain. Expected output: empty.
- Run `grep -rn "text-chip-label" app/ tailwind.config.js components/` to confirm no NativeWind class still references the color token. Expected output: empty.
- Run `grep -rn "shadow-chip\\|rgba(156,175,136,0.25)" app/ tailwind.config.js components/` to confirm no consumer of the chip shadow remains (the symptoms impl used it as an inline literal, not as a `shadow-chip` className, so the literal value matters too). Expected output: empty.
- If all three greps come up empty, delete `symptoms.ts` and remove both the `text-chip-label` color entry and the `boxShadow.chip` entry.

**Execution note:** This unit MUST land after Units 5 and 6. Deleting `symptoms.ts` while any code still imports it would break the build; removing the token while any `className="text-text-chip-label"` reference exists would break the Tailwind compile. The greps are the gate.

**Patterns to follow:**
- General hygiene: leave the comment that GROUPS the existing onboarding tokens intact (`// Onboarding Step 2 (Goals) tokens (from issue #10).` from Unit 1) — only remove the `// Onboarding Step 2 tokens (from issue #3).` comment that captioned the now-removed `text-chip-label`

**Test scenarios:**
- Test expectation: none — pure deletion. Coverage that the deletion didn't break anything comes from the full suite re-running after the change.

**Verification:**
- `npx jest` passes (full suite — Step 1 + Step 2 + any other tests)
- `npx tsc --noEmit` passes
- `npm run lint` passes
- `grep -rn "symptoms\\|text-chip-label\\|shadow-chip\\|rgba(156,175,136,0.25)" app/ tailwind.config.js .maestro/` returns no matches (excluding doc/plan history references in `docs/`)

---

## System-Wide Impact

- **Interaction graph:** Step 1 `Next` → Step 2 (was symptoms, now goals) → Step 3 stub. Auth flow, `Stack.Protected` guards, and `(onboarding)` group registration all unchanged. No new auth listeners, no `AppState` callbacks touched.
- **Error propagation:** No async/network code in this plan. All state is local `useState`. No error paths added.
- **State lifecycle risks:** "Other" expand collapses on deselect AND clears typed text — the deselect-then-reselect path must reset the input to empty. Tested explicitly in Unit 4. No other state-lifecycle concerns (no async fetches, no subscriptions, no AppState integration).
- **API surface parity:** None — this is a pure-UI change with no exported types other than the new `GoalId` / `GOALS` from `goals.ts`. Internal to the `(onboarding)` route group.
- **Integration coverage:** The Step 1 indicator update (Unit 3) and the Step 2 replacement (Units 4–5) are independent — neither depends on the other at runtime. Only the Maestro flow (Unit 6) crosses both screens (Step 1 → Step 2 navigation), and the existing Step 1 Maestro flow's `assertVisible: "Step 2"` already substring-matches "Step 2 of 4" so no Step-1-flow update is required.
- **Unchanged invariants:** `lib/auth-context.tsx`, `lib/supabase.ts`, `app/_layout.tsx` are untouched. The Step 3 stub at `app/(onboarding)/step-3.tsx` is untouched. The `(auth)` group is untouched. Step 1's `as never` route cast and existing `canProceed` logic are untouched (per Scope Boundaries). (The `useRedirectOnSignIn` hook is **not** in this list because it was already removed in PR #8 when the `(tabs)` stack was deleted — see CLAUDE.md "Post-sign-in flow". This plan does not reintroduce it.)

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Existing Step 2 Maestro flow asserts symptoms strings — re-running it before Unit 6 lands will fail | Bundle Units 5 + 6 in the same PR (or land Unit 6 immediately after Unit 5). The flow is gated on a dev-client + authed session, so CI does not re-run it on every push; only manual local runs are at risk |
| TDD test rewrite (Unit 4) could be misread as "modifying tests to make them pass," violating CLAUDE.md's non-negotiable | Address up front in the PR description and the Institutional Learnings section above. Symptoms tests are deleted because the *behavior* is removed, not because the implementation is broken. The rule applies within a feature's lifetime, not across feature pivots |
| Border-width swap on selection causes a 1dp row jump | Use 2px border on both states (see Key Technical Decisions). Unit 4 doesn't directly test this geometry — flagged as a manual visual verification step in Unit 5's Verification |
| The "Other" TextInput could trap focus when the keyboard is up, making it impossible to deselect "Other" without dismissing the keyboard first | `keyboardShouldPersistTaps="handled"` on the parent ScrollView is the standard fix and is already required for Step 1. Carry it forward in Unit 5. Manual verification: keyboard-up tap on the "Other" row's selected state correctly toggles |
| Step 1 Maestro flow's `assertVisible: "Step 2"` is a substring match — if a future flow asserts the literal "Step 2 of 4", it'll need to change | Not a problem for this PR. Documented here so the next flow author knows the substring match is intentional |
| Typed-routes manifest may transiently flag `'/(onboarding)/step-3'` after the rewrite | Use `@ts-expect-error` per Pattern 5 in the TDD multi-screen guide. Self-cleaning: once the manifest regenerates, `tsc` reports the directive as unused, and removal is a one-line follow-up |

## Documentation / Operational Notes

- **No CLAUDE.md update required at merge time.** The mobile stack non-negotiables, the existing test conventions, and the design system reference all stay accurate. Note: the token-count line in CLAUDE.md currently reads "11 onboarding-step-1 tokens"; after this plan lands the count drifts to 13 (after adding `bg-goal-selected` and `border-indicator-unselected` in Unit 1) and then to 12 (after removing `text-chip-label` and the `boxShadow.chip` entry in Unit 7). The line is descriptive prose, not a hard contract — a follow-up doc-cleanup PR can update it for precision, but it is not required for this merge.
- **No PR template / docs/onboarding update required.** The `docs/onboarding/` folder didn't exist when this plan was written; no narrative docs need updating.
- **No EAS rebuild required.** No new native modules. The dev-client build that includes the date-picker modules from issue #2 is sufficient for this issue's Maestro flow.
- **Rollout:** standard merge-to-main. No feature flag, no staged rollout. Auth and persistence are untouched, so no user data is at risk.

## Sources & References

- **Origin issue:** https://github.com/nipunvv/WorkflowTest/issues/10
- **Superseded issue:** https://github.com/nipunvv/WorkflowTest/issues/3 (close in favor of #10 once this PR merges)
- **Superseded plan:** `docs/plans/2026-04-22-002-feat-onboarding-step-2-symptoms-plan.md`
- **TDD patterns:** `docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md`
- **Reference implementation:** `app/(onboarding)/step-1.tsx`, `app/(onboarding)/__tests__/step-1.test.tsx`
- **Step 1 plan (parent pattern):** `docs/plans/2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md`
- **Existing tokens / shadows:** `tailwind.config.js`
- **Design:** Figma file `CLEcJLTTd4L1JDDjc6KDwl`, node `170:2` (https://www.figma.com/design/CLEcJLTTd4L1JDDjc6KDwl/Untitled?node-id=170-2)
- **Project non-negotiables:** `CLAUDE.md` (TDD discipline, RN primitive rules, NativeWind v4 conventions, React Compiler constraints, accessibility requirements)
