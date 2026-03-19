
import { Server } from "socket.io";
import { mouse, Button } from '@nut-tree-fork/nut-js';
import { registerPairingHandlers, roomModes } from '../handlers/pairingHandler.js';
import { handleDraw } from '../handlers/drawHandler.js';
import { handleGesture } from '../handlers/gestureHandler.js';


mouse.config.mouseSpeed = 99999;
mouse.config.autoDelayMs = 0;
mouse.releaseButton(Button.LEFT).catch(() => {});

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    });

    io.on('connection', (socket) => {
        console.log("Socket Connected:", socket.id);

        registerPairingHandlers(socket);

        socket.on('draw', async (data) => {
              console.log("Draw received:", socket.roomId, socket.deviceType, data.type, "| mode:", roomModes.get(socket.roomId));
            if (!socket.roomId) return;
            if (socket.deviceType === 'MOBILE') {
                socket.to(socket.roomId).emit('draw', data);
            }
            const mode = roomModes.get(socket.roomId) || 'mousepad';
            await handleDraw(data, socket.roomId, mode);
        });

        socket.on('gesture', async (data) => {
            await handleGesture(data);
        });
    });
};

export default initializeSocket;