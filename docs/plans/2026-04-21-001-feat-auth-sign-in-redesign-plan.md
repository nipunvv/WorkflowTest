---
title: "feat: Redesign Auth / Sign-In screen (issue #1)"
type: feat
status: active
date: 2026-04-21
origin: https://github.com/nipunvv/WorkflowTest/issues/1
---

# feat: Redesign Auth / Sign-In screen (issue #1)

## Context

The current `app/(auth)/login.tsx` is a minimal placeholder (centered brand name + "Continue with Google" button). Issue #1 replaces it with the Figma-designed sign-in screen (Figma node `4:2`): organic decorative background, honey-jar logo with glow, H1 + subtext, sage-tinted privacy badge, dark Google Sign-In button, and legal footer. The existing auth wiring (`useAuth().signInWithGoogle()` returning `{ error }`, local `submitting` flag, `Alert.alert` on error) is untouched — this is a pure UI + assets + tokens change.

**Scope decisions made in planning:**
- H1 copy uses **"Hi Honey"** per user decision. Rename limited to `app.json` `name` (the user-facing display name). `slug`, `scheme: "workflowtest"`, `ios.bundleIdentifier: "com.workflowtest.app"`, and `package.json name` stay untouched — they are wired into Supabase Redirect URLs, EAS build history, Maestro `appId`, and the repo identity (per `CLAUDE.md` non-negotiables).
- Figma is source-of-truth for colors/spacing (issue says "pixel-close to Figma"). Figma hex values (`#fff8f0`, `#1f1a14`, `#33291f`, `#d4a574`, `#9caf88`, …) diverge from `DESIGN.md`'s ramp — reconciling DESIGN.md to match is deferred to a follow-up issue.
- Assets ship as PNG exports (no new `react-native-svg` dependency). SVG conversion is a follow-up optimization.

## Requirements Trace (from issue #1)

- R1. Render: decorative background, logo with glow, H1, subtext, privacy badge, Google button, legal footer
- R2. Wire Google button to existing `useAuth().signInWithGoogle()` — no auth-logic changes
- R3. Loading state on button during sign-in; `Alert.alert` on error
- R4. Legal links open via `WebBrowser.openBrowserAsync` (in-app browser)
- R5. Full-screen modal shell, safe-area top + bottom, no header/tabs
- R6. Jest+RNTL test suite covering render, button action, loading, error, legal-link taps
- R7. Maestro `launch.yaml` updated for new copy
- R8. Pixel-close to Figma on iPhone 17 simulator
- R9. No regression in the existing OAuth flow

## Scope Boundaries

- NOT implementing email sign-in (the Figma frame shows it; issue explicitly defers) — omit the divider and email button
- NOT touching `lib/auth-context.tsx` or `lib/supabase.ts`
- NOT authoring Terms / Privacy Policy pages (external URLs)
- NOT reconciling DESIGN.md hex values with Figma (follow-up)
- NOT adding Apple or other social providers

## Context & Research

### Relevant Code and Patterns (current state, from Phase 1 exploration)

- `app/(auth)/login.tsx` — uses `useAuth()`, local `const [submitting, setSubmitting] = useState(false)`, calls `await signInWithGoogle()` expecting `{ error }`, shows error via `Alert.alert`. Pattern preserved in the redesign.
- `lib/auth-context.tsx` — `signInWithGoogle: async () => Promise<{ error: Error | null }>`. Context shape: `{ session, user, loading, signInWithGoogle, signOut }`. No loading managed inside the method itself — caller owns the flag.
- `app/(auth)/_layout.tsx` — already sets `headerShown: false` (no change).
- `app/_layout.tsx` — `Stack.Protected guard={!isAuthed}` wraps `(auth)` (no change).
- `jest-setup.ts` — pre-mocks `expo-secure-store`, `expo-web-browser` (`openAuthSessionAsync` returns `{ type: 'cancel', url: null }`), `expo-linking` (`createURL` returns `workflowtest://{path}`), and `react-native-reanimated`. Does NOT mock `WebBrowser.openBrowserAsync` — add to the mock or override in-test.
- `.maestro/launch.yaml` — asserts old copy ("Sign in to continue", "Continue with Google"). Needs updating.
- `tailwind.config.js` — `theme.extend.colors` is currently empty. First real use.
- `assets/images/` — no Google logo / organic glow / decorations assets today.

### Figma Design (node `4:2`) — token values used

| Role | Hex | Notes |
|---|---|---|
| Page background | `#fff8f0` | cream / warm |
| Logo square bg | `#d4a574` | honey-tan, 72dp square, 20dp radius |
| Logo glow | decorative asset | 140dp, behind logo (PNG export) |
| Decorations overlay | decorative asset | absolute, full-bleed behind content (PNG export) |
| H1 text | `#33291f` | Inter Bold 32 / 40 line-height |
| Body text | `#736659` | Inter Regular 16 / 24 |
| Badge bg | `rgba(156,175,136,0.15)` | sage tint, 100dp pill |
| Badge text | `#617354` | Inter Medium 13 |
| Google button bg | `#1f1a14` | 56dp tall, 16dp radius, shadow `0 4 12 rgba(0,0,0,0.1)` |
| Google button label | white | Inter Semi Bold 17 |
| Legal footer text | `#8c8073` | Inter Regular 12 / 18 |
| Legal link | `#d4a574` | Inter Medium 12, underlined |

### Institutional Learnings

- `CLAUDE.md` "Mobile stack": never use HTML elements or `TouchableOpacity`; strings must be inside `<Text>`; never `{falsy && JSX}`; use `boxShadow` CSS string (not legacy iOS/Android split); use `gap` not `margin*`; pair `borderRadius` with `borderCurve: 'continuous'`; use `Image` from `expo-image` (already installed).
- `CLAUDE.md` "Non-negotiables": strictly TDD; never modify or delete an existing test to make it pass.
- The Figma plugin confirmed no existing local components match the screen shape — we're building fresh.

## Key Technical Decisions

- **Tailwind tokens first:** add Figma-derived colors/spacing to `tailwind.config.js` `theme.extend` so `login.tsx` uses semantic class names (`bg-bg-primary`, `text-text-heading`, `bg-button-primary-bg`, etc.) instead of NativeWind arbitrary-value classes (`bg-[#fff8f0]`). Keeps future screens consistent and makes the DESIGN.md reconciliation follow-up easier.
- **PNG for decorative assets:** export the decorations overlay, organic glow, and Google "G" logo from Figma as PNG (2x retina). Avoids the new `react-native-svg` dependency. Load via `expo-image` for caching.
- **Privacy lock glyph is an emoji (🔒), not an SVG icon:** matches Figma, zero asset cost, platform-consistent.
- **Preserve existing wiring pattern:** local `submitting` state, `{ error } = await signInWithGoogle()`, `Alert.alert` on error. No changes to auth context.
- **Rename boundary:** `app.json` `name` only (user-facing display). `slug`, `scheme`, bundle ID, `package.json name`, and `CLAUDE.md` repo references stay as "workflow-test" — they are technical identifiers, not product names.
- **Mock strategy for Jest:** mock `useAuth` per-test via `jest.mock('@/lib/auth-context')` with a factory returning `{ signInWithGoogle: jest.fn(), session: null, ... }`. This is the first Jest test file, so it establishes the canonical mock pattern for future screens.

## Open Questions

### Resolved During Planning

- **H1 copy?** → "Hi Honey" (user decision)
- **Rename scope?** → `app.json` `name` only; keep slug/scheme/bundle/package-name as `workflowtest`/`workflow-test`
- **Asset format?** → PNG (no new dependency)
- **Token reconciliation with DESIGN.md?** → Figma is source of truth for this issue; DESIGN.md reconciliation is a follow-up issue

### Deferred to Implementation

- Exact PNG export sizes from Figma (2x retina is the default; 3x if jank on high-DPR)
- Whether to extract a `<PrivacyBadge />` / `<LegalFooter />` subcomponent during REFACTOR — decided after the GREEN implementation if JSX grows beyond ~150 lines
- Whether `WebBrowser.openBrowserAsync` or `Linking.openURL` is nicer for legal links — issue specifies `WebBrowser` so default to that; revisit only if it mis-behaves on the dev client

## Implementation Units

- [ ] **Unit 1: Add Figma design tokens to `tailwind.config.js`**

**Goal:** Seed `theme.extend.colors` and `theme.extend.boxShadow` with the tokens used by the sign-in screen, so NativeWind class names stay semantic.

**Requirements:** R8 (pixel-close), enables R1

**Dependencies:** None

**Files:**
- Modify: `tailwind.config.js`

**Approach:**
- Add under `theme.extend.colors`: `bg-primary: '#fff8f0'`, `bg-logo: '#d4a574'`, `bg-badge: 'rgba(156,175,136,0.15)'`, `button-primary-bg: '#1f1a14'`, `text-heading: '#33291f'`, `text-body: '#736659'`, `text-badge: '#617354'`, `text-subtle: '#8c8073'`, `accent-primary: '#d4a574'`.
- Add under `theme.extend.boxShadow`: `button: '0 4px 12px rgba(0,0,0,0.1)'`.
- Leave DESIGN.md untouched — flag reconciliation in a follow-up issue.

**Test scenarios:**
- Test expectation: none — pure configuration, no behavioral change. Verified transitively via Unit 5 implementation and Unit 7 visual QA.

**Verification:**
- `npx tsc --noEmit` passes. New token names resolve in NativeWind (Unit 5 implementation will exercise them).

- [ ] **Unit 2: Export Figma assets into `assets/images/`**

**Goal:** Get the three PNG assets referenced by the Figma frame into the repo so `expo-image` can load them.

**Requirements:** R1, R8

**Dependencies:** None

**Files:**
- Create: `assets/images/auth-decorations.png` (full-bleed background overlay, Figma node `8:2`)
- Create: `assets/images/auth-logo-glow.png` (140dp circle glow behind logo, Figma node `5:4`)
- Create: `assets/images/google-logo.png` (20dp Google "G" mark, Figma node `120:2`)

**Approach:**
- Export each asset from Figma at 2x scale, PNG format.
- Name files with a clear prefix so future auth screens can share them.
- No downscaling / editing — match Figma's export directly.

**Patterns to follow:**
- Other `assets/images/*.png` files already in the repo (React logos / splash / app icons) for directory conventions.

**Test scenarios:**
- Test expectation: none — asset-only change. Verified visually in Unit 7.

**Verification:**
- All three files exist at the listed paths. `npx expo start` doesn't 404 on them when Unit 4 imports them.

- [ ] **Unit 3: Update product display name in `app.json`**

**Goal:** Change the user-facing app name from "workflow-test" to "Hi Honey" without touching technical identifiers.

**Requirements:** enables H1 consistency and home-screen display matching the product identity chosen

**Dependencies:** None

**Files:**
- Modify: `app.json` (field: `expo.name`)

**Approach:**
- Change **only** `expo.name` from `"workflow-test"` to `"Hi Honey"`.
- **Do NOT change** `expo.slug`, `expo.scheme`, `expo.ios.bundleIdentifier`, or `expo.android.package`. Those are wired into the Supabase Redirect URL allowlist and Maestro's `appId`; changing them is out of scope and would break the OAuth flow (per `CLAUDE.md`'s non-negotiables).
- `package.json` `name` stays `workflow-test` (technical package identifier).
- `CLAUDE.md` stays as-is (repo/project identifier, not product identifier). Add a one-line note in the repo's README (if present) or leave — the split is subtle but real.

**Test scenarios:**
- Test expectation: none — single-field config change. Maestro flow in Unit 6 will assert the new name is visible.

**Verification:**
- `app.json` diff shows only `expo.name` changed. Dev client still authenticates (smoke test after Unit 5 ships).

- [ ] **Unit 4 (RED): Write failing tests for the redesigned sign-in screen**

**Goal:** Produce `app/(auth)/__tests__/login.test.tsx` covering all acceptance-criteria behaviors. Every test must **fail** against the current un-redesigned `login.tsx` — the failure mode is the spec. No implementation changes in this unit. This lands as its own atomic commit with the exact failing-test evidence recorded in the PR description.

**Requirements:** R6 (drives R1, R2, R3, R4 verification)

**Dependencies:** None. Intentionally runs before token/asset/UI work so the tests define "done" before any implementation begins.

**Files:**
- Create: `app/(auth)/__tests__/login.test.tsx`

**Approach:**
- First Jest test file in the project — this unit also establishes the canonical mock pattern for future screens.
- Mock `@/lib/auth-context`:
  ```
  jest.mock('@/lib/auth-context', () => ({
    useAuth: jest.fn(),
  }))
  ```
  In each test, set `jest.mocked(useAuth).mockReturnValue({ signInWithGoogle, session: null, user: null, loading: false, signOut: jest.fn() })`.
- Spy on `Alert.alert`: `jest.spyOn(Alert, 'alert').mockImplementation(() => undefined)` in `beforeEach`, restore in `afterEach`.
- Extend the `expo-web-browser` mock to stub `openBrowserAsync` (resolves with `{ type: 'opened' }`). Either add to `jest-setup.ts` or override at the top of `login.test.tsx`. Default: override in-test so we don't globalize a mock that later tests may want to customize.
- Use `render` and `screen` from `@testing-library/react-native`. Use `findByRole` / `findByText` with regex for flexibility.
- Wrap `render` in a helper that provides `SafeAreaProvider` (from `react-native-safe-area-context`) so `useSafeAreaInsets()` inside login.tsx doesn't throw.

**Execution note:** This is the RED half of red/green. Do NOT touch `login.tsx`, `tailwind.config.js`, or any asset in this unit. Commit the failing tests as-is. Verify RED with a full `npm test` run and record the failing output in the PR description.

**Patterns to follow:**
- `jest-setup.ts` mock-extension pattern (mocks `expo-secure-store`, `expo-web-browser.openAuthSessionAsync`, etc.).
- This unit defines a new pattern for future auth-related screens — keep the `useAuth` factory mock generic enough to reuse.

**Test scenarios:**
- **Happy path — renders H1:** Finds text matching `/Welcome to/i` and `/Hi Honey/` visible on screen.
- **Happy path — renders subtext:** Finds text matching `/gentle companion/i`.
- **Happy path — renders privacy badge:** Finds text matching `/private.*encrypted/i`.
- **Happy path — renders Google button:** Finds a button with `accessibilityLabel` matching `/Sign in with Google/i`.
- **Happy path — renders legal links:** Finds Pressable/Text with `accessibilityRole="link"` (or `role="button"` + label containing) for both "Terms of Service" and "Privacy Policy".
- **Happy path — tap Google calls auth:** `fireEvent.press` on the Google button → `signInWithGoogle` mock called exactly once.
- **Edge case — double-tap guard:** Two synchronous `fireEvent.press` calls while `signInWithGoogle` is still pending → mock is called at most once.
- **Happy path — loading UI:** While `signInWithGoogle` promise is unresolved, an `ActivityIndicator` is visible inside the Google button (query by testID `google-button-spinner` or by the button's `accessibilityState.busy === true`).
- **Error path — Alert on failure:** When `signInWithGoogle` resolves with `{ error: new Error('oauth failed') }`, `Alert.alert` is called with a message containing `/oauth failed/i`.
- **Error path — submitting reset:** After the error resolves, a second press of the Google button calls `signInWithGoogle` again (proves `submitting` flag was cleared).
- **Happy path — Terms link:** Pressing the "Terms of Service" link calls `WebBrowser.openBrowserAsync` with a URL string containing `/terms/i`.
- **Happy path — Privacy link:** Pressing the "Privacy Policy" link calls `WebBrowser.openBrowserAsync` with a URL string containing `/privacy/i`.
- **Happy path — accessibility:** Google button and both legal links each have both `accessibilityRole` and `accessibilityLabel` set (non-empty strings).

**Verification:**
- `npx jest app/(auth)/__tests__/login.test.tsx` exits **non-zero** with every test case failing for the right reason: the new UI elements don't exist yet (matchers fail with "Unable to find …"), NOT syntax / import / runtime errors.
- `npx tsc --noEmit` still clean (test file is syntactically valid TS).
- `npm run lint` still clean.
- Commit message references "RED — failing tests for redesigned sign-in". No production code changed.

- [ ] **Unit 5 (GREEN): Implement redesigned `login.tsx` to pass the Unit 4 tests**

**Goal:** Rewrite `app/(auth)/login.tsx` with the Figma-designed UI, using the tokens from Unit 1 and assets from Unit 2, so every Unit 4 test turns green. Do NOT modify any test. Land as its own atomic commit.

**Requirements:** R1, R2, R3, R4, R5, R9

**Dependencies:** Unit 1 (tokens), Unit 2 (assets), Unit 4 (tests in place). Unit 3 is independent but conceptually related.

**Files:**
- Modify: `app/(auth)/login.tsx`

**Approach:**
- Use `<View>`, `<Text>`, `<Pressable>` only. `Image` from `expo-image` for the three PNG assets.
- Layout shell: full-screen `<View className="flex-1 bg-bg-primary">` with safe-area top+bottom handled via `useSafeAreaInsets()` (non-scroll screen, per CLAUDE.md "safe areas" rule).
- Two vertical sections (Figma structure): **Top Section** (decorations absolute layer, Logo Area `[glow 140dp + honey square 72dp with 🍯 emoji]`, Welcome text "Welcome to / Hi Honey", subtext, Privacy badge pill) and **Bottom Section** (Google button, Legal footer). `justify-between` on the root so the two sections anchor top and bottom.
- Decorations: absolute-positioned `<Image>` filling the screen, `pointerEvents="none"`, behind everything.
- Google button: `<Pressable>` with NativeWind classes using the new tokens. Show `<ActivityIndicator color="#fff" />` when `submitting` is `true`, otherwise render the Google "G" logo + "Sign in with Google" text. Set `accessibilityState={{ busy: submitting }}` and guard with `disabled={submitting}` to satisfy the double-tap test.
- Legal footer: `<Text>` wrapping with nested `<Text onPress={…}>` spans for the link styling, each calling `WebBrowser.openBrowserAsync('https://example.com/terms')` (placeholder URLs — issue says Terms/Privacy content is out of scope).
- Wiring: preserve existing pattern verbatim — `const { signInWithGoogle } = useAuth()`, local `const [submitting, setSubmitting] = useState(false)`, try/finally resets `submitting`, `Alert.alert('Sign-in failed', error.message)` on error.
- Accessibility: `accessibilityRole="button"` + `accessibilityLabel="Sign in with Google"` on the Google button; `accessibilityRole="link"` + label on each legal link.
- Watch for CLAUDE.md traps: every string inside `<Text>` (including 🍯 and 🔒 emoji), no `{falsy && JSX}` patterns.

**Execution note:** This is the GREEN half. Do NOT modify `__tests__/login.test.tsx` — if a test is wrong, stop and discuss; do not edit it to match the implementation (CLAUDE.md non-negotiable). Stay minimal — write only what's needed to make each test pass.

**Patterns to follow:**
- Current `login.tsx` wiring pattern (submitting flag, Alert on error, destructure `useAuth`) — preserve verbatim, only the JSX changes.
- Figma frame `4:2` for layout geometry, colors, typography, and shadow values.

**Test scenarios:**
- Same 13 scenarios from Unit 4 — this unit makes them pass, does not add new ones.
- Additional behavioral confirmations (not new tests — implementation-only): loading spinner color is white (matches `button-primary-bg` contrast), shadow matches Figma value `0 4 12 rgba(0,0,0,0.1)`.

**Verification:**
- `npx jest app/(auth)/__tests__/login.test.tsx` — all 13 cases green.
- `npm test` (full suite) — green, no regressions.
- `npx tsc --noEmit` clean.
- `npm run lint` clean.
- `git diff` touches only `app/(auth)/login.tsx` in this commit.

- [ ] **Unit 6: Update `.maestro/launch.yaml` for the new copy**

**Goal:** Keep the existing smoke-test flow green against the redesigned screen.

**Requirements:** R7

**Dependencies:** Unit 5 (new copy has to actually be on screen first)

**Files:**
- Modify: `.maestro/launch.yaml`

**Approach:**
- Replace the `assertVisible` lines that match the old strings ("Sign in to continue", "Continue with Google") with selectors for the new ones ("Welcome to", "Hi Honey", "Sign in with Google", and the privacy badge phrase).
- Keep the `appId` and launch steps unchanged.
- No new flows added — that's a follow-up once we add onboarding / post-auth screens.

**Test scenarios:**
- Test expectation: the flow itself IS the test. Post-Unit-4, running `maestro test .maestro/launch.yaml` against a dev-client build must succeed.

**Verification:**
- `maestro test .maestro/launch.yaml` passes against a simulator running the dev-client EAS build with the redesigned screen.

- [ ] **Unit 7: Visual parity + acceptance verification**

**Goal:** Prove the implementation matches Figma on-device and the existing OAuth flow still works end-to-end.

**Requirements:** R8, R9

**Dependencies:** Units 1–6

**Files:** None

**Approach:**
- Start `npx expo start --dev-client`.
- Load on iPhone 17 simulator.
- Side-by-side compare against Figma node `4:2`. Fix dp drift (spacing, radii, shadow, letter-spacing). Acceptable tolerance: ~1dp for positioning, exact for colors.
- Dark mode: Figma does not specify — screen reads on both (bg is cream; dark mode fallback is fine for this issue).
- Execute a real Google sign-in on the dev client — confirm the app routes to `(tabs)` after consent (R9 regression guard).
- Confirm tapping "Terms of Service" and "Privacy Policy" each open an in-app `ASWebAuthenticationSession` / `SFSafariViewController`.

**Test scenarios:**
- Test expectation: none directly — this is manual QA. Covered by the Unit 4 unit tests (behavior) and Unit 5 Maestro flow (end-to-end).

**Verification:**
- All four gates green: `npx tsc --noEmit`, `npm run lint`, `npm test`, `maestro test .maestro/launch.yaml`.
- Real OAuth flow completes on the dev client and lands on `(tabs)`.
- Side-by-side visual match on iPhone 17 simulator.

## System-Wide Impact

- **Interaction graph:** Only the `(auth)/login` route is touched. `AuthProvider`, `_layout.tsx` guards, and the `(tabs)` stack are unaffected.
- **Error propagation:** `Alert.alert` surfaces `signInWithGoogle`'s returned error. No change to where errors come from or how they're formatted in the auth context.
- **State lifecycle risks:** `submitting` state is purely local to the login screen; no cache/persistence concerns. The existing `SecureStore` + Supabase session hand-off is not touched.
- **API surface parity:** N/A — `useAuth()`'s public API is unchanged.
- **Integration coverage:** The Maestro `launch.yaml` smoke test + the real OAuth walk-through on the dev client (Unit 6) cover the live integration. Unit tests alone cannot exercise the `ASWebAuthenticationSession` sheet (CLAUDE.md limitation).
- **Unchanged invariants:** `flowType: 'pkce'`, `detectSessionInUrl: false`, the `SecureStore` chunking adapter, the `AppState` refresh loop, the `(auth)` ↔ `(tabs)` guard structure, `scheme: "workflowtest"`, `ios.bundleIdentifier: "com.workflowtest.app"`. None change.

## Risks & Dependencies

| Risk | Mitigation |
|---|---|
| Renaming `app.json` `expo.name` accidentally creeps into `slug` / `scheme` / bundle ID and breaks Supabase Redirect URL matching | Unit 3 locks the diff surgically to `expo.name` only; Unit 6 verifies OAuth still completes end-to-end |
| Figma hex values diverge from DESIGN.md — future screens pick up mismatched tokens | Tokens added in Unit 1 are Figma-derived and named by role, not by DESIGN.md's legacy names. Reconciliation tracked as a follow-up issue. |
| Jest's `Alert` spy leaks across tests | Use `jest.spyOn(Alert, 'alert').mockImplementation(() => undefined)` in `beforeEach` and restore in `afterEach`, or wrap in `jest.mock('react-native/Libraries/Alert/Alert')` at the top of the file |
| `WebBrowser.openBrowserAsync` isn't pre-mocked in `jest-setup.ts` (only `openAuthSessionAsync` is) | Extend the existing `expo-web-browser` mock to stub `openBrowserAsync` returning `Promise.resolve({ type: 'opened' })`, or override per-test |
| Android flag emoji coverage / honey-jar emoji rendering differences between iOS and Android | 🍯 and 🔒 are well-supported on both; verify in Unit 6 if the dev client is available on Android; not a blocker for iOS-simulator-only delivery |
| Asset file sizes inflate the binary | 2x retina PNGs at the sizes used (≤ 1024×1024) are small enough not to matter for a single auth screen; revisit only if bundle size regresses |

## Documentation / Operational Notes

- **README (if created):** note that the app's user-facing name is "Hi Honey" but the technical slug / scheme / bundle remain `workflowtest`.
- **CLAUDE.md:** no update required — `workflow-test` remains the repo identifier throughout that file.
- **EAS:** no rebuild flag needed for a pure JS change; `eas update --branch preview` is sufficient for shipping post-merge (per `CLAUDE.md` + mobile-workflow doc).
- **Figma:** bookmark node `4:2` in issue #1 — we'll re-reference it during visual QA.

## Sources & References

- **Origin issue:** [issue #1](https://github.com/nipunvv/WorkflowTest/issues/1)
- **Figma frame:** node `4:2` — https://www.figma.com/design/CLEcJLTTd4L1JDDjc6KDwl/Untitled?node-id=4-2
- Related files:
  - `app/(auth)/login.tsx`
  - `lib/auth-context.tsx`
  - `app.json`
  - `tailwind.config.js`
  - `jest-setup.ts`
  - `.maestro/launch.yaml`
  - `DESIGN.md`
  - `CLAUDE.md`
- Related future issues (not created yet): "Reconcile DESIGN.md tokens with Figma palette", "Convert auth assets from PNG to SVG via react-native-svg"

## Verification (end-to-end)

1. **Type-check:** `npx tsc --noEmit` — clean
2. **Lint:** `npm run lint` — clean
3. **Unit / integration tests:** `npm test` — all pass (includes the new `login.test.tsx`)
4. **E2E smoke test:** `maestro test .maestro/launch.yaml` — passes on a dev-client build
5. **Live OAuth walk-through:** run `npx expo start --dev-client`, tap "Sign in with Google" on the redesigned screen, complete Google consent in `ASWebAuthenticationSession`, confirm the app lands on `(tabs)` without errors
6. **Legal links:** tap each legal link, confirm `WebBrowser.openBrowserAsync` opens an in-app browser sheet
7. **Visual parity:** side-by-side with Figma node `4:2` on iPhone 17 simulator; dp tolerance ~1px

If any step fails, iterate on the failing unit before marking complete.

---

**Post-approval note:** This plan currently lives at `/Users/nipun/.claude/plans/flickering-seeking-blanket.md` (the plan-mode scratch path). On approval via `ExitPlanMode`, copy it to `docs/plans/2026-04-21-001-feat-auth-sign-in-redesign-plan.md` as the canonical repo-tracked plan, then proceed to `/ce:work` or TDD the first unit manually.
