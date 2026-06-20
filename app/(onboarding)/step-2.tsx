import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GOALS, type Goal, type GoalId } from './goals';

type GoalRowProps = {
  goal: Goal;
  selected: boolean;
  onToggle: (id: GoalId) => void;
};

function GoalRow({ goal, selected, onToggle }: GoalRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={goal.label}
      accessibilityState={{ checked: selected }}
      onPress={() => onToggle(goal.id)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: selected ? 'rgba(156,175,136,0.12)' : '#faf7f5',
        borderColor: selected ? '#9caf88' : '#e0dbd6',
        borderWidth: selected ? 2 : 1,
        // Padding-compensation for the 1dp border delta (mirrors LanguageRow
        // in step-3.tsx) — keeps outer geometry constant on toggle.
        paddingHorizontal: selected ? 17 : 18,
        paddingVertical: selected ? 12 : 13,
        borderRadius: 16,
        borderCurve: 'continuous',
      }}
    >
      <Text style={{ fontSize: 22 }}>{goal.emoji}</Text>
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text
          className="text-text-heading"
          style={{ fontSize: 16, fontWeight: selected ? '600' : '500' }}
        >
          {goal.label}
        </Text>
      </View>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: selected ? '#9caf88' : '#ffffff',
          borderWidth: selected ? 0 : 1.5,
          borderColor: '#d1c9c2',
        }}
      >
        {selected ? (
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>✓</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

type OtherRowProps = {
  selected: boolean;
  otherText: string;
  onToggle: () => void;
  onChangeText: (text: string) => void;
};

function OtherRow({ selected, otherText, onToggle, onChangeText }: OtherRowProps) {
  return (
    <Pressable
      testID="goal-row-other"
      accessibilityRole="checkbox"
      accessibilityLabel="Other"
      accessibilityState={{ checked: selected }}
      onPress={onToggle}
      style={{
        backgroundColor: selected ? 'rgba(156,175,136,0.12)' : '#faf7f5',
        borderColor: selected ? '#9caf88' : '#e0dbd6',
        borderWidth: selected ? 2 : 1,
        paddingHorizontal: selected ? 17 : 18,
        paddingVertical: selected ? 12 : 13,
        borderRadius: 16,
        borderCurve: 'continuous',
        gap: 8,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ fontSize: 22 }}>✍️</Text>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text
            className="text-text-heading"
            style={{ fontSize: 16, fontWeight: selected ? '600' : '500' }}
          >
            Other
          </Text>
        </View>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: selected ? '#9caf88' : '#ffffff',
            borderWidth: selected ? 0 : 1.5,
            borderColor: '#d1c9c2',
          }}
        >
          {selected ? (
            <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>✓</Text>
          ) : null}
        </View>
      </View>
      {selected ? (
        <TextInput
          testID="goal-other-input"
          accessibilityLabel="Other goal text"
          value={otherText}
          onChangeText={onChangeText}
          placeholder="Tell us what matters to you…"
          placeholderTextColor="#a6998c"
          style={{
            backgroundColor: '#ffffff',
            borderColor: '#d4a574',
            borderWidth: 1.5,
            borderRadius: 12,
            borderCurve: 'continuous',
            height: 48,
            paddingHorizontal: 16,
            fontSize: 15,
            color: '#33291f',
            marginTop: 6,
          }}
        />
      ) : null}
    </Pressable>
  );
}

export default function OnboardingStep2Screen() {
  const { push, back } = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [selectedPresets, setSelectedPresets] = useState<Set<GoalId>>(new Set());
  const [otherSelected, setOtherSelected] = useState(false);
  const [otherText, setOtherText] = useState('');

  const canProceed = selectedPresets.size > 0 || otherSelected;

  const handleTogglePreset = (id: GoalId) => {
    // Dismiss the keyboard if the Other input has focus — tapping a different
    // row should commit the existing typed text and close the keyboard.
    Keyboard.dismiss();
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleOther = () => {
    setOtherSelected((prev) => {
      const next = !prev;
      if (!next) {
        // Deselect: clear typed text per spec.
        setOtherText('');
      } else {
        // Select: scroll to the bottom so the just-revealed input is visible
        // above the keyboard. Defer to the next frame so the row's layout
        // change has flushed before we measure.
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
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
          ref={scrollRef}
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
              Step 2 of 4
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
                  width: '50%',
                }}
              />
            </View>
          </View>

          <View style={{ height: 12 }} />

          <View
            className="bg-bg-card"
            style={{
              borderRadius: 24,
              borderCurve: 'continuous',
              paddingVertical: 20,
              paddingHorizontal: 24,
              gap: 16,
              boxShadow: '0 4px 24px rgba(212,165,116,0.08)',
            }}
          >
            <View style={{ gap: 8 }}>
              <Text
                className="text-text-heading"
                style={{ fontSize: 24, lineHeight: 32, fontWeight: '700' }}
              >
                What matters most to you right now?
              </Text>
              <Text
                className="text-text-subtle"
                style={{ fontSize: 14, fontWeight: '400' }}
              >
                Select all that apply — we&apos;ll personalize your experience
              </Text>
            </View>

            <View style={{ flexDirection: 'column', gap: 8 }}>
              {GOALS.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  selected={selectedPresets.has(goal.id)}
                  onToggle={handleTogglePreset}
                />
              ))}
              <OtherRow
                selected={otherSelected}
                otherText={otherText}
                onToggle={handleToggleOther}
                onChangeText={setOtherText}
              />
            </View>
          </View>

          <View style={{ flex: 1, minHeight: 16 }} />

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
