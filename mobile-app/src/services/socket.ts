

import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'AKONVA_SERVER_IP';

// Initialize with fallback URL immediately so socket is never null
const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://192.168.1.1:3000';

const socket: Socket = io(SERVER_URL, {
  autoConnect: false,
  transports: ['polling','websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Update URL from SecureStore then connect
SecureStore.getItemAsync(STORAGE_KEY).then((savedIP) => {
  if (savedIP) {
    const sanitizedUrl = savedIP.replace(/^https?:\/\//, '');
    const url = sanitizedUrl.includes(':') ? `http://${sanitizedUrl}` : `http://${sanitizedUrl}:3000`;
    console.log('🔌 Connecting to saved IP:', url);
    (socket.io as any).uri = url;
  }
  socket.connect();
});

socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
socket.on('disconnect', (reason) => console.log('❌ Socket disconnected:', reason));
socket.on('connect_error', (error) => console.error('❌ Connection error:', error.message));

export const reconnectWithIP = (ip: string) => {
  const sanitizedUrl = ip.replace(/^https?:\/\//, '');
  const url = sanitizedUrl.includes(':') ? `http://${sanitizedUrl}` : `http://${sanitizedUrl}:3000`;
  console.log('🔌 Reconnecting to:', url);
  socket.disconnect();
  (socket.io as any).uri = url;
  socket.connect();
};

export default socket;
