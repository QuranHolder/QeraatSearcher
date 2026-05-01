# Conventions

## TypeScript And Module Style

- The project uses ESM (`"type": "module"` in `package.json`).
- Source imports use relative paths such as `../hooks/useDatabase` and `../lib/sqljs-db`.
- React components are written as function components.
- TypeScript interfaces for database rows live in `src/lib/types.ts`.
- Files use `.tsx` for React UI and `.ts` for non-UI modules.

## UI Organization

- Routed screens live in `src/pages`.
- Shared shell components live in `src/components`.
- State and browser integration helpers live in `src/hooks`.
- Reusable non-React logic lives in `src/lib`.
- Localization dictionaries live in `src/dictionaries`.

## Styling

- Tailwind utility classes are used directly in TSX.
- Dark mode is class-based (`darkMode: 'class'`).
- Font families extend Tailwind with `Cairo` for `sans` and `arabic`.
- Additional CSS exists in `src/App.css` and `src/index.css`.

## Data Access

- SQL queries are centralized in `src/lib/sqljs-db.ts`.
- Search APIs are thin exported functions such as `searchText`, `searchRoot`, `searchReading`, and `searchTag`.
- Query parameters are bound through `stmt.bind(params)` rather than string interpolation for executable SQL.
- `buildDebugSql` intentionally interpolates params only for human-readable debugging output.

## State Persistence

- User preferences and saved filters are persisted in `localStorage`.
- Hooks catch localStorage errors and usually ignore them silently.
- Saved filters dispatch a custom `qeraat_filters_updated` event so multiple hook instances stay synchronized.

## Error Handling

- Database load errors are surfaced through `useDatabase` as `{ status: 'error'; error: string }`.
- Clipboard/share/localStorage failures are often caught and ignored.
- The error-handling policy for user-visible failures is [ASK USER].

## Naming

- Qira'at domain types use names like `QuranData`, `Qareemaster`, `Tagsmaster`, `QuranSora`, and `BookQuran`.
- Database row field names mirror SQLite columns, including legacy or database-native casing such as `Done`, `Q1`, `R5_2`, `resultnew`, and `qareesrest`.
- Some comments mention Next.js even though the project is Vite/React. Treat those as stale comments unless confirmed.

## Documentation Style

- Existing project docs are mixed Arabic and English.
- Some docs under `doc/` are domain documentation for database tables and ER relationships.
- `README.md` and `buildguide.md` both describe build/test workflows; `README.md` is actually the broader build/distribution guide.

## Unknowns

- Formatting command beyond ESLint is [TODO]; no Prettier config was found during inspection.
- Commit message convention is [TODO]; no local policy file was found.
- Branching/release policy is [ASK USER].

## Evidence

- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\package.json`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\App.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\lib\types.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\lib\sqljs-db.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useSavedFilters.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useTheme.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\tailwind.config.js`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\eslint.config.js`
- `D:\Repos\QuranHolder\QeraatSearcher\doc`
