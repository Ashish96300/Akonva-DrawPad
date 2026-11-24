
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
    if (otp.length < 4) {
      Alert.alert('Invalid Code', 'Please enter the code shown on your laptop.');
      return;
    }

    setLoading(true);

    try {
      console.log('1. Saving IP...');
      await SecureStore.setItemAsync(STORAGE_KEY, ipAddress.trim());

      console.log('2. Reconnecting to:', ipAddress.trim());
      reconnectWithIP(ipAddress.trim());

      console.log('3. Waiting for connection...');
      socket.once('connect', () => {
        console.log('4. Connected! Pairing with OTP:', otp);
        socket.emit('registerMobile', { otp: otp.trim() });
      });

      if (socket.connected) {
        console.log('4. Already connected, pairing with OTP:', otp);
        socket.emit('registerMobile', { otp: otp.trim() });
      }

      setTimeout(() => {
        if (!socket.connected) {
          setLoading(false);
          Alert.alert('Connection Timeout', 'Could not reach the server. Check your IP.');
        }
      }, 5000);

    } catch (err) {
      setLoading(false);
      console.error('Pairing error:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return { ipAddress, setIpAddress, otp, setOtp, loading, handlePairing };
};

export default usePairing;