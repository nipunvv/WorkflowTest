---
title: Use NativeWind v4 for styling with StyleSheet as fallback
date: 2026-04-21
status: accepted
---

# 003. Use NativeWind v4 for styling with StyleSheet as fallback

## Context

React Native styling options range from inline `StyleSheet.create()` objects to full CSS-in-JS libraries. The team wanted utility-first styling consistent with a Tailwind mental model, applied at the component level without the overhead of a full CSS-in-JS runtime.

NativeWind v4 compiles Tailwind class strings to RN style objects at build time (via Babel), with a small runtime for dynamic and responsive classes. It supports NativeWind's `preset` for Tailwind configuration and `jsxImportSource: "nativewind"` to apply styles via `className` without explicit imports.

## Decision

Use **NativeWind v4** with **Tailwind v3.4.x** (pinned — NativeWind v4 is not yet compatible with Tailwind v4). Styling uses `className` props on all RN components. `StyleSheet.create()` is the fallback for:

- Animated values (Reanimated `useAnimatedStyle` — must return plain RN style objects).
- Runtime-computed values (e.g. dynamic widths derived from `useWindowDimensions`).
- Anything NativeWind's Tailwind subset can't express.

Configuration:
- `tailwind.config.js` — `presets: [require("nativewind/preset")]`, custom design tokens in `theme.extend`.
- `global.css` imported once at the top of `app/_layout.tsx`.
- `babel.config.js` — `jsxImportSource: "nativewind"` + `nativewind/babel` preset.

## Alternatives considered

- **Pure `StyleSheet.create()`** — verbose, no utility-class reuse, harder to maintain design tokens.
- **Styled-components / Emotion** — large runtime, not recommended for React Native performance.
- **Shopify Restyle** — theme-safe but opinionated component model; heavier migration cost.

## Consequences

- Tailwind v4 cannot be used until NativeWind releases a compatible version.
- Responsive breakpoints are via `useWindowDimensions()`, not media queries — NativeWind's `sm:`/`md:` variants map to width buckets configured in `tailwind.config.js`.
- Custom design tokens live in `tailwind.config.js` under `theme.extend.colors` and `theme.extend.boxShadow`, namespaced by semantic role (e.g. `bg-primary`, `border-input-active`).

## References

- `tailwind.config.js`
- `babel.config.js`
- `global.css`
- `CLAUDE.md` — "NativeWind v4" and "Design system" sections
