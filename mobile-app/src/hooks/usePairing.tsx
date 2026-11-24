
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import socket, { reconnectWithIP } from '../services/socket';

const STORAGE_KEY = 'AKONVA_SERVER_IP';

const usePairing = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSavedIP() {
      const savedIP = await SecureStore.getItemAsync(STORAGE_KEY);
      if (savedIP) setIpAddress(savedIP);
    }
    loadSavedIP();
  }, []);

  const handlePairing = async () => {
    if (!ipAddress.trim()) {
      Alert.alert('Missing Field', 'Please enter your laptop IP address.');
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      Alert.alert('Invalid Code', 'Please enter the code shown on your laptop.');
      return;
    }

    setLoading(true);
    let settled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const cleanup = () => {
      clearTimeout(timeout);
      socket.off('connect', handleConnect);
      socket.off('pairingSuccess', handlePairingSuccess);
      socket.off('error', handlePairingError);
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      setLoading(false);
    };
    const handlePairingSuccess = () => finish();
    const handlePairingError = ({ message }: { message?: string } = {}) => {
      finish();
      Alert.alert('Could not pair', message || 'Check the pairing code and try again.');
    };
    const handleConnect = () => {
      if (settled) return;
      socket.emit('registerMobile', { otp: otp.trim() });
    };

    try {
      console.log('1. Saving IP...');
      await SecureStore.setItemAsync(STORAGE_KEY, ipAddress.trim());

      // Listen before reconnecting so a fast connection cannot be missed.
      socket.on('connect', handleConnect);
      socket.once('pairingSuccess', handlePairingSuccess);
      socket.once('error', handlePairingError);
      console.log('2. Reconnecting to:', ipAddress.trim());
      reconnectWithIP(ipAddress.trim());

      if (socket.connected) {
        handleConnect();
      }

      timeout = setTimeout(() => {
        if (settled) return;
        const wasConnected = socket.connected;
        finish();
        Alert.alert(
          wasConnected ? 'Pairing timed out' : 'Connection timed out',
          wasConnected
            ? 'The server did not accept the code. Check that it matches the current code on your laptop.'
            : 'Could not reach the server. Check the laptop IP and make sure both devices are on the same Wi-Fi.'
        );
      }, 10000);

    } catch (err) {
      finish();
      console.error('Pairing error:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return { ipAddress, setIpAddress, otp, setOtp, loading, handlePairing };
};

export default usePairing;
