# Qeraat Searcher: Build & Distribution Guide

This guide provides step-by-step instructions for building and distributing the **Qeraat Searcher** native application for Android, iOS, and Windows.

## 📱 Project Architecture
The native app is built as a **Single Page Application (SPA)** using Vite and React, wrapped by **Capacitor**. It uses **sql.js (WebAssembly)** to provide offline search capabilities by loading the database into memory.

---

## 🛠 Prerequisites

### General
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)

### Android
- **Android Studio**
- **Android SDK** (API level 30 or higher recommended)
- **Java Development Kit (JDK)** 17

### iOS (Requires a Mac)
- **Xcode**
- **CocoaPods** (`sudo gem install cocoapods`)

### Windows (Electron)
- No additional global tools required, but `electron-builder` (bundled) handles packaging.

---

## 🚀 Development Workflow

1. **Install Dependencies**:
   ```bash
   cd qeraat-native
   npm install
   ```

2. **Run in Browser (Preview)**:
   ```bash
   npm run dev
   ```

3. **Update Native Assets**:
   Whenever you change code in `src/` or assets in `public/`, you must rebuild the web project and sync it with the native platforms:
   ```bash
   npm run build
   npx cap sync
   ```

---

## 🤖 Android Distribution

### 1. Build the APK (Debug)
1. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
2. Wait for Gradle sync to complete.
3. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. Locating the file: `android/app/build/outputs/apk/debug/app-debug.apk`.

### 2. Prepare for Release (Google Play)
1. In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle** (preferred for Play Store).
3. Create/select your **Keystore** and sign the app.
4. The resulting `.aab` file is ready for upload to the Google Play Console.

---

## 🍎 iOS Distribution (Mac Only)

### 1. Build the App
1. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```
2. Select your target device (or "Any iOS Device").

### 2. Archive and Distribute
1. Go to **Product > Archive**.
2. Once the archive is complete, the **Organizer** window will open.
3. Click **Distribute App**.
4. Choose **App Store Connect** (for TestFlight/App Store) or **Ad Hoc** (for manual installation).
5. Follow the prompts to sign and export the `.ipa` file.

---

## 🪟 Windows Distribution (Electron)

### 1. Run the Desktop App
```bash
npx cap open @capacitor-community/electron
```

### 2. Package into a `.exe` Installer
1. Navigate to the electron directory:
   ```bash
   cd electron
   ```
2. Run the build command:
   ```bash
   npm run build
   ```
3. The installer (`.exe`) and portable versions will be generated in the `electron/dist` folder.

---

## 💾 Database Updates
If you need to update the Quran database:
1. Replace the file at `qeraat-native/public/db/qeraat_data_v1.db`.
2. Run `npm run build`.
3. Run `npx cap sync`.
4. Rebuild the native projects as described above.

---

## ⚠️ Important Considerations
- **Offline Mode**: The database (~27MB) is fetched on first launch and kept in memory. No internet is required after the app is installed and opened once.
- **RTL Support**: The app automatically detects the selected language (Arabic/English) and flips the UI layout (Right-to-Left for Arabic).
- **Storage**: Since the DB is in memory, closing the app completely releases the memory.
