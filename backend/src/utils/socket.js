import { Server } from "socket.io";
import generatePairingCode from "./pairingLogic.js"
import { addDevice, removeDevice } from '../services/deviceRegistration.service.js'

const waitingDesktops = new Map()

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    })

    io.on('connection', (socket) => {
        console.log("Socket Connected Successfully!!!")

        socket.on('registerDesktop', () => {
            // Generate OTP
            const otp = generatePairingCode();
           
            // Storing OTP
            waitingDesktops.set(otp, socket)
             console.log("Waiting map size after adding:", waitingDesktops.size);
            console.log("Waiting map size when mobile tries:", waitingDesktops.size);

            // Send it to this Device only
            socket.emit('otp', { otp })

            // Save roomId on desktop socket too
            socket.roomId = otp;

            addDevice(socket.id, 'DESKTOP')
        })

        socket.on('registerMobile', ({ otp }) => {
        const desktopSocket = waitingDesktops.get(otp);

        if (!desktopSocket) {
            socket.emit('error', { message: 'Invalid Code' });
            return;
        }

        // 1. Force join rooms
        socket.join(otp);
        desktopSocket.join(otp);

        socket.roomId = otp;
        desktopSocket.roomId = otp;

        // 2. Pair them
        socket.emit('pairingSuccess', { message: 'Paired Successful' });
        desktopSocket.emit('pairingSuccess', { message: 'Paired Successful' });

    // 3. IMPORTANT: Tell the desktop specifically to send dimensions 
    // AND tell it exactly which socket ID to send them to.
        desktopSocket.emit('requestDimensions', { targetMobileId: socket.id });

        waitingDesktops.delete(otp);
    });
    // --- THE HANDSHAKE (Fixes the "Waiting" screen) ---
        socket.on('drawingScreenReady', () => {
            console.log(`📱 Mobile in room ${socket.roomId} is mounted and ready.`);
            // Send to the desktop in the same room
            socket.to(socket.roomId).emit('getCanvasDimensions');
        });

// 4. Update the dimensions listener to be more precise
            socket.on('canvasDimensions', (data) => {
                console.log(`📏 Canvas dimensions received: ${data.width}x${data.height}`);
                
                // Instead of io.to, send it specifically to the other person in the room
                // This bypasses many room-join latency issues.
                socket.to(socket.roomId).emit('canvasDimensions', data);
            });
            socket.on('draw', (data) => {
                socket.to(socket.roomId).emit('draw', data);
            })

            socket.on('disconnect', () => {
            waitingDesktops.forEach((desktopSocket, otp) => {
                if (desktopSocket === socket) waitingDesktops.delete(otp)
            })
            removeDevice(socket.id)
        })
    })
}

export default initializeSocket;