
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
        cors: { origin: process.env.CORS_ORIGIN || "*" }
    });
    const drawQueues = new Map();

    const queueDraw = (roomId, data, mode) => {
        const previous = drawQueues.get(roomId) || Promise.resolve();
        const next = previous.catch(() => {}).then(() => handleDraw(data, roomId, mode));
        drawQueues.set(roomId, next);
        next.finally(() => {
            if (drawQueues.get(roomId) === next) drawQueues.delete(roomId);
        }).catch(() => {});
    };

    io.on('connection', (socket) => {
        console.log("Socket Connected:", socket.id);

        registerPairingHandlers(socket);

        socket.on('draw', (data) => {
            if (!socket.roomId) return;
            if (socket.deviceType === 'MOBILE') {
                socket.to(socket.roomId).emit('draw', data);
            }
            const mode = roomModes.get(socket.roomId) || 'mousepad';
            queueDraw(socket.roomId, data, mode);
        });

        socket.on('gesture', async (data) => {
            // Only a paired mobile device may inject input
            if (!socket.roomId || socket.deviceType !== 'MOBILE') return;
            await handleGesture(data);
        });
    });
};

export default initializeSocket;
