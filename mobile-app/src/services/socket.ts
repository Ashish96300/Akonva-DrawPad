
import io from 'socket.io-client';

console.log('🔌 Connecting to:', process.env.EXPO_PUBLIC_SERVER_URL);
const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL!;

const socket = io(SERVER_URL, {
  autoConnect: true,  
  transports: ['polling','websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

// Connection events
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
});

export default socket;