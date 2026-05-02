# Searcher Context Manifest

## Purpose

This folder is the durable agent-facing context pack for the Qeraat Searcher repository. Use it to recover project knowledge across threads and sessions without relying on chat history.

## Scope

This context applies to `QeraatSearcher`, especially the active app under `qeraat-native`.

The sibling `QuranData` repository is referenced where it affects the app, but it should have its own context pack if it becomes an active editing target.

## Current Modules

- `../../README.md`: human-facing app introduction, prerequisites, and local development quick start.
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

## Development Quick Start

The active React web app is `qeraat-native`, served by Vite. From the `QeraatSearcher` repository root, use `.\run-web-app.cmd` to launch it; this script handles the correct app directory, bundled Node/npm path, logs, dependency install option, and the fixed local host/port.

- Prerequisites: Node.js 18+ and npm 9+ for web development. Native targets additionally need Android Studio/Android SDK/JDK 17 for Android, Xcode/CocoaPods on macOS for iOS, and the Electron package under `qeraat-native/electron` for Windows desktop packaging.
- This machine currently has Node/npm available through Visual Studio's bundled Node path, not the default shell PATH: `C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs`.
- Dependencies can be installed through the launcher with `.\run-web-app.cmd -Install`; it uses a project-local npm cache.
- Run the web app with `.\run-web-app.cmd`; the default local URL is `http://127.0.0.1:5173/`.
- If a future Codex thread is asked to run the app, run `D:\Repos\QuranHolder\QeraatSearcher\run-web-app.cmd` directly. In sandboxed shells Vite may fail with `spawn EPERM`; rerun the launcher with escalation instead of investigating the stack again.
- On 2026-05-01, `npm install --cache .npm-cache` completed and Vite served the app successfully at `http://127.0.0.1:5173/`; an HTTP smoke check returned status 200.
- The install reported `10 vulnerabilities` (`2 moderate`, `8 high`) in the npm dependency tree. Do not run `npm audit fix` automatically; review dependency impact first.

## Maintenance

Update this context when durable project knowledge changes, such as:

- architecture changes
- dependency or platform changes
- new build, test, release, or data-pipeline workflows
- resolved `[ASK USER]` items
- newly discovered risks or corrected assumptions
- any repo knowledge that seems worth preserving across future agent threads, whether discovered during work or explicitly requested by the user

Keep the context concise and evidence-based. Mark unknowns as `[TODO]` and intent-dependent decisions as `[ASK USER]`.
