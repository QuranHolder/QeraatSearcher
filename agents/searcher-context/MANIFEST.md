# Searcher Context Manifest

## Purpose

This folder is the durable agent-facing context pack for the Qeraat Searcher repository. Use it to recover project knowledge across threads and sessions without relying on chat history.

## Scope

This context applies to `QeraatSearcher`, especially the active app under `qeraat-native`.

The sibling `QuranData` repository is referenced where it affects the app, but it should have its own context pack if it becomes an active editing target.

## Current Modules

- `codebase/STACK.md`: languages, frameworks, dependencies, and runtime stack.
- `codebase/STRUCTURE.md`: repository layout, entry points, and important folders.
- `codebase/ARCHITECTURE.md`: runtime shape, data flow, and app/database relationships.
- `codebase/CONVENTIONS.md`: local coding, styling, naming, and documentation conventions.
- `codebase/INTEGRATIONS.md`: browser APIs, SQLite/sql.js, Capacitor, Electron, data artifacts, and deployment markers.
- `codebase/TESTING.md`: current test surface, verification commands, and test gaps.
- `codebase/CONCERNS.md`: known risks, unclear areas, and onboarding warnings.

## Usage

Start with this file, then load only the module needed for the task. For broad onboarding or architecture work, read all files under `codebase/`.

Prefer direct source inspection for implementation decisions. Treat these files as a map, not as a substitute for reading the current code.

## Maintenance

Update this context when durable project knowledge changes, such as:

- architecture changes
- dependency or platform changes
- new build, test, release, or data-pipeline workflows
- resolved `[ASK USER]` items
- newly discovered risks or corrected assumptions

Keep the context concise and evidence-based. Mark unknowns as `[TODO]` and intent-dependent decisions as `[ASK USER]`.
