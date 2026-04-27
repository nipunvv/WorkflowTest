import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingStep2Screen from '../step-2';
import { SYMPTOMS } from '../symptoms';

// Mock expo-router per-file (not globally in jest-setup.ts) — future screens
// may want different router behavior, and a global mock would couple them.
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  Stack: {
    Screen: () => null,
    Protected: ({ children }: { children: ReactNode }) => children ?? null,
  },
}));

const initialMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 393, height: 852 },
};

function renderScreen(ui: ReactElement = <OnboardingStep2Screen />) {
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

function getChip(label: string) {
  return screen.getByRole('checkbox', { name: new RegExp(label, 'i') });
}

describe('SYMPTOMS catalog — contract (R1 prerequisite)', () => {
  test('exposes exactly six symptoms', () => {
    expect(SYMPTOMS).toHaveLength(6);
  });

  test('every symptom has a unique id', () => {
    const ids = SYMPTOMS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every symptom has a unique non-empty accessibilityLabel', () => {
    const labels = SYMPTOMS.map((s) => s.accessibilityLabel);
    expect(new Set(labels).size).toBe(labels.length);
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe('OnboardingStep2Screen — static render (R1)', () => {
  test('renders the "Step 2 of 3" header caption', () => {
    renderScreen();
    expect(screen.getByText('Step 2 of 3')).toBeOnTheScreen();
  });

  test('renders the progress bar with a fill element', () => {
    renderScreen();
    expect(screen.getByTestId('progress-bar')).toBeOnTheScreen();
    expect(screen.getByTestId('progress-fill')).toBeOnTheScreen();
  });

  test('renders the primary question', () => {
    renderScreen();
    expect(screen.getByText(/What are your primary symptoms/i)).toBeOnTheScreen();
  });

  test('renders the "Select all that apply" helper text', () => {
    renderScreen();
    expect(screen.getByText(/Select all that apply/i)).toBeOnTheScreen();
  });

  test('renders all six symptom chips by their accessibility label', () => {
    renderScreen();
    for (const symptom of SYMPTOMS) {
      expect(getChip(symptom.accessibilityLabel)).toBeOnTheScreen();
    }
  });

  test('renders the Next button', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /^Next$/i })).toBeOnTheScreen();
  });

  test('renders the Back button', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /^Back$/i })).toBeOnTheScreen();
  });
});

describe('OnboardingStep2Screen — chip toggle (R2)', () => {
  test('tapping a chip toggles its checked state to true', () => {
    renderScreen();
    const chip = getChip('dry eyes');
    expect(chip.props.accessibilityState?.checked).toBe(false);

    fireEvent.press(chip);

    expect(getChip('dry eyes').props.accessibilityState?.checked).toBe(true);
  });

  test('tapping a selected chip deselects it', () => {
    renderScreen();
    const chip = getChip('dry eyes');
    fireEvent.press(chip);
    fireEvent.press(getChip('dry eyes'));
    expect(getChip('dry eyes').props.accessibilityState?.checked).toBe(false);
  });

  test('supports multiple chips selected simultaneously', () => {
    renderScreen();
    fireEvent.press(getChip('dry eyes'));
    fireEvent.press(getChip('fatigue'));

    expect(getChip('dry eyes').props.accessibilityState?.checked).toBe(true);
    expect(getChip('fatigue').props.accessibilityState?.checked).toBe(true);
  });

  test('deselecting one chip leaves other selections intact', () => {
    renderScreen();
    fireEvent.press(getChip('dry eyes'));
    fireEvent.press(getChip('fatigue'));
    fireEvent.press(getChip('fatigue'));

    expect(getChip('dry eyes').props.accessibilityState?.checked).toBe(true);
    expect(getChip('fatigue').props.accessibilityState?.checked).toBe(false);
  });
});

describe('OnboardingStep2Screen — Next enablement (R3)', () => {
  function isNextDisabled() {
    const next = screen.getByRole('button', { name: /^Next$/i });
    return next.props.accessibilityState?.disabled === true;
  }

  test('Next is disabled on initial render (no chips selected)', () => {
    renderScreen();
    expect(isNextDisabled()).toBe(true);
  });

  test('Next is enabled after selecting one chip', () => {
    renderScreen();
    fireEvent.press(getChip('dry eyes'));
    expect(isNextDisabled()).toBe(false);
  });

  test('deselecting the last selected chip re-disables Next', () => {
    renderScreen();
    fireEvent.press(getChip('dry eyes'));
    expect(isNextDisabled()).toBe(false);

    fireEvent.press(getChip('dry eyes'));
    expect(isNextDisabled()).toBe(true);
  });

  test('Next stays enabled when multiple chips are selected', () => {
    renderScreen();
    fireEvent.press(getChip('dry eyes'));
    fireEvent.press(getChip('fatigue'));
    expect(isNextDisabled()).toBe(false);
  });
});

describe('OnboardingStep2Screen — navigation (R4, R5)', () => {
  test('tapping Next with a selection navigates to /onboarding/step-3', () => {
    renderScreen();
    fireEvent.press(getChip('dry eyes'));

    fireEvent.press(screen.getByRole('button', { name: /^Next$/i }));

    expect(mockPush).toHaveBeenCalledTimes(1);
    const [arg] = mockPush.mock.calls[0];
    const pathname =
      typeof arg === 'string' ? arg : (arg as { pathname?: string } | undefined)?.pathname;
    // Accept either the group-stripped URL form (`/onboarding/step-3`) or the
    // Expo Router typed-routes form (`/(onboarding)/step-3`).
    expect(pathname).toMatch(/\/\(?onboarding\)?\/step-3/);
  });

  test('tapping Next does nothing when no chips are selected', () => {
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: /^Next$/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('tapping Back calls router.back()', () => {
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: /^Back$/i }));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('OnboardingStep2Screen — accessibility (R6)', () => {
  test('every chip exposes role=checkbox, a non-empty label, and a boolean checked state', () => {
    renderScreen();
    for (const symptom of SYMPTOMS) {
      const chip = getChip(symptom.accessibilityLabel);
      expect(chip.props.accessibilityRole ?? chip.props.role).toBe('checkbox');
      expect(typeof chip.props.accessibilityLabel).toBe('string');
      expect(chip.props.accessibilityLabel.length).toBeGreaterThan(0);
      expect(typeof chip.props.accessibilityState?.checked).toBe('boolean');
    }
  });

  test('chip accessibilityLabels contain no emoji characters', () => {
    renderScreen();
    // Unicode property \p{Extended_Pictographic} covers all standardized emoji
    // pictographs — broader than a hand-rolled code-point range and stable
    // across future catalog additions.
    const emojiPattern = /\p{Extended_Pictographic}/u;
    for (const symptom of SYMPTOMS) {
      const chip = getChip(symptom.accessibilityLabel);
      expect(chip.props.accessibilityLabel).not.toMatch(emojiPattern);
    }
  });

  test('only the selected chips report accessibilityState.checked === true', () => {
    renderScreen();
    fireEvent.press(getChip('dry eyes'));
    fireEvent.press(getChip('brain fog'));

    for (const symptom of SYMPTOMS) {
      const chip = getChip(symptom.accessibilityLabel);
      const shouldBeChecked = symptom.id === 'dry-eyes' || symptom.id === 'brain-fog';
      expect(chip.props.accessibilityState?.checked).toBe(shouldBeChecked);
    }
  });
});
