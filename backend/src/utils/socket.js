import { Server } from "socket.io";
import generatePairingCode from "./pairingLogic"

const waitingDesktops = new Map()

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173"
        }
    })

    io.on('connection', (socket) => {
        console.log("Socket Connected Successfully!!!")

        socket.on('registerDesktop', () => {
            // Generate OTP
            const otp = generatePairingCode();

            // Storing OTP
             waitingDesktops.set(otp, socket)
            
             // Send it to this Device only
            socket.emit('otp', { otp })
        })

        socket.on('registerMobile', ({otp}) => {
            // Verifying OTP
            const desktopSocket = waitingDesktops.get(otp)

            if(!desktopSocket){
                socket.emit('error', { message: 'Invalid Code' })
                return
            }
            
            // Join Room 
            socket.join(otp)
            desktopSocket.join(otp)

            // Pairing Successful
            socket.emit('pairingSuccess', {message: 'Paired Successful'})
            desktopSocket.emit('pairingSuccess', {message: 'Paired Successful'})

            // Saving OTP for later uses
            socket.roomId = otp;

            // Delete OTP used up, remove it so nobody else can use it
            waitingDesktops.delete(otp)
        })

        socket.on('draw', (data) => {
            socket.to(socket.roomId).emit('draw', data);
        })

        socket.on('disconnect', () => {
            waitingDesktops.forEach((desktopSocket, otp) => {
                if(desktopSocket === socket) waitingDesktops.delete(otp)
            })
        })
    })
}

export default initializeSocket;