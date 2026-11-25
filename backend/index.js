
import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import initializeSocket from './src/utils/socket.js'

dotenv.config({
  path: './.env'
});

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initializeSocket(server)


server.listen(PORT, "0.0.0.0",() => {
  console.log(`🚀 Akonva server listening on PORT ${PORT}`);
  console.log(`📡 HTTP: http://localhost:${PORT}`);
  // console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});
console.log("🔥 NEW SERVER INSTANCE STARTED");
