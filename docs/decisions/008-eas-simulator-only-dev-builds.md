---
title: EAS configured for iOS simulator dev-client builds only
date: 2026-04-21
status: accepted
---

# 008. EAS configured for iOS simulator dev-client builds only

## Context

Native modules (e.g. `@react-native-community/datetimepicker`) require a compiled dev-client build — they cannot run in Expo Go. Building for a real iOS device requires an Apple Developer account and signing certificates. At the pre-MVP stage with a single developer, the overhead of account setup wasn't warranted.

## Decision

`eas.json` configures the `development` profile with `ios.simulator: true`. Builds target the iOS simulator and do not require an Apple Developer account or code-signing certificates. Cloud builds run via EAS Build.

```bash
npx eas build --platform ios --profile development   # produces a simulator .app
npx eas build:run -p ios --latest                    # installs on the running simulator
```

`preview` and `production` profiles exist in `eas.json` but have not been used yet.

## Alternatives considered

- **Local builds (`npx expo run:ios`)** — viable, but requires Xcode and the full local toolchain. EAS cloud builds avoid local Xcode version dependencies.
- **Expo Go only** — insufficient once native modules are added (datetime picker, potentially others).
- **Real device dev builds** — requires Apple Developer account; deferred until pre-TestFlight / beta stage.

## Consequences

- Haptics, camera, and push notifications cannot be tested in the simulator — real device required for those features.
- When native dependencies are added, the dev-client must be rebuilt via EAS before the new module works. (PR #6 added `@react-native-community/datetimepicker` and `react-native-modal-datetime-picker` — both require a rebuild.)
- Moving to device testing will require Apple Developer account setup and new EAS signing configuration.

## References

- `eas.json`
- `app.json` — `scheme: "workflowtest"`, `ios.bundleIdentifier: "com.workflowtest.app"`
- `CLAUDE.md` — "EAS" section
