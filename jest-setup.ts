// Prevents lib/supabase.ts from throwing during module import in tests.
// Override per-test with real/mock clients as needed.
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Default mocks for Expo modules that don't run in the Jest Node env.
// Override per-test with `jest.mocked(...)` or `jest.spyOn(...)`.

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => (store.has(k) ? store.get(k)! : null)),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      store.delete(k);
    }),
    __resetStore: () => store.clear(),
  };
});

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn(async () => ({ type: 'cancel', url: null })),
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path: string) => `workflowtest://${path}`),
  parse: jest.fn((url: string) => ({ queryParams: {}, path: url })),
}));

// Reanimated ships an official mock that stubs its worklets.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
