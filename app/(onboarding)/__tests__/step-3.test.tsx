import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingStep3Screen from '../step-3';

// Mock expo-router locally. Keep the factory minimal but mirror step-1.test.tsx
// so incidental imports (Stack.Protected wrapper, etc.) resolve to harmless
// no-ops during render.
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

function renderScreen(ui: ReactElement = <OnboardingStep3Screen />) {
  return render(<SafeAreaProvider initialMetrics={initialMetrics}>{ui}</SafeAreaProvider>);
}

let mockPush: jest.Mock;
let mockBack: jest.Mock;
let mockReplace: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockPush = jest.fn();
  mockBack = jest.fn();
  mockReplace = jest.fn();
  jest.mocked(useRouter).mockReturnValue({
    push: mockPush,
    back: mockBack,
    replace: mockReplace,
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

// Query helpers. The 简体中文 row's accessibilityLabel is intentionally flexible —
// GREEN may use the native name, the english translation, or a compound label.
const zhRadioMatcher = /简体中文|Simplified Chinese/i;

function getEnglishRow() {
  return screen.getByRole('radio', { name: /English/i });
}

function getZhRow() {
  return screen.getByRole('radio', { name: zhRadioMatcher });
}

function getBackControl() {
  return (
    screen.queryByRole('link', { name: /^Back$/i }) ??
    screen.getByRole('button', { name: /^Back$/i })
  );
}

describe('OnboardingStep3Screen — static render (R1)', () => {
  test('renders the "Step 3 of 3" header caption', () => {
    renderScreen();
    expect(screen.getByText('Step 3 of 3')).toBeOnTheScreen();
  });

  test('renders the progress bar with a fill element', () => {
    renderScreen();
    expect(screen.getByTestId('progress-bar')).toBeOnTheScreen();
    expect(screen.getByTestId('progress-fill')).toBeOnTheScreen();
  });

  test('renders the "Preferred Language" question', () => {
    renderScreen();
    expect(screen.getByText(/Preferred Language/i)).toBeOnTheScreen();
  });

  test('renders the helper copy "You can change this later in settings"', () => {
    renderScreen();
    expect(screen.getByText(/You can change this later in settings/i)).toBeOnTheScreen();
  });

  test('renders an English language row as a radio', () => {
    renderScreen();
    expect(getEnglishRow()).toBeOnTheScreen();
  });

  test('renders a 简体中文 language row as a radio', () => {
    renderScreen();
    expect(getZhRow()).toBeOnTheScreen();
  });

  test('wraps the two rows in an accessibilityRole="radiogroup" container with a non-empty label', () => {
    renderScreen();
    const group = screen.getByRole('radiogroup');
    expect(group).toBeOnTheScreen();
    const label: unknown = group.props.accessibilityLabel;
    expect(typeof label).toBe('string');
    expect((label as string).length).toBeGreaterThan(0);
  });

  test('renders the Get Started button', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeOnTheScreen();
  });

  test('renders the Back link', () => {
    renderScreen();
    expect(getBackControl()).toBeOnTheScreen();
  });
});

describe('OnboardingStep3Screen — default selection (R2)', () => {
  test('English is pre-selected on mount', () => {
    renderScreen();
    expect(getEnglishRow().props.accessibilityState?.selected).toBe(true);
  });

  test('简体中文 is NOT selected on mount', () => {
    renderScreen();
    expect(getZhRow().props.accessibilityState?.selected).toBe(false);
  });
});

describe('OnboardingStep3Screen — mutual exclusion (R3)', () => {
  test('tapping 简体中文 selects it', () => {
    renderScreen();
    fireEvent.press(getZhRow());
    expect(getZhRow().props.accessibilityState?.selected).toBe(true);
  });

  test('tapping 简体中文 deselects English', () => {
    renderScreen();
    fireEvent.press(getZhRow());
    expect(getEnglishRow().props.accessibilityState?.selected).toBe(false);
  });

  test('tapping English after 简体中文 re-selects English and deselects 简体中文', () => {
    renderScreen();
    fireEvent.press(getZhRow());
    fireEvent.press(getEnglishRow());
    expect(getEnglishRow().props.accessibilityState?.selected).toBe(true);
    expect(getZhRow().props.accessibilityState?.selected).toBe(false);
  });

  test('exactly one row is selected at any time across repeated toggles', () => {
    renderScreen();
    const countSelected = () =>
      [getEnglishRow(), getZhRow()].filter(
        (r) => r.props.accessibilityState?.selected === true,
      ).length;

    // Initial state
    expect(countSelected()).toBe(1);

    // After selecting zh-CN
    fireEvent.press(getZhRow());
    expect(countSelected()).toBe(1);

    // Back to English
    fireEvent.press(getEnglishRow());
    expect(countSelected()).toBe(1);

    // Back to zh-CN
    fireEvent.press(getZhRow());
    expect(countSelected()).toBe(1);
  });
});

describe('OnboardingStep3Screen — Get Started navigation (R4)', () => {
  test('tapping Get Started calls router.replace("/(tabs)")', () => {
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: /Get Started/i }));

    expect(mockReplace).toHaveBeenCalledTimes(1);
    const [arg] = mockReplace.mock.calls[0];
    const pathname =
      typeof arg === 'string' ? arg : (arg as { pathname?: string } | undefined)?.pathname;
    expect(pathname).toBe('/(tabs)');
  });

  test('tapping Get Started does NOT call router.push', () => {
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: /Get Started/i }));
    expect(mockPush).not.toHaveBeenCalled();
  });

  test('tapping Get Started does NOT call router.back', () => {
    renderScreen();
    fireEvent.press(screen.getByRole('button', { name: /Get Started/i }));
    expect(mockBack).not.toHaveBeenCalled();
  });
});

describe('OnboardingStep3Screen — Back navigation (R5)', () => {
  test('tapping Back calls router.back()', () => {
    renderScreen();
    fireEvent.press(getBackControl());
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  test('tapping Back does NOT call router.replace or router.push', () => {
    renderScreen();
    fireEvent.press(getBackControl());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('OnboardingStep3Screen — accessibility (R6)', () => {
  test('each language row has role="radio", a non-empty label, and a boolean selected state', () => {
    renderScreen();
    for (const row of [getEnglishRow(), getZhRow()]) {
      expect(row.props.accessibilityRole ?? row.props.role).toBe('radio');
      expect(typeof row.props.accessibilityLabel).toBe('string');
      expect((row.props.accessibilityLabel as string).length).toBeGreaterThan(0);
      expect(typeof row.props.accessibilityState?.selected).toBe('boolean');
    }
  });

  test('the radiogroup wrapper has role="radiogroup" and a non-empty label', () => {
    renderScreen();
    const group = screen.getByRole('radiogroup');
    expect(group.props.accessibilityRole ?? group.props.role).toBe('radiogroup');
    expect(typeof group.props.accessibilityLabel).toBe('string');
    expect((group.props.accessibilityLabel as string).length).toBeGreaterThan(0);
  });

  test('every interactive element exposes a role and a non-empty label', () => {
    renderScreen();

    const english = getEnglishRow();
    expect(english.props.accessibilityRole ?? english.props.role).toBeTruthy();
    expect(english.props.accessibilityLabel).toBeTruthy();

    const zh = getZhRow();
    expect(zh.props.accessibilityRole ?? zh.props.role).toBeTruthy();
    expect(zh.props.accessibilityLabel).toBeTruthy();

    const getStarted = screen.getByRole('button', { name: /Get Started/i });
    expect(getStarted.props.accessibilityRole ?? getStarted.props.role).toBeTruthy();
    expect(getStarted.props.accessibilityLabel).toBeTruthy();

    const back = getBackControl();
    expect(back.props.accessibilityRole ?? back.props.role).toBeTruthy();
    expect(back.props.accessibilityLabel).toBeTruthy();
  });
});
