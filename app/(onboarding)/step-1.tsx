import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

type DateFieldProps = {
  testID: string;
  accessibilityLabel: string;
  value: Date | null;
  onChangeDate: (date: Date) => void;
  disabled?: boolean;
  placeholder: string;
  disabledPlaceholder?: string;
  defaultPickerDate?: Date;
};

function DateField(props: DateFieldProps) {
  const {
    testID,
    accessibilityLabel,
    value,
    onChangeDate,
    disabled = false,
    placeholder,
    disabledPlaceholder,
    defaultPickerDate,
  } = props;
  const [pickerOpen, setPickerOpen] = useState(false);

  const shownText = disabled
    ? (disabledPlaceholder ?? placeholder)
    : value
      ? formatDate(value)
      : placeholder;

  const textColor = disabled
    ? '#b2a699'
    : value
      ? '#33291f'
      : '#a6998c';

  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setPickerOpen(true)}
        style={{
          backgroundColor: disabled ? '#f2f0ed' : '#faf7f5',
          borderColor: disabled ? '#e5e3e0' : '#e0dbd6',
          borderWidth: 1,
          borderRadius: 16,
          borderCurve: 'continuous',
          height: 52,
          paddingHorizontal: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text style={{ fontSize: 16, color: textColor }}>{shownText}</Text>
        <Text style={{ fontSize: 18 }}>📅</Text>
      </Pressable>
      <DateTimePickerModal
        isVisible={pickerOpen}
        mode="date"
        maximumDate={new Date()}
        date={value ?? defaultPickerDate ?? new Date()}
        onConfirm={(d) => {
          setPickerOpen(false);
          onChangeDate(d);
        }}
        onCancel={() => setPickerOpen(false)}
      />
    </>
  );
}

export default function OnboardingStep1Screen() {
  const { push, back } = useRouter();

  const [firstName, setFirstName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [diagnosisDate, setDiagnosisDate] = useState<Date | null>(null);
  const [notSure, setNotSure] = useState(false);

  const canProceed = firstName.trim().length > 0 && (dateOfBirth !== null || notSure);

  const handleNotSureChange = (value: boolean) => {
    setNotSure(value);
    if (value) setDiagnosisDate(null);
  };

  const handleNext = () => {
    if (!canProceed) return;
    push('/(onboarding)/step-2');
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
              Step 1 of 3
            </Text>
            <View
              testID="progress-bar"
              className="bg-bg-progress-track overflow-hidden"
              style={{
                height: 6,
                borderRadius: 3,
                width: '100%',
              }}
            >
              <View
                testID="progress-fill"
                className="bg-bg-progress-fill"
                style={{
                  height: 6,
                  borderRadius: 3,
                  width: '33.333%',
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
              gap: 28,
              boxShadow: '0 4px 24px rgba(212,165,116,0.08)',
            }}
          >
            <Text
              className="text-text-heading"
              style={{ fontSize: 24, lineHeight: 32, fontWeight: '700' }}
            >
              Let&apos;s get to know you 👋
            </Text>

            <View style={{ gap: 8, width: '100%' }}>
              <Text
                className="text-text-body"
                style={{ fontSize: 14, fontWeight: '500' }}
              >
                First Name
              </Text>
              <TextInput
                accessibilityLabel="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Angel"
                placeholderTextColor="#a6998c"
                className="bg-bg-input text-text-heading"
                style={{
                  borderColor: '#d4a574',
                  borderWidth: 1.5,
                  borderRadius: 16,
                  borderCurve: 'continuous',
                  height: 52,
                  paddingHorizontal: 18,
                  fontSize: 16,
                }}
              />
            </View>

            <View style={{ gap: 8, width: '100%' }}>
              <Text
                className="text-text-body"
                style={{ fontSize: 14, fontWeight: '500' }}
              >
                Date of Birth
              </Text>
              <DateField
                testID="dob-field"
                accessibilityLabel="Date of Birth"
                value={dateOfBirth}
                onChangeDate={setDateOfBirth}
                placeholder="Select date"
                defaultPickerDate={new Date(1990, 0, 1)}
              />
            </View>

            <View style={{ gap: 8, width: '100%' }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Text
                  className="text-text-body"
                  style={{ fontSize: 14, fontWeight: '500' }}
                >
                  Diagnosis Date
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Switch
                    testID="diagnosis-not-sure"
                    accessibilityRole="switch"
                    accessibilityLabel="Not sure"
                    value={notSure}
                    onValueChange={handleNotSureChange}
                    trackColor={{ true: '#9caf88', false: '#d4c3b0' }}
                    thumbColor="#ffffff"
                    ios_backgroundColor="#d4c3b0"
                  />
                  <Text
                    className="text-text-subtle"
                    style={{ fontSize: 13 }}
                  >
                    Not sure
                  </Text>
                </View>
              </View>
              <DateField
                testID="diagnosis-field"
                accessibilityLabel="Diagnosis Date"
                value={diagnosisDate}
                onChangeDate={setDiagnosisDate}
                disabled={notSure}
                placeholder="Select diagnosis date"
                disabledPlaceholder="Not applicable"
              />
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
