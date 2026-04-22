---
title: Chunk Supabase session storage to work around iOS Keychain 2KB limit
date: 2026-04-21
status: accepted
---

# 002. Chunk Supabase session storage to work around iOS Keychain 2KB limit

## Context

Supabase persists the auth session (access token + refresh token + provider token + metadata) to the storage adapter supplied to `createClient`. The default storage in web contexts is `localStorage`. For React Native, the idiomatic choice is `expo-secure-store` (iOS Keychain / Android Keystore).

iOS Keychain imposes a ~2KB per-item size limit. Supabase sessions — which include an access JWT, a refresh token, and a Google provider token — routinely exceed this limit. When `SecureStore.setItemAsync` receives a value larger than ~2KB, it fails silently (no exception thrown), leaving the stored value empty or truncated. On the next cold start, `getSession()` returns `null`, and the user sees the login screen despite having signed in — an infinite login loop with no error message.

## Decision

Implement `lib/secure-store-adapter.ts` as a chunking adapter. The adapter:

1. Splits values into 1800-byte chunks (safely under the 2KB limit).
2. Writes each chunk as `${key}.0`, `${key}.1`, … and writes `${key}.count` as the chunk count marker.
3. On read, checks for `${key}.count`; if absent, falls back to reading `${key}` directly (backward compatibility with any legacy single-value writes).
4. On remove, cleans up all chunks and the count key, then also removes the bare key.

The adapter is passed as the `storage` option in `lib/supabase.ts`.

## Alternatives considered

- **Use `AsyncStorage`** — not encrypted; unsuitable for auth tokens.
- **Compress the session value** — adds complexity; doesn't help if provider tokens themselves are large; would need revisiting with every Supabase client upgrade.
- **Store only the refresh token and re-hydrate on start** — requires significant Supabase internals knowledge; fragile across client versions.

## Consequences

- Silent `setItem` failures are eliminated. Auth sessions survive app restarts correctly.
- The adapter adds 3-4 async Keychain reads on cold start (one per chunk). For a typical session (2–4 chunks) this is imperceptible.
- `jest-setup.ts` provides an in-memory mock for `expo-secure-store` so tests don't need real Keychain access. The chunking logic is exercised by `lib/__tests__/secure-store-adapter.test.ts`.
- If Supabase ever reduces session payload size, the adapter remains correct (single chunk path) — no migration needed.

## References

- `lib/secure-store-adapter.ts` — full implementation
- `lib/supabase.ts` — `storage: ChunkedSecureStoreAdapter`
- `CLAUDE.md` — "The non-obvious pieces" section
- `docs/authentication/secure-store-adapter.md`
