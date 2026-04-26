# MCSE — Android TWA Wrapper

This directory contains the Android Trusted Web Activity (TWA) wrapper for the MCSE web app. It uses [Bubblewrap](https://github.com/nicolo-ribaudo/nicolo-nicolo-nicolo-nicolo-nicolo-nicolo-nicolo-nicolo-nicolo-nicolo-nicolo-nicolo-nicolo-nicolo) to package the PWA at `https://mcse.in` as a native Android app.

## Project Structure

```
/mcse                    ← Repository root
├── app/                 ← Next.js pages (web app)
├── components/          ← React components (web app)
├── public/              ← Static assets, web manifest, icons
│   ├── manifest.json
│   ├── .well-known/
│   │   └── assetlinks.json   ← Digital Asset Links (TWA verification)
│   ├── web-app-manifest-192x192.png
│   └── web-app-manifest-512x512.png
├── android-app/         ← Android TWA wrapper (this directory)
│   ├── twa-manifest.json     ← Bubblewrap configuration
│   ├── gradle.properties     ← Gradle build settings
│   ├── build.ps1             ← Build script (PowerShell)
│   ├── android.keystore      ← Signing key (gitignored, you create this)
│   └── app/                  ← Generated Android project (after bubblewrap init)
├── package.json
└── next.config.ts
```

> **The web app lives at the root.** This folder (`android-app/`) only contains the Android wrapper. No web app code is modified by anything in here.

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| JDK | 11+ | `winget install Microsoft.OpenJDK.11` |
| Android SDK | API 33+ | Via Android Studio or `sdkmanager` |
| Bubblewrap CLI | Latest | `npm install -g @nicolo-ribaudo/bubblewrap` |

Ensure `JAVA_HOME` and `ANDROID_HOME` environment variables are set.

## First-Time Setup

### 1. Initialize the Android project

```powershell
cd android-app
bubblewrap init --manifest="https://mcse.in/manifest.json"
```

This generates the `app/` directory with the full Android project scaffold. Follow the interactive prompts for SDK paths.

### 2. Generate a signing keystore

```powershell
keytool -genkeypair -v -keystore android.keystore -alias mcse -keyalg RSA -keysize 2048 -validity 10000
```

When prompted, set a strong password. **Do not commit the keystore or password.**

### 3. Get your SHA-256 fingerprint

```powershell
keytool -list -v -keystore android.keystore -alias mcse
```

Copy the `SHA256:` fingerprint and paste it into `../public/.well-known/assetlinks.json`, replacing `YOUR_SHA256_FINGERPRINT_HERE`. This is required for the TWA to display fullscreen (no browser bar).

Example format: `AB:CD:EF:12:34:56:...`

### 4. Deploy assetlinks.json

Ensure `https://mcse.in/.well-known/assetlinks.json` is publicly accessible and returns the correct JSON. This file is already placed in `public/.well-known/` — it will be served automatically by Next.js/Vercel.

## Building

```powershell
cd android-app
./build.ps1
```

The build script will:
1. Verify `bubblewrap` CLI is installed
2. Validate `twa-manifest.json` (no null fields)
3. Fetch `https://mcse.in/manifest.json` and verify it's valid JSON
4. Check icon files exist in `../public/`
5. Check for the signing keystore
6. Run `bubblewrap update`
7. Run `bubblewrap build --no-daemon`
8. Verify the output `.aab` file was generated

Signing passwords are prompted interactively during the build — they are never stored in the script.

### Output

```
android-app/app-release-bundle.aab
```

Upload this file to the [Google Play Console](https://play.google.com/console) for distribution.

## Configuration

### twa-manifest.json

Key fields:

| Field | Value | Notes |
|-------|-------|-------|
| `packageId` | `in.mcse.twa` | Android package name |
| `host` | `mcse.in` | Production domain |
| `webManifestUrl` | `https://mcse.in/manifest.json` | Must be absolute URL |
| `iconUrl` | `https://mcse.in/web-app-manifest-512x512.png` | Must be absolute URL |
| `themeColor` | `#0a0a0a` | Matches web manifest |
| `backgroundColor` | `#0a0a0a` | Matches web manifest |

### gradle.properties

Pre-configured with recommended settings:
- `org.gradle.jvmargs=-Xmx1024m -Dfile.encoding=UTF-8`
- `android.useAndroidX=true`
- `android.enableJetifier=true`

## Troubleshooting

**Browser bar showing in the TWA?**
→ `assetlinks.json` is not reachable or the SHA-256 fingerprint doesn't match. Verify with: `https://mcse.in/.well-known/assetlinks.json`

**Build fails with "keystore not found"?**
→ Run the `keytool` command from First-Time Setup step 2.

**`bubblewrap` command not found?**
→ `npm install -g @nicolo-ribaudo/bubblewrap`

**Gradle out of memory?**
→ Increase heap in `gradle.properties`: `org.gradle.jvmargs=-Xmx2048m`
