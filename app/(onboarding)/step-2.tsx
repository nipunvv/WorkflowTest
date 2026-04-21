import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

// Placeholder for Onboarding Step 2. Tracked as a separate issue; this stub
// exists so `router.push('/onboarding/step-2')` from Step 1 resolves without
// a 404 on a dev-client build.
export default function OnboardingStep2Screen() {
  return (
    <View className="flex-1 bg-bg-primary">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-text-heading text-center"
            style={{ fontSize: 24, fontWeight: '700' }}
          >
            Step 2 coming soon
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
