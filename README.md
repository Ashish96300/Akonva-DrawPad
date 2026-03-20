# 🎨 DrawPad Backend — Setup & Testing Guide

A real-time drawing pad server where a **mobile device** acts as a drawing input for a **desktop screen**. Devices are paired using a 4-digit OTP code.

---

## 📁 Project Structure

```
backend/
├── index.js                          → Starts the server
├── app.js                            → HTTP routes setup
├── .env                              → Environment variables
├── src/
│   ├── utils/
│   │   ├── socket.js                 → All socket.io logic
│   │   └── pairingLogic.js           → OTP generator
│   ├── routes/
│   │   └── device.routes.js          → HTTP endpoints
│   ├── controller/
│   │   └── deviceRegistration.controller.js
│   ├── services/
│   │   └── deviceRegistration.service.js
│   └── configs/
│       └── constants.js
└── test/
    ├── test-desktop.html             → Desktop test client
    └── test-mobile.html              → Mobile test client
```

---


## 🚀 Step 1 — Open the Project in VS Code

1. Open **VS Code**
2. Click **File** → **Open Folder**
3. Select your `backend` folder
4. VS Code will open the project

---

## 📦 Step 2 — Install Dependencies

1. In VS Code, open the terminal by pressing **Ctrl + `** (backtick key)
2. You will see a terminal at the bottom of VS Code
3. Run this command:

```bash
npm install
```

Wait for it to finish. You will see a `node_modules` folder appear in your project.

---

## ⚙️ Step 3 — Create the `.env` File

1. In VS Code, right click on the root folder in the file explorer on the left
2. Click **New File**
3. Name it `.env`
4. Add this inside it:

```
PORT=3000
```

Save the file with **Ctrl + S**.

---

## ▶️ Step 4 — Start the Server

In the VS Code terminal, run:

```bash
npm run dev
```

You should see this output in the terminal:

```
🚀 Server listening on PORT 3000
📡 HTTP: http://localhost:3000
🔌 WebSocket: ws://localhost:3000
```

✅ This means your server is running. **Keep this terminal open — do not close it.**

---

## 🧪 Step 5 — Test the Server

You need **two browser tabs** open at the same time — one acting as the Desktop and one acting as the Mobile.

### Opening the test files

There are two ways to open the HTML test files:

**Option A — Directly from File Explorer (Easiest)**
1. Open your File Explorer (Windows Explorer)
2. Navigate to your `backend/test/` folder
3. Double click `test-desktop.html` — it opens in your browser
4. Go back to File Explorer and double click `test-mobile.html` — it opens in a new tab

**Option B — From VS Code using Live Server**
1. Install the **Live Server** extension in VS Code if you haven't:
   - Click the Extensions icon on the left sidebar (looks like 4 squares)
   - Search for `Live Server`
   - Click **Install**
2. In VS Code file explorer, find `test-desktop.html`
3. **Right click on it** → click **Open with Live Server**
4. Do the same for `test-mobile.html`

> ⚠️ Do NOT click "Go Live" from the bottom bar — right click the specific file instead.

---

## 🔗 Step 6 — Pair Desktop and Mobile

Now you have two tabs open. Follow these steps in order:

**In the Desktop tab (`test-desktop.html`):**
1. Click the **"Connect as Desktop"** button
2. You will see a 4-digit OTP code appear on screen like `4829`
3. Keep this tab open

**In the Mobile tab (`test-mobile.html`):**
1. Click the **"Connect as Mobile"** button
2. A text box will appear asking for the OTP
3. Type the 4-digit OTP you saw on the Desktop tab
4. Click **"Pair with Desktop"**

✅ Both tabs should now show **"Paired Successfully"**

---

## ✏️ Step 7 — Test Drawing

1. Go to the **Mobile tab**
2. Draw anything on the canvas using your mouse
3. Switch to the **Desktop tab**
4. You should see the drawing appear on the Desktop canvas in real time 🎨

You can also:
- Change the **brush color** using the color picker
- Change the **brush size** using the slider
- Click **Clear** to clear the canvas on both devices

---

## 🌐 Step 8 — Test HTTP Endpoints

While your server is running, you can also test the HTTP endpoints.

Open a new browser tab and visit these URLs:

| URL | What it does |
|-----|--------------|
| `http://localhost:3000/` | Check if server is running |
| `http://localhost:3000/health` | Server health check |
| `http://localhost:3000/api/devices` | See all connected devices |
| `http://localhost:3000/api/devices/stats` | See device counts |

Or click the **"Get Stats"** button in either test file to see stats directly.

---

## 🛑 Stopping the Server

To stop the server, click on the VS Code terminal and press:
```
Ctrl + C
```

You will see:
```
SIGINT signal received: closing HTTP server
HTTP server closed
```

---

## ❗ Common Errors & Fixes

**Error: `Cannot find module`**
```
Run npm install again
```

**Error: `Port 3000 already in use`**
```
Change PORT=3001 in your .env file and restart
```

**Browser shows "Cannot connect"**
```
Make sure your server is running (npm run dev) before opening the test files
```

**OTP not working**
```
Make sure you type the exact 4 digit number shown on the Desktop tab
OTPs expire when the desktop disconnects — reconnect and get a new one
```

**Drawing not showing on Desktop**
```
Make sure both tabs show "Paired Successfully" before drawing
If not, disconnect both and start the pairing process again
```

---

## 📡 How It Works (Simple Explanation)

```
Desktop opens → Server gives OTP (e.g. 4829)
                        ↓
Mobile enters OTP → Both join room "4829"
                        ↓
Mobile draws → Server forwards to room "4829"
                        ↓
Desktop receives drawing data → Shows on screen
```

---

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Backend runtime |
| Express.js | HTTP server |
| Socket.io | Real-time communication |
| HTML Canvas | Drawing in browser |