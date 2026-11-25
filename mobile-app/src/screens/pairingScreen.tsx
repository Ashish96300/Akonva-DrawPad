
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import usePairing from '../hooks/usePairing';

const PairingScreen = () => {
  const { ipAddress, setIpAddress, otp, setOtp, loading, handlePairing } = usePairing();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-950"
    >
      <View className="flex-1 justify-center items-center px-6">
        
        {/* Header */}
        <View className="items-center mb-12">
          <Text className="text-4xl font-bold text-white">Akonva</Text>
          <Text className="text-slate-400 mt-2 text-center text-sm">
            Connect your phone to your laptop
          </Text>
        </View>

        {/* Input Fields */}
        <View className="w-full gap-4">
          
          {/* IP Address Input */}
          <View>
            <Text className="text-slate-400 text-xs mb-2 uppercase tracking-widest">
              Laptop IP Address
            </Text>
            <TextInput
              className="w-full bg-slate-800 text-white text-lg px-4 py-3 rounded-xl"
              placeholder="e.g. 192.168.1.5"
              placeholderTextColor="#475569"
              keyboardType="decimal-pad"
              value={ipAddress}
              onChangeText={setIpAddress}
              editable={!loading}
            />
            <Text className="text-slate-500 text-xs leading-5 mt-2">
              Find it on Windows: open Command Prompt or PowerShell, run{' '}
              <Text className="text-slate-300 font-semibold">ipconfig</Text>, then enter the{' '}
              <Text className="text-slate-300 font-semibold">IPv4 Address</Text> under your active Wi-Fi adapter.
              Do not use the Default Gateway.
            </Text>
          </View>

          {/* OTP Input */}
          <View>
            <Text className="text-slate-400 text-xs mb-2 uppercase tracking-widest">
              Pairing Code
            </Text>
            <TextInput
              className="w-full bg-slate-800 text-white text-center text-4xl tracking-widest px-4 py-3 rounded-xl"
              placeholder="0000"
              placeholderTextColor="#475569"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              editable={!loading}
            />
          </View>

          {/* Pair Button */}
          <TouchableOpacity
            onPress={handlePairing}
            disabled={loading}
            className={`w-full py-4 rounded-xl items-center mt-2 ${loading ? 'bg-slate-700' : 'bg-cyan-500'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold">Connect</Text>
            )}
          </TouchableOpacity>

        </View>

        {/* Footer */}
        <Text className="absolute bottom-10 text-slate-600 text-xs text-center px-6">
          Ensure both devices are on the same Wi-Fi network
        </Text>

      </View>
    </KeyboardAvoidingView>
  );
};

export default PairingScreen;
