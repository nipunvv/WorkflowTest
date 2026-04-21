import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import type { ReactElement } from 'react';
import { Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth-context';

import LoginScreen from '../login';

jest.mock('@/lib/auth-context', () => ({
  useAuth: jest.fn(),
}));

// Override jest-setup.ts's expo-web-browser mock to add openBrowserAsync (used
// by the redesigned legal-link footer). Keep openAuthSessionAsync + maybeCompleteAuthSession
// stubbed so the auth-context module still imports cleanly.
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(async () => ({ type: 'cancel', url: null })),
  openBrowserAsync: jest.fn(async () => ({ type: 'opened' })),
  maybeCompleteAuthSession: jest.fn(),
}));

const initialMetrics = {
  insets: { top: 0, right: 0, bottom: 0, left: 0 },
  frame: { x: 0, y: 0, width: 393, height: 852 },
};

function renderScreen(ui: ReactElement = <LoginScreen />) {
  return render(<SafeAreaProvider initialMetrics={initialMetrics}>{ui}</SafeAreaProvider>);
}

function mockAuth(signInWithGoogle = jest.fn(async () => ({ error: null as Error | null }))) {
  jest.mocked(useAuth).mockReturnValue({
    session: null,
    user: null,
    loading: false,
    signInWithGoogle,
    signOut: jest.fn(async () => undefined),
  });
  return signInWithGoogle;
}

let alertSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

afterEach(() => {
  alertSpy.mockRestore();
});

describe('LoginScreen — static content', () => {
  test('renders the "Welcome to" + "Hi Honey" headline', () => {
    mockAuth();
    renderScreen();

    expect(screen.getByText(/Welcome to/i)).toBeOnTheScreen();
    expect(screen.getByText(/Hi Honey/)).toBeOnTheScreen();
  });

  test('renders the subtext describing the app', () => {
    mockAuth();
    renderScreen();

    expect(screen.getByText(/gentle companion/i)).toBeOnTheScreen();
  });

  test('renders the privacy reassurance badge', () => {
    mockAuth();
    renderScreen();

    expect(screen.getByText(/private.*encrypted/i)).toBeOnTheScreen();
  });

  test('renders a Google sign-in button with an accessible label', () => {
    mockAuth();
    renderScreen();

    const button = screen.getByRole('button', { name: /Sign in with Google/i });
    expect(button).toBeOnTheScreen();
  });

  test('renders Terms of Service and Privacy Policy links', () => {
    mockAuth();
    renderScreen();

    expect(screen.getByRole('link', { name: /Terms of Service/i })).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toBeOnTheScreen();
  });
});

describe('LoginScreen — Google sign-in wiring', () => {
  test('tapping the Google button calls signInWithGoogle exactly once', async () => {
    const signInWithGoogle = mockAuth();
    renderScreen();

    fireEvent.press(screen.getByRole('button', { name: /Sign in with Google/i }));

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  test('does not call signInWithGoogle again while a previous press is still pending', async () => {
    let resolve!: (value: { error: Error | null }) => void;
    const signInWithGoogle = mockAuth(
      jest.fn(
        () =>
          new Promise<{ error: Error | null }>((r) => {
            resolve = r;
          })
      )
    );
    renderScreen();

    const button = screen.getByRole('button', { name: /Sign in with Google/i });
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(signInWithGoogle).toHaveBeenCalledTimes(1);

    resolve({ error: null });
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1);
    });
  });

  test('shows a loading indicator while sign-in is in-flight', async () => {
    let resolve!: (value: { error: Error | null }) => void;
    mockAuth(
      jest.fn(
        () =>
          new Promise<{ error: Error | null }>((r) => {
            resolve = r;
          })
      )
    );
    renderScreen();

    fireEvent.press(screen.getByRole('button', { name: /Sign in with Google/i }));

    await waitFor(() => {
      expect(screen.getByTestId('google-button-spinner')).toBeOnTheScreen();
    });

    resolve({ error: null });
  });

  test('surfaces an Alert when signInWithGoogle resolves with an error', async () => {
    mockAuth(jest.fn(async () => ({ error: new Error('oauth failed') })));
    renderScreen();

    fireEvent.press(screen.getByRole('button', { name: /Sign in with Google/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    });
    const [, message] = alertSpy.mock.calls[0];
    expect(String(message)).toMatch(/oauth failed/i);
  });

  test('clears the submitting flag after an error so the button works again', async () => {
    const signInWithGoogle = jest
      .fn()
      .mockResolvedValueOnce({ error: new Error('oauth failed') })
      .mockResolvedValueOnce({ error: null });
    mockAuth(signInWithGoogle);
    renderScreen();

    const button = screen.getByRole('button', { name: /Sign in with Google/i });

    fireEvent.press(button);
    await waitFor(() => expect(alertSpy).toHaveBeenCalled());

    fireEvent.press(button);
    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(2);
    });
  });
});

describe('LoginScreen — legal links', () => {
  test('tapping the Terms of Service link opens the Terms URL in an in-app browser', async () => {
    mockAuth();
    renderScreen();

    fireEvent.press(screen.getByRole('link', { name: /Terms of Service/i }));

    await waitFor(() => {
      expect(WebBrowser.openBrowserAsync).toHaveBeenCalled();
    });
    const termsCall = jest
      .mocked(WebBrowser.openBrowserAsync)
      .mock.calls.find(([url]) => /terms/i.test(String(url)));
    expect(termsCall).toBeDefined();
  });

  test('tapping the Privacy Policy link opens the Privacy URL in an in-app browser', async () => {
    mockAuth();
    renderScreen();

    fireEvent.press(screen.getByRole('link', { name: /Privacy Policy/i }));

    await waitFor(() => {
      expect(WebBrowser.openBrowserAsync).toHaveBeenCalled();
    });
    const privacyCall = jest
      .mocked(WebBrowser.openBrowserAsync)
      .mock.calls.find(([url]) => /privacy/i.test(String(url)));
    expect(privacyCall).toBeDefined();
  });
});

describe('LoginScreen — accessibility', () => {
  test('Google button and both legal links have role + label set', () => {
    mockAuth();
    renderScreen();

    const googleButton = screen.getByRole('button', { name: /Sign in with Google/i });
    expect(googleButton.props.accessibilityRole ?? googleButton.props.role).toBeTruthy();
    expect(googleButton.props.accessibilityLabel).toBeTruthy();

    const termsLink = screen.getByRole('link', { name: /Terms of Service/i });
    expect(termsLink.props.accessibilityRole ?? termsLink.props.role).toBeTruthy();
    expect(termsLink.props.accessibilityLabel).toBeTruthy();

    const privacyLink = screen.getByRole('link', { name: /Privacy Policy/i });
    expect(privacyLink.props.accessibilityRole ?? privacyLink.props.role).toBeTruthy();
    expect(privacyLink.props.accessibilityLabel).toBeTruthy();
  });
});
