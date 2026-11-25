const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

// Fixed: the renderer and the phone app both default to port 3000
const PORT = 3000;

let mainWindow;
let serverModule;
let serverInfo;

// The server is an ES module; load it from this CommonJS entry point.
const startEngine = async () => {
    serverModule = await import(pathToFileURL(path.join(__dirname, 'server', 'index.js')).href);
    serverInfo = await serverModule.startServer(PORT);
};

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

    // Tell the renderer where phones should connect once it has loaded.
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('server-info', serverInfo);
    });

    // DevTools only on request: DRAWPAD_DEBUG=1 npm start
    if (process.env.DRAWPAD_DEBUG) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
};

app.whenReady().then(async () => {
    try {
        await startEngine();
    } catch (err) {
        dialog.showErrorBox(
            'Akonva could not start',
            err.code === 'EADDRINUSE'
                ? `Port ${PORT} is already in use. Close the other app or set a different PORT.`
                : String(err.message || err)
        );
        app.quit();
        return;
    }
    createWindow();
});

app.on('before-quit', () => {
    if (serverModule) serverModule.stopServer();
});

app.on('window-all-closed', () => {
    app.quit();
});
