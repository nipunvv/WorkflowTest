---
title: Strict TDD — failing tests committed before any implementation
date: 2026-04-21
status: accepted
---

# 005. Strict TDD — failing tests committed before any implementation

## Context

Early mobile projects frequently skip or paper over tests under delivery pressure, accruing test debt that is hard to repay. The team wanted an explicit commitment to test discipline that would hold across contributors and sub-agents.

## Decision

This project follows strict red-first TDD:

1. Tests are written before implementation. The failing test suite is committed as a standalone artifact (the RED commit) — it defines the spec.
2. Implementation follows in a separate commit (GREEN) that makes the tests pass without modifying them.
3. Refactoring (REFACTOR) happens after GREEN, with tests remaining green throughout.
4. **Tests are never modified to make them pass.** If a test fails, fix the implementation. The only legitimate test edits are: correcting a broken RNTL API call (not a spec assertion), or updating a test when the spec itself changes (with explicit product sign-off).

Each feature ships with a planning doc in `docs/plans/` that includes a "Requirements Trace" section mapping test cases to acceptance criteria, and explicit RED scaffolding instructions so the failing suite fails for the right reasons (behavior not found, not module-resolution errors).

## Alternatives considered

- **Test-after (write tests once implementation is done)** — rejected; historically leads to tests that document implementation rather than specify behavior, and to skipping edge cases under deadline pressure.
- **E2E-only testing (Maestro)** — rejected as the primary harness; Maestro can't run in CI without a device/simulator, can't drive `ASWebAuthenticationSession`, and has limited assertion expressiveness. Used as a secondary smoke layer, not the primary spec.

## Consequences

- Features ship with a complete RNTL test suite covering behavior, roles, accessibility labels, and navigation contracts.
- The RED commit is a self-contained spec artifact — a future contributor can read the failing tests to understand exactly what the feature requires.
- Refactoring (component extraction, etc.) is deferred until GREEN is solid, preventing premature abstraction.
- Strict test-immutability means a bug in a test that mislabels expected behavior must be surfaced and discussed rather than silently patched.

## References

- `CLAUDE.md` — "Non-negotiables" section
- `docs/plans/2026-04-21-001-feat-auth-sign-in-redesign-plan.md` — Unit 4 "RED" pattern
- `docs/plans/2026-04-22-001-feat-onboarding-step-1-tdd-red-plan.md` — RED scaffolding checklist
- `docs/solutions/best-practices/tdd-multiscreen-react-native-patterns-2026-04-22.md` — Pattern 3 (RED scaffolding)
