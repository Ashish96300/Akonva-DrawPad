import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('drawpad', {
    // Renderer → Main
    send: (channel, data) => ipcRenderer.send(channel, data),
    // Main → Renderer
    on: (channel, callback) => ipcRenderer.on(channel, (_, data) => callback(data)),
    off: (channel) => ipcRenderer.removeAllListeners(channel),
});