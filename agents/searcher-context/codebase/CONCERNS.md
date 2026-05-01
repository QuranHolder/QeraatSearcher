# Concerns

## Skill Installation Concern

The manually added `acquire-codebase-knowledge` skill is incomplete in this environment. Its `SKILL.md` references `scripts/scan.py`, `references/`, and `assets/templates/`, but the skill folder contains only `SKILL.md`.

Impact: the normal skill scan/template workflow could not run. These docs were produced by direct repository inspection instead.

## Repository Shape Concern

`D:\Repos\QuranHolder` is not itself a Git repo. It is a holder folder containing two separate Git repos. Workflows that assume a single repo root may miss either app code or data artifacts.

## Large Central UI File

`SearchPage.tsx` is the largest source file inspected at about 47 KB. It appears to combine UI rendering, filter state, search behavior, copy/share behavior, saved-filter behavior, and navigation.

Risk: changes to search UX or filters may have a large blast radius.

## Test Coverage Gap

No frontend test framework or frontend tests were found. The highest-risk logic is search query construction and filter composition in `sqljs-db.ts`, but it is currently only verifiable manually unless tests exist elsewhere outside the inspected tree.

## Data Artifact Integrity

`QuranData/farsh_v13.db.zip` exists and reports one `farsh_v13.db` member, but Python zip extraction reported `Bad CRC-32 for file 'farsh_v13.db'`.

Risk: the archive may be corrupt or produced by a zip variant/tooling path that needs validation. This should be checked with the team's expected extraction tooling and `PRAGMA integrity_check` after extraction.

## Data Pipeline Ambiguity

The app ships `qeraat-native/public/db/qeraat_data_v1.db`, while `QuranData` stores larger zipped DB variants such as `data_v22.db.zip`, `words_v3.db.zip`, and `farsh_v13.db.zip`.

The repo does not show a verified script that transforms `QuranData` artifacts into the app-bundled DB. That handoff is [ASK USER].

## Stale Or Mismatched Comments

`sqljs-db.ts` has a comment saying the base URL helper works in browser "Next.js" and Electron/Capacitor WebView. The app is Vite/React, not Next.js.

Risk: small, but stale comments can mislead onboarding and future platform fixes.

## Silent Error Handling

Several browser API calls catch and ignore failures, especially localStorage/share/clipboard paths. This may be acceptable for UX, but it can hide storage quota issues, permission failures, malformed import data, or platform-specific share failures.

## Packaging Tooling Assumption

`QuranData` batch scripts call `winrar` directly. That makes packaging Windows/WinRAR-dependent unless there is a separate documented path.

## Security And Maintenance Unknowns

- No CI/CD workflow was found in the inspected files.
- No dependency update policy was found.
- No security policy was found.
- No `.env.example` was found.
- No production monitoring or crash-reporting integration was found.

These may be acceptable for this app, but they are [ASK USER] if this is heading toward production distribution.

## Evidence

- `C:\Users\acer\.codex\skills\acquire-codebase-knowledge\SKILL.md`
- `C:\Users\acer\.codex\skills\acquire-codebase-knowledge`
- `D:\Repos\QuranHolder\QeraatSearcher\.git`
- `D:\Repos\QuranHolder\QuranData\.git`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\pages\SearchPage.tsx`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\lib\sqljs-db.ts`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\src\hooks\useSavedFilters.ts`
- `D:\Repos\QuranHolder\QuranData\farsh_v13.db.zip`
- `D:\Repos\QuranHolder\QuranData\zipAll.bat`
- `D:\Repos\QuranHolder\QeraatSearcher\qeraat-native\package.json`
