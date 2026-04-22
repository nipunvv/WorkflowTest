# Testing

## Purpose

Describes the testing approach, conventions, module mocks, and the known limitations of each testing layer.

## Layers

| Layer | Tooling | Scope |
|---|---|---|
| Unit / integration | Jest 29 + `@testing-library/react-native` 13.3 | Components, hooks, utilities |
| E2E | Maestro YAML | App-level smoke flows on a real dev-client build |

## Jest + RNTL conventions

### File location

Tests colocate under `__tests__/` directories next to the code they test:

```
app/(auth)/__tests__/login.test.tsx
app/(onboarding)/__tests__/step-1.test.tsx
hooks/__tests__/use-redirect-on-sign-in.test.ts
```

### Running tests

```bash
npm test                            # All tests (watch mode)
npm run test:watch                  # Explicit watch
npx jest path/to/file.test.ts       # Single file
npx jest -t "partial test name"     # Tests matching a name substring
npm run test:ci                     # CI mode with coverage report
```

### Path alias

`tsconfig.json` defines `"@/*": ["./*"]`. `package.json` mirrors this in the Jest config:

```json
"moduleNameMapper": {
  "^@/(.*)$": "<rootDir>/$1"
}
```

Import as `@/lib/auth-context` rather than `../../lib/auth-context`.

### `jest-setup.ts` global mocks

`jest-setup.ts` runs before every test file. It:

1. **Injects Supabase env vars** — `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set to placeholder values so `lib/supabase.ts` (which throws at import if missing) can be imported in any test.

2. **Mocks `expo-secure-store`** — in-memory `Map` with `getItemAsync`, `setItemAsync`, `deleteItemAsync`, and a `__resetStore()` helper. Does not enforce Keychain size limits.

3. **Mocks `expo-web-browser`** — `openAuthSessionAsync` returns `{ type: 'cancel', url: null }` by default; `maybeCompleteAuthSession` is a no-op.

4. **Mocks `expo-linking`** — `createURL` returns `workflowtest://<path>`; `parse` returns `{ queryParams: {}, path: url }`.

5. **Mocks `react-native-reanimated`** — uses the official `react-native-reanimated/mock` stub.

### Overriding mocks per-test

Use `jest.mocked(...)` + `.mockReturnValue(...)` to override a global mock for one test or test file. Example from `login.test.tsx`:

```ts
// Override openBrowserAsync (not in the global mock) for this file:
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(async () => ({ type: 'cancel', url: null })),
  openBrowserAsync: jest.fn(async () => ({ type: 'opened' })),
  maybeCompleteAuthSession: jest.fn(),
}));
```

### Rendering screens in tests

All screen tests wrap the component in `SafeAreaProvider` with fixed `initialMetrics` to prevent safe-area layout from throwing in the Node test environment:

```ts
const initialMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 393, height: 852 },
};
function renderScreen(ui = <MyScreen />) {
  return render(<SafeAreaProvider initialMetrics={initialMetrics}>{ui}</SafeAreaProvider>);
}
```

### Simulating DateField date selection

`DateField`'s internal `DateTimePickerModal` cannot be driven in the Jest environment. Tests fire the `onChangeDate` prop directly:

```ts
fireEvent(screen.getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
```

This bypasses the native picker UI and feeds a date directly into the component's `onChangeDate` callback.

## Maestro E2E conventions

Maestro flows live in `.maestro/`. Run with:

```bash
maestro test .maestro/
```

### Preconditions

- A **dev-client build** must be installed on a booted iOS Simulator. Maestro identifies apps by native `appId` (`com.workflowtest.app`) and cannot attach to Expo Go (`host.exp.Exponent`).
- For flows that require an authenticated session (e.g., `onboarding-step-1.yaml`), the user must be **already signed in** before running the flow. Maestro cannot drive the Google OAuth consent sheet.

### Known Maestro limitations

1. **Cannot attach to Expo Go.** Always use a dev-client or production build.

2. **Cannot drive `ASWebAuthenticationSession` (Google OAuth sheet).** The consent screen is a system Safari sheet — Maestro has no access to it. Auth flows must be tested with Jest/RNTL using a mocked `useAuth`.

3. **Cannot drive native date pickers reliably.** The iOS date picker is a native wheel UI. `tapOn: { id: "dob-field" }` opens the picker, but selecting a specific date via Maestro gestures is flaky across iOS versions. Workaround: the RNTL tests cover date selection via `fireEvent`; Maestro flows may need to accept "picker opened and closed" as sufficient signal, or use a dev-build-only shortcut to seed a date.

4. **`onboarding-step-1.yaml` is in RED state.** The Maestro flow was authored alongside the RED TDD plan. It is expected to pass once a dev-client build ships the implementation.

## Key files

| File | Role |
|---|---|
| `jest-setup.ts` | Global module mocks and env var injection |
| `package.json` `"jest"` | Jest config: `jest-expo` preset, `moduleNameMapper`, `transformIgnorePatterns` |
| `app/(auth)/__tests__/login.test.tsx` | Login screen tests |
| `app/(onboarding)/__tests__/step-1.test.tsx` | Onboarding step 1 tests |
| `hooks/__tests__/use-redirect-on-sign-in.test.ts` | Hook tests |
| `.maestro/onboarding-step-1.yaml` | E2E onboarding smoke flow |

## Cross-refs

- `docs/development/setup.md` — how to install and run the test suite
- `docs/architecture/authentication.md` — why OAuth cannot be E2E-tested with Maestro
