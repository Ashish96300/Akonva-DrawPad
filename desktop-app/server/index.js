
import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import initializeSocket from './src/utils/socket.js'
import { networkInterfaces } from 'os';

dotenv.config({
  path: './.env'
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initializeSocket(server)


server.listen(PORT, "0.0.0.0",() => {
  console.log(`🚀 Server listening on PORT ${PORT}`);
  console.log(`📡 HTTP: http://localhost:${PORT}`);
});
console.log("🔥 NEW SERVER INSTANCE STARTED");

server.on('connection', (socket) => {
    console.log('🔌 Raw TCP connection from:', socket.remoteAddress);
});

const nets = networkInterfaces();
Object.values(nets).flat()
    .filter(n => n.family === 'IPv4' && !n.internal)
    .forEach(n => console.log('📱 Mobile connect to:', `http://${n.address}:3000`));
