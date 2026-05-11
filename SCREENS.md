# Hi Honey — Screens in Figma

**Source:** [Figma — Untitled](https://www.figma.com/design/CLEcJLTTd4L1JDDjc6KDwl/Untitled?node-id=0-1)
**File key:** `CLEcJLTTd4L1JDDjc6KDwl`
**Page:** `1.1 — Auth / Sign In` (id `0:1`) — single page
**Frame size:** all screens 393 × 852 (mobile)
**Captured:** 2026-04-28

---

## Summary

Six screen frames currently exist on the canvas. Auth is one screen; onboarding is split across two design iterations (an older 3-step flow and a newer 4-step flow). Both versions live on the canvas side-by-side.

| #   | Screen                                         | Node ID | Canvas X | Notes                      |
| --- | ---------------------------------------------- | ------- | -------: | -------------------------- |
| 1   | Auth — Sign In                                 | `4:2`   |      100 | Entry / sign-in            |
| 2   | Onboarding — Step 1 Basic Info                 | `13:2`  |      573 | Shared start of both flows |
| 3   | Onboarding — Step 2 Symptoms (3-step flow)     | `14:2`  |     1046 | Older "Step 2 of 3"        |
| 4   | Onboarding — Step 3 Language (3-step flow)     | `15:2`  |     1519 | Older "Step 3 of 3"        |
| 5   | Onboarding — Step 2 Goals (4-step flow)        | `170:2` |     1992 | Newer "Step 2 of 4"        |
| 6   | Onboarding — Step 3 Integrations (4-step flow) | `178:2` |     2465 | Newer "Step 3 of 4"        |

**Not yet designed:** Step 4 of the 4-step flow (no frame on canvas); the post-onboarding "First Log Prompt" / Log Something / Insights / Care Team screens described in `SCREENS.md`.

---

## 1. Auth — Sign In (`4:2`)

Welcome / sign-in screen.

**Top section (`5:2`)**

- Logo area (`5:3`): organic glow disc with 🍯 honey logo (72×72) inside a 160×160 frame.
- Welcome text (`5:7`):
  - Heading: "Welcome to Hi Honey"
  - Subheading: "Your gentle companion for tracking symptoms & finding triggers."
- Privacy badge (`5:10`): 🔒 "Your health data is private & encrypted"

**Bottom section (`6:2`)**

- Auth buttons (`6:3`):
  - Primary: "Sign in with Google" (`6:4`) with Google logo (`120:2`)
  - Divider: "or" (`6:10`)
  - Secondary: ✉ "Continue with Email" (`6:7`)
- Legal footer text (`6:14`)

**Decorations (`8:2`)**

- Two organic blobs (top-right `8:3`, bottom-left `8:4`)
- Three accent dots (`8:5`, `8:6`, `8:7`)

---

## 2. Onboarding — Step 1: Basic Info (`13:2`)

First step of onboarding, shown in both flow versions.

**Header (`13:3`)**

- Label: "Step 1 of 3" _(progress fill 112 / 337 ≈ 33%)_
- Progress bar (`13:5`)

**Card — Basic Info (`13:8`)**

- Title: "Let's get to know you 👋"
- Input — First Name (`13:10`): label + text field, sample value "Angel"
- Input — Date of Birth (`13:14`): label + date picker with 📅 trailing icon, placeholder "Select date"
- Input — Diagnosis Date (`13:19`):
  - Label row with "Not sure" toggle (`13:22`)
  - Disabled date picker showing "Not applicable" when toggle is on

**Navigation (`13:29`)**

- Primary button: "Next"
- Back link

> Note: header reads "Step 1 of 3" but the newer flow on the canvas runs to 4 steps — this label is likely stale.

---

## 3. Onboarding — Step 2: Symptoms (`14:2`) _— older 3-step flow_

**Header (`14:3`)**

- Label: "Step 2 of 3" (progress fill 224 / 337 ≈ 67%)

**Card — Symptoms (`14:8`)**

- Question: "What are your primary symptoms?"
- Helper: "Select all that apply"
- Symptom chips (`14:12`) — 2-column grid of 6 chips:
  - 👁 Dry Eyes
  - 💧 Dry Mouth
  - 🦴 Joint Pain
  - 😴 Fatigue
  - 🌫 Brain Fog
  - ⚡ Neuropathy

**Navigation (`14:26`):** Next button + Back link.

---

## 4. Onboarding — Step 3: Language (`15:2`) _— older 3-step flow_

**Header (`15:3`)**

- Label: "Step 3 of 3" (progress bar full)

**Card — Language (`15:8`)**

- Question: "Preferred Language? 🌍"
- Helper: "You can change this later in settings"
- Language options (`15:12`) — radio list:
  - 🇺🇸 English / English _(selected — radio dot present)_
  - 🇨🇳 简体中文 / Simplified Chinese

**Navigation (`15:29`)**

- Primary button: "Get Started 🎉"
- Back link

---

## 5. Onboarding — Step 2: Goals (`170:2`) _— newer 4-step flow_

**Header (`171:2`)**

- Label: "Step 2 of 4" (progress fill 169 / 337 ≈ 50%)

**Card — Goals (`172:3`)**

- Question: "What matters most to you right now?"
- Helper: "Select all that apply — we'll personalize your experience"
- Goal options (`172:7`) — selectable rows with check indicator:
  - 🔍 Find my symptom triggers _(✓ selected)_
  - ⚡ Improve my daily energy _(✓ selected)_
  - 📋 Understand my protocol
  - 📊 Capture everything in one place
  - 🤝 Coordinate with my care team
  - ✍️ Other _(expanded state with input field "Tell us what matters to you…")_

**Navigation (`173:2`):** Next button + Back link.

---

## 6. Onboarding — Step 3: Integrations (`178:2`) _— newer 4-step flow_

**Header (`179:2`)**

- Label: "Step 3 of 4" (progress fill 253 / 337 ≈ 75%)

**Title block (`180:3`)**

- "Recommended" badge (`180:6`)
- Heading: "Connect your devices"
- Subheading: "Automatic sleep & weight tracking saves you time."

**Integration cards (`180:10`)**

- Oura Ring (`180:11`): 💍 logo, "Sleep stages, HRV", **Connected** badge with ✓
- Withings Scale (`180:21`): ⚖️ logo, "Weight, body composition", **Connect** button
- More integrations hint (`180:29`): ✨ "More integrations coming soon"

**Navigation (`184:3`)**

- Primary button: "Continue"
- Secondary link: "Skip for now"

---

## Observations

- **Two onboarding iterations coexist on the canvas.** The 3-step flow (Basic Info → Symptoms → Language) and the 4-step flow (Basic Info → Goals → Integrations → ?) share Step 1 but diverge from Step 2 onward. Step 1's header still reads "Step 1 of 3"; it has not been re-skinned for the 4-step flow.
- **Step 4 of the new flow is missing.** The progress bar at Step 3 is at 75%, implying a fourth step (likely the "First Log Prompt" / "You're all set 🎉" screen described in `SCREENS.md`), but no frame for it exists on the canvas yet.
- **No post-onboarding screens are designed.** `SCREENS.md` enumerates ~72 screens (Log Something, Insights, Care Team, Settings, etc.); none are on this canvas yet.
- **Symptoms and Language steps from the 3-step flow are not wired into the 4-step flow.** If they're still required, they need to be re-inserted (or merged into another step) in the new flow.
