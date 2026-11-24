# 🎨 Konvas / DrawPad

Use your **phone as a wireless trackpad or stylus** for your laptop. The laptop app shows a 6‑digit code, you enter it on the phone, and your touch input moves the real mouse cursor over your local Wi‑Fi.

```
 Phone (Expo app) ──── socket.io over LAN ────▶ Desktop app (Electron + embedded server) ──▶ moves your mouse (nut-js)
```

## Repository layout

| Folder | What it is |
|--------|-----------|
| `desktop-app/` | Electron app for Windows. Starts the server automatically and shows the pairing code. **This is what end users run.** |
| `desktop-app/server/` | The socket.io server used inside the desktop app. |
| `mobile-app/` | Expo / React Native Android app (the touchpad and stylus surface). |
| `backend/` | Standalone copy of the same server, handy for development and browser test pages. |

> `desktop-app/server/src` and `backend/src` are currently duplicates. If you change one, change the other.

## Install

Download the latest release from [GitHub Releases](https://github.com/Ashish96300/konvas/releases/latest). Windows users install the `.exe`; Android users install the `.apk`. Start DrawPad on Windows, then pair the Android app using the laptop address and code shown in the desktop app.

## Quick start (using the app)

1. **Desktop:** start DrawPad. It shows a 6‑digit code and the address your phone should use, for example `192.168.1.5`.
2. **Phone:** open the app, enter that address and the code, and tap pair.
3. The phone opens in **Mouse Pad** mode (relative movement, tap to click, two fingers to scroll). Tap **DRAW / STYLUS** on the phone to draw directly on the laptop; stylus strokes are sent in small batches to preserve the full path. Use **MOUSE PAD** to switch back. **NEXT PAGE** scrolls the active laptop app down.

Both devices must be on the **same Wi‑Fi network**. If pairing fails, allow DrawPad through the Windows firewall on private networks (port `3000`).

## Development

### Desktop app

```bash
cd desktop-app
npm install
npm start                 # runs Electron + embedded server on port 3000
DRAWPAD_DEBUG=1 npm start # same, with DevTools open
npm run dist              # builds the Windows installer into dist/
```

### Standalone server (optional)

```bash
cd backend
npm install
cp .env.example .env      # PORT=3000
npm run dev
```

Open `http://localhost:3000/health` to check it is running. Environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | Server port |
| `CORS_ORIGIN` | `*` | Allowed browser origins for socket.io |
| `ENABLE_DEBUG_API` | off | Set to `true` to expose `GET /api/devices` and `/api/devices/stats` |

`backend/test.html` and `backend/test-desktop.html` are simple browser clients for testing pairing without the apps.

> The server controls the machine it runs on through `nut-js`, so it needs a real desktop session. It cannot run on a headless cloud server.

### Mobile app

The app uses native modules (Skia, Gesture Handler), so **Expo Go will not work**. Use a development build:

```bash
cd mobile-app
npm install
npm install -g eas-cli && eas login
eas build --profile development --platform android   # install the resulting APK
npx expo start --dev-client
```

Use `eas build --profile preview --platform android` for a shareable APK. To pre-fill the server address, set `EXPO_PUBLIC_SERVER_URL` (for example `http://192.168.1.5:3000`) before building. The last address you used is remembered on the phone.

## How pairing works

1. Desktop registers and receives a random 6‑digit code (valid for 2 minutes).
2. Phone connects to the desktop's address and sends the code.
3. Both join a socket.io room named after the code; the desktop shares its screen size.
4. Only a paired phone can send `draw` and `gesture` events. After 5 wrong codes a connection is dropped.

## Security notes

- Traffic is plain HTTP/WebSocket on your local network (the Android app allows cleartext for this reason). Use trusted Wi‑Fi only.
- Anyone who can reach port 3000 and guess a live code can control your mouse while the app is open, so close the app when you are not using it.

## Tech stack

Electron, Node.js, Express 5, socket.io, `@nut-tree-fork/nut-js`, Expo / React Native, Skia, NativeWind.

## Authors

Ashish, Harsh
