# DESIGN.md

Design tokens for workflow-test, pulled from the Figma source of truth.

**Figma file:** `AnSl87SgxwLiS6LL6I99x7`
**Last synced:** 2026-04-14

---

## Primitives

Raw color values. Not used directly in components — referenced via Semantic aliases.

### Brand

| Token | Hex |
|---|---|
| `Brand/Honey Tan` | `#D4A574` |
| `Brand/Sage Green` | `#9CAF88` |
| `Brand/Muted Coral` | `#E08D79` |

### Honey Scale

| Token | Hex |
|---|---|
| `Honey/50` | `#FDF9F3` |
| `Honey/100` | `#F7F2EB` |
| `Honey/200` | `#F5EFE6` |
| `Honey/300` | `#E8DDD0` |
| `Honey/400` | `#D4C3B0` |
| `Honey/500` | `#D4A574` |
| `Honey/600` | `#C08D5C` |
| `Honey/700` | `#966A3F` |
| `Honey/800` | `#6B5340` |
| `Honey/900` | `#503E32` |

### Sage Scale

| Token | Hex |
|---|---|
| `Sage/50` | `#F2F5EE` |
| `Sage/100` | `#E3EADB` |
| `Sage/200` | `#C8D6B8` |
| `Sage/300` | `#9CAF88` |
| `Sage/400` | `#6B8050` |
| `Sage/500` | `#5A6E42` |
| `Sage/600` | `#4A5B37` |

### Neutral Scale (Warm Grays)

| Token | Hex |
|---|---|
| `Neutral/0` | `#FFFFFF` |
| `Neutral/50` | `#FDF9F3` |
| `Neutral/100` | `#F7F2EB` |
| `Neutral/200` | `#E8E0D8` |
| `Neutral/300` | `#D2C8BE` |
| `Neutral/400` | `#A59A90` |
| `Neutral/500` | `#786B5F` |
| `Neutral/600` | `#5E534A` |
| `Neutral/700` | `#453C35` |
| `Neutral/800` | `#2D2620` |
| `Neutral/900` | `#1C1C1E` |
| `Neutral/1000` | `#000000` |

### Coral Scale

| Token | Hex |
|---|---|
| `Coral/100` | `#FBEAE6` |
| `Coral/300` | `#E08D79` |
| `Coral/500` | `#C96F5A` |

---

## Semantic Colors (Light Mode)

Aliased from Primitives. These are the tokens to use in code.

### Backgrounds

| Token | CSS Variable | Resolves To | Hex |
|---|---|---|---|
| `BG/Primary` | `--bg-primary` | Neutral/50 | `#FDF9F3` |
| `BG/Secondary` | `--bg-secondary` | Neutral/100 | `#F7F2EB` |
| `BG/Surface` | `--bg-surface` | Neutral/0 | `#FFFFFF` |
| `BG/Warm` | `--bg-warm` | Honey/200 | `#F5EFE6` |
| `BG/Sage Subtle` | `--bg-sage-subtle` | Sage/50 | `#F2F5EE` |

### Text

| Token | CSS Variable | Resolves To | Hex |
|---|---|---|---|
| `Text/Primary` | `--text-primary` | Neutral/800 | `#2D2620` |
| `Text/Secondary` | `--text-secondary` | Neutral/500 | `#786B5F` |
| `Text/Muted` | `--text-muted` | Neutral/400 | `#A59A90` |
| `Text/On Dark` | `--text-on-dark` | Neutral/0 | `#FFFFFF` |
| `Text/Sage` | `--text-sage` | Sage/500 | `#5A6E42` |
| `Text/Honey` | `--text-honey` | Honey/700 | `#966A3F` |

### Borders

| Token | CSS Variable | Resolves To | Hex |
|---|---|---|---|
| `Border/Default` | `--border-default` | Neutral/200 | `#E8E0D8` |
| `Border/Subtle` | `--border-subtle` | Neutral/300 | `#D2C8BE` |
| `Border/Honey` | `--border-honey` | Honey/400 | `#D4C3B0` |

### Buttons

| Token | CSS Variable | Resolves To | Hex |
|---|---|---|---|
| `Button/Primary Fill` | `--button-primary-fill` | Neutral/900 | `#1C1C1E` |
| `Button/Secondary Fill` | `--button-secondary-fill` | Honey/200 | `#F5EFE6` |
| `Button/Accent Fill` | `--button-accent-fill` | Coral/300 | `#E08D79` |
| `Button/Primary Text` | `--button-primary-text` | Neutral/0 | `#FFFFFF` |
| `Button/Secondary Text` | `--button-secondary-text` | Honey/800 | `#6B5340` |
| `Button/Accent Text` | `--button-accent-text` | Neutral/0 | `#FFFFFF` |

### Accents

| Token | CSS Variable | Resolves To | Hex |
|---|---|---|---|
| `Accent/Honey` | `--accent-honey` | Honey/500 | `#D4A574` |
| `Accent/Sage` | `--accent-sage` | Sage/300 | `#9CAF88` |
| `Accent/Coral` | `--accent-coral` | Coral/300 | `#E08D79` |

### Icons

| Token | CSS Variable | Resolves To | Hex |
|---|---|---|---|
| `Icon/Default` | `--icon-default` | Neutral/500 | `#786B5F` |
| `Icon/Sage` | `--icon-sage` | Sage/400 | `#6B8050` |
| `Icon/On Dark` | `--icon-on-dark` | Neutral/0 | `#FFFFFF` |

---

## Spacing

| Token | CSS Variable | Value |
|---|---|---|
| `Space/2` | `--space-2` | 2px |
| `Space/4` | `--space-4` | 4px |
| `Space/6` | `--space-6` | 6px |
| `Space/8` | `--space-8` | 8px |
| `Space/10` | `--space-10` | 10px |
| `Space/12` | `--space-12` | 12px |
| `Space/14` | `--space-14` | 14px |
| `Space/16` | `--space-16` | 16px |
| `Space/20` | `--space-20` | 20px |
| `Space/24` | `--space-24` | 24px |
| `Space/32` | `--space-32` | 32px |
| `Space/40` | `--space-40` | 40px |
| `Space/48` | `--space-48` | 48px |
| `Space/56` | `--space-56` | 56px |
| `Space/64` | `--space-64` | 64px |

---

## Border Radius

| Token | CSS Variable | Value |
|---|---|---|
| `Radius/None` | `--radius-none` | 0px |
| `Radius/SM` | `--radius-sm` | 4px |
| `Radius/MD` | `--radius-md` | 8px |
| `Radius/LG` | `--radius-lg` | 12px |
| `Radius/XL` | `--radius-xl` | 16px |
| `Radius/2XL` | `--radius-2xl` | 24px |
| `Radius/Pill` | `--radius-pill` | 100px |

---

## Sizing

| Token | CSS Variable | Value |
|---|---|---|
| `Size/Button Height` | `--size-button-height` | 56px |
| `Size/Icon SM` | `--size-icon-sm` | 16px |
| `Size/Icon MD` | `--size-icon-md` | 20px |
| `Size/Icon LG` | `--size-icon-lg` | 24px |
| `Size/Touch Target` | `--size-touch-target` | 44px |

---

## Shadows (Effect Styles)

Shadows are Figma Effect Styles, not variables.

| Style | Offset | Blur | Spread | Color |
|---|---|---|---|---|
| `Shadow/Subtle` | 0, 1 | 4 | 0 | `rgba(0,0,0,0.04)` |
| `Shadow/Medium` | 0, 4 | 12 | 0 | `rgba(0,0,0,0.08)` |
| `Shadow/Large` | 0, 8 | 24 | 0 | `rgba(0,0,0,0.12)` |

---

## Typography

Font: **Inter** (all weights available: Thin through Extra Bold).

| Role | Weight | Size | Line Height | Letter Spacing |
|---|---|---|---|---|
| Display / Headline | Bold | 32px | 40px | -0.5px |
| Section Heading | Bold | 28px | 36px | -0.5px |
| Button Label | Semi Bold | 17px | 22px | -0.2px |
| Body | Regular | 16px | 24px | 0px |
| Body Small | Regular | 15px | 22px | 0px |
| Label / Chip | Medium | 15px | 20px | 0px |
| Caption | Medium | 14px | 20px | 0px |
| Small Label | Medium | 13px | 18px | 0px |
| Legal / Fine Print | Regular | 12px | 18px | 0px |

---

## Usage Patterns

### Buttons
- **Primary:** `Button/Primary Fill` bg, `Button/Primary Text` text, `Radius/XL`, `Shadow/Medium`, height `Size/Button Height`
- **Secondary:** `Button/Secondary Fill` bg, `Button/Secondary Text` text, `Border/Honey` stroke (1.5px), `Radius/XL`, height `Size/Button Height`
- **Accent:** `Button/Accent Fill` bg, `Button/Accent Text` text, `Radius/XL`

### Chips (Multi-select)
- **Selected:** `Accent/Sage` fill, `Text/On Dark` text, `Radius/Pill`
- **Unselected:** `BG/Surface` fill, `Border/Default` stroke (1px), `Text/Primary` text, `Radius/Pill`

### Input Fields
- **Default:** `BG/Surface` fill, `Border/Default` stroke (1px), `Radius/XL`, padding `Space/14` vertical / `Space/16` horizontal
- **Focused / Filled:** `BG/Surface` fill, `Border/Honey` stroke (1.5px), `Radius/XL`

### Radio Cards
- **Selected:** `BG/Sage Subtle` fill, `Accent/Sage` stroke (2px), `Radius/XL`
- **Unselected:** `BG/Surface` fill, `Border/Default` stroke (1px), `Radius/XL`
