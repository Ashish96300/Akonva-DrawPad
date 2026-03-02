import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text, GestureResponderEvent } from 'react-native';
import { Canvas, Path, Skia, SkPath } from "@shopify/react-native-skia";
import socket from '../services/socket';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DrawingScreen = () => {
  const [laptopDims, setLaptopDims] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
 
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [currentPath, setCurrentPath] = useState<SkPath | null>(null);

  useEffect(() => {
   
    socket.emit('drawingScreenReady');

    socket.on('canvasDimensions', (data: any) => {
      if (data.width && data.height) {
        setLaptopDims({ width: data.width, height: data.height });
        setIsReady(true);
      }
    });

    return () => {
      socket.off('canvasDimensions');
    };
  }, []);

  const handleTouch = (eventType: 'start' | 'move' | 'end', e: GestureResponderEvent) => {
    if (!isReady) return;

    const { locationX, locationY } = e.nativeEvent;

    // 1. Update Skia Visuals
    if (eventType === 'start') {
      const newPath = Skia.Path.Make();
      newPath.moveTo(locationX, locationY);
      setCurrentPath(newPath);
    } else if (eventType === 'move' && currentPath) {
      currentPath.lineTo(locationX, locationY);
      // We force a re-render by creating a shallow copy or using a state trick
      setCurrentPath(currentPath.copy());
    } else if (eventType === 'end' && currentPath) {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath(null);
    }

    // 2. Send Scaled Data to Laptop
    const scaleX = laptopDims.width / SCREEN_WIDTH;
    const scaleY = laptopDims.height / SCREEN_HEIGHT;

    socket.emit('draw', {
      type: eventType,
      x: locationX * scaleX,
      y: locationY * scaleY,
      color: '#00ffa3', // Neon green for better visibility
      size: 4,
    });
  };

  if (!isReady) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <Text className="text-cyan-400 font-bold">Initializing Skia Engine...</Text>
      </View>
    );
  }

  return (
    <View 
      className="flex-1 bg-slate-950"
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => handleTouch('start', e)}
      onResponderMove={(e) => handleTouch('move', e)}
      onResponderRelease={(e) => handleTouch('end', e)}
    >
      {/* Skia Canvas for High-Performance Drawing */}
      <Canvas style={{ flex: 1 }}>
        {paths.map((path, index) => (
          <Path
            key={index}
            path={path}
            color="#00ffa3"
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
          />
        ))}
        {currentPath && (
          <Path
            path={currentPath}
            color="#00ffa3"
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      </Canvas>

      {/* Info Overlay */}
      <View className="absolute bottom-10 left-0 right-0 items-center pointer-events-none">
        <Text className="text-slate-700 text-[10px] tracking-widest uppercase">
          Skia Hardware Accelerated
        </Text>
      </View>
    </View>
  );
};

export default DrawingScreen;