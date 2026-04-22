# Sign-In Screen

## Purpose

Documents the login screen UI: what it renders, how it behaves, its accessibility contract, and its test coverage. This is the only screen in the `(auth)` group.

**File:** `app/(auth)/login.tsx`

## Scope

- Visual layout and copy
- Google sign-in button: states, behavior, error handling
- Legal footer links
- Loading state
- Accessibility

**Not covered:** the OAuth flow that `signInWithGoogle()` triggers (see `authentication.md`); what happens after a successful sign-in (see `post-signin-redirect.md`).

## Layout

The screen has two main layout regions inside a `SafeAreaView` with `edges={['top', 'bottom']}`:

**Top section (logo + copy):** centered, `gap: 24`
1. Logo container (140×140) — glow image (absolute, decorative) behind a honey-tan rounded square (72×72, `borderRadius: 20`) containing the 🍯 emoji.
2. Two-line heading: "Welcome to" / "Hi Honey" — `fontSize: 32`, `fontWeight: '700'`, `text-text-heading`.
3. Subtext: "Your gentle companion for tracking symptoms & finding triggers." — `fontSize: 16`, `text-text-body`.
4. Privacy badge (pill shape, `borderRadius: 100`) — "🔒 Your health data is private & encrypted" — `bg-bg-badge`, `text-text-badge`.

**Bottom section (CTA):** `gap: 16`
1. Google sign-in button — full-width (height 56), `bg-button-primary-bg`, `borderRadius: 16`.
2. Legal footer — inline text with tappable Terms of Service and Privacy Policy links.

A full-screen background decoration image (`auth-decorations.png`) is absolutely positioned behind everything, `pointerEvents="none"`, `contentFit="cover"`.

## Google sign-in button

| State | Visual |
|---|---|
| Idle | Google logo + "Sign in with Google" text, white text on dark background |
| Loading | `ActivityIndicator` (`testID="google-button-spinner"`) replaces the logo + text; button disabled |
| Error | Alert dialog with the error message; button re-enables |

**Behavior:**
- Pressing calls `signInWithGoogle()` from `useAuth()`.
- Guard: if `submitting === true`, the handler returns early (prevents double-tap).
- `submitting` is set to `true` before the call and reset to `false` in the `finally` block, so the button re-enables on both success and error.
- On error (`result.error != null`): `Alert.alert('Sign-in failed', error.message)`.
- On success: the `onAuthStateChange` listener in `AuthProvider` updates the session; navigation is handled by `useRedirectOnSignIn` in `app/_layout.tsx`, not by the screen itself.

**Accessibility:**
```
accessibilityRole="button"
accessibilityLabel="Sign in with Google"
accessibilityState={{ busy: submitting, disabled: submitting }}
```

## Legal footer

Inline `Text` block: "By continuing, you agree to our [Terms of Service] and [Privacy Policy]"

- Both links are `<Text>` with `accessibilityRole="link"` and `textDecorationLine: 'underline'`.
- Tapping opens the URL in an in-app browser via `WebBrowser.openBrowserAsync(url)`.
- URLs are hardcoded constants at the top of the file:
  ```ts
  const TERMS_URL = 'https://example.com/terms';
  const PRIVACY_URL = 'https://example.com/privacy';
  ```
  **These are placeholder URLs** and have not been replaced with real legal pages.

## Key files & components

| File | Role |
|---|---|
| `app/(auth)/login.tsx` | Screen implementation |
| `app/(auth)/__tests__/login.test.tsx` | Jest + RNTL test suite |
| `app/(auth)/_layout.tsx` | Group layout (headerless Stack) |
| `assets/images/auth-decorations.png` | Background decoration (decorative, `pointerEvents="none"`) |
| `assets/images/auth-logo-glow.png` | Logo glow halo (decorative) |
| `assets/images/google-logo.png` | Google "G" logo in the button |

## Dependencies

- `expo-image` — `Image` component for logo and decorations
- `expo-web-browser` — `openBrowserAsync` for legal links
- `react-native-safe-area-context` — `SafeAreaView`
- `lib/auth-context` — `useAuth()` hook

## Test coverage (`app/(auth)/__tests__/login.test.tsx`)

| Area | Tests |
|---|---|
| Static content | headline, subtext, privacy badge, Google button, legal links |
| Google sign-in wiring | button calls `signInWithGoogle`, deduplication guard, loading spinner, error Alert, re-enables after error |
| Legal links | Terms opens URL with `/terms`, Privacy opens URL with `/privacy` |
| Accessibility | button and both links have role + label |

`useAuth` is mocked at the module level with `jest.mock('@/lib/auth-context')`. `expo-web-browser` is overridden per-test to add `openBrowserAsync` (the `jest-setup.ts` global only stubs `openAuthSessionAsync`).

## Not shipped / follow-up

- **Terms and Privacy URLs are placeholder.** `https://example.com/terms` and `https://example.com/privacy` must be replaced before any public release.
- **No "Sign in with Apple" option.** Apple's guidelines require native apps that offer social sign-in to include Sign in with Apple. Not implemented.
- **No error recovery beyond Alert.** A dismissed Alert offers no retry shortcut; the user must tap the button again manually.

## Cross-refs

- `docs/architecture/authentication.md` — what `signInWithGoogle()` does internally
- `docs/onboarding/post-signin-redirect.md` — where the user goes after sign-in
