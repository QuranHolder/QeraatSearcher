# Architecture

## Stated Intent

The project intent, as documented in `program_overview_ar.md`, is to provide a Quranic Qira'at search tool for students and researchers. The app supports text search, root search, classification/tag search, reading-face search, advanced filters, saved filters, verse detail pages, copy/share, offline operation, dark mode, and Arabic RTL support.

The build guide states the implementation shape: a Vite/React single-page app wrapped by Capacitor, using `sql.js` WebAssembly to load a SQLite database into memory for offline search.

## Runtime Shape

```text
React UI
  -> React Router pages
  -> hooks for user/browser state
  -> sqljs-db.ts query functions
  -> sql.js WebAssembly
  -> public/db/qeraat_data_v1.db
```

The app does not call a backend API for core search. It fetches a static SQLite file from the app bundle/public assets and queries it in browser memory.

## UI Layer

`App.tsx` wires:

- `ThemeProvider`
- `LocaleProvider`
- `BrowserRouter`
- `TopBar`
- `Sidebar`
- `LoadingScreen`
- routes for home, search, aya detail, settings, and about.

The largest visible workflow is `SearchPage.tsx`, which handles search parameters, filters, result cards, copy/share, saved filters, and navigation to aya details.

## Data Access Layer

`sqljs-db.ts` is the central data-access module.

Responsibilities:

- Load `sql-wasm.wasm`.
- Fetch `/db/qeraat_data_v1.db`.
- Create a singleton `sql.js` `Database`.
- Build search clauses for text, root, reading, and tag searches.
- Apply filters for tags, qarees, Hafs exclusion, surah, and aya ranges.
- Query lookup tables such as `tagsmaster`, `qareemaster`, `quran_sora`, and `book_quran`.
- Build aya detail payloads by combining aya text, surah info, readings, and qaree names.

`useDatabase.ts` adds a React hook wrapper over the database singleton. It caches the resolved DB and the in-flight promise at module scope.

## Data Model

The app-bundled database has these inspected tables:

- `book_quran`: 6,236 rows of Quran aya text and metadata.
- `quran_sora`: 114 surah metadata rows.
- `quran_data`: 68,539 reading-variation rows.
- `qareemaster`: 30 qaree/narrator rows.
- `tagsmaster`: 44 tag rows.
- `tagsshahid`: 130 tag/shahid summary rows.

Logical relationships, based on code and docs:

- `book_quran.aya_index` links Quran text to `quran_data.aya_index`.
- `quran_sora.sora` links surah names to `quran_data.sora` and `book_quran.sora`.
- `quran_data` stores qaree/narrator applicability in columns `Q1` to `Q10` and `R1_1` to `R10_2`.
- `quran_data.tags` stores comma-delimited tag values checked against `tagsmaster`.

## Persistence

Browser/device-local state is stored in `localStorage`:

- `qeraat_saved_filters`
- `qeraat_settings`
- `qeraat_locale`
- theme key in `useTheme.tsx`

The SQLite DB is not modified by the app; it is loaded read-only into memory.

## Build And Distribution Flow

Web development:

```text
npm install
npm run dev
```

Production/native update path:

```text
npm run build
npx cap sync
```

Android:

```text
npm run android:sync
npm run android:open
```

Electron packaging:

```text
npm run build
npx cap sync electron
cd electron
npm run build
npm run electron:make
```

## Data Repo Role

`QuranData` appears to be upstream data storage, not app runtime code. It keeps compressed database versions and packaging scripts. The app currently ships its own smaller `qeraat_data_v1.db` under `QeraatSearcher/qeraat-native/public/db`, so the exact pipeline from `QuranData` into that app DB is [ASK USER].

## Evidence

- `D:\Repos\QuranHolder\QeraatSearcher\doc\program_overview_ar.md`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\README.md`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\App.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\pages\SearchPage.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\pages\AyaPage.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\lib\sqljs-db.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useDatabase.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useSavedFilters.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\lib\types.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\public\db\qeraat_data_v1.db`
- `D:\Repos\QuranHolder\QuranData\zipAll.bat`
