
import http from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import app from './app.js';
import { handleWebSocketConnection } from './src/routes/websocket.routes.js';

dotenv.config({
  path: './.env'
});

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', handleWebSocketConnection);

server.listen(PORT, () => {
  console.log(`🚀 Server listening on PORT ${PORT}`);
  console.log(`📡 HTTP: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});