# Structure

## Workspace Layout

`D:\Repos\QuranHolder` is a parent folder with two nested Git repositories:

```text
QuranHolder/
  QeraatSearcher/
    doc/
    qeraat-native/
  QuranData/
    *.db.zip
    *.zip
    zip*.bat
```

## QeraatSearcher Layout

`QeraatSearcher` contains documentation plus the actual app.

```text
QeraatSearcher/
  doc/
    program_overview_ar.md
    program_overview_brf.md
    quran_data_doc.txt
    erd.txt
    ...
  qeraat-native/
    src/
    public/
    android/
    ios/
    electron/
    assets/
    icons/
    package.json
    vite.config.ts
    capacitor.config.ts
```

## App Source Layout

`qeraat-native/src` is organized by UI role:

- `App.tsx`: top-level providers, router, shell layout, and route declarations.
- `main.tsx`: React application entry point.
- `pages/`: routed screens.
- `components/`: shared shell/UI components.
- `hooks/`: React hooks for database state, locale, theme, settings, and saved filters.
- `lib/`: database access, locale helpers, and TypeScript types.
- `dictionaries/`: Arabic and English UI strings.
- `assets/`: app image assets used by source.

The routed pages are:

- `HomePage.tsx`
- `SearchPage.tsx`
- `AyaPage.tsx`
- `SettingsPage.tsx`
- `AboutPage.tsx`

## Static Assets

`qeraat-native/public` contains runtime assets served by Vite/Capacitor:

- `sql-wasm.wasm`: WebAssembly runtime used by `sql.js`.
- `db/qeraat_data_v1.db`: SQLite database fetched by the app.
- `manifest.webmanifest`, `favicon.svg`, `icons.svg`.

## Native Platform Layout

- `qeraat-native/android`: Android Gradle project.
- `qeraat-native/ios`: iOS project.
- `qeraat-native/electron`: Electron wrapper with its own `package.json`, TypeScript config, assets, and builder config.

These native folders are wrapper/build targets around the web app, not independent feature implementations.

## QuranData Layout

`QuranData` has a flat artifact layout:

- `data*.db.zip` and `data*.zip`: large Quran/reference SQLite databases.
- `farsh*.db.zip` and `farsh*.zip`: Farsh-related SQLite databases.
- `words*.db.zip` and `words*.zip`: word-level SQLite databases.
- `sides.zip`: PNG page-side assets under `side`, `side1`, and `side2`.
- `zipAll.bat`, `zipData.bat`, `zipFarsh.bat`, `zipWords.bat`: Windows packaging scripts.
- `.gitignore`: ignores raw `.db` files.

## Entry Points

- Web app entry: `QeraatSearcher/qeraat-native/src/main.tsx`.
- React shell entry: `QeraatSearcher/qeraat-native/src/App.tsx`.
- Database module: `QeraatSearcher/qeraat-native/src/lib/sqljs-db.ts`.
- Electron main entry: `QeraatSearcher/qeraat-native/electron/src/index.ts`.
- Android build entry: `QeraatSearcher/qeraat-native/android/app/build.gradle`.
- Capacitor config: `QeraatSearcher/qeraat-native/capacitor.config.ts`.

## Evidence

- `D:\Repos\QuranHolder\QeraatSearcher\doc`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\App.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\main.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\pages`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\components`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\lib`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\public`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\electron\package.json`
- `D:\Repos\QuranHolder\QuranData`
- `D:\Repos\QuranHolder\QuranData\sides.zip`
