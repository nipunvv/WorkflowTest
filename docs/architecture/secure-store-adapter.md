# SecureStore Chunking Adapter

## Purpose

Explains why `lib/secure-store-adapter.ts` exists, what problem it solves, and how it works.

## The problem

`expo-secure-store` maps to the iOS Keychain and Android Keystore. iOS Keychain has a hard per-item size limit of approximately **2KB**. A typical Supabase session object includes an access token, refresh token, and OAuth provider tokens — which routinely exceeds 2KB together. `SecureStore.setItemAsync` fails silently when the value is too large: it returns without error but the data is never written. On the next app launch, `getItem` returns `null`, the session is gone, and the user is in an infinite sign-in loop with no error message.

## The solution

`ChunkedSecureStoreAdapter` transparently splits large values into 1800-byte chunks and reassembles them on read. The chunk size (1800) fits comfortably under the 2KB Keychain limit including key overhead.

## How it works

### Writing (`setItem`)

1. Calls `removeItem` to clear any previous value for the key (prevents stale chunk count mismatches).
2. Slices the value string into 1800-character chunks.
3. Writes the chunk count to `${key}.count`.
4. Writes each chunk to `${key}.0`, `${key}.1`, `${key}.2`, … in order.

### Reading (`getItem`)

1. Reads `${key}.count`.
2. If `null` (never written, or written by an older version without chunking): falls back to reading `${key}` directly. This backward-compatibility path lets the adapter adopt gracefully on upgrade.
3. Otherwise reads `${key}.0` through `${key}.${count - 1}` and joins them.

### Deleting (`removeItem`)

1. Reads `${key}.count` to discover how many chunks exist.
2. Deletes each chunk key.
3. Deletes `${key}.count`.
4. Also deletes the bare `${key}` to clean up any legacy single-value writes.

## Storage key layout example

For a session stored under the key `sb-abc-auth-token` split into 3 chunks:

```
sb-abc-auth-token.count  →  "3"
sb-abc-auth-token.0      →  <first 1800 chars>
sb-abc-auth-token.1      →  <next 1800 chars>
sb-abc-auth-token.2      →  <remainder>
```

## Key files & components

| File | Role |
|---|---|
| `lib/secure-store-adapter.ts` | The adapter implementation |
| `lib/supabase.ts` | Passes `ChunkedSecureStoreAdapter` as the `storage` option to `createClient` |
| `jest-setup.ts` | Mocks `expo-secure-store` with an in-memory `Map`; the adapter's tests run against this mock |

## Dependencies

- `expo-secure-store` — the underlying Keychain/Keystore API

## Gotchas / known limitations

- **Chunk size is a string-character count, not a byte count.** Multi-byte UTF-8 characters could still cause an item to exceed the Keychain limit. In practice, Supabase sessions are base64-encoded JSON and stay in ASCII range, so this is not a real concern.
- **Writes are sequential, not transactional.** A crash mid-write could leave partial chunks. Recovery: `getItem` would return `null` on the missing chunk, which Supabase treats as "no session" — the user sees a sign-in screen, which is safe.
- **The mock in `jest-setup.ts` is a flat `Map` — it does not enforce size limits.** Tests that rely on the adapter cannot verify that chunking actually solves the Keychain limit; that's only observable on a real device.

## Cross-refs

- `docs/architecture/authentication.md` — how the adapter fits into the OAuth flow
