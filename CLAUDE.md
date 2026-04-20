# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Non-negotiables

- This project strictly follows test-driven development.
- Never modify or delete an existing test to make it pass. If a test fails, fix the implementation — not the test.
- Never commit until I say so.

## Mobile stack

- **Expo + Expo Router** with file-based routing in `app/`. No `pages/`, no `next.config.*`.
- **React Native components only:** `<View>`, `<Text>`, `<Pressable>`. Never HTML elements. Never the deprecated `<TouchableOpacity>`.
- **NativeWind** for styling (Tailwind classes via `className`). Use `StyleSheet.create()` as a fallback when NativeWind can't express the style (animated values, runtime-computed values).
- **Supabase** for database + auth. Client-side public vars use the `EXPO_PUBLIC_` prefix.
- **Secrets rule:** never put a secret in an `EXPO_PUBLIC_*` variable — those bundle into the distributed binary and are trivially extractable. Any call that needs a secret key goes through a backend API (Supabase Edge Function, server route, etc.) that holds the secret server-side.
- **Testing:** Jest + React Native Testing Library for unit/integration; Maestro YAML flows for E2E. Details in *Testing conventions* below.
- **Deploy via EAS** — `eas build`, `eas submit`. Not Vercel. Not Netlify. (OTA via `eas update` is not wired up yet — `expo-updates` is not installed.)
- **Performance:**
  - Use `FlatList` / `SectionList` for lists larger than ~20 items. Don't `ScrollView` + `.map()` at that size.
  - **React Compiler is enabled** (`experiments.reactCompiler: true` in `app.json`). Do NOT hand-write `React.memo` / `useMemo` / `useCallback` as a default — the compiler inserts memoization for you. Only reach for them when profiling shows the compiler missed a case.
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

`app/_layout.tsx` gates routes with `<Stack.Protected guard={!!session}>` around `(tabs)` and `<Stack.Protected guard={!session}>` around `(auth)`. While `loading === true`, it renders `null` to avoid flashing the wrong stack on cold start.

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

### Routing layout

Expo Router v6 with typed routes enabled.

```
app/
  _layout.tsx        # AuthProvider wrapper, Stack.Protected guards, AppState refresh
  (auth)/            # Unauth group — only reachable when !session
    _layout.tsx
    login.tsx
  (tabs)/            # Authed group — only reachable when session
    _layout.tsx
    index.tsx        # Home (has temp sign-out button)
    explore.tsx
  modal.tsx
```

### NativeWind v4

- `tailwind.config.js` includes `nativewind/preset`.
- `global.css` is imported once in `app/_layout.tsx`.
- `babel.config.js` sets `jsxImportSource: "nativewind"` + `nativewind/babel` preset.
- Tailwind v3.4.x is pinned (NativeWind v4 doesn't support Tailwind v4).

## Testing conventions

- Unit / integration tests colocate in `__tests__/` dirs next to the code they test.
- `jest-setup.ts` pre-mocks `expo-secure-store` (in-memory), `expo-web-browser`, `expo-linking`, and `react-native-reanimated`. Override per-test with `jest.mocked(...)` or fresh `jest.mock` calls.
- Path alias `@/` → repo root (set in `tsconfig.json` and mirrored in `jest` config).

### Maestro limitations

- Maestro identifies apps by native `appId` (`com.workflowtest.app`), so it **cannot attach to Expo Go** (which runs as `host.exp.Exponent`). A dev-client or standalone build must be installed first.
- The Google OAuth consent screen runs inside `ASWebAuthenticationSession` (a system Safari sheet) and cannot be driven by Maestro. Post-auth flows are best covered by Jest/RNTL integration tests with a mocked auth context.

## EAS

- `eas.json` defines `development` (simulator-only dev client), `preview`, and `production` profiles.
- Currently configured for iOS simulator builds — no Apple Developer account needed.
- `app.json` holds `scheme: "workflowtest"` and `ios.bundleIdentifier: "com.workflowtest.app"`. These are referenced by Supabase Redirect URL config and Maestro `appId`; changing them requires updating both.

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
- Shadows: translate to `shadowColor` / `shadowOffset` / `shadowOpacity` / `shadowRadius` on iOS **and** `elevation` on Android. A single CSS `box-shadow` doesn't cross-compile.
- Respect platform conventions: **safe areas** (`react-native-safe-area-context`), **status bar** per screen, **back-gesture** on Android, iOS swipe-back on stack screens.

## Housekeeping

- **Add `.claude/` to `.gitignore`.** Worktree and session artifacts don't belong in version control. (Currently missing from this repo's `.gitignore`.)
- **Don't overload this file with documentation.** Longer guides, onboarding docs, and runbooks go in a `docs/` folder; this file is the map, not the territory.
- **Put project context in files, not chat messages.** Worktrees and sub-agents read files, not conversation history — anything that matters to future work must live on disk.
- **Consider a gitignored `CLAUDE.local.md`** for personal preferences (editor quirks, individual workflow overrides) that shouldn't live in the shared file. Not created here — flagging as an option.
