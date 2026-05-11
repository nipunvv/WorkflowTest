import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LANGUAGES, type Language, type LanguageCode } from './languages';

type LanguageRowProps = {
  language: Language;
  selected: boolean;
  onSelect: (code: LanguageCode) => void;
};

function LanguageRow({ language, selected, onSelect }: LanguageRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={language.accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={() => onSelect(language.code)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: selected ? 'rgba(156,175,136,0.12)' : '#faf7f5',
        borderColor: selected ? '#9caf88' : '#e5e0db',
        borderWidth: selected ? 2 : 1,
        // Compensate for the 1dp border delta so the outer footprint is stable.
        paddingHorizontal: selected ? 17 : 18,
        paddingVertical: selected ? 19 : 20,
        borderRadius: 16,
        borderCurve: 'continuous',
      }}
    >
      <Text style={{ fontSize: 24 }}>{language.flag}</Text>
      <View style={{ flex: 1, marginLeft: 12, gap: 2 }}>
        <Text className="text-text-heading" style={{ fontSize: 16, fontWeight: '600' }}>
          {language.nativeName}
        </Text>
        <Text className="text-text-subtle" style={{ fontSize: 13, fontWeight: '400' }}>
          {language.englishName}
        </Text>
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: selected ? '#9caf88' : '#cfc8c1',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#9caf88',
            }}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

export default function OnboardingStep3Screen() {
  const { push, back } = useRouter();
  const { firstName, symptomCount } = useLocalSearchParams<{
    firstName?: string;
    symptomCount?: string;
  }>();
  const [selected, setSelected] = useState<LanguageCode>('en');

  const handleSelect = (code: LanguageCode) => {
    setSelected(code);
  };

  const handleGetStarted = () => {
    const languageLabel = LANGUAGES.find((l) => l.code === selected)?.englishName ?? 'English';
    push({
      pathname: '/(onboarding)/step-4',
      params: { firstName, symptomCount, deviceCount: '0', languageLabel },
    });
  };

  return (
    <View className="flex-1 bg-bg-primary" testID="onboarding-step-3-screen">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 28,
            paddingHorizontal: 28,
            paddingBottom: 32,
          }}
        >
          <View style={{ gap: 12, paddingBottom: 8, width: '100%' }}>
            <Text className="text-text-subtle" style={{ fontSize: 14, fontWeight: '500' }}>
              Step 3 of 4
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
                  width: '75%',
                }}
              />
            </View>
          </View>

          <View style={{ height: 36 }} />

          <View
            className="bg-bg-card"
            style={{
              borderRadius: 24,
              borderCurve: 'continuous',
              paddingVertical: 28,
              paddingHorizontal: 24,
              gap: 24,
              boxShadow: '0 4px 24px rgba(212,165,116,0.08)',
            }}
          >
            <View style={{ gap: 8 }}>
              <Text
                className="text-text-heading"
                style={{ fontSize: 24, lineHeight: 32, fontWeight: '700' }}
              >
                Preferred Language? 🌍
              </Text>
              <Text className="text-text-subtle" style={{ fontSize: 14, fontWeight: '400' }}>
                You can change this later in settings
              </Text>
            </View>

            <View
              accessible
              accessibilityRole="radiogroup"
              accessibilityLabel="Preferred language"
              style={{ gap: 12 }}
            >
              {LANGUAGES.map((language) => (
                <LanguageRow
                  key={language.code}
                  language={language}
                  selected={selected === language.code}
                  onSelect={handleSelect}
                />
              ))}
            </View>
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
              <Text style={{ fontSize: 18 }}>🎉</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={back}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
              }}
            >
              <Text className="text-text-subtle" style={{ fontSize: 15, fontWeight: '500' }}>
                Back
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
