# HelpID — Expo app

Expo (React Native + TypeScript) client for HelpID. Same emergency-profile logic, rebuilt around an Expo Router tab shell, Supabase sync, and a dark, minimal UI.

The earlier Kotlin implementation is preserved in git history; this Expo app is now the main client.

## What works

| Feature | Status |
| --- | --- |
| Emergency ID card, medical info, contacts | Yes |
| Offline-first profile + encrypted local cache | Yes |
| SOS 5s countdown, message builder, location link | Yes |
| SMS handoff to all contacts (one composer) | Yes (`expo-sms`) |
| Fallback share + copy SOS message | Yes |
| Auto-call emergency number after 30s (dialer) | Yes |
| Follow-up reminders every 3 min × 4 | Yes (local notifications) |
| QR card: secure link or offline payload | Yes |
| Share QR image / copy link | Yes |
| Contact picker, E.164 validation | Yes (`expo-contacts`, libphonenumber-js) |
| 5 languages (en/es/hi/fr/de) | Yes |
| Share profile text, export PDF | Yes |
| Supabase anonymous auth + profile sync + public card | Yes, when configured |
| NFC beaming, silent SMS, lock-screen intents | Native build only — see limitations |

## Quick start (Expo Go)

```powershell
cd mobile
npm install
copy .env.example .env   # optional
npx expo start
```

Scan the QR with Expo Go on Android or iOS. With no `.env`, the app runs in **local mode**: profiles are stored on-device (AES-encrypted via a SecureStore key) and every feature except cloud sync/public links works.

Typecheck:

```powershell
npx tsc --noEmit
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com), then enable **Anonymous sign-ins** (Authentication → Sign In / Providers → Anonymous).
2. Apply the migrations in `supabase/migrations/` (SQL editor, `supabase db push`, or the Supabase MCP tools). Order matters:

   ```
   0001_init.sql       profiles + public_keys + RLS
   0002_app_secrets.sql server-only signing secret (generated in Postgres)
   0003_harden.sql      deny client access to server tables
   0004_rls_perf.sql    auth.uid() initplan fix
   ```

   The public-card signing secret is generated inside Postgres (`app_secrets`) and is never stored in the repo. To override it, set a function secret instead:

   ```bash
   supabase secrets set PROFILE_JWT_SECRET="at-least-32-characters"
   ```

3. Deploy the two edge functions. `mint` keeps JWT verification on; the public card function does its own token check, so it must run with gateway verification off:

   ```bash
   supabase functions deploy mint
   supabase functions deploy profile --no-verify-jwt
   ```

4. Put the project URL and publishable/anon key in `.env`:

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-OR-ANON-KEY
   ```

Restart Expo so the env vars are picked up. The profile screen shows **Synced with Supabase** once connected.

### How the shared card works

- `mint` authenticates the app session, allocates a reusable `HID-…` public key, and signs a 24h HS256 token.
- The QR encodes `https://<project>.supabase.co/functions/v1/profile?key=…&t=…`.
- `profile` verifies the token + key, reads via the service role, and renders a no-index HTML emergency card. Add `&format=json` for JSON.
- Deleting the row in `public_keys` revokes the link. Tokens expire after 24 hours.

## Project layout

```
app/                 Expo Router screens
  (tabs)/            ID, QR, Profile tabs
  language.tsx       Language modal
src/components/      UI kit, tab bar, SOS sheet, cards
src/lib/             Supabase, profile store, crypto, SMS, QR, PDF, i18n helpers
src/state/           Profile and settings providers
src/i18n/            en/es/hi/fr/de dictionaries
supabase/            SQL migration + edge functions
```

## Expo Go limitations (and the native upgrade path)

The Kotlin app sent SMS silently, beamed NFC from the lock screen, and ran background SMS workers. Expo Go cannot do these, so the port is honest about it:

- **SMS**: opens the system composer prefilled for all contacts; the user taps send. A development build can add a silent-SMS native module behind `src/lib/sos.ts`.
- **NFC**: shown as unavailable. Add `react-native-nfc-manager` in a dev build and wire it into the QR screen.
- **Follow-ups**: local notifications prompt a manual share every 3 min; no background SMS without a dev build.
- **Lock screen**: no full-screen intent / show-over-lock behavior in Expo Go.

Everything is isolated in `src/lib`, so the native build only replaces those adapters.

## Data notes

- Local cache is AES-encrypted (`expo-secure-store` key + `crypto-js`), stored in AsyncStorage.
- Supabase sessions use AsyncStorage; RLS only lets a user read/write their own profile.
- `public_keys` is service-role only; the app never reads the table directly.
- No secrets are committed; `.env` is ignored.

Medical and emergency apps need careful review before real-world use. HelpID supports responders; it does not replace emergency services.
