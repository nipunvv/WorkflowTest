---
title: Wrap native date-picker in a DateField component to expose onChangeDate as a testable synthetic event
date: 2026-04-22
status: accepted
---

# 006. Wrap native date-picker in a DateField component to expose onChangeDate as a testable synthetic event

## Context

`app/(onboarding)/step-1.tsx` needed a date field backed by `react-native-modal-datetime-picker`. The implementation had to be testable via RNTL's `fireEvent` without relying on the native picker UI (which can't be driven in Jest).

The naive approach — putting `onChangeDate` directly on a `<Pressable>` — fails at two levels:
1. TypeScript: `Pressable` doesn't accept `onChangeDate` in its props type.
2. RNTL: `fireEvent(node, 'changeDate', date)` resolves to `props.onChangeDate` by walking up the tree from the queried node. If the prop isn't on the queried node or an ancestor, the call silently no-ops — tests pass green without exercising any behavior.

Additionally, RNTL's `fireEvent` auto-prepends `on` to the event name: `fireEvent(node, 'changeDate', ...)` resolves to `props.onChangeDate`. Calling `fireEvent(node, 'onChangeDate', ...)` resolves to `props.onOnChangeDate` — a common mistake that silently no-ops.

## Decision

Implement a `DateField` wrapper component inside `step-1.tsx` that:
- Accepts `onChangeDate: (d: Date) => void` as a first-class typed prop.
- Owns the picker's `isVisible` state internally.
- Renders a `<Pressable testID="...">` to open the picker, and a `<DateTimePickerModal>` that calls `onChangeDate` on confirm.

The `onChangeDate` prop lives on `DateField`, which is the node RNTL finds when querying by `testID`. `fireEvent(getByTestId('dob-field'), 'changeDate', new Date(...))` fires reliably in tests and maps to the same prop used in production — no test-only code path.

```tsx
fireEvent(getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
// resolves to DateField.props.onChangeDate(new Date('1990-06-01'))
```

## Alternatives considered

- **Add `onChangeDate` directly to `<Pressable>`** — TypeScript error; would require `as any` cast and lose type safety.
- **Use a `ref` + imperative handle to trigger the callback** — bypasses RNTL's prop-walk; tests would need `act()` + manual ref manipulation; production and test paths diverge.
- **Mock the entire date picker module and test via the confirm callback** — possible but requires deep knowledge of the modal's internal prop names; brittle against library upgrades.
- **Test only via Maestro E2E** — Maestro can't run in Jest; would leave unit test coverage of date selection absent.

## Consequences

- `DateField` is a reusable pattern for any custom input that needs a synthetic event testable by RNTL (date pickers, signature pads, custom selectors).
- The component is currently local to `step-1.tsx`. If reused in later onboarding steps, extract to `components/`.
- RNTL event-name gotcha is documented: use `'changeDate'` not `'onChangeDate'`.

## References

- `app/(onboarding)/step-1.tsx` — `DateField` component definition
- `app/(onboarding)/__tests__/step-1.test.tsx` — `fireEvent(getByTestId('dob-field'), 'changeDate', ...)` usage
- `docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md` — Pattern 1 (RNTL event names) and Pattern 2 (wrapper component)
- PR #6: https://github.com/nipunvv/WorkflowTest/pull/6 — "Design decisions" section
