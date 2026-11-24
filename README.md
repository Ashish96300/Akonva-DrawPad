

# Konvas

**Turn your Android phone into a wireless trackpad and stylus for your Windows PC.**

Konvas lets you control your computer's mouse cursor, scroll through content, and draw on your desktop using your phone. Both devices connect over the same local Wi-Fi network—no USB cable required.

<!-- Screenshots / preview images will be added here later. -->

## Features

- **Wireless mouse control** — move the cursor using your phone's touch surface.
- **Tap to click** — use simple touch gestures for mouse interaction.
- **Two-finger scrolling** — scroll through pages and apps from your phone.
- **Stylus mode** — draw directly on your Windows desktop.
- **Quick pairing** — connect using the six-digit code shown by the desktop app.
- **Local network connection** — your phone and PC communicate over your Wi-Fi network.

## Downloads

Get the latest published builds from the **[Konvas Releases page](https://github.com/Ashish96300/konvas/releases/latest)**.

Download the appropriate file from the release assets for your device:

- **Windows:** desktop application installer.
- **Android:** mobile application APK.

> Always download the latest version from the Releases page. Available files and version numbers are listed under each release's **Assets** section.

## Getting started

### 1. Install the apps

Install the Windows desktop application on your PC and the Android APK on your phone.

### 2. Connect both devices to the same Wi-Fi

Your phone and Windows PC must be connected to the same local network.

### 3. Pair your phone with your PC

1. Open Konvas on your Windows PC. The desktop app displays a six-digit pairing code and the local network address.
2. Open the Android app.
3. Enter the address and six-digit code shown on your PC.
4. Tap **Pair**.

Once connected, your phone can control the PC.

### 4. Use the touch controls

- **Mouse Pad:** move the cursor, tap to click, and use two fingers to scroll.
- **Draw / Stylus:** draw directly on the computer screen.
- **Next Page:** scroll the active desktop app down.
- Switch back to **Mouse Pad** whenever you want regular cursor controls.

## Screenshots

<!--
Add screenshots here when they are ready.

Suggested images:
- Desktop pairing screen
- Android mouse pad screen
- Stylus / drawing mode
-->

## How it works

The Windows application runs an Electron desktop app with an embedded Node.js and Socket.IO server. The Android app connects to that server over your local network.

```text
Android phone
     |
     | Socket.IO over local Wi-Fi
     v
Windows desktop app (Electron + embedded server)
     |
     v
Mouse and drawing input on your PC
```

During pairing, the desktop app generates a temporary six-digit code. The phone submits that code to join the matching Socket.IO session. The pairing code expires after two minutes, and a connection is dropped after five incorrect attempts.

## Repository structure

| Directory | Description |
|---|---|
| `desktop-app/` | Electron application for Windows. Starts the embedded server and displays the pairing code. |
| `desktop-app/server/` | Socket.IO server bundled with the desktop application. |
| `mobile-app/` | Expo / React Native Android application containing the touchpad and stylus interface. |
| `backend/` | Standalone copy of the server, useful for development and browser-based testing. |

> **Development note:** `desktop-app/server/src` and `backend/src` are currently duplicate server implementations. Keep them in sync when making server changes.

## Development setup

### Requirements

- Node.js and npm
- Android development environment / EAS CLI for mobile builds
- Windows for running and packaging the desktop application

### Desktop application

```bash
cd desktop-app
npm install
npm start
```

The desktop app starts Electron with its embedded server on port `3000`.

To open DevTools while developing:

```bash
DRAWPAD_DEBUG=1 npm start
```

To build the Windows installer:

```bash
npm run dist
```

The generated installer is placed in the `dist/` directory.

### Standalone backend (optional)

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The standalone server uses port `3000` by default. Visit `http://localhost:3000/health` to check whether it is running.

| Environment variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `*` | Allowed browser origins for Socket.IO |
| `ENABLE_DEBUG_API` | Off | Set to `true` to expose development device endpoints |

The files `backend/test.html` and `backend/test-desktop.html` provide simple browser clients for testing pairing.

> The backend uses desktop input-control functionality, so it must run in a real desktop session. It is not intended to run as a headless cloud service.

### Android application

The mobile app uses native modules, including Skia and Gesture Handler. **Expo Go is not supported**; use an Expo development build instead.

```bash
cd mobile-app
npm install
npm install -g eas-cli
eas login
eas build --profile development --platform android
npx expo start --dev-client
```

To create a shareable APK:

```bash
eas build --profile preview --platform android
```

You can set `EXPO_PUBLIC_SERVER_URL` before building to pre-fill the desktop server address, for example:

```text
EXPO_PUBLIC_SERVER_URL=http://192.168.1.5:3000
```

The app remembers the last server address used on the phone.

## Troubleshooting

**The phone cannot pair with the PC**

- Confirm that both devices are connected to the same Wi-Fi network.
- Check that the IP address entered on the phone matches the address shown by the desktop app.
- Make sure the pairing code has not expired; use the current code displayed on the PC.
- Allow the desktop app through Windows Firewall on **Private networks**. The server uses port `3000`.

**The app connects but input does not work**

- Keep the desktop application open while using the phone.
- Check that the Windows desktop session is active and that the connection has not been interrupted.

## Security

Konvas currently communicates over plain HTTP and WebSocket connections on your local network.

- Use Konvas only on a trusted Wi-Fi network.
- Anyone who can reach the server and guess the active pairing code may be able to control the PC while the app is running.
- Close the desktop app when you are finished using it.

## Tech stack

- **Desktop:** Electron, Node.js
- **Backend:** Express 5, Socket.IO
- **Desktop input:** `@nut-tree-fork/nut-js`
- **Mobile:** Expo, React Native, Skia, NativeWind, Gesture Handler

## Contributors

- Ashish
- Harsh 

