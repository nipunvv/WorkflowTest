# Hi Honey — Sitemap (Figma-current)

**Source:** [Figma — Untitled](https://www.figma.com/design/CLEcJLTTd4L1JDDjc6KDwl/Untitled?node-id=0-1)
**Page:** `1.1 — Auth / Sign In` (single page, id `0:1`)
**Captured:** 2026-04-28
**Scope:** screens that currently exist as frames on the canvas. Screens listed in `SITEMAP.md` but not yet designed in Figma are flagged as **NOT IN FIGMA**.

---

## Designed Flow (what's on the canvas)

```
1.1 Auth — Sign In  (4:2)
 │   ├─ [Sign in with Google]
 │   └─ [Continue with Email]
 │
 ▼
1.2 Onboarding — Step 1 of N: Basic Info  (13:2)
 │   ├─ First Name
 │   ├─ Date of Birth
 │   └─ Diagnosis Date  (with "Not sure" toggle)
 │
 ├──────────── 3-STEP FLOW (older) ────────────┐
 │                                              │
 ▼                                              ▼
1.3a Step 2 of 3: Symptoms  (14:2)       1.3b Step 2 of 4: Goals  (170:2)
 │   👁 Dry Eyes  💧 Dry Mouth                  🔍 Find triggers
 │   🦴 Joint Pain  😴 Fatigue                  ⚡ Improve energy
 │   🌫 Brain Fog  ⚡ Neuropathy                📋 Understand protocol
 │                                               📊 Capture everything
 ▼                                               🤝 Coordinate care team
1.4a Step 3 of 3: Language  (15:2)             ✍️ Other (free text)
     🇺🇸 English   🇨🇳 简体中文                   │
     [Get Started 🎉]                            ▼
                                          1.4b Step 3 of 4: Integrations  (178:2)
                                                💍 Oura Ring     [Connected]
                                                ⚖️ Withings Scale [Connect]
                                                ✨ More integrations soon
                                                [Continue] · Skip for now
                                                │
                                                ▼
                                          1.5b Step 4 of 4 — "You're all set" (dummy)
                                                ✅ Confirmation screen after
                                                   Integrations
                                                ⚠️ NOT IN FIGMA — placeholder
                                                   stub planned in code only
```

---

## Frame Index

| Node ID | Screen                                     | Canvas X | Status                                      |
| ------- | ------------------------------------------ | -------: | ------------------------------------------- |
| `4:2`   | Auth — Sign In                             |      100 | Designed                                    |
| `13:2`  | Onboarding — Step 1: Basic Info            |      573 | Designed (header still reads "Step 1 of 3") |
| `14:2`  | Onboarding — Step 2: Symptoms (3-step)     |     1046 | Designed (older flow)                       |
| `15:2`  | Onboarding — Step 3: Language (3-step)     |     1519 | Designed (older flow)                       |
| `170:2` | Onboarding — Step 2: Goals (4-step)        |     1992 | Designed (newer flow)                       |
| `178:2` | Onboarding — Step 3: Integrations (4-step) |     2465 | Designed (newer flow)                       |

All frames are 393 × 852 mobile.

---

## Gaps vs. `SITEMAP.md`

The original sitemap defines a much larger app. Everything below is **NOT IN FIGMA** yet:

### 1. Onboarding flow — missing pieces

- 1.1 Welcome Splash _(original sitemap shows this before Auth)_
- 1.5b Step 4 of 4 — "You're all set" confirmation _(planned as a dummy stub in code; not yet designed in Figma)_
- 1.6 First Log Prompt ("You're all set 🎉")

### 2. Log tab (default landing)

- 3.1 Log Something
- 3.2–3.x Meal logging, photo capture, voice note, record meeting, etc.

### 3. Insights tab

- All Insights screens

### 4. My Plan tab

- All My Plan screens

### 5. Activity tab

- Activity / history screens

### 6. More tab

- Settings, profile, integrations management, account, support

### 7. Cross-cutting

- Care Team screens
- Notifications / reminders
- Empty / loading / error states for any of the above

---

## Inconsistencies to resolve

1. **Two onboarding iterations on the canvas.** The 3-step flow (Symptoms → Language) and the 4-step flow (Goals → Integrations → ?) share Step 1 but diverge after. Decide which is canonical and remove the other, or merge missing questions (Symptoms, Language) into the 4-step flow.
2. **Step 1 header is stale.** `13:2` still reads "Step 1 of 3"; in the 4-step flow it should read "Step 1 of 4".
3. **Step 4 of the 4-step flow is undesigned** despite being implied by the progress bar.
4. **Symptoms and Language are absent from the 4-step flow.** Either they're being dropped, deferred to Settings, or need to be reintroduced — currently ambiguous.
