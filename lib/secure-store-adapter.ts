import * as SecureStore from 'expo-secure-store';

// iOS Keychain has a ~2KB per-item limit. Supabase sessions with OAuth
// provider tokens routinely exceed this, so we transparently split values
// into numbered chunks and reassemble on read.
const CHUNK_SIZE = 1800;
const COUNT_SUFFIX = '.count';
const CHUNK_SUFFIX = (i: number) => `.${i}`;

export const ChunkedSecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    const countStr = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
    if (countStr === null) {
      // Either never written, or written as a single unchunked value by an
      // older version — fall back to reading the base key directly.
      return SecureStore.getItemAsync(key);
    }
    const count = Number.parseInt(countStr, 10);
    const parts: string[] = [];
    for (let i = 0; i < count; i++) {
      const part = await SecureStore.getItemAsync(`${key}${CHUNK_SUFFIX(i)}`);
      if (part === null) return null;
      parts.push(part);
    }
    return parts.join('');
  },

  async setItem(key: string, value: string): Promise<void> {
    await this.removeItem(key);
    const chunks: string[] = [];
    for (let i = 0; i < value.length; i += CHUNK_SIZE) {
      chunks.push(value.slice(i, i + CHUNK_SIZE));
    }
    await SecureStore.setItemAsync(`${key}${COUNT_SUFFIX}`, String(chunks.length));
    for (let i = 0; i < chunks.length; i++) {
      await SecureStore.setItemAsync(`${key}${CHUNK_SUFFIX(i)}`, chunks[i]);
    }
  },

  async removeItem(key: string): Promise<void> {
    const countStr = await SecureStore.getItemAsync(`${key}${COUNT_SUFFIX}`);
    if (countStr !== null) {
      const count = Number.parseInt(countStr, 10);
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(`${key}${CHUNK_SUFFIX(i)}`);
      }
      await SecureStore.deleteItemAsync(`${key}${COUNT_SUFFIX}`);
    }
    // Clean up legacy single-value writes too.
    await SecureStore.deleteItemAsync(key);
  },
};
