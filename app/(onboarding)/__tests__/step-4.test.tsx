import { fireEvent, render, screen } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import OnboardingStep4Screen from '../step-4';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: () => null,
    Protected: ({ children }: { children: unknown }) => children ?? null,
  },
}));

const initialMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 393, height: 852 },
};

type ScreenParams = {
  firstName?: string;
  symptomCount?: string;
  deviceCount?: string;
  languageLabel?: string;
};

const defaultParams: ScreenParams = {
  firstName: 'Angel',
  symptomCount: '3',
  deviceCount: '1',
  languageLabel: 'English',
};

function renderScreen(params: ScreenParams = defaultParams, ui?: ReactElement) {
  jest.mocked(useLocalSearchParams).mockReturnValue(params as ReturnType<typeof useLocalSearchParams>);
  return render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      {ui ?? <OnboardingStep4Screen />}
    </SafeAreaProvider>
  );
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

describe('OnboardingStep4Screen — static render (R1)', () => {
  test('renders the "Step 4 of 4" header caption', () => {
    renderScreen();
    expect(screen.getByText('Step 4 of 4')).toBeOnTheScreen();
  });

  test('renders the progress bar with a fill element', () => {
    renderScreen();
    expect(screen.getByTestId('progress-bar')).toBeOnTheScreen();
    expect(screen.getByTestId('progress-fill')).toBeOnTheScreen();
  });

  test('renders the hero with accessibilityRole="image" and a non-empty accessibilityLabel', () => {
    renderScreen();
    const hero = screen.getByRole('image');
    expect(hero).toBeOnTheScreen();
    const label: unknown = hero.props.accessibilityLabel;
    expect(typeof label).toBe('string');
    expect((label as string).length).toBeGreaterThan(0);
  });

  test('renders the title "You\'re all set, Angel!" when firstName="Angel"', () => {
    renderScreen();
    expect(screen.getByText("You're all set, Angel!")).toBeOnTheScreen();
  });

  test('renders fallback title "You\'re all set!" when firstName is absent', () => {
    renderScreen({ ...defaultParams, firstName: undefined });
    expect(screen.getByText("You're all set!")).toBeOnTheScreen();
  });

  test('renders subtitle line 1: "Your gentle companion is ready."', () => {
    renderScreen();
    expect(screen.getByText('Your gentle companion is ready.')).toBeOnTheScreen();
  });

  test('renders subtitle line 2: "Let\'s start your journey, one day at a time."', () => {
    renderScreen();
    expect(screen.getByText("Let's start your journey, one day at a time.")).toBeOnTheScreen();
  });

  test('renders a summary list container with accessibilityRole="list"', () => {
    renderScreen();
    expect(screen.getByRole('list')).toBeOnTheScreen();
  });

  test('renders the "Profile saved" row', () => {
    renderScreen();
    expect(screen.getByText('Profile saved')).toBeOnTheScreen();
  });

  test('renders the symptomCount row (e.g. "3 symptoms tracked" when symptomCount="3")', () => {
    renderScreen();
    expect(screen.getByText('3 symptoms tracked')).toBeOnTheScreen();
  });

  test('renders the deviceCount row with singular (1 device connected)', () => {
    renderScreen({ ...defaultParams, deviceCount: '1' });
    expect(screen.getByText('1 device connected')).toBeOnTheScreen();
  });

  test('renders the deviceCount row with plural (2 devices connected)', () => {
    renderScreen({ ...defaultParams, deviceCount: '2' });
    expect(screen.getByText('2 devices connected')).toBeOnTheScreen();
  });

  test('renders the deviceCount row with zero (0 devices connected)', () => {
    renderScreen({ ...defaultParams, deviceCount: '0' });
    expect(screen.getByText('0 devices connected')).toBeOnTheScreen();
  });

  test('renders the languageLabel row (Language set to English)', () => {
    renderScreen();
    expect(screen.getByText('Language set to English')).toBeOnTheScreen();
  });

  test('renders the Get Started button', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /Get Started/i })).toBeOnTheScreen();
  });

  test('renders the privacy pill text', () => {
    renderScreen();
    expect(screen.getByText(/Your health data is private/i)).toBeOnTheScreen();
  });

  test('does NOT render a Back button', () => {
    renderScreen();
    expect(screen.queryByRole('button', { name: /^Back$/i })).toBeNull();
  });
});

describe('OnboardingStep4Screen — dynamic content interpolation (R2)', () => {
  test('title interpolates a different firstName correctly', () => {
    renderScreen({ ...defaultParams, firstName: 'Sam' });
    expect(screen.getByText("You're all set, Sam!")).toBeOnTheScreen();
  });

  test('symptomCount interpolation: "5 symptoms tracked"', () => {
    renderScreen({ ...defaultParams, symptomCount: '5' });
    expect(screen.getByText('5 symptoms tracked')).toBeOnTheScreen();
  });

  test('deviceCount singular: "1 device connected"', () => {
    renderScreen({ ...defaultParams, deviceCount: '1' });
    expect(screen.getByText('1 device connected')).toBeOnTheScreen();
  });

  test('deviceCount plural: "3 devices connected"', () => {
    renderScreen({ ...defaultParams, deviceCount: '3' });
    expect(screen.getByText('3 devices connected')).toBeOnTheScreen();
  });

  test('deviceCount zero: "0 devices connected"', () => {
    renderScreen({ ...defaultParams, deviceCount: '0' });
    expect(screen.getByText('0 devices connected')).toBeOnTheScreen();
  });

  test('languageLabel: "Language set to Español" when languageLabel="Español"', () => {
    renderScreen({ ...defaultParams, languageLabel: 'Español' });
    expect(screen.getByText('Language set to Español')).toBeOnTheScreen();
  });
});

describe('OnboardingStep4Screen — default params (production path)', () => {
  test('renders with defaults when no params are passed (real nav path without data)', () => {
    renderScreen({});
    expect(screen.getByText("You're all set!")).toBeOnTheScreen();
    expect(screen.getByText('0 symptoms tracked')).toBeOnTheScreen();
    expect(screen.getByText('0 devices connected')).toBeOnTheScreen();
    expect(screen.getByText('Language set to English')).toBeOnTheScreen();
  });
});

describe('OnboardingStep4Screen — Get Started navigation (R3)', () => {
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

describe('OnboardingStep4Screen — accessibility (R4)', () => {
  test('hero has accessibilityRole="image" and non-empty accessibilityLabel', () => {
    renderScreen();
    const hero = screen.getByRole('image');
    expect(hero.props.accessibilityRole ?? hero.props.role).toBe('image');
    expect(typeof hero.props.accessibilityLabel).toBe('string');
    expect((hero.props.accessibilityLabel as string).length).toBeGreaterThan(0);
  });

  test('title has accessibilityRole="header"', () => {
    renderScreen();
    const header = screen.getByRole('header');
    expect(header).toBeOnTheScreen();
  });

  test('summary list container has accessibilityRole="list"', () => {
    renderScreen();
    const list = screen.getByRole('list');
    expect(list.props.accessibilityRole ?? list.props.role).toBe('list');
  });

  test('each summary row has accessibilityRole="listitem" and a non-empty accessibilityLabel', () => {
    renderScreen();
    const items = screen.queryAllByRole('listitem');
    expect(items.length).toBe(4);
    for (const item of items) {
      expect(item.props.accessibilityRole ?? item.props.role).toBe('listitem');
      expect(typeof item.props.accessibilityLabel).toBe('string');
      expect((item.props.accessibilityLabel as string).length).toBeGreaterThan(0);
    }
  });

  test('Get Started has accessibilityRole="button" and non-empty accessibilityLabel', () => {
    renderScreen();
    const button = screen.getByRole('button', { name: /Get Started/i });
    expect(button.props.accessibilityRole ?? button.props.role).toBe('button');
    expect(typeof button.props.accessibilityLabel).toBe('string');
    expect((button.props.accessibilityLabel as string).length).toBeGreaterThan(0);
  });
});
