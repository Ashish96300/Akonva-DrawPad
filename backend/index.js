
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
  console.log(`🚀 Server listening on PORT ${PORT}`);
  console.log(`📡 HTTP: http://localhost:${PORT}`);
  // console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});
console.log("🔥 NEW SERVER INSTANCE STARTED");

// process.on('SIGTERM', () => {
//   console.log('SIGTERM signal received: closing HTTP server');
//   server.close(() => {
//     console.log('HTTP server closed');
//     process.exit(0);
//   });
// });

// process.on('SIGINT', () => {
//   console.log('SIGINT signal received: closing HTTP server');
//   server.close(() => {
//     console.log('HTTP server closed');
//     process.exit(0);
//   });
// });