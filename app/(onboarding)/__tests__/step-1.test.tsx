import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingStep1Screen from '../step-1';

// Mock expo-router locally. Keep the factory minimal — this test file only cares
// about useRouter. Stack.Screen is included so any incidental import via the
// module graph resolves to a harmless no-op.
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Stack: {
    Screen: () => null,
    Protected: ({ children }: { children: unknown }) => children ?? null,
  },
}));

const initialMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 393, height: 852 },
};

function renderScreen(ui: ReactElement = <OnboardingStep1Screen />) {
  return render(<SafeAreaProvider initialMetrics={initialMetrics}>{ui}</SafeAreaProvider>);
}

let mockPush: jest.Mock;
let mockBack: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockPush = jest.fn();
  mockBack = jest.fn();
  jest.mocked(useRouter).mockReturnValue({
    push: mockPush,
    back: mockBack,
    replace: jest.fn(),
    dismiss: jest.fn(),
    dismissAll: jest.fn(),
    canGoBack: () => true,
    setParams: jest.fn(),
    navigate: jest.fn(),
    reload: jest.fn(),
    prefetch: jest.fn(),
    dismissTo: jest.fn(),
    canDismiss: () => false,
  });
});

describe('OnboardingStep1Screen — static render', () => {
  test('renders the "Step 1 of 3" header caption', () => {
    renderScreen();
    expect(screen.getByText('Step 1 of 3')).toBeOnTheScreen();
  });

  test('renders the progress bar with a fill element', () => {
    renderScreen();
    expect(screen.getByTestId('progress-bar')).toBeOnTheScreen();
    expect(screen.getByTestId('progress-fill')).toBeOnTheScreen();
  });

  test('renders the "Let\'s get to know you" headline', () => {
    renderScreen();
    expect(screen.getByText(/Let's get to know you/i)).toBeOnTheScreen();
  });

  test('renders the First Name text input with an accessible label', () => {
    renderScreen();
    expect(screen.getByLabelText(/First Name/i)).toBeOnTheScreen();
  });

  test('renders the Date of Birth field with a "Select date" placeholder', () => {
    renderScreen();
    expect(screen.getByTestId('dob-field')).toBeOnTheScreen();
    expect(screen.getByText(/Select date/i)).toBeOnTheScreen();
  });

  test('renders the Diagnosis Date field', () => {
    renderScreen();
    expect(screen.getByTestId('diagnosis-field')).toBeOnTheScreen();
  });

  test('renders the "Not sure" switch in the OFF state by default', () => {
    renderScreen();
    const toggle = screen.getByRole('switch', { name: /Not sure/i });
    expect(toggle).toBeOnTheScreen();
    const checked = toggle.props.accessibilityState?.checked ?? toggle.props.value;
    expect(checked).toBe(false);
  });

  test('renders the Next button', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /^Next$/i })).toBeOnTheScreen();
  });

  test('renders the Back link', () => {
    renderScreen();
    // Back may be implemented as a Pressable with accessibilityRole="button" or "link".
    // Accept either — a11y contract is covered separately below.
    const back = screen.queryByRole('link', { name: /^Back$/i })
      ?? screen.getByRole('button', { name: /^Back$/i });
    expect(back).toBeOnTheScreen();
  });
});

describe('OnboardingStep1Screen — First Name input (R2)', () => {
  test('typing into First Name updates the input value', () => {
    renderScreen();
    const input = screen.getByLabelText(/First Name/i);
    fireEvent.changeText(input, 'Angel');
    expect(screen.getByDisplayValue('Angel')).toBeOnTheScreen();
  });
});

describe('OnboardingStep1Screen — "Not sure" toggle (R3)', () => {
  test('toggling "Not sure" ON disables the Diagnosis Date field', () => {
    renderScreen();
    const toggle = screen.getByRole('switch', { name: /Not sure/i });
    fireEvent(toggle, 'valueChange', true);

    const diagnosisField = screen.getByTestId('diagnosis-field');
    expect(diagnosisField.props.accessibilityState?.disabled).toBe(true);
  });

  test('toggling "Not sure" ON clears a previously selected diagnosis date', () => {
    renderScreen();

    // Simulate picking a diagnosis date.
    fireEvent(screen.getByTestId('diagnosis-field'), 'changeDate', new Date('2024-01-15'));
    // Sanity: the picked date is reflected somewhere on the diagnosis field (exact format up to GREEN).
    expect(screen.queryByText(/Not applicable/i)).not.toBeOnTheScreen();

    // Toggle Not sure ON.
    fireEvent(screen.getByRole('switch', { name: /Not sure/i }), 'valueChange', true);

    // Field should now show "Not applicable" and no longer show the picked date.
    expect(screen.getByText(/Not applicable/i)).toBeOnTheScreen();
  });

  test('toggling "Not sure" OFF re-enables the Diagnosis Date field', () => {
    renderScreen();
    const toggle = screen.getByRole('switch', { name: /Not sure/i });

    fireEvent(toggle, 'valueChange', true);
    fireEvent(toggle, 'valueChange', false);

    const diagnosisField = screen.getByTestId('diagnosis-field');
    expect(diagnosisField.props.accessibilityState?.disabled).toBe(false);
  });

  test('the "Not sure" toggle does not affect the Date of Birth field', () => {
    renderScreen();

    fireEvent(screen.getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
    const toggle = screen.getByRole('switch', { name: /Not sure/i });
    fireEvent(toggle, 'valueChange', true);
    fireEvent(toggle, 'valueChange', false);

    // DOB field should not be disabled and should not show "Select date" placeholder
    // (because a date was picked before the toggle cycle).
    expect(screen.queryByText(/Select date/i)).not.toBeOnTheScreen();
  });
});

describe('OnboardingStep1Screen — Next button enablement (R4)', () => {
  function isNextDisabled() {
    const next = screen.getByRole('button', { name: /^Next$/i });
    return next.props.accessibilityState?.disabled === true;
  }

  test('Next is disabled on initial render', () => {
    renderScreen();
    expect(isNextDisabled()).toBe(true);
  });

  test('Next remains disabled with only First Name filled', () => {
    renderScreen();
    fireEvent.changeText(screen.getByLabelText(/First Name/i), 'Angel');
    expect(isNextDisabled()).toBe(true);
  });

  test('Next remains disabled with only Date of Birth set', () => {
    renderScreen();
    fireEvent(screen.getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
    expect(isNextDisabled()).toBe(true);
  });

  test('Next remains disabled with only "Not sure" toggled ON', () => {
    renderScreen();
    fireEvent(screen.getByRole('switch', { name: /Not sure/i }), 'valueChange', true);
    expect(isNextDisabled()).toBe(true);
  });

  test('Next is enabled when First Name and Date of Birth are both set', () => {
    renderScreen();
    fireEvent.changeText(screen.getByLabelText(/First Name/i), 'Angel');
    fireEvent(screen.getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
    expect(isNextDisabled()).toBe(false);
  });

  test('Next is enabled when First Name is set and "Not sure" is ON (no DOB)', () => {
    // Encodes the literal reading of issue #2's acceptance text:
    //   "Next is enabled only when First Name is non-empty AND
    //    (Date of Birth is set OR 'Not sure' is on)"
    // If product intent is actually "DOB is independently required; Not sure only
    // covers the Diagnosis field", this test is wrong and the issue should be
    // clarified BEFORE GREEN starts — per CLAUDE.md, tests must not be modified
    // to make implementation pass.
    renderScreen();
    fireEvent.changeText(screen.getByLabelText(/First Name/i), 'Angel');
    fireEvent(screen.getByRole('switch', { name: /Not sure/i }), 'valueChange', true);
    expect(isNextDisabled()).toBe(false);
  });

  test('clearing First Name re-disables Next even when DOB is set', () => {
    renderScreen();
    fireEvent.changeText(screen.getByLabelText(/First Name/i), 'Angel');
    fireEvent(screen.getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));
    expect(isNextDisabled()).toBe(false);

    fireEvent.changeText(screen.getByLabelText(/First Name/i), '');
    expect(isNextDisabled()).toBe(true);
  });
});

describe('OnboardingStep1Screen — navigation (R5, R6)', () => {
  test('tapping Next with a valid form navigates to /onboarding/step-2', () => {
    renderScreen();
    fireEvent.changeText(screen.getByLabelText(/First Name/i), 'Angel');
    fireEvent(screen.getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));

    fireEvent.press(screen.getByRole('button', { name: /^Next$/i }));

    expect(mockPush).toHaveBeenCalledTimes(1);
    const [arg] = mockPush.mock.calls[0];
    const pathname =
      typeof arg === 'string' ? arg : (arg as { pathname?: string } | undefined)?.pathname;
    expect(pathname).toMatch(/\/onboarding\/step-2/);
  });

  test('tapping Next does nothing when the form is invalid', () => {
    renderScreen();
    fireEvent.changeText(screen.getByLabelText(/First Name/i), 'Angel');
    // No DOB, no "Not sure" — Next is disabled.

    fireEvent.press(screen.getByRole('button', { name: /^Next$/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('tapping Back calls router.back()', () => {
    renderScreen();
    const back = screen.queryByRole('link', { name: /^Back$/i })
      ?? screen.getByRole('button', { name: /^Back$/i });

    fireEvent.press(back);
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('tapping Back does not trigger navigation forward even with a valid form', () => {
    renderScreen();
    fireEvent.changeText(screen.getByLabelText(/First Name/i), 'Angel');
    fireEvent(screen.getByTestId('dob-field'), 'changeDate', new Date('1990-06-01'));

    const back = screen.queryByRole('link', { name: /^Back$/i })
      ?? screen.getByRole('button', { name: /^Back$/i });
    fireEvent.press(back);

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('OnboardingStep1Screen — accessibility (R7)', () => {
  test('every interactive element exposes a role and a non-empty label', () => {
    renderScreen();

    const firstName = screen.getByLabelText(/First Name/i);
    expect(firstName.props.accessibilityLabel).toBeTruthy();

    const dob = screen.getByTestId('dob-field');
    expect(dob.props.accessibilityRole ?? dob.props.role).toBeTruthy();
    expect(dob.props.accessibilityLabel).toBeTruthy();

    const diagnosis = screen.getByTestId('diagnosis-field');
    expect(diagnosis.props.accessibilityRole ?? diagnosis.props.role).toBeTruthy();
    expect(diagnosis.props.accessibilityLabel).toBeTruthy();

    const notSure = screen.getByRole('switch', { name: /Not sure/i });
    expect(notSure.props.accessibilityRole ?? notSure.props.role).toBeTruthy();
    expect(notSure.props.accessibilityLabel).toBeTruthy();

    const next = screen.getByRole('button', { name: /^Next$/i });
    expect(next.props.accessibilityRole ?? next.props.role).toBeTruthy();
    expect(next.props.accessibilityLabel).toBeTruthy();

    const back = screen.queryByRole('link', { name: /^Back$/i })
      ?? screen.getByRole('button', { name: /^Back$/i });
    expect(back.props.accessibilityRole ?? back.props.role).toBeTruthy();
    expect(back.props.accessibilityLabel).toBeTruthy();
  });
});
