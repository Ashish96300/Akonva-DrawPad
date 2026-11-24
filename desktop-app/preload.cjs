const { contextBridge, ipcRenderer } = require('electron');

// Only allow the channels the renderer actually needs.
const ALLOWED_CHANNELS = ['server-info'];

contextBridge.exposeInMainWorld('drawpad', {
    // Main → Renderer
    on: (channel, callback) => {
        if (!ALLOWED_CHANNELS.includes(channel)) return;
        ipcRenderer.removeAllListeners(channel);
        ipcRenderer.on(channel, (_, data) => callback(data));
    },
});
