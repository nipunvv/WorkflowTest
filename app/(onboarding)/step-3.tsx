import { View } from 'react-native';

// RED-phase stub. Exists so app/(onboarding)/__tests__/step-3.test.tsx
// can import and render the screen without a module-resolution error;
// every UI assertion fails with "Unable to find ..." — the RED signal.
// GREEN (issue #4) replaces this with the real Preferred Language screen.
export default function OnboardingStep3Screen() {
  return <View testID="onboarding-step-3-screen" />;
}
