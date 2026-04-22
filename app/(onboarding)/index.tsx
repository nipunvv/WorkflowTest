import { Redirect } from 'expo-router';

// The (onboarding) group has no native index screen — Step 1 is the real
// entry. This redirect resolves the unmatched-route error when the group
// is mounted via its anchor (see app/_layout.tsx unstable_settings).
//
// NOTE: uses the group-prefixed form `/(onboarding)/step-1` because that's
// what the typed-routes manifest currently exposes. Expo Router strips the
// group segment at runtime, so users still see `/onboarding/step-1`.
export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/step-1" />;
}
