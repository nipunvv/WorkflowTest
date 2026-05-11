import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Post-onboarding placeholder. The original spec for issue #4 routed
// Get Started to `(tabs)`, but `(tabs)` was removed before this branch
// rebased onto main. Until the real post-onboarding destination ships,
// this screen is the landing zone for `router.replace('/(onboarding)/complete')`.
export default function OnboardingCompleteScreen() {
  return (
    <View className="flex-1 bg-bg-primary" testID="onboarding-complete-screen">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-center text-text-heading"
            style={{ fontSize: 28, fontWeight: '700', lineHeight: 36 }}
          >
            You&rsquo;re all set!
          </Text>
          <Text
            className="text-center text-text-subtle"
            style={{ fontSize: 15, lineHeight: 22, marginTop: 12 }}
          >
            Your dashboard is coming soon.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
