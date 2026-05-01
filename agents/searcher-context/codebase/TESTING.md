# Testing

## Current Test Surface

No frontend test framework is declared in `qeraat-native/package.json`.

No `src` test directories or frontend test files were found under `qeraat-native/src`.

Android contains generated/default test folders:

- `android/app/src/test`
- `android/app/src/androidTest`

These appear to be native wrapper test placeholders rather than tests for the React search/domain behavior.

## Available Verification Commands

Declared scripts in `qeraat-native/package.json`:

```text
npm run lint
npm run build
npm run build:web
npm run preview
npm run android:sync
npm run android:build
```

The build command runs TypeScript project build and Vite production build:

```text
tsc -b && vite build
```

The lint command runs:

```text
eslint .
```

## Manual Testing Path

Existing docs recommend:

```text
cd qeraat-native
npm install
npm run dev
```

Then open the Vite local URL, commonly `http://localhost:5173`.

Native smoke testing flow:

- Android: `npm run android:sync`, then `npm run android:open`.
- iOS: `npm run build`, `npx cap sync ios`, `npx cap open ios`.
- Electron: build web assets, sync Electron, then run Electron build/make scripts.

## High-Value Test Gaps

- Search query builder behavior in `sqljs-db.ts`.
- Filter combinations: include tags, exclude tags, qarees, Hafs exclusion, surah, aya range, whole-word matching.
- Database load failure and retry behavior in `useDatabase.ts`.
- Saved filter persistence and synchronization in `useSavedFilters.ts`.
- Settings import/export behavior in `SettingsPage.tsx`.
- RTL/LTR locale behavior.
- Aya detail page query and rendering behavior.
- Native wrapper smoke tests for Android/Electron after database or asset changes.

## Data Validation Gaps

`QuranData` has no inspected automated validation script for:

- Zip integrity.
- SQLite integrity checks.
- Expected table counts/schema.
- Expected image counts in `sides.zip`.

This matters because `farsh_v13.db.zip` produced a CRC error during Python zip extraction in local inspection.

## Unknowns

- Required CI checks before merge are [ASK USER].
- Whether the team wants Playwright, Vitest, or another test stack is [ASK USER].
- Whether database artifacts have an external validation process is [ASK USER].

## Evidence

- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\package.json`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\README.md`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\buildguide.md`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\android\app\src\test`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\android\app\src\androidTest`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\lib\sqljs-db.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useDatabase.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useSavedFilters.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\pages\SettingsPage.tsx`
- `D:\Repos\QuranHolder\QuranData\farsh_v13.db.zip`
