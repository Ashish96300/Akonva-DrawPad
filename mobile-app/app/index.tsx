// app/index.tsx
import "./global.css"
import React, { useState, useEffect } from 'react';
import DrawingScreen from "../src/screens/drawingScreen";
import socket from '../src/services/socket';
import PairingScreen from '../src/screens/pairingScreen';
import { Platform } from 'react-native';

export default function Index() {
  const [isPaired, setIsPaired] = useState(false);
  const [skiaLoaded, setSkiaLoaded] = useState(false);

  useEffect(() => {
    const prepareSkia = async () => {
      if (Platform.OS === 'web') {
        
        const { LoadSkiaWeb } = await import("@shopify/react-native-skia/lib/module/web");
        try {
          await LoadSkiaWeb();
          console.log("🎨 Skia Web Loaded!");
        } catch (err) {
          console.error("Skia Web failed to load", err);
        }
      }
      setSkiaLoaded(true);
    };

    prepareSkia();

    socket.on('pairingSuccess', () => {
      console.log('🎉 Paired! Switching to DrawingScreen');
      setIsPaired(true);
    });

    return () => {
      socket.off('pairingSuccess');
    };
  }, []);

  if (!skiaLoaded) return null;

  return isPaired ? <DrawingScreen /> : <PairingScreen />;
}