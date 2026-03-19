import { useState } from 'react';
import { Alert } from 'react-native';
import socket from '../services/socket';

const usePairing = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePairing = () => {
    if (otp.length < 4) {
      Alert.alert('Invalid Code', 'Please enter the code shown on your laptop.');
      return;
    }

    setLoading(true);
    console.log("📤 Attempting to pair with OTP:", otp);
    socket.emit('registerMobile', { otp: otp.trim() });
  };

  return { otp, setOtp, loading, handlePairing };
};

export default usePairing;