# Android Build Guide

## Current status

The Expo app is configured for EAS Android builds.

Files already prepared:

- `app.json`
- `eas.json`
- `package.json` build scripts

## First-time setup

1. Open a terminal in `mobile/`
2. Log in to Expo:

```bash
npx eas login
```

3. Configure the project on Expo if prompted:

```bash
npx eas init
```

## Build commands

Preview/internal Android build:

```bash
npm run build:android
```

Production Android build:

```bash
npm run build:android:prod
```

## Notes

- `preview` is suitable for testing and internal distribution.
- `production` is for release-ready cloud builds.
- Installable APK/AAB generation happens on Expo's build servers, not purely locally.
- If you want fully persistent testing data, replace the current local dev database setup with MongoDB Atlas credentials in `server/.env`.
