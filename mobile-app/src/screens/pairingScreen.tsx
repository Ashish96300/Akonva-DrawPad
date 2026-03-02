
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import socket from '../services/socket'; 

const PairingScreen = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePairing = () => {
    if (otp.length < 4) { 
      Alert.alert('Invalid Code', 'Please enter the code shown on your laptop.');
      return;
    }

    setLoading(true);
    console.log("📤 Attempting to pair with OTP:", otp);

    // Send the pairing request
    socket.emit('registerMobile', { otp: otp.trim() });

  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <View className="items-center mb-10">
        <Text className="text-3xl font-bold text-slate-800">Connect Device</Text>
        <Text className="text-slate-500 mt-2 text-center">
          Enter the code displayed on your laptop screen to start drawing.
        </Text>
      </View>

      <View className="w-full space-y-6">
        <TextInput
          className="w-full border-b-2 border-slate-300 text-center text-4xl tracking-widest py-2 text-slate-800 focus:border-blue-500"
          placeholder="0000"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          editable={!loading}
        />

        <TouchableOpacity 
          onPress={handlePairing}
          disabled={loading}
          className={`w-full py-4 rounded-xl items-center ${loading ? 'bg-slate-400' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-semibold">Pair Now</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text className="absolute bottom-10 text-slate-400 text-sm">
        Ensure both devices are on the same Wi-Fi
      </Text>
    </View>
  );
};

export default PairingScreen;

