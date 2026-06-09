const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 480,
        height: 620,
        resizable: false,
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
    mainWindow.webContents.openDevTools();
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// const { app, BrowserWindow } = require('electron');
// const path = require('path');

// let mainWindow;

// const createWindow = () => {
//     mainWindow = new BrowserWindow({
//         width: 480,
//         height: 620,
//         resizable: false,
//         titleBarStyle: 'hiddenInset',
//         webPreferences: {
//             preload: path.join(__dirname, 'preload.cjs'),
//             contextIsolation: true,
//             nodeIntegration: false,
//         }
//     });

//     mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
//     // mainWindow.webContents.openDevTools(); // Close this for the final build
// };

// // ─── THE MERGE STEP ───
// app.whenReady().then(() => {
//     // 1. Start your Backend Engine
//     // This looks for 'index.js' inside your 'server' folder
//     import('./server/index.js')
//         .then(() => console.log("🚀 Wireless Engine Started Successfully"))
//         .catch(err => console.error("❌ Engine Failed to Start:", err));

//     // 2. Open the Window
//     createWindow();
// });

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') app.quit();
// });