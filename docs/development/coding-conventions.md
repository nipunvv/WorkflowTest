# Coding Conventions

## Purpose

A summary of the coding rules for this project. **`CLAUDE.md` at the repo root is the authoritative source.** This file summarizes and links — it does not duplicate. Read `CLAUDE.md` first.

## Non-negotiables (from CLAUDE.md)

- **Test-driven development.** Tests are written before implementation. Never modify a test to make it pass — fix the implementation.
- **Never commit until explicitly asked.**

## React Native rules

- Use `<View>`, `<Text>`, `<Pressable>` only. No HTML elements. No `<TouchableOpacity>`.
- Every bare string must be inside `<Text>`. A bare string as a direct child of `<View>` crashes at runtime.
- Use `FlatList` / `SectionList` for scrollable lists. Not `ScrollView` + `.map()`.
- No `React.memo` / `useMemo` / `useCallback` by default — the React Compiler handles memoization. Only use them when profiling shows the compiler missed a case.
- Don't render falsy values as JSX children. Use ternary or `!!x && ...` patterns.
- Never store scroll position in `useState`. Use `useSharedValue` or `useRef`.

## Styling

- NativeWind `className` for Tailwind-expressible styles.
- Inline `style` for runtime-computed values.
- `StyleSheet.create()` only when NativeWind can't express the style.
- `borderCurve: 'continuous'` inline (cannot be expressed as a Tailwind class).
- Tailwind v3.4 only — do not upgrade to v4.

## Routing

- Expo Router v6, file-based, typed routes enabled.
- Groups: `(auth)` (unauthenticated), `(tabs)` (authenticated home), `(onboarding)` (authenticated flow).
- `Stack.Protected` guards are set in `app/_layout.tsx`.

## Auth / secrets

- Never put secrets in `EXPO_PUBLIC_*` variables — they bundle into the binary.
- The anon key is the one exception: it is the public publishable key and is designed to be shipped.

## Accessibility

- Every interactive element gets `accessibilityLabel` and `accessibilityRole`.
- Verify with VoiceOver (iOS) and TalkBack (Android) before shipping.

## Performance

- Animate `transform` and `opacity` only (GPU-accelerated). Don't animate `width`, `height`, `top`, `margin`, or `padding`.
- React Compiler is enabled — no hand-written memoization by default.
- Destructure hook returns at the top of render (compiler compat).
- Don't dot into objects inline (compiler compat).

## Images

- Use `Image` from `expo-image`, not React Native's `Image`. Exceptions: tiny bundled assets only.

## Key files

| File | Contents |
|---|---|
| `CLAUDE.md` | Full authoritative rules, gotchas, commands, architecture overview |
| `DESIGN.md` | Design token source of truth |
| `tailwind.config.js` | Tailwind token registry |
| `tsconfig.json` | Path aliases (`@/`) |
| `eslint.config.js` | ESLint rules (expo flat config) |
| `.prettierrc` | Prettier config (Tailwind class sorting) |

## Cross-refs

- `CLAUDE.md` — read this; it is the primary source
- `docs/architecture/styling.md` — styling system details
- `docs/development/testing.md` — TDD workflow
