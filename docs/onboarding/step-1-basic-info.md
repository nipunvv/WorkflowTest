# Onboarding Step 1 — Basic Info

## Purpose

Documents the first onboarding screen: fields, validation, toggle behavior, navigation, accessibility contract, and testID bindings. This is the first screen a user sees after signing in for the first time.

**File:** `app/(onboarding)/step-1.tsx`

## Scope

- Full field inventory and behavior
- `canProceed` validation logic (and the live ambiguity within it)
- "Not sure" toggle and its side-effects
- Next / Back navigation
- Accessibility contract
- testID contracts for RNTL and Maestro

**Not covered:** how the user gets to this screen (see `post-signin-redirect.md`); where Step 2 goes (stub, see below).

## Layout

The screen is a `ScrollView` (with `keyboardShouldPersistTaps="handled"`) inside a `SafeAreaView`. Three visual regions:

1. **Progress header** — "Step 1 of 3" caption + progress bar (track + 33.333% fill).
2. **Form card** — white card (`bg-bg-card`, `borderRadius: 24`, `boxShadow`) containing the three fields.
3. **Navigation footer** — Next button (full-width) + Back button (text-only, below).

## Fields

### First Name

| Property | Value |
|---|---|
| Component | `TextInput` |
| `accessibilityLabel` | `"First Name"` |
| Placeholder | `"Angel"` (placeholder text color `#a6998c`) |
| Style | `bg-bg-input`, amber border (`#d4a574`, 1.5px), `borderRadius: 16` |
| Validation | Required; `trim().length > 0` |

### Date of Birth

| Property | Value |
|---|---|
| Component | `DateField` (local wrapper, see below) |
| `testID` | `"dob-field"` |
| `accessibilityLabel` | `"Date of Birth"` |
| `accessibilityRole` | `"button"` |
| Placeholder | `"Select date"` |
| `defaultPickerDate` | `new Date(1990, 0, 1)` (picker opens at Jan 1 1990 when no value is set) |
| `maximumDate` | `new Date()` (today — no future dates) |
| Validation | Required for `canProceed` — **see ambiguity note below** |

### Diagnosis Date

| Property | Value |
|---|---|
| Component | `DateField` |
| `testID` | `"diagnosis-field"` |
| `accessibilityLabel` | `"Diagnosis Date"` |
| `accessibilityRole` | `"button"` |
| Placeholder | `"Select diagnosis date"` |
| `disabledPlaceholder` | `"Not applicable"` |
| Validation | Optional; not part of `canProceed` |
| Disabled when | `notSure === true` |

## "Not sure" toggle

A `Switch` next to the "Diagnosis Date" label controls the `notSure` state.

| Property | Value |
|---|---|
| `testID` | `"diagnosis-not-sure"` |
| `accessibilityRole` | `"switch"` |
| `accessibilityLabel` | `"Not sure"` |
| Track color (on) | `#9caf88` (sage green) |
| Track color (off) | `#d4c3b0` |

**Side effects when toggled ON:**
- `diagnosisDate` state is cleared (`setDiagnosisDate(null)`).
- `DateField` receives `disabled={true}`, which sets `opacity: 0.5`, uses `bg-bg-input-disabled` fill, and shows the `disabledPlaceholder` ("Not applicable").

**Side effects when toggled OFF:**
- `notSure` reverts to `false`.
- `DateField` re-enables.
- `diagnosisDate` remains `null` until the user explicitly picks a new date.

The "Not sure" toggle has **no effect on the Date of Birth field**.

## Validation: `canProceed`

```ts
const canProceed = firstName.trim().length > 0 && (dateOfBirth !== null || notSure);
```

**Ambiguity:** The "Not sure" toggle is semantically tied to the Diagnosis Date field, but the `canProceed` expression treats `notSure === true` as a substitute for `dateOfBirth !== null`. This means a user can tap Next with a first name and "Not sure" ON but without picking a Date of Birth.

This behavior is encoded in the test suite (see "Next is enabled when First Name is set and 'Not sure' is ON" in `step-1.test.tsx`) with an explicit comment flagging the ambiguity:

> "If product intent is actually 'DOB is independently required; Not sure only covers the Diagnosis field', this test is wrong and the issue should be clarified BEFORE GREEN starts."

**This is a live product question.** The current implementation allows proceeding without a DOB when "Not sure" is toggled. Until the product spec is clarified, do not change this behavior — per `CLAUDE.md`, tests must not be modified to make an implementation pass.

## Navigation

| Action | Behavior |
|---|---|
| Tap "Next" when `canProceed` | `router.push('/onboarding/step-2')` |
| Tap "Next" when `!canProceed` | No-op (button is `disabled`, handler returns early) |
| Tap "Back" | `router.back()` |

The Next button's visual opacity drops to `0.5` when `!canProceed`.

## DateField component

`DateField` is a file-local component (not exported) that wraps `DateTimePickerModal` from `react-native-modal-datetime-picker`:

- Renders a `Pressable` showing the formatted date, placeholder, or disabled placeholder.
- Pressing the `Pressable` opens the native date picker modal.
- The picker is configured with `mode="date"`, `maximumDate={new Date()}`.
- On confirm: calls `onChangeDate(date)` and closes the picker.
- On cancel: closes the picker without changing the value.
- The internal `pickerOpen` state is entirely encapsulated — callers don't see it.

`DateField` accepts an `onChangeDate` prop. In RNTL tests, this is fired directly via `fireEvent(element, 'changeDate', date)` to simulate date selection without driving the native picker UI.

## Accessibility contract

Every interactive element has both `accessibilityRole` and `accessibilityLabel`:

| Element | role | label |
|---|---|---|
| First Name input | (TextInput default: `none`) | `"First Name"` |
| DOB field | `"button"` | `"Date of Birth"` |
| Diagnosis field | `"button"` | `"Diagnosis Date"` |
| "Not sure" switch | `"switch"` | `"Not sure"` |
| Next button | `"button"` | `"Next"` |
| Back button | `"button"` | `"Back"` |

The Next button also sets `accessibilityState={{ disabled: !canProceed }}`. The DOB and Diagnosis fields set `accessibilityState={{ disabled }}`.

## testID contracts

| testID | Element | Used by |
|---|---|---|
| `"dob-field"` | DOB `DateField` root `Pressable` | RNTL tests, Maestro |
| `"diagnosis-field"` | Diagnosis `DateField` root `Pressable` | RNTL tests, Maestro |
| `"diagnosis-not-sure"` | "Not sure" `Switch` | Maestro (`.maestro/onboarding-step-1.yaml`) |
| `"progress-bar"` | Progress bar track `View` | RNTL tests |
| `"progress-fill"` | Progress bar fill `View` | RNTL tests |
| `"google-button-spinner"` | (In login screen, not this screen) | — |

## Key files & components

| File | Role |
|---|---|
| `app/(onboarding)/step-1.tsx` | Screen + `DateField` component |
| `app/(onboarding)/__tests__/step-1.test.tsx` | Jest + RNTL test suite |
| `app/(onboarding)/step-2.tsx` | Stub destination for Next navigation |
| `.maestro/onboarding-step-1.yaml` | E2E smoke test (status: RED — not yet passing on any build) |

## Dependencies

- `react-native-modal-datetime-picker` ^18.0.0 — date picker modal
- `@react-native-community/datetimepicker` 8.4.4 — native peer dependency
- `expo-router` — `useRouter()`
- `react-native-safe-area-context` — `SafeAreaView`

## Not shipped / follow-up

- **Step 2 is a stub** (`"Step 2 coming soon"` placeholder). No form or content yet.
- **No persistence to Supabase.** The form data is local `useState` only; nothing is saved. A `profiles` table and Supabase insert call do not exist yet.
- **Profile-completion gate not implemented.** Returning users with an existing session are bounced to onboarding every time they sign in freshly (via `useRedirectOnSignIn`). There is no check to skip onboarding for users who completed it. This requires a profile-completion flag — tracked as a follow-up.
- **Maestro E2E test is in RED state.** The `.maestro/onboarding-step-1.yaml` flow was authored alongside the RED test plan. It is expected to pass once a dev-client build ships the implementation.

## Cross-refs

- `docs/onboarding/post-signin-redirect.md` — how the user arrives at this screen
- `docs/architecture/routing.md` — onboarding group routing
- `docs/development/testing.md` — how to run the Jest tests; Maestro limitations
