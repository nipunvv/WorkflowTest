import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder for Onboarding Step 3. Tracked as a separate issue; this stub
// exists so `router.push('/onboarding/step-3')` from Step 2 resolves without
// a 404 on a dev-client build.
export default function OnboardingStep3Screen() {
  return (
    <View className="flex-1 bg-bg-primary">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center px-8">
          <Text
            className="text-text-heading text-center"
            style={{ fontSize: 24, fontWeight: '700' }}
          >
            Step 3 coming soon
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
