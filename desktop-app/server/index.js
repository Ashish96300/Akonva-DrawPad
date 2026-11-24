import http from 'http';
import { networkInterfaces } from 'os';
import app from './app.js';
import initializeSocket from './src/utils/socket.js';

let server = null;

export const getLanAddresses = () =>
  Object.values(networkInterfaces())
    .flat()
    .filter((n) => n && n.family === 'IPv4' && !n.internal)
    .map((n) => n.address);

/** Start the DrawPad server. Resolves with { port, addresses }. */
export const startServer = (port = Number(process.env.PORT) || 3000) =>
  new Promise((resolve, reject) => {
    if (server) return resolve({ port, addresses: getLanAddresses() });

    const s = http.createServer(app);
    initializeSocket(s);
    s.once('error', reject);
    s.listen(port, '0.0.0.0', () => {
      server = s;
      console.log(`🚀 DrawPad server listening on port ${port}`);
      getLanAddresses().forEach((ip) => console.log(`📱 Mobile connect to: ${ip}:${port}`));
      resolve({ port, addresses: getLanAddresses() });
    });
  });

export const stopServer = () =>
  new Promise((resolve) => {
    if (!server) return resolve();
    const s = server;
    server = null;
    s.close(() => resolve());
    s.closeAllConnections?.();
  });
