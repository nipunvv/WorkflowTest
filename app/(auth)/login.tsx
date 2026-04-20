import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    const { error } = await signInWithGoogle();
    setSubmitting(false);
    if (error) {
      Alert.alert('Sign-in failed', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-neutral-950">
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-16 items-center">
          <Text className="mb-2 text-3xl font-bold text-neutral-900 dark:text-white">
            workflow-test
          </Text>
          <Text className="text-base text-neutral-500 dark:text-neutral-400">
            Sign in to continue
          </Text>
        </View>

        <Pressable
          onPress={handleGoogleSignIn}
          disabled={submitting}
          className="w-full flex-row items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 py-4 active:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:active:bg-neutral-800"
        >
          {submitting ? (
            <ActivityIndicator />
          ) : (
            <Text className="text-base font-medium text-neutral-900 dark:text-white">
              Continue with Google
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
