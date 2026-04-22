# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Non-negotiables

- This project strictly follows test-driven development.
- Never modify or delete an existing test to make it pass. If a test fails, fix the implementation — not the test.
- Never commit until I say so.

## Mobile stack

- **Expo + Expo Router** with file-based routing in `app/`. No `pages/`, no `next.config.*`.
- **React Native components only:** `<View>`, `<Text>`, `<Pressable>`. Never HTML elements. Never the deprecated `<TouchableOpacity>`. **Every string goes inside `<Text>`** — a bare string child of `<View>` crashes at runtime.
- **NativeWind** for styling (Tailwind classes via `className`). Use `StyleSheet.create()` as a fallback when NativeWind can't express the style (animated values, runtime-computed values).
- **Supabase** for database + auth. Client-side public vars use the `EXPO_PUBLIC_` prefix.
- **Secrets rule:** never put a secret in an `EXPO_PUBLIC_*` variable — those bundle into the distributed binary and are trivially extractable. Any call that needs a secret key goes through a backend API (Supabase Edge Function, server route, etc.) that holds the secret server-side.
- **Testing:** Jest + React Native Testing Library for unit/integration; Maestro YAML flows for E2E. Details in *Testing conventions* below.
- **Deploy via EAS** — `eas build`, `eas submit`. Not Vercel. Not Netlify. (OTA via `eas update` is not wired up yet — `expo-updates` is not installed.)
- **Performance:**
  - Use `FlatList` / `SectionList` for any scrollable list beyond a handful of items. Don't `ScrollView` + `.map()` — `ScrollView` mounts every child upfront; virtualizers render only what's visible. (Reach for `FlashList` if/when items get heavy enough to jank FlatList — not installed yet.)
  - **React Compiler is enabled** (`experiments.reactCompiler: true` in `app.json`). Do NOT hand-write `React.memo` / `useMemo` / `useCallback` as a default — the compiler inserts memoization for you. Only reach for them when profiling shows the compiler missed a case.
  - **React Compiler compat:** use `.get()` / `.set()` on Reanimated shared values (not `.value`), and destructure hook returns at the top of render (`const { push } = useRouter()`, not `router.push(…)`). Dotting into objects creates new references each render and opts the compiler out of memoization.
  - **Don't render falsy values as JSX.** `{count && <Text>{count} items</Text>}` crashes when `count === 0` (falsy but JSX-renderable). Use `count ? <Text>…</Text> : null`, `!!count && …`, or an early return. Enable `react/jsx-no-leaked-render` in ESLint to catch it.
  - **Never store scroll position in `useState`.** Scroll fires every frame — state updates thrash renders. Use `useSharedValue` + `useAnimatedScrollHandler` for animations, or a `useRef` for non-reactive tracking.
- **Animations (Reanimated + Gesture Handler are installed):**
  - Animate `transform` (translate / scale / rotate) and `opacity` only — GPU-accelerated, no layout recalculation. Animating `width` / `height` / `top` / `margin` / `padding` re-runs layout every frame and janks.
  - For animated press states (scale, opacity feedback), use `GestureDetector` + `Gesture.Tap()` + a shared value — not `Pressable`'s `onPressIn`/`onPressOut`. Gesture callbacks run on the UI thread as worklets; Pressable round-trips through JS.
  - For derived shared values, use `useDerivedValue` (returns a value, tracks deps automatically) — not `useAnimatedReaction` (reserve that for side effects like haptics or `runOnJS`).
  - State should represent real state (`pressed`, `progress`, `isOpen`), not visual output (`scale`, `opacity`). Derive visuals via `interpolate(pressed.get(), [0, 1], [1, 0.95])` — single source of truth, easy to extend to more properties.
- **Images:** use `Image` from `expo-image` (already installed) over RN's `Image`. Memory-efficient caching, blurhash placeholders, `contentFit`, `transition`, `priority`, `cachePolicy`. Reserve RN's `Image` for tiny bundled assets.
- **Native UI primitives — prefer over JS reimplementations:**
  - **Bottom sheets:** use `Modal` with `presentationStyle="formSheet"` (or Expo Router's `presentation: 'formSheet'` stack option). Native gestures, keyboard avoidance, a11y for free.
  - **Menus / dropdowns:** when needed, reach for `zeego` (not installed yet) — wraps native `UIMenu` / Android popup menu. Don't roll a JS dropdown.
- **Accessibility:** every interactive element gets `accessibilityLabel` and `accessibilityRole`. Verify with VoiceOver (iOS) and TalkBack (Android) before shipping.
- **Deep links:** required for OAuth callbacks and universal-link handoff. The app scheme is set in `app.json` (`scheme: "workflowtest"`).
- **Platform:** prefer cross-platform. `Platform.OS` / `Platform.select` checks are allowed but used sparingly and only for genuine behavioral differences (haptics strength, safe-area shape, back-gesture handling).

## Mobile gotchas to watch for

- **Expo Go vs development builds:** switch to a dev client the moment a native module isn't supported in Expo Go. Don't waste time debugging "it works in Expo Go but not in a build" — build the dev client and move on.
- **App Store review adds 1–3 day latency.** For JS-only hotfixes, ship via `eas update` instead of a new native build.
- **Simulators don't support camera, push notifications, or haptics.** Test those on real devices.
- **Don't lose the Android keystore.** EAS stores it, but treat it as irreplaceable — losing it means you can never update the app on the Play Store under the same package.
- **Separate Supabase projects for dev and prod.** Never share a database across environments; a single migration mistake corrupts real user data.

## Commands

```bash
# Dev server (Metro)
npx expo start                      # Expo Go or dev-client connect
npx expo start --dev-client         # force dev-client (after EAS dev build installed)

# Tests
npm test                            # Jest + RNTL (watch: npm run test:watch)
npx jest path/to/file.test.ts       # single file
npx jest -t "partial test name"     # single test by name
maestro test .maestro/              # E2E (dev-client build must be installed)

# Code quality
npm run lint                        # expo lint (ESLint flat config)
npm run format                      # Prettier (Tailwind class sort enabled)
npx tsc --noEmit                    # type-check

# EAS builds
npx eas build --platform ios --profile development  # cloud build for simulator
npx eas build:run -p ios --latest                   # download + install latest build on sim
```

## Architecture

### Auth flow (Supabase Google OAuth via PKCE)

Browser-based PKCE flow, not native Google Sign-In. Trace:

1. `lib/auth-context.tsx` `signInWithGoogle()` calls `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } })` → returns an authorize URL.
2. `WebBrowser.openAuthSessionAsync(url, redirectTo)` opens the URL in `ASWebAuthenticationSession`.
3. Supabase brokers Google consent and redirects to `redirectTo` with `?code=...`.
4. `supabase.auth.exchangeCodeForSession(code)` completes the flow.
5. `onAuthStateChange` listener in `AuthProvider` updates `session` state.

`app/_layout.tsx` gates routes with `<Stack.Protected guard={!!session}>` around `(onboarding)` and `<Stack.Protected guard={!session}>` around `(auth)`. While `loading === true`, it renders `null` to avoid flashing the wrong stack on cold start. `unstable_settings.anchor = '(onboarding)'` makes Step 1 the landing screen for any authed session; there is no post-onboarding destination yet (the default `(tabs)` / `modal` scaffolding was removed).

### The non-obvious pieces

- **`lib/secure-store-adapter.ts` is load-bearing.** iOS Keychain has a ~2KB per-item limit; Supabase sessions (access + refresh + provider tokens) routinely exceed it. The adapter transparently splits values into `${key}.0`, `${key}.1`, … with a `${key}.count` marker. Without chunking, `setItem` fails silently and the user hits an infinite login loop.
- **`AppState` listener in `app/_layout.tsx` drives token refresh.** Supabase does NOT auto-refresh in backgrounded React Native apps. The listener calls `supabase.auth.startAutoRefresh()` on `active` and `stopAutoRefresh()` otherwise.
- **`import 'react-native-url-polyfill/auto'` must be the first line** in `app/_layout.tsx` (before any Supabase import). Hermes's `URL` is incomplete and Supabase depends on it.
- **`lib/supabase.ts` throws at import if env vars missing.** `jest-setup.ts` injects placeholder values so tests can import modules that transitively load the client. Don't change to lazy-throw without updating tests.
- **`detectSessionInUrl: false` and `flowType: 'pkce'` are required** — the defaults (true, implicit) break React Native.

### OAuth redirect URL quirks

The redirect URL sent to Supabase depends on the runtime:

| Runtime | `Linking.createURL('auth/callback')` returns |
|---|---|
| Expo Go | `exp://<LAN_IP>:8081/--/auth/callback` (IP changes per network) |
| Dev client / standalone | `workflowtest://auth/callback` (stable) |

Supabase's Redirect URL allowlist matches the host literally — `**` wildcards only cover the path, not the host/port. So every LAN IP you develop from needs its own allowlist entry in Expo Go, OR use a dev client and the `workflowtest://` URL works everywhere.

Supabase's **Site URL** is the fallback when `redirect_to` doesn't match the allowlist. Keep it set to a URL the app can actually handle (`workflowtest://auth/callback` for dev-client, or the current LAN `exp://` URL for Expo Go).

### Post-sign-in flow

Post-login routing is driven entirely by `unstable_settings.anchor = '(onboarding)'` — when `Stack.Protected` admits the authed routes, Expo Router lands on `(onboarding)/step-1.tsx` as the initial screen. There is no explicit redirect hook. A previous `useRedirectOnSignIn` hook was removed when the `(tabs)` stack was deleted and onboarding became the sole authed landing.

Known limitation: every authed session (fresh sign-in OR cold-start session-restore) currently lands on Step 1 regardless of whether the user has already completed onboarding. A profile-completion gate is a tracked follow-up; the `Stack.Protected` pattern will accommodate it with a third guard once the `profiles` table exists.

Do NOT add a second `onAuthStateChange` subscriber for navigation side-effects — it creates listener-ordering races against `AuthProvider`'s subscriber. When the profile gate lands, extend `AuthContext` to expose the profile state and guard the `(onboarding)` / future-tabs groups off it.

### Routing layout

Expo Router v6 with typed routes enabled.

```
app/
  _layout.tsx        # AuthProvider wrapper, Stack.Protected guards, AppState refresh
  (auth)/            # Unauth group — only reachable when !session
    _layout.tsx
    login.tsx
  (onboarding)/      # Authed group — onboarding flow; anchor is step-1
    _layout.tsx
    step-1.tsx       # Basic Info (First Name, DOB, Diagnosis Date)
    step-2.tsx       # Symptoms multi-select
    step-3.tsx       # Placeholder stub — real Step 3 is a separate issue
```

There is no post-onboarding destination yet; the default `create-expo-app` `(tabs)` group, Home/Explore screens, and `modal.tsx` were removed as part of wiring the onboarding flow.

### NativeWind v4

- `tailwind.config.js` includes `nativewind/preset`.
- `global.css` is imported once in `app/_layout.tsx`.
- `babel.config.js` sets `jsxImportSource: "nativewind"` + `nativewind/babel` preset.
- Tailwind v3.4.x is pinned (NativeWind v4 doesn't support Tailwind v4).
- `tailwind.config.js` now carries **9 auth-screen tokens** (`bg-primary`, `text-heading`, `accent-primary`, etc.) and **11 onboarding-step-1 tokens** (`bg-card`, `bg-input`, `border-input-active`, `bg-progress-fill`, etc.), plus **3 `boxShadow` tokens** (`button`, `card`, `next`). All values are Figma-derived and diverge intentionally from `DESIGN.md`'s ramp — see ADR 004.

### `DateField` wrapper pattern for custom synthetic events

When a component needs to expose a custom event prop (e.g. `onChangeDate`) that isn't a standard RN prop, wrap it in a thin component:

```tsx
function DateField({ testID, accessibilityLabel, value, onChangeDate, ... }: DateFieldProps) {
  // owns modal open state; onChangeDate is a first-class typed prop
}
```

RNTL's `fireEvent(node, 'changeDate', date)` walks the tree from the queried node upward until it finds `onChangeDate` — the event name capitalizes to the prop name. Two gotchas:
- Use `fireEvent(node, 'changeDate', ...)` **not** `fireEvent(node, 'onChangeDate', ...)` — RNTL auto-prefixes `on`, so the latter resolves to `props.onOnChangeDate` (no-op).
- The wrapper component does not need to be the directly queried node — RNTL walks up to a parent that declares the prop.

See `app/(onboarding)/step-1.tsx` and `docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md` (Pattern 2) for the full pattern.

## Testing conventions

- Unit / integration tests colocate in `__tests__/` dirs next to the code they test.
- `jest-setup.ts` pre-mocks `expo-secure-store` (in-memory), `expo-web-browser`, `expo-linking`, and `react-native-reanimated`. Override per-test with `jest.mocked(...)` or fresh `jest.mock` calls.
- Path alias `@/` → repo root (set in `tsconfig.json` and mirrored in `jest` config).
- Mock `expo-router` **per test file** (not globally in `jest-setup.ts`) — future screens may need different router behavior per-test. Expose `useRouter: jest.fn()` returning `{ push, back, replace, dismiss }` as `jest.fn()`.
- **RED scaffolding rule:** before committing a failing test suite, ensure every failure reads "Unable to find …" not "Cannot find module …". Module-resolution failures are broken RED — add a minimal stub (empty `<View testID="...">`) and route registration first.

### Maestro flows

- `.maestro/launch.yaml` — app launch smoke test.
- `.maestro/onboarding-step-1.yaml` — fill Basic Info form, toggle "Not sure", tap Next. Requires a fresh dev-client build (new native date-picker module) and a live Supabase session.
- Maestro identifies apps by native `appId` (`com.workflowtest.app`), so it **cannot attach to Expo Go** (which runs as `host.exp.Exponent`). A dev-client or standalone build must be installed first.
- The Google OAuth consent screen runs inside `ASWebAuthenticationSession` (a system Safari sheet) and cannot be driven by Maestro. Post-auth flows are best covered by Jest/RNTL integration tests with a mocked auth context.

## EAS

- `eas.json` defines `development` (simulator-only dev client), `preview`, and `production` profiles.
- Currently configured for iOS simulator builds — no Apple Developer account needed.
- `app.json` holds `scheme: "workflowtest"` and `ios.bundleIdentifier: "com.workflowtest.app"`. These are referenced by Supabase Redirect URL config and Maestro `appId`; changing them requires updating both.
- **Rebuild the dev-client** when new native modules are added. PR #6 added `@react-native-community/datetimepicker@8.4.4` and `react-native-modal-datetime-picker@^18.0.0` (both native, registered via config plugin in `app.json`). Any build predating PR #6 will crash on the date-picker screen.

## Environment

`.env` is gitignored; `.env.example` is committed. Required:

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

The `EXPO_PUBLIC_` prefix exposes these to the client bundle (intentional — the anon/publishable key is safe to ship).

## Design system

Read `DESIGN.md` for the design system: colors, typography, spacing, layout, borders & shape, elevation & shadows, motion, iconography, and components.

**Mobile adjustments the DESIGN.md tokens need when applied in code:**

- Use **dp units** (React Native's logical pixels), not `px`. The raw numbers in `DESIGN.md` translate directly.
- **Flexbox only.** No CSS Grid. Multi-column layouts use `flexDirection: "row"` + `flexWrap` or `FlatList` with `numColumns`.
- Breakpoints via **`useWindowDimensions()`**, not media queries. NativeWind's `sm:`/`md:` variants map to width buckets in `tailwind.config.js`.
- **Spacing:** `gap` on the parent for space between siblings, `padding` for space within. Don't default to `margin*` on children.
- **Rounded corners:** pair `borderRadius` with `borderCurve: 'continuous'` — smoother iOS corners (ignored on Android, free tweak).
- **Shadows:** use CSS `boxShadow` string syntax (`boxShadow: '0 2px 8px rgba(0,0,0,0.1)'`) — RN 0.76+ cross-compiles it to iOS shadow props + Android elevation. The legacy `shadowColor` / `shadowOffset` / `shadowOpacity` / `shadowRadius` + `elevation` split is only needed on older RN.
- **Safe areas:** on the root `ScrollView` of a screen, prefer `contentInsetAdjustmentBehavior="automatic"` over wrapping content in `SafeAreaView` or reading `useSafeAreaInsets()` by hand — iOS handles keyboard and dynamic toolbars natively without layout shifts. Use `useSafeAreaInsets` for non-scroll screens.
- Respect platform conventions: **status bar** per screen, **back-gesture** on Android, iOS swipe-back on stack screens.

## Housekeeping

- **Add `.claude/` to `.gitignore`.** Worktree and session artifacts don't belong in version control. (Currently missing from this repo's `.gitignore`.)
- **Don't overload this file with documentation.** Longer guides, onboarding docs, and runbooks go in a `docs/` folder; this file is the map, not the territory.
- **Put project context in files, not chat messages.** Worktrees and sub-agents read files, not conversation history — anything that matters to future work must live on disk.
- **`docs/solutions/`** — documented solutions and learnings from past problems (bugs, best practices, workflow patterns), organized by category (`best-practices/`, `runtime-errors/`, etc.) with YAML frontmatter (`module`, `tags`, `problem_type`). Relevant when implementing or debugging in documented areas.
- **Consider a gitignored `CLAUDE.local.md`** for personal preferences (editor quirks, individual workflow overrides) that shouldn't live in the shared file. Not created here — flagging as an option.
