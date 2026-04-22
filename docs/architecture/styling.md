# Styling

## Purpose

Explains how the app is styled: NativeWind v4 setup, the Tailwind token registry, how it interplays with `StyleSheet.create()` and inline `style` props, and the relationship to `DESIGN.md`.

## Scope

- NativeWind v4 + Tailwind v3.4 configuration
- Token definitions in `tailwind.config.js`
- When to use `className` vs `style` vs `StyleSheet.create()`
- `DESIGN.md` as the design-token source of truth

**Not covered:** individual screen styling decisions; animation (Reanimated); `DESIGN.md` content (read that file directly).

## How NativeWind works

NativeWind compiles Tailwind class names to React Native styles at build time (via the `nativewind/babel` Babel preset) and at runtime (for dynamic classes). The setup:

1. `babel.config.js` — `jsxImportSource: "nativewind"` + `"nativewind/babel"` preset. This lets NativeWind intercept JSX and inject style resolution.
2. `tailwind.config.js` — includes `nativewind/preset` and extends the theme with project-specific color tokens.
3. `global.css` — three-line file importing Tailwind's base/components/utilities layers. Imported once in `app/_layout.tsx`.
4. `nativewind-env.d.ts` — TypeScript ambient declarations so `className` props type-check on React Native components.

## Token registry

`tailwind.config.js` defines all project color tokens under `theme.extend.colors`. They are organized by the screen that introduced them:

### Auth screen tokens (issue #1)

| Token | Value | Usage |
|---|---|---|
| `bg-primary` | `#fff8f0` | Screen background |
| `bg-logo` | `#d4a574` | Logo container background |
| `bg-badge` | `rgba(156,175,136,0.15)` | Privacy badge background |
| `button-primary-bg` | `#1f1a14` | Google sign-in button |
| `text-heading` | `#33291f` | Headings |
| `text-body` | `#736659` | Body copy |
| `text-badge` | `#617354` | Badge text |
| `text-subtle` | `#8c8073` | Secondary text |
| `accent-primary` | `#d4a574` | Links, accents |

### Onboarding Step 1 tokens (issue #2)

| Token | Value | Usage |
|---|---|---|
| `bg-card` | `#ffffff` | Card container |
| `bg-input` | `#faf7f5` | Text input background |
| `bg-input-disabled` | `#f2f0ed` | Disabled input background |
| `bg-next` | `#d4a574` | Next button background |
| `bg-progress-track` | `rgba(156,175,136,0.2)` | Progress bar track |
| `bg-progress-fill` | `#9caf88` | Progress bar fill |
| `border-input-active` | `#d4a574` | Input active border |
| `border-input-default` | `#e0dbd6` | Input default border |
| `border-input-disabled` | `#e5e3e0` | Input disabled border |
| `text-placeholder` | `#a6998c` | Input placeholder text |
| `text-placeholder-disabled` | `#b2a699` | Disabled placeholder text |

### boxShadow extensions

```js
boxShadow: {
  button: "0 4px 12px rgba(0,0,0,0.1)",
  card:   "0 4px 24px rgba(212,165,116,0.08)",
  next:   "0 4px 16px rgba(212,165,116,0.3)",
}
```

These use RN 0.76+ cross-platform `boxShadow` string syntax (compiles to iOS shadow props + Android elevation).

## DESIGN.md as source of truth

`DESIGN.md` contains the full design system pulled from Figma (last synced 2026-04-14): primitive color scales, semantic aliases, typography, spacing, elevation, motion, and component specs.

**Current divergence between `DESIGN.md` and the code:**

- `DESIGN.md` defines full semantic aliases (e.g., `Surface/Primary`, `Text/Heading`) in terms of the primitive scales. `tailwind.config.js` uses a flatter naming convention (`bg-primary`, `text-heading`) that roughly corresponds but is not a direct 1:1 mapping.
- Some hex values are written inline in component `style` props rather than using a Tailwind class. Examples: `borderColor: '#d4a574'` in the `TextInput` in `step-1.tsx` and inline text colors in `DateField`. These should be migrated to tokens as the codebase matures.
- Dark mode tokens are not yet defined in `tailwind.config.js`. `DESIGN.md` only documents light mode. Dark mode is handled by `@react-navigation/native`'s `DarkTheme`/`DefaultTheme` for the navigation chrome, but the product screens are light-only for now.

## When to use what

| Situation | Approach |
|---|---|
| Static Tailwind-expressible styles | `className="..."` |
| Styles that depend on runtime values (e.g., `opacity: canProceed ? 1 : 0.5`) | Inline `style={{ ... }}` |
| Animated values (Reanimated shared values) | `useAnimatedStyle` + `Animated.View` |
| Rarely-changing, complex static styles | `StyleSheet.create()` — avoids object creation on every render |

## Key files

| File | Role |
|---|---|
| `tailwind.config.js` | Token definitions + NativeWind preset |
| `global.css` | Tailwind directives; imported once |
| `babel.config.js` | NativeWind Babel preset |
| `nativewind-env.d.ts` | TypeScript ambient declarations |
| `DESIGN.md` | Figma-sourced design tokens (source of truth) |
| `constants/theme.ts` | Legacy `Colors` + `Fonts` from the Expo scaffold; used only by `(tabs)/_layout.tsx` tab bar tint. Not used by product screens. |

## Dependencies

- `nativewind` ^4.2.3
- `tailwindcss` ^3.4.19 (NativeWind v4 does not support Tailwind v4)
- `babel-preset-expo` (included in `expo`)

## Gotchas

- **Tailwind v4 is not compatible with NativeWind v4.** `package.json` pins `tailwindcss ^3.4.19`. Do not upgrade Tailwind to v4 until NativeWind publishes v4 support.
- **`constants/theme.ts` is a scaffold artifact.** It defines a blue `tint` color used only by the tab bar. Product screens use NativeWind tokens exclusively. Don't add new color values here.
- **`borderCurve: 'continuous'`** is set inline on all rounded elements. This is a React Native iOS-specific prop for smoother corners (like Apple's squircle). It is silently ignored on Android. It cannot be expressed as a Tailwind class in NativeWind v4; it must stay as an inline `style` prop.

## Cross-refs

- `DESIGN.md` — full design-token specification
- `docs/authentication/sign-in-screen.md` — tokens used in the login screen
- `docs/onboarding/step-1-basic-info.md` — tokens used in the onboarding screen
