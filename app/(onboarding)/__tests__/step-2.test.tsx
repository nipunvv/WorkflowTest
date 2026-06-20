import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import type { ReactElement, ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingStep2Screen from '../step-2';
import { GOALS } from '../goals';

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

function getGoalRow(label: string) {
  return screen.getByRole('checkbox', { name: new RegExp(label, 'i') });
}

function getOtherRow() {
  return screen.getByRole('checkbox', { name: /^Other$/i });
}

describe('GOALS catalog — contract (R1 prerequisite)', () => {
  test('exposes exactly five preset goals', () => {
    expect(GOALS).toHaveLength(5);
  });

  test('every goal has a unique id', () => {
    const ids = GOALS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('every goal has a unique non-empty label', () => {
    const labels = GOALS.map((g) => g.label);
    expect(new Set(labels).size).toBe(labels.length);
    for (const label of labels) {
      expect(label.length).toBeGreaterThan(0);
    }
  });

  test('every goal has a non-empty emoji', () => {
    for (const goal of GOALS) {
      expect(goal.emoji.length).toBeGreaterThan(0);
    }
  });
});

describe('OnboardingStep2Screen — static render (R1)', () => {
  test('renders the "Step 2 of 4" header caption', () => {
    renderScreen();
    expect(screen.getByText('Step 2 of 4')).toBeOnTheScreen();
  });

  test('renders the progress bar with a fill element', () => {
    renderScreen();
    expect(screen.getByTestId('progress-bar')).toBeOnTheScreen();
    expect(screen.getByTestId('progress-fill')).toBeOnTheScreen();
  });

  test('renders the H1 question', () => {
    renderScreen();
    expect(screen.getByText(/What matters most to you right now/i)).toBeOnTheScreen();
  });

  test('renders the helper text', () => {
    renderScreen();
    expect(screen.getByText(/Select all that apply/i)).toBeOnTheScreen();
  });

  test('renders all five preset goal rows by their visible label', () => {
    renderScreen();
    for (const goal of GOALS) {
      expect(getGoalRow(goal.label)).toBeOnTheScreen();
    }
  });

  test('renders the "Other" row', () => {
    renderScreen();
    expect(getOtherRow()).toBeOnTheScreen();
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

describe('OnboardingStep2Screen — preset goal toggle (R3)', () => {
  test('tapping a preset goal toggles its checked state from false to true', () => {
    renderScreen();
    const row = getGoalRow('Find my symptom triggers');
    expect(row.props.accessibilityState?.checked).toBe(false);

    fireEvent.press(row);

    expect(getGoalRow('Find my symptom triggers').props.accessibilityState?.checked).toBe(true);
  });

  test('tapping a selected preset goal deselects it', () => {
    renderScreen();
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    expect(getGoalRow('Find my symptom triggers').props.accessibilityState?.checked).toBe(false);
  });

  test('supports multiple preset goals selected simultaneously', () => {
    renderScreen();
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    fireEvent.press(getGoalRow('Improve my daily energy'));

    expect(getGoalRow('Find my symptom triggers').props.accessibilityState?.checked).toBe(true);
    expect(getGoalRow('Improve my daily energy').props.accessibilityState?.checked).toBe(true);
  });

  test('deselecting one preset leaves other selected presets intact', () => {
    renderScreen();
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    fireEvent.press(getGoalRow('Improve my daily energy'));
    fireEvent.press(getGoalRow('Improve my daily energy'));

    expect(getGoalRow('Find my symptom triggers').props.accessibilityState?.checked).toBe(true);
    expect(getGoalRow('Improve my daily energy').props.accessibilityState?.checked).toBe(false);
  });
});

describe('OnboardingStep2Screen — Other row expand/collapse (R4)', () => {
  test('initial render: "Other" row is unchecked and the input is not in the tree', () => {
    renderScreen();
    expect(getOtherRow().props.accessibilityState?.checked).toBe(false);
    expect(screen.queryByPlaceholderText(/Tell us what matters to you/i)).not.toBeOnTheScreen();
  });

  test('tapping "Other" reveals the TextInput with the expected placeholder', () => {
    renderScreen();
    fireEvent.press(getOtherRow());

    expect(getOtherRow().props.accessibilityState?.checked).toBe(true);
    expect(screen.getByPlaceholderText(/Tell us what matters to you/i)).toBeOnTheScreen();
  });

  test('typing into the "Other" input updates its displayed value', () => {
    renderScreen();
    fireEvent.press(getOtherRow());
    const input = screen.getByPlaceholderText(/Tell us what matters to you/i);
    fireEvent.changeText(input, 'Better sleep');

    expect(screen.getByDisplayValue('Better sleep')).toBeOnTheScreen();
  });

  test('deselecting "Other" hides the TextInput', () => {
    renderScreen();
    fireEvent.press(getOtherRow());
    fireEvent.press(getOtherRow());

    expect(screen.queryByPlaceholderText(/Tell us what matters to you/i)).not.toBeOnTheScreen();
  });

  test('deselecting "Other" clears the typed text — re-selecting shows an empty input', () => {
    renderScreen();
    fireEvent.press(getOtherRow());
    fireEvent.changeText(
      screen.getByPlaceholderText(/Tell us what matters to you/i),
      'Better sleep',
    );
    fireEvent.press(getOtherRow());

    // Reselect — input should be present again, with no prior value
    fireEvent.press(getOtherRow());
    const input = screen.getByPlaceholderText(/Tell us what matters to you/i);
    expect(input.props.value).toBe('');
    expect(screen.queryByDisplayValue('Better sleep')).not.toBeOnTheScreen();
  });

  test('selecting "Other" while a preset goal is already selected does not deselect the preset', () => {
    renderScreen();
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    fireEvent.press(getOtherRow());

    expect(getGoalRow('Find my symptom triggers').props.accessibilityState?.checked).toBe(true);
    expect(getOtherRow().props.accessibilityState?.checked).toBe(true);
  });
});

describe('OnboardingStep2Screen — Next enablement (R5)', () => {
  function isNextDisabled() {
    const next = screen.getByRole('button', { name: /^Next$/i });
    return next.props.accessibilityState?.disabled === true;
  }

  test('Next is disabled on initial render (no selections)', () => {
    renderScreen();
    expect(isNextDisabled()).toBe(true);
  });

  test('Next is enabled after selecting one preset goal', () => {
    renderScreen();
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    expect(isNextDisabled()).toBe(false);
  });

  test('Next is enabled when only "Other" is selected, even with empty text', () => {
    renderScreen();
    fireEvent.press(getOtherRow());
    expect(isNextDisabled()).toBe(false);
  });

  test('Next stays enabled when multiple goals (preset + Other) are selected', () => {
    renderScreen();
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    fireEvent.press(getOtherRow());
    expect(isNextDisabled()).toBe(false);
  });

  test('deselecting the last selected goal re-disables Next', () => {
    renderScreen();
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    expect(isNextDisabled()).toBe(true);
  });
});

describe('OnboardingStep2Screen — navigation (R6, R7)', () => {
  test('tapping Next with at least one selection navigates to /onboarding/step-3', () => {
    renderScreen();
    fireEvent.press(getGoalRow('Find my symptom triggers'));

    fireEvent.press(screen.getByRole('button', { name: /^Next$/i }));

    expect(mockPush).toHaveBeenCalledTimes(1);
    const [arg] = mockPush.mock.calls[0];
    const pathname =
      typeof arg === 'string' ? arg : (arg as { pathname?: string } | undefined)?.pathname;
    expect(pathname).toMatch(/\/\(?onboarding\)?\/step-3/);
  });

  test('tapping Next with no selection does nothing', () => {
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: /^Next$/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('tapping Back calls router.back() exactly once', () => {
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: /^Back$/i }));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('tapping Back never calls push (no forward navigation leaked)', () => {
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: /^Back$/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('OnboardingStep2Screen — accessibility (R8, R9)', () => {
  test('every preset goal row exposes role=checkbox, a non-empty label, and a boolean checked state', () => {
    renderScreen();
    for (const goal of GOALS) {
      const row = getGoalRow(goal.label);
      expect(row.props.accessibilityRole ?? row.props.role).toBe('checkbox');
      expect(typeof row.props.accessibilityLabel).toBe('string');
      expect(row.props.accessibilityLabel.length).toBeGreaterThan(0);
      expect(typeof row.props.accessibilityState?.checked).toBe('boolean');
    }
  });

  test('the "Other" row exposes role=checkbox, a non-empty label, and a boolean checked state', () => {
    renderScreen();
    const row = getOtherRow();
    expect(row.props.accessibilityRole ?? row.props.role).toBe('checkbox');
    expect(typeof row.props.accessibilityLabel).toBe('string');
    expect(row.props.accessibilityLabel.length).toBeGreaterThan(0);
    expect(typeof row.props.accessibilityState?.checked).toBe('boolean');
  });

  test('when the "Other" input is visible, it exposes a non-empty accessibilityLabel', () => {
    renderScreen();
    fireEvent.press(getOtherRow());
    const input = screen.getByPlaceholderText(/Tell us what matters to you/i);
    expect(typeof input.props.accessibilityLabel).toBe('string');
    expect(input.props.accessibilityLabel.length).toBeGreaterThan(0);
  });

  test('only the selected rows report accessibilityState.checked === true', () => {
    renderScreen();
    fireEvent.press(getGoalRow('Find my symptom triggers'));
    fireEvent.press(getOtherRow());

    for (const goal of GOALS) {
      const row = getGoalRow(goal.label);
      const shouldBeChecked = goal.id === 'find-symptom-triggers';
      expect(row.props.accessibilityState?.checked).toBe(shouldBeChecked);
    }
    expect(getOtherRow().props.accessibilityState?.checked).toBe(true);
  });
});
