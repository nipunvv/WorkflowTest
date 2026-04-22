import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SYMPTOMS, type Symptom, type SymptomId } from './symptoms';

type SymptomChipProps = {
  symptom: Symptom;
  selected: boolean;
  onToggle: (id: SymptomId) => void;
};

function SymptomChip({ symptom, selected, onToggle }: SymptomChipProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={symptom.accessibilityLabel}
      accessibilityState={{ checked: selected }}
      onPress={() => onToggle(symptom.id)}
      style={{
        backgroundColor: selected ? '#9caf88' : '#faf7f5',
        borderColor: selected ? 'transparent' : '#e0dbd6',
        borderWidth: 1,
        borderRadius: 100,
        borderCurve: 'continuous',
        paddingHorizontal: 18,
        paddingVertical: 14,
        boxShadow: selected ? '0 2px 8px rgba(156,175,136,0.25)' : undefined,
      }}
    >
      <Text
        style={{
          color: selected ? '#ffffff' : '#594d40',
          fontSize: 15,
          fontWeight: selected ? '600' : '500',
        }}
      >
        {symptom.emoji} {symptom.label}
      </Text>
    </Pressable>
  );
}

export default function OnboardingStep2Screen() {
  const { push, back } = useRouter();
  const [selected, setSelected] = useState<Set<SymptomId>>(new Set());

  const canProceed = selected.size > 0;

  const handleToggle = (id: SymptomId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (!canProceed) return;
    push('/(onboarding)/step-3');
  };

  return (
    <View className="flex-1 bg-bg-primary">
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
            <Text
              className="text-text-subtle"
              style={{ fontSize: 14, fontWeight: '500' }}
            >
              Step 2 of 3
            </Text>
            <View
              testID="progress-bar"
              className="bg-bg-progress-track overflow-hidden"
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
                  width: '66.666%',
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
                What are your primary symptoms?
              </Text>
              <Text
                className="text-text-subtle"
                style={{ fontSize: 14, fontWeight: '400' }}
              >
                Select all that apply
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              {SYMPTOMS.map((symptom) => (
                <SymptomChip
                  key={symptom.id}
                  symptom={symptom}
                  selected={selected.has(symptom.id)}
                  onToggle={handleToggle}
                />
              ))}
            </View>
          </View>

          <View style={{ flex: 1, minHeight: 40 }} />

          <View style={{ gap: 16, alignItems: 'center', width: '100%' }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next"
              accessibilityState={{ disabled: !canProceed }}
              disabled={!canProceed}
              onPress={handleNext}
              className="bg-bg-next"
              style={{
                height: 56,
                width: '100%',
                borderRadius: 16,
                borderCurve: 'continuous',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(212,165,116,0.3)',
                opacity: canProceed ? 1 : 0.5,
              }}
            >
              <Text
                className="text-white"
                style={{ fontSize: 17, fontWeight: '600' }}
              >
                Next
              </Text>
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
              <Text
                className="text-text-subtle"
                style={{ fontSize: 15, fontWeight: '500' }}
              >
                Back
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
