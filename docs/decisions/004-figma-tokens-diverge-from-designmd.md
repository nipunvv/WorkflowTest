---
title: Add Figma-derived color tokens to tailwind.config.js; defer DESIGN.md reconciliation
date: 2026-04-21
status: accepted
---

# 004. Add Figma-derived color tokens to tailwind.config.js; defer DESIGN.md reconciliation

## Context

The project has two color authorities that diverged before the first feature was built:

1. **`DESIGN.md`** — a design-system document with a named color ramp (neutrals, accent scale, semantic roles). Written as a reference; hex values may have been specified independently.
2. **Figma** — the live design file (`CLEcJLTTd4L1JDDjc6KDwl`). PR #1's issue was explicitly "pixel-close to Figma". The Figma hex values (e.g. `#fff8f0`, `#d4a574`, `#9caf88`) do not match `DESIGN.md`'s corresponding entries.

Reconciling the two before shipping would block delivery with no user-visible benefit. The Figma file is the source of truth for what gets built.

## Decision

Add Figma-derived hex values directly to `tailwind.config.js` under semantic role names (e.g. `bg-primary`, `text-heading`, `accent-primary`, `bg-card`, `border-input-active`). Leave `DESIGN.md` untouched. Track reconciliation as a follow-up issue.

**Auth tokens** (PR #1, 9 colors): `bg-primary`, `bg-logo`, `bg-badge`, `button-primary-bg`, `text-heading`, `text-body`, `text-badge`, `text-subtle`, `accent-primary`.

**Onboarding step-1 tokens** (PR #6, 11 colors + 3 shadows): `bg-card`, `bg-input`, `bg-input-disabled`, `bg-next`, `bg-progress-track`, `bg-progress-fill`, `border-input-active`, `border-input-default`, `border-input-disabled`, `text-placeholder`, `text-placeholder-disabled`; shadows `button`, `card`, `next`.

## Alternatives considered

- **Reconcile DESIGN.md first** — deferred; no design review had confirmed which document's values are canonical.
- **Use NativeWind arbitrary-value classes** (`bg-[#fff8f0]`) — rejected; arbitrary values scatter magic strings across every component and make future token updates require a codebase-wide search.
- **Generate tokens from Figma via a token export plugin** — not set up; would be the right long-term approach.

## Consequences

- Screen-level components reference semantic role names (`bg-bg-primary`, `text-text-heading`) which are stable across hex value changes.
- `DESIGN.md` is currently misleading — its hex values may not match what's on screen. New contributors should treat `tailwind.config.js` as the actual token source.
- Reconciliation is a follow-up issue: audit `DESIGN.md`, align with Figma, and update both `tailwind.config.js` and `DESIGN.md` together.

## References

- `tailwind.config.js` — all current token values
- `docs/plans/2026-04-21-001-feat-auth-sign-in-redesign-plan.md` — "Scope decisions" and "Key Technical Decisions" sections
- `docs/plans/2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md` — Figma token table, "NOT reconciling" scope boundary
- PR #1: https://github.com/nipunvv/WorkflowTest/pull/1
- PR #6: https://github.com/nipunvv/WorkflowTest/pull/6
