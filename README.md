# Qeraat Searcher

Qeraat Searcher is a React application for searching Qira'at data from a bundled SQLite database. The active app lives in `qeraat-native`; it runs as a Vite web app for development and is wrapped with Capacitor for Android, iOS, and Electron desktop targets.

## Prerequisites

For web development:

- Node.js 18 or higher.
- npm 9 or higher.

For native targets:

- Android: Android Studio, Android SDK, and JDK 17.
- iOS: macOS with Xcode and CocoaPods.
- Windows desktop: Electron dependencies under `qeraat-native/electron`.

On this machine, `node` and `npm` may not be on the default shell PATH. A working bundled Node installation exists at:

```text
C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs
```

For the current PowerShell session, add it to PATH with:

```powershell
$nodeDir = 'C:\Program Files\Microsoft Visual Studio\18\Community\MSBuild\Microsoft\VisualStudio\NodeJs'
$env:PATH = "$nodeDir;$env:PATH"
```

## Run The Web App

From this repository root:

```powershell
cd qeraat-native
npm install
npm run dev -- --host 127.0.0.1
```

Then open:

```text
http://127.0.0.1:5173/
```

If npm cannot write to the user cache in a sandboxed shell, use a project-local cache:

```powershell
npm install --cache .npm-cache
```

## Useful Commands

```powershell
npm run lint
npm run build
npm run build:web
npm run preview
```

Native sync/build commands are defined in `qeraat-native/package.json`.
