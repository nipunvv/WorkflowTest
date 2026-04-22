# Development Setup

## Prerequisites

- Node.js 20+
- npm (comes with Node)
- iOS Simulator (Xcode) — all current builds are iOS simulator only
- Expo Go (optional, for quick iteration without a native build)

## Clone and install

```bash
git clone <repo-url>
cd workflow-test
npm install
```

## Environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Both values come from the Supabase dashboard under **Project Settings → API**. The anon key is the public "publishable" key — safe to include in a dev `.env`.

`lib/supabase.ts` will throw at import time if either variable is missing, so you must have these set before running the app or tests.

## Running the app

### Option A: Expo Go (quick, limited)

```bash
npx expo start
```

Scan the QR code with the Expo Go app on a physical device or press `i` to open in the iOS Simulator. Expo Go is good for quick UI iteration, but:

- Google OAuth will NOT work reliably (redirect URL changes with each LAN IP).
- Any screen using a native module not bundled in Expo Go will fail.

### Option B: Dev-client build (recommended)

A dev-client build is a custom Expo binary that includes all native modules:

```bash
# Build for iOS Simulator (cloud build via EAS — no Apple Developer account required)
npx eas build --platform ios --profile development

# Download and install the latest build on the booted simulator
npx eas build:run -p ios --latest

# Start the dev server and connect
npx expo start --dev-client
```

After the build is installed once, you only need `npx expo start --dev-client` for subsequent sessions (unless native dependencies change).

## Running tests

```bash
npm test                          # Jest + RNTL (watch mode)
npm run test:watch                # Explicit watch mode
npx jest path/to/file.test.ts     # Single file
npx jest -t "partial test name"   # Single test by name
npm run test:ci                   # CI mode with coverage
```

## E2E tests (Maestro)

```bash
maestro test .maestro/            # Run all Maestro flows
```

Requires:
1. A dev-client build installed on a booted iOS Simulator.
2. The user must be **already signed in** (Maestro cannot drive the Google OAuth sheet).

See `docs/development/testing.md` for Maestro limitations.

## Code quality

```bash
npm run lint        # ESLint (expo lint, flat config)
npm run format      # Prettier (Tailwind class sort enabled)
npx tsc --noEmit    # TypeScript type-check
```

## EAS build reference

| Command | What it does |
|---|---|
| `npx eas build --platform ios --profile development` | Cloud build for iOS Simulator (dev-client) |
| `npx eas build --platform ios --profile preview` | Internal preview build (iOS Simulator) |
| `npx eas build --platform ios --profile production` | Production build (requires Apple Developer account) |
| `npx eas build:run -p ios --latest` | Download + install latest build on booted simulator |

## Simulator caveats

The following features do not work in any iOS Simulator build (dev or Expo Go):

- Camera
- Push notifications
- Haptics (API returns without effect)

Test these on a real device.

## Cross-refs

- `docs/development/project-structure.md` — where everything lives
- `docs/development/testing.md` — test conventions and Maestro limitations
- `CLAUDE.md` — authoritative commands reference
