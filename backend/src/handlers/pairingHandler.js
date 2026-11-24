import generatePairingCode from '../utils/pairingLogic.js';
import { addDevice, removeDevice } from '../services/deviceRegistration.service.js';
import { deleteSmoothing, resetSmoothing } from '../utils/smoothing.js';
import { mouse, Button } from '@nut-tree-fork/nut-js';
import { releaseMouseIfDown } from './drawHandler.js';

export const roomDimensions = new Map();
export const roomModes = new Map();
export const waitingDesktops = new Map();

const OTP_TTL_MS = 2 * 60 * 1000;      // codes expire after 2 minutes
const MAX_FAILED_ATTEMPTS = 5;         // wrong guesses allowed per socket
export const pairedRooms = new Map();

export const registerPairingHandlers = (socket) => {

    socket.on('registerDesktop', () => {
        // Drop any previous code this desktop was waiting with
        waitingDesktops.forEach((entry, code) => {
            if (entry.socket === socket) waitingDesktops.delete(code);
        });

        let otp;
        do { otp = generatePairingCode(); } while (waitingDesktops.has(otp) || pairedRooms.has(otp));

        waitingDesktops.set(otp, { socket, expiresAt: Date.now() + OTP_TTL_MS });
        socket.emit('otp', { otp });
        socket.roomId = otp;
        socket.deviceType = 'DESKTOP';
        addDevice(socket.id, 'DESKTOP');
        console.log("Desktop registered, OTP:", otp);
    });

    socket.failedAttempts = 0;

    socket.on('registerMobile', ({ otp } = {}) => {
        if (socket.roomId) return; // already paired / registered
        if (socket.failedAttempts >= MAX_FAILED_ATTEMPTS) {
            socket.emit('error', { message: 'Too many attempts. Reconnect and try again.' });
            socket.disconnect(true);
            return;
        }

        const entry = typeof otp === 'string' ? waitingDesktops.get(otp) : undefined;
        if (!entry || entry.expiresAt < Date.now() || !entry.socket.connected) {
            if (entry) waitingDesktops.delete(otp);
            socket.failedAttempts += 1;
            socket.emit('error', { message: 'Invalid or expired code' });
            return;
        }
        const desktopSocket = entry.socket;
        socket.join(otp);
        desktopSocket.join(otp);
        socket.roomId = otp;
        socket.deviceType = 'MOBILE';
        desktopSocket.roomId = otp;
        pairedRooms.set(otp, { desktopSocket, mobileSocket: socket });
        socket.emit('pairingSuccess', { message: 'Paired Successfully' });
        desktopSocket.emit('pairingSuccess', { message: 'Paired Successfully' });
        desktopSocket.emit('requestDimensions', { targetMobileId: socket.id });
        waitingDesktops.delete(otp);
        addDevice(socket.id, 'MOBILE');
        console.log("Mobile paired with OTP:", otp);
    });

    socket.on('canvasDimensions', (data) => {
        if (!socket.roomId) return;
        roomDimensions.set(socket.roomId, data);
        socket.to(socket.roomId).emit('canvasDimensions', data);
    });

    socket.on('drawingScreenReady', () => {
        if (!socket.roomId) return;
        if (roomDimensions.has(socket.roomId)) {
            socket.emit('canvasDimensions', roomDimensions.get(socket.roomId));
        } else {
            socket.to(socket.roomId).emit('getCanvasDimensions');
        }
    });

    socket.on('setMode', ({ mode }) => {
        if (!socket.roomId) return;
        roomModes.set(socket.roomId, mode);
        socket.to(socket.roomId).emit('modeChanged', { mode });
        resetSmoothing(socket.roomId);
        if (mode === 'mousepad') {
            mouse.releaseButton(Button.LEFT).catch(() => {});
        }
        console.log(`Room ${socket.roomId} mode: ${mode}`);
    });

    socket.on('setSensitivity', ({ value }) => {
        if (!socket.roomId) return;
        socket.to(socket.roomId).emit('sensitivityChanged', { value });
    });

    socket.on('disconnect', () => {
        console.log("Socket disconnected:", socket.id);
        const roomId = socket.roomId;
        releaseMouseIfDown(roomId);
        waitingDesktops.forEach((entry, otp) => {
            if (entry.socket === socket) waitingDesktops.delete(otp);
        });

        if (roomId && pairedRooms.has(roomId)) {
            const { desktopSocket, mobileSocket } = pairedRooms.get(roomId);
            if (socket.deviceType === 'DESKTOP' && mobileSocket) {
                mobileSocket.emit('partnerDisconnected', { message: 'Desktop disconnected' });
            } else if (socket.deviceType === 'MOBILE' && desktopSocket) {
                desktopSocket.emit('partnerDisconnected', { message: 'Mobile disconnected' });
            }
            roomModes.delete(roomId);
            roomDimensions.delete(roomId);
            deleteSmoothing(roomId);
            pairedRooms.delete(roomId);
        }

        removeDevice(socket.id);
    });
};