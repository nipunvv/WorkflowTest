import { renderHook } from '@testing-library/react-native';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';

import { supabase } from '@/lib/supabase';

import { useRedirectOnSignIn } from '../use-redirect-on-sign-in';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: jest.fn(),
    },
  },
}));

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void;

let capturedListener: AuthListener | undefined;
let unsubscribe: jest.Mock;
let replaceMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  capturedListener = undefined;
  unsubscribe = jest.fn();
  replaceMock = jest.fn();

  jest.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb: AuthListener) => {
    capturedListener = cb;
    return {
      data: { subscription: { id: 'sub-1', callback: cb, unsubscribe } },
    };
  });

  jest.mocked(useRouter).mockReturnValue({
    replace: replaceMock,
    push: jest.fn(),
    back: jest.fn(),
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

describe('useRedirectOnSignIn', () => {
  test('subscribes to supabase auth events on mount', () => {
    renderHook(() => useRedirectOnSignIn());
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledTimes(1);
    expect(capturedListener).toBeDefined();
  });

  test('redirects to /onboarding/step-1 when a SIGNED_IN event fires', () => {
    renderHook(() => useRedirectOnSignIn());
    capturedListener!('SIGNED_IN', { user: {} } as Session);

    expect(replaceMock).toHaveBeenCalledTimes(1);
    const [arg] = replaceMock.mock.calls[0];
    const pathname =
      typeof arg === 'string' ? arg : (arg as { pathname?: string } | undefined)?.pathname;
    expect(pathname).toMatch(/\/onboarding\/step-1/);
  });

  test('does not redirect on INITIAL_SESSION (session restore on app launch)', () => {
    renderHook(() => useRedirectOnSignIn());
    capturedListener!('INITIAL_SESSION', { user: {} } as Session);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  test('does not redirect on TOKEN_REFRESHED', () => {
    renderHook(() => useRedirectOnSignIn());
    capturedListener!('TOKEN_REFRESHED', { user: {} } as Session);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  test('does not redirect on SIGNED_OUT', () => {
    renderHook(() => useRedirectOnSignIn());
    capturedListener!('SIGNED_OUT', null);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  test('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useRedirectOnSignIn());
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
