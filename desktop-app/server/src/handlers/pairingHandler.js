import generatePairingCode from '../utils/pairingLogic.js';
import { addDevice, removeDevice } from '../services/deviceRegistration.service.js';
import { deleteSmoothing, resetSmoothing } from '../utils/smoothing.js';
import { mouse, Button } from '@nut-tree-fork/nut-js';
import { releaseMouseIfDown } from './drawHandler.js';

export const roomDimensions = new Map();
export const roomModes = new Map();
export const waitingDesktops = new Map();
export const pairedRooms = new Map();

export const registerPairingHandlers = (socket) => {

    socket.on('registerDesktop', () => {
        const otp = generatePairingCode();
        waitingDesktops.set(otp, socket);
        socket.emit('otp', { otp });
        socket.roomId = otp;
        socket.deviceType = 'DESKTOP';
        addDevice(socket.id, 'DESKTOP');
        console.log("Desktop registered, OTP:", otp);
    });

    socket.on('registerMobile', ({ otp }) => {
        const desktopSocket = waitingDesktops.get(otp);
        if (!desktopSocket) {
            socket.emit('error', { message: 'Invalid or expired code' });
            return;
        }
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
        releaseMouseIfDown();

        const roomId = socket.roomId;
        waitingDesktops.forEach((desktopSocket, otp) => {
            if (desktopSocket === socket) waitingDesktops.delete(otp);
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