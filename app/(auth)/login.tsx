import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';

const TERMS_URL = 'https://example.com/terms';
const PRIVACY_URL = 'https://example.com/privacy';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Sign-in failed', error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openTerms = () => {
    WebBrowser.openBrowserAsync(TERMS_URL);
  };

  const openPrivacy = () => {
    WebBrowser.openBrowserAsync(PRIVACY_URL);
  };

  return (
    <View className="flex-1 bg-bg-primary">
      <View
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Image
          source={require('@/assets/images/auth-decorations.png')}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
      </View>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View
          className="flex-1 justify-between px-8"
          style={{ paddingTop: 48, paddingBottom: 16 }}
        >
          <View className="items-center" style={{ gap: 24 }}>
            <View
              className="items-center justify-center"
              style={{ width: 140, height: 140 }}
            >
              <View
                pointerEvents="none"
                style={{ position: 'absolute', width: 140, height: 140 }}
              >
                <Image
                  source={require('@/assets/images/auth-logo-glow.png')}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                />
              </View>
              <View
                className="bg-bg-logo items-center justify-center"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  borderCurve: 'continuous',
                }}
              >
                <Text style={{ fontSize: 36 }}>🍯</Text>
              </View>
            </View>

            <View className="items-center" style={{ gap: 4 }}>
              <Text
                className="text-text-heading text-center"
                style={{ fontSize: 32, lineHeight: 40, fontWeight: '700' }}
              >
                Welcome to
              </Text>
              <Text
                className="text-text-heading text-center"
                style={{ fontSize: 32, lineHeight: 40, fontWeight: '700' }}
              >
                Hi Honey
              </Text>
            </View>

            <Text
              className="text-text-body text-center"
              style={{ fontSize: 16, lineHeight: 24, paddingHorizontal: 16 }}
            >
              Your gentle companion for tracking symptoms & finding triggers.
            </Text>

            <View
              className="bg-bg-badge flex-row items-center"
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 100,
                borderCurve: 'continuous',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 14 }}>🔒</Text>
              <Text
                className="text-text-badge"
                style={{ fontSize: 13, fontWeight: '500' }}
              >
                Your health data is private & encrypted
              </Text>
            </View>
          </View>

          <View style={{ gap: 16 }}>
            <Pressable
              onPress={handleGoogleSignIn}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Sign in with Google"
              accessibilityState={{ busy: submitting, disabled: submitting }}
              className="bg-button-primary-bg flex-row items-center justify-center"
              style={{
                height: 56,
                borderRadius: 16,
                borderCurve: 'continuous',
                gap: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {submitting ? (
                <ActivityIndicator testID="google-button-spinner" color="#ffffff" />
              ) : (
                <>
                  <Image
                    source={require('@/assets/images/google-logo.png')}
                    style={{ width: 20, height: 20 }}
                    contentFit="contain"
                  />
                  <Text
                    className="text-white"
                    style={{ fontSize: 17, fontWeight: '600' }}
                  >
                    Sign in with Google
                  </Text>
                </>
              )}
            </Pressable>

            <Text
              className="text-text-subtle text-center"
              style={{ fontSize: 12, lineHeight: 18 }}
            >
              By continuing, you agree to our{' '}
              <Text
                onPress={openTerms}
                accessibilityRole="link"
                accessibilityLabel="Terms of Service"
                className="text-accent-primary"
                style={{ fontWeight: '500', textDecorationLine: 'underline' }}
              >
                Terms of Service
              </Text>
              {' and '}
              <Text
                onPress={openPrivacy}
                accessibilityRole="link"
                accessibilityLabel="Privacy Policy"
                className="text-accent-primary"
                style={{ fontWeight: '500', textDecorationLine: 'underline' }}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
