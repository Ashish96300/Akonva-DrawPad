// // app/index.tsx
// import "./global.css"
// import React, { useState, useEffect } from 'react';
// import DrawingScreen from "../src/screens/drawingScreen";
// import socket from '../src/services/socket';
// import PairingScreen from '../src/screens/pairingScreen';
// import { Platform } from 'react-native';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// export default function Index() {
//   const [isPaired, setIsPaired] = useState(false);
//   const [skiaLoaded, setSkiaLoaded] = useState(false);
//   const [mode, setMode] = useState<'mousepad' | 'stylus'>('mousepad');
//   const [sensitivity, setSensitivity] = useState(1.5);
//   useEffect(() => {
//     socket.on('modeChanged', ({ mode }: any) => setMode(mode));
//     socket.on('sensitivityChanged', ({ value }: any) => setSensitivity(value));
//     const prepareSkia = async () => {
//       if (Platform.OS === 'web') {
//         const { LoadSkiaWeb } = await import("@shopify/react-native-skia/lib/module/web");
//         try {
//           await LoadSkiaWeb();
//           console.log("🎨 Skia Web Loaded!");
//         } catch (err) {
//           console.error("Skia Web failed to load", err);
//         }
//       }
//       setSkiaLoaded(true);
//     };

//     prepareSkia();

//     socket.on('pairingSuccess', () => {
//       console.log('🎉 Paired! Switching to DrawingScreen');
//       setIsPaired(true);
//     });

//     // ADD THIS
//     socket.on('partnerDisconnected', ({ message }) => {
//       console.log('Desktop disconnected:', message);
//       setIsPaired(false);  // goes back to PairingScreen automatically
//     });

//     // return () => {
//     //   socket.off('pairingSuccess');
//     //   socket.off('partnerDisconnected');  // ADD THIS
//     // };
//      return () => {
//     socket.off('modeChanged');
//     socket.off('sensitivityChanged');
//     socket.off('pairingSuccess');
//   };
//   }, []);
  
//   if (!skiaLoaded) return null;

//     return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       {isPaired ? <DrawingScreen mode={mode} sensitivity={sensitivity} /> : <PairingScreen />}
//     </GestureHandlerRootView>
//   );
// }

import "./global.css"
import React, { useState, useEffect } from 'react';
import DrawingScreen from "../src/screens/drawingScreen";
import socket from '../src/services/socket';
import PairingScreen from '../src/screens/pairingScreen';
import { Platform } from 'react-native';

export default function Index() {
  const [isPaired, setIsPaired] = useState(false);
  const [skiaLoaded, setSkiaLoaded] = useState(false);
  const [mode, setMode] = useState<'mousepad' | 'stylus'>('mousepad');
  const [sensitivity, setSensitivity] = useState(1.5);

  useEffect(() => {
    socket.on('modeChanged', ({ mode }: any) => setMode(mode));
    socket.on('sensitivityChanged', ({ value }: any) => setSensitivity(value));

    const prepareSkia = async () => {
      if (Platform.OS === 'web') {
        const { LoadSkiaWeb } = await import("@shopify/react-native-skia/lib/module/web");
        try {
          await LoadSkiaWeb();
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

    socket.on('partnerDisconnected', ({ message }: any) => {
      console.log('Desktop disconnected:', message);
      setIsPaired(false);
    });

    return () => {
      socket.off('modeChanged');
      socket.off('sensitivityChanged');
      socket.off('pairingSuccess');
      socket.off('partnerDisconnected');
    };
  }, []);

  if (!skiaLoaded) return null;

  return isPaired 
    ? <DrawingScreen mode={mode} sensitivity={sensitivity} /> 
    : <PairingScreen />;
}