# Maestro flows

## Running

```bash
# One flow
maestro test .maestro/launch.yaml

# All flows in this directory
maestro test .maestro/
```

## Prerequisites

- `maestro` CLI on PATH (`brew install mobile-dev-inc/tap/maestro --formula`)
- `JAVA_HOME` pointing at a JDK (e.g. `/opt/homebrew/opt/openjdk`)
- An iOS Simulator booted with the app installed as a **dev client or standalone build** — Maestro identifies apps by `appId` and can't attach to Expo Go. Build once with `npx expo run:ios`.

## What these flows cover

| Flow | Purpose |
|------|---------|
| `launch.yaml` | App launches cleanly; login screen renders with the Google sign-in CTA |

## What these flows do NOT cover

The full Google OAuth consent flow runs inside `ASWebAuthenticationSession` (a system Safari sheet). Maestro cannot drive that sheet reliably. Post-auth E2E scenarios (tab navigation, sign-out, etc.) are best covered by Jest/RNTL integration tests with a mocked auth context — not Maestro.
