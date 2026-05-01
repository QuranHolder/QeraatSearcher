# Integrations

## Runtime Integrations

### SQLite Via sql.js

The main runtime integration is local SQLite through `sql.js`.

- `initSqlJs` loads the WebAssembly runtime.
- `locateFile` points to `/sql-wasm.wasm`.
- The app fetches `/db/qeraat_data_v1.db`.
- The app creates `new SQL.Database(new Uint8Array(buffer))`.

This means core search is offline after the bundled/public assets are available. There is no inspected backend API for search.

### Browser APIs

The frontend uses browser APIs directly:

- `fetch` for loading the SQLite database file.
- `localStorage` for settings, locale, theme, and saved filters.
- `navigator.clipboard` for copy actions.
- `navigator.share` and `navigator.canShare` for share/export actions.
- `window.dispatchEvent` and `window.addEventListener` for saved-filter synchronization.

### Capacitor

Capacitor wraps the web app for native platforms:

- App ID: `com.mrshm.qeraat`.
- App name: Arabic app name in `capacitor.config.ts`.
- Web build directory: `dist`.
- Android and iOS dependencies are declared in the root app package.

### Electron

The Electron wrapper has a separate package under `qeraat-native/electron`.

- Main entry: `build/src/index.js`.
- Build scripts compile TypeScript and use `electron-builder`.
- Windows target is NSIS.
- `electron-updater` is installed, but update server/provider configuration is [TODO].

## Data Integrations

`QuranData` supplies database/image artifacts:

- Quran/reference DB archives.
- Farsh DB archives.
- Word-level DB archives.
- `sides.zip` with page image folders `side`, `side1`, and `side2`.

The inspected app DB is a separate file in `QeraatSearcher/qeraat-native/public/db`. The exact process for deriving or copying it from `QuranData` is [ASK USER].

## Deployment/Hosting

`wrangler.toml` exists in `qeraat-native`, which suggests Cloudflare tooling may be intended. The inspected docs and scripts do not establish a full deployment workflow, so production web hosting is [ASK USER].

## External Services

No external auth provider, analytics provider, monitoring SDK, payment service, or remote API client was found in the inspected manifests/source.

## Security-Relevant Integrations

- There are no committed secrets observed in inspected config files.
- There is no `.env.example` or similar config template found during the manifest/documentation search.
- No Snyk, Dependabot, SBOM, or security policy file was found during inspection.

## Evidence

- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\lib\sqljs-db.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useSavedFilters.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useSettings.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useTheme.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\lib\locale.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\pages\SearchPage.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\pages\SettingsPage.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\capacitor.config.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\electron\package.json`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\electron\electron-builder.config.json`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\wrangler.toml`
- `D:\Repos\QuranHolder\QuranData\sides.zip`
