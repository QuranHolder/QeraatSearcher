# Stack

## Scope

This documentation treats `D:\Repos\QuranHolder` as a holder workspace, not as a Git repo. It contains two Git repositories:

- `QeraatSearcher`: application repo for the Qira'at search app.
- `QuranData`: data-artifact repo for SQLite database archives and mushaf page image archives.

## QeraatSearcher Runtime Stack

The active app lives under `QeraatSearcher/qeraat-native`.

- Language: TypeScript and TSX.
- UI runtime: React 19.
- Build tool: Vite 8.
- Routing: `react-router-dom`.
- Styling: Tailwind CSS 3 plus plain CSS files.
- Icons: `lucide-react`.
- Local database engine: `sql.js`, loaded through WebAssembly.
- Native wrappers: Capacitor for Android and iOS, plus `@capacitor-community/electron` for desktop.
- Android build system: Gradle project generated/managed under `qeraat-native/android`.
- Desktop build system: Electron plus `electron-builder` under `qeraat-native/electron`.
- Deployment marker: `wrangler.toml` exists, but the active deployment target and Cloudflare workflow are [ASK USER].

## QeraatSearcher Tooling

- Package manager: npm, evidenced by `package-lock.json`.
- Type checking/build command: `tsc -b && vite build`.
- Lint command: `eslint .`.
- Asset generation: `@capacitor/assets`.
- Web preview/dev server: `vite`.
- Native sync: Capacitor CLI commands in `package.json`.

## QeraatSearcher Production Dependencies

Production dependencies declared in `qeraat-native/package.json`:

- `@capacitor-community/electron`
- `@capacitor/android`
- `@capacitor/cli`
- `@capacitor/core`
- `@capacitor/ios`
- `@types/sql.js`
- `lucide-react`
- `react`
- `react-dom`
- `react-router-dom`
- `sql.js`

Note: `@types/sql.js` is declared under `dependencies`, even though it is type-only. Whether this is intentional is [ASK USER].

## QuranData Stack

`QuranData` is not an application codebase. It is a data repo.

- Stored artifact type: compressed SQLite `.db` files in `.zip` archives.
- Packaging scripts: Windows batch files.
- Compression tool: `winrar`, invoked directly by `zipAll.bat`, `zipData.bat`, `zipFarsh.bat`, and `zipWords.bat`.
- Git policy: raw `.db` files are ignored by `.gitignore`; zipped archives are committed.

## Database Technologies

The app-bundled database is:

- `QeraatSearcher/qeraat-native/public/db/qeraat_data_v1.db`
- SQLite format, loaded client-side by `sql.js`.
- The inspected app DB contains these tables: `book_quran`, `qareemaster`, `quran_data`, `quran_sora`, `tagsmaster`, `tagsshahid`.

The data repo contains larger source/archive databases:

- `data_v22.db.zip`: inspected as a large Quran/reference database with many `book_*` tables and mushaf coordinate tables.
- `words_v3.db.zip`: inspected as a word-level database with `wordsall` and word-coordinate views.
- `farsh_v12.db.zip`: inspected as a Farsh coordinate database with `madina` and `shmrly` tables.
- `farsh_v13.db.zip`: zip entry exists, but Python zip extraction reported a CRC error during inspection.

## Evidence

- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\package.json`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\package-lock.json`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\vite.config.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\tailwind.config.js`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\eslint.config.js`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\capacitor.config.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\electron\package.json`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\README.md`
- `D:\Repos\QuranHolder\QuranData\.gitignore`
- `D:\Repos\QuranHolder\QuranData\zipAll.bat`
- `D:\Repos\QuranHolder\QuranData\data_v22.db.zip`
- `D:\Repos\QuranHolder\QuranData\words_v3.db.zip`
- `D:\Repos\QuranHolder\QuranData\farsh_v12.db.zip`
- `D:\Repos\QuranHolder\QuranData\farsh_v13.db.zip`
