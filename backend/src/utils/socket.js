import { Server } from "socket.io";
import generatePairingCode from "./pairingLogic.js"
import { addDevice, removeDevice } from '../services/deviceRegistration.service.js'
import { mouse, Point, Button } from '@nut-tree-fork/nut-js'

const waitingDesktops = new Map()  // otp -> desktopSocket
const pairedRooms = new Map()       // otp -> { desktopSocket, mobileSocket }

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" }
    })

    io.on('connection', (socket) => {
        console.log("Socket Connected:", socket.id)

        socket.on('registerDesktop', () => {
            const otp = generatePairingCode();
            waitingDesktops.set(otp, socket)
            socket.emit('otp', { otp })
            socket.roomId = otp;
            socket.deviceType = 'DESKTOP';
            addDevice(socket.id, 'DESKTOP')
            console.log("Desktop registered, OTP:", otp)
        })

        socket.on('registerMobile', ({ otp }) => {
            const desktopSocket = waitingDesktops.get(otp);

            if (!desktopSocket) {
                socket.emit('error', { message: 'Invalid or expired code' });
                return;
            }

            // Join room
            socket.join(otp);
            desktopSocket.join(otp);

            socket.roomId = otp;
            socket.deviceType = 'MOBILE';
            desktopSocket.roomId = otp;

            // Track the pair so we can notify on disconnect
            pairedRooms.set(otp, { desktopSocket, mobileSocket: socket })

            // Notify both
            socket.emit('pairingSuccess', { message: 'Paired Successfully' });
            desktopSocket.emit('pairingSuccess', { message: 'Paired Successfully' });

            desktopSocket.emit('requestDimensions', { targetMobileId: socket.id });

            // Remove from waiting since it's now paired
            waitingDesktops.delete(otp);

            addDevice(socket.id, 'MOBILE')
            console.log("Mobile paired with OTP:", otp)
        })

        socket.on('drawingScreenReady', () => {
            if (!socket.roomId) {
                console.log("drawingScreenReady fired but no roomId set yet")
                return;
            }
            console.log(`Mobile in room ${socket.roomId} is ready`)
            socket.to(socket.roomId).emit('getCanvasDimensions');
        })

        socket.on('canvasDimensions', (data) => {
            if (!socket.roomId) return;
            console.log(`Canvas dimensions: ${data.width}x${data.height}`)
            socket.to(socket.roomId).emit('canvasDimensions', data);
        })

        socket.on('draw', async (data) => {
            if (!socket.roomId) return;

            // Only forward from mobile to desktop, not the other way
            if (socket.deviceType === 'MOBILE') {
                socket.to(socket.roomId).emit('draw', data)
            }

            // robotjs / nut-js acts on it
            try {
                if (data.type === 'start') {
                    await mouse.move([new Point(data.x, data.y)])
                    await mouse.pressButton(Button.LEFT)
                } else if (data.type === 'move' && data.points) {
                    const points = data.points.map(p => new Point(p.x, p.y))
                    await mouse.move(points)
                } else if (data.type === 'end') {
                    await mouse.releaseButton(Button.LEFT)
                }
            } catch (err) {
                console.error("Mouse control error:", err.message)
            }
        })

        socket.on('disconnect', () => {
            console.log("Socket disconnected:", socket.id, socket.deviceType)

            const roomId = socket.roomId;

            // If was waiting as desktop (never paired), clean up waiting map
            waitingDesktops.forEach((desktopSocket, otp) => {
                if (desktopSocket === socket) waitingDesktops.delete(otp)
            })

            // If was in a paired room, notify the other side and clean up
            if (roomId && pairedRooms.has(roomId)) {
                const { desktopSocket, mobileSocket } = pairedRooms.get(roomId)

                // Figure out who's still connected and notify them
                if (socket.deviceType === 'DESKTOP' && mobileSocket) {
                    mobileSocket.emit('partnerDisconnected', { message: 'Desktop disconnected' })
                } else if (socket.deviceType === 'MOBILE' && desktopSocket) {
                    desktopSocket.emit('partnerDisconnected', { message: 'Mobile disconnected' })
                }

                pairedRooms.delete(roomId)
            }

            removeDevice(socket.id)
        })
    })
}

export default initializeSocket;