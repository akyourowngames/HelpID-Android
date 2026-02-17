# Helper-ID

Emergency identity platform with:
- an Android app (`app/`) for creating and sharing emergency profile data
- a web app + serverless APIs (`helper-id/`) for public profile access, short-lived share links, and Gemini proxy calls

## Repository Layout

`app/` Android (Kotlin + Jetpack Compose + Firebase + Room)  
`helper-id/` Vite + React frontend and Vercel serverless APIs (`api/*.js`)  
`gradle/`, `gradlew*` Android build tooling

## Main Features

- Emergency ID card UI with profile, medical notes, and emergency contacts
- SOS flow with SMS + optional location link
- Offline-first profile behavior (Room cache + pending sync)
- Anonymous Firebase auth bootstrap and Firestore profile storage
- Shareable emergency profile links minted via `/api/mint` and resolved by `/api/profile`
- Gemini server-side proxy endpoint at `/api/gemini` (API key stays server-side)

## Prerequisites

- Android Studio (latest stable recommended)
- JDK 17 (Android Gradle Plugin 8.x compatibility)
- Node.js 18+ and npm (for `helper-id/`)
- Firebase project configured for:
  - Anonymous Authentication
  - Firestore Database

## Android App Setup (`app/`)

1. Ensure `app/google-services.json` is present and matches your Firebase project.
2. Open the repository root in Android Studio.
3. Sync Gradle.
4. Run on emulator/device.

CLI build:

```bash
./gradlew :app:assembleDebug
```

Windows PowerShell:

```powershell
.\gradlew.bat :app:assembleDebug
```

## Web App + API Setup (`helper-id/`)

1. Install dependencies:

```bash
cd helper-id
npm install
```

2. Create `.env.local` in `helper-id/` with required values:

```env
GEMINI_API_KEY=your_gemini_key
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
PROFILE_JWT_SECRET=replace_with_a_long_random_secret
```

Notes:
- `FIREBASE_SERVICE_ACCOUNT_KEY` must be a JSON string (single line) for `firebase-admin`.
- `PROFILE_JWT_SECRET` signs temporary profile access tokens used by `/api/mint` and `/api/profile`.

3. Run local dev server:

```bash
npm run dev
```

4. Build production bundle:

```bash
npm run build
```

## API Endpoints (`helper-id/api`)

- `POST /api/mint`
  - Verifies Firebase ID token from `Authorization: Bearer <token>`
  - Generates/reuses public key
  - Returns signed temporary URL (`/e/:key?t=...`)
- `GET /api/profile?key=<publicKey>&t=<jwt>`
  - Validates token
  - Maps public key to UID
  - Returns sanitized profile fields only
- `POST /api/gemini`
  - Proxies prompt to Gemini model server-side

## Recommended Cleanup

- `helper-id/node_modules/` appears committed locally; keep it gitignored and out of source control.
- `local.properties` is machine-specific for Android SDK paths; do not commit personalized values.

  ## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=akyourowngames/HelpID-Android&type=date&legend=top-left)](https://www.star-history.com/#akyourowngames/HelpID-Android&type=date&legend=top-left)

## License

No license file is currently present in the repository. Add one if this project will be shared publicly.

