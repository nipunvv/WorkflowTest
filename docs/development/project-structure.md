# Project Structure

## Purpose

An annotated tour of the repository layout. Describes what each directory and key file does.

## Top-level

```
workflow-test/
├── app/                    # Expo Router file-based routes
├── assets/                 # Static images
├── components/             # Reusable UI components
├── constants/              # Theme colors + fonts (legacy scaffold)
├── docs/                   # This documentation
├── hooks/                  # Custom React hooks
├── lib/                    # Core library code (auth, Supabase)
├── .maestro/               # Maestro E2E flow definitions
├── app.json                # Expo app configuration
├── babel.config.js         # Babel config (NativeWind preset)
├── CLAUDE.md               # Project instructions for Claude Code
├── DESIGN.md               # Figma-sourced design tokens
├── eas.json                # EAS build profiles
├── eslint.config.js        # ESLint flat config
├── global.css              # Tailwind directives (imported once in _layout)
├── jest-setup.ts           # Jest global mocks
├── metro.config.js         # Metro bundler config (NativeWind)
├── nativewind-env.d.ts     # TypeScript ambient declarations for NativeWind
├── package.json
├── tailwind.config.js      # Token definitions + NativeWind preset
├── tsconfig.json           # TypeScript config; defines @/ path alias
└── .env.example            # Required env vars template (gitignored: .env)
```

## `app/` — Expo Router routes

```
app/
├── _layout.tsx             # Root layout: AuthProvider, Stack.Protected guards,
│                           # AppState refresh listener, useRedirectOnSignIn
├── modal.tsx               # Modal screen (scaffold leftover, unused by product)
├── (auth)/
│   ├── _layout.tsx         # Auth group layout (headerless Stack)
│   ├── login.tsx           # Sign-in screen
│   └── __tests__/
│       └── login.test.tsx
├── (tabs)/
│   ├── _layout.tsx         # Tab bar layout (Home, Explore)
│   ├── index.tsx           # Home screen (Expo scaffold placeholder)
│   └── explore.tsx         # Explore screen (Expo scaffold placeholder)
└── (onboarding)/
    ├── _layout.tsx         # Onboarding group layout (headerless Stack)
    ├── step-1.tsx          # Basic info form (shipped)
    ├── step-2.tsx          # Stub ("Step 2 coming soon")
    └── __tests__/
        └── step-1.test.tsx
```

Route groups in parentheses do not add a URL segment. `(auth)` → `/login`, `(onboarding)` → `/onboarding/step-1`, `(tabs)` → tab root.

## `lib/` — core library

| File | Contents |
|---|---|
| `auth-context.tsx` | `AuthProvider` component, `useAuth()` hook, `signInWithGoogle()` implementation |
| `supabase.ts` | Supabase JS client creation; injects `ChunkedSecureStoreAdapter` |
| `secure-store-adapter.ts` | iOS Keychain chunking adapter |

## `hooks/` — custom hooks

| File | Contents |
|---|---|
| `use-redirect-on-sign-in.ts` | Listens for `SIGNED_IN` event; routes to onboarding |
| `use-color-scheme.ts` | Wraps RN `useColorScheme`; returns `'light'` as fallback |
| `use-color-scheme.web.ts` | Web-specific variant |
| `use-theme-color.ts` | Returns a color from `constants/theme.ts` based on color scheme (used by scaffold components) |

## `components/` — reusable components

All components here are from the Expo scaffold. None are used by the product screens (login, onboarding).

| File | Contents |
|---|---|
| `external-link.tsx` | Link that opens in the system browser |
| `haptic-tab.tsx` | Tab bar button with haptic feedback on press |
| `hello-wave.tsx` | Animated waving hand (Explore screen decoration) |
| `parallax-scroll-view.tsx` | Header-parallax scroll view (Explore screen) |
| `themed-text.tsx` | Text that reads from `constants/theme.ts` colors |
| `themed-view.tsx` | View that reads from `constants/theme.ts` colors |
| `ui/collapsible.tsx` | Animated collapsible section |
| `ui/icon-symbol.tsx` | SF Symbol icon wrapper (Android fallback) |
| `ui/icon-symbol.ios.tsx` | SF Symbol icon (iOS-specific, uses `expo-symbols`) |

## `assets/images/` — static images

| File | Used by |
|---|---|
| `auth-decorations.png` | Login screen background decoration |
| `auth-logo-glow.png` | Login screen logo glow halo |
| `google-logo.png` | Google "G" logo in the sign-in button |
| `icon.png` | App icon |
| `splash-icon.png` | Splash screen image |
| `android-icon-*.png` | Android adaptive icon layers |
| `favicon.png` | Web favicon |
| `react-logo*.png` | Expo scaffold (Explore screen) |
| `partial-react-logo.png` | Expo scaffold (Home screen header) |

## `.maestro/` — E2E flows

| File | Contents |
|---|---|
| `config.yaml` | Global Maestro config |
| `launch.yaml` | App launch flow |
| `onboarding-step-1.yaml` | Onboarding Step 1 smoke test (RED — not passing on any build yet) |
| `README.md` | Maestro limitations and preconditions |

## `docs/` — this documentation

```
docs/
├── index.md
├── architecture/
│   ├── authentication.md
│   ├── secure-store-adapter.md
│   ├── routing.md
│   ├── state-management.md
│   ├── session-refresh.md
│   └── styling.md
├── authentication/
│   └── sign-in-screen.md
├── onboarding/
│   ├── step-1-basic-info.md
│   └── post-signin-redirect.md
├── development/
│   ├── setup.md
│   ├── project-structure.md  ← you are here
│   ├── testing.md
│   └── coding-conventions.md
├── plans/                    # Implementation plans (one per feature)
└── solutions/                # Best-practice research notes
```

## Key configuration files

| File | Key settings |
|---|---|
| `app.json` | App name ("Hi Honey"), `scheme: "workflowtest"`, `bundleIdentifier: "com.workflowtest.app"`, `experiments.reactCompiler: true`, `experiments.typedRoutes: true`, `newArchEnabled: true` |
| `tsconfig.json` | `"@/*": ["./*"]` path alias maps `@/` to repo root |
| `tailwind.config.js` | Color tokens, NativeWind preset, Tailwind v3.4 |
| `eas.json` | `development` (simulator dev-client), `preview`, `production` build profiles |
| `jest-setup.ts` | Injects SUPABASE env vars; mocks `expo-secure-store`, `expo-web-browser`, `expo-linking`, `react-native-reanimated` |
