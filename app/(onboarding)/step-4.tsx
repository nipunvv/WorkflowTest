import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type SummaryRowProps = {
  label: string;
};

function SummaryRow({ label }: SummaryRowProps) {
  return (
    <View
      accessible
      role="listitem"
      accessibilityLabel={label}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
    >
      <View
        className="bg-accent-sage items-center justify-center"
        style={{ width: 20, height: 20, borderRadius: 10, borderCurve: 'continuous' }}
      >
        <Text style={{ color: '#ffffff', fontSize: 11, fontWeight: '700' }}>✓</Text>
      </View>
      <Text
        className="text-text-heading"
        style={{ fontSize: 15, fontWeight: '500', lineHeight: 20 }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function OnboardingStep4Screen() {
  const { replace } = useRouter();
  const { firstName, symptomCount, deviceCount, languageLabel } = useLocalSearchParams<{
    firstName?: string;
    symptomCount?: string;
    deviceCount?: string;
    languageLabel?: string;
  }>();

  const title = firstName ? `You're all set, ${firstName}!` : "You're all set!";
  const symptomLabel = `${Number(symptomCount ?? 0)} symptoms tracked`;
  const deviceNum = Number(deviceCount ?? 0);
  const deviceLabel = deviceNum === 1 ? '1 device connected' : `${deviceNum} devices connected`;
  const languageRowLabel = `Language set to ${languageLabel ?? 'English'}`;

  const handleGetStarted = () => {
    replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-bg-primary" testID="onboarding-step-4-screen">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 60,
            paddingHorizontal: 28,
            paddingBottom: 32,
          }}
        >
          <View style={{ gap: 12, paddingBottom: 8, width: '100%' }}>
            <Text className="text-text-subtle" style={{ fontSize: 14, fontWeight: '500' }}>
              Step 4 of 4
            </Text>
            <View
              testID="progress-bar"
              className="overflow-hidden bg-bg-progress-track"
              style={{
                height: 6,
                borderRadius: 3,
                borderCurve: 'continuous',
                width: '100%',
              }}
            >
              <View
                testID="progress-fill"
                className="bg-bg-progress-fill"
                style={{
                  height: 6,
                  borderRadius: 3,
                  borderCurve: 'continuous',
                  width: '100%',
                }}
              />
            </View>
          </View>

          <View style={{ height: 40 }} />

          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="Onboarding complete"
            style={{
              width: 160,
              height: 160,
              alignSelf: 'center',
              position: 'relative',
            }}
          >
            <View
              style={{
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: 'rgba(156,175,136,0.12)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 20,
                left: 20,
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: 'rgba(212,165,116,0.15)',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 36,
                left: 36,
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: '#d4a574',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: 48,
                  fontWeight: '700',
                  lineHeight: 88,
                }}
              >
                ✓
              </Text>
            </View>
            <Text style={{ position: 'absolute', top: 30, left: 12, fontSize: 14 }}>✨</Text>
            <Text style={{ position: 'absolute', top: 22, right: 6, fontSize: 16 }}>✨</Text>
            <Text style={{ position: 'absolute', bottom: 28, left: 8, fontSize: 12 }}>✨</Text>
            <Text style={{ position: 'absolute', bottom: 22, right: 2, fontSize: 14 }}>✨</Text>
          </View>

          <View style={{ height: 28 }} />

          <View style={{ gap: 8, alignItems: 'center' }}>
            <Text
              accessibilityRole="header"
              style={{
                fontSize: 28,
                lineHeight: 36,
                fontWeight: '700',
                color: '#33291f',
                textAlign: 'center',
                letterSpacing: -0.5,
              }}
            >
              {title}
            </Text>
            <Text
              className="text-text-body-secondary"
              style={{
                fontSize: 15,
                lineHeight: 22,
                fontWeight: '400',
                textAlign: 'center',
              }}
            >
              Your gentle companion is ready.
            </Text>
            <Text
              className="text-text-body-secondary"
              style={{
                fontSize: 15,
                lineHeight: 22,
                fontWeight: '400',
                textAlign: 'center',
              }}
            >
              Let&apos;s start your journey, one day at a time.
            </Text>
          </View>

          <View style={{ height: 28 }} />

          <View
            accessible
            role="list"
            accessibilityLabel="Onboarding summary"
            className="border-border-card bg-bg-card"
            style={{
              borderWidth: 1,
              borderRadius: 20,
              borderCurve: 'continuous',
              padding: 20,
              gap: 12,
              boxShadow: '0 4px 16px rgba(51,41,31,0.06)',
            }}
          >
            <SummaryRow label="Profile saved" />
            <SummaryRow label={symptomLabel} />
            <SummaryRow label={deviceLabel} />
            <SummaryRow label={languageRowLabel} />
          </View>

          <View style={{ flex: 1, minHeight: 40 }} />

          <View style={{ gap: 16, alignItems: 'center', width: '100%' }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get Started"
              onPress={handleGetStarted}
              className="bg-bg-next"
              style={{
                height: 56,
                width: '100%',
                borderRadius: 16,
                borderCurve: 'continuous',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 16px rgba(212,165,116,0.3)',
              }}
            >
              <Text className="text-white" style={{ fontSize: 17, fontWeight: '600' }}>
                Get Started
              </Text>
              <Text style={{ fontSize: 16 }}>🍯</Text>
            </Pressable>
            <View
              className="bg-bg-privacy-pill"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 100,
              }}
            >
              <Text style={{ fontSize: 12 }}>🔒</Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: '#5c754d',
                }}
              >
                Your health data is private &amp; encrypted
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
