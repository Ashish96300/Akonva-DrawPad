import React from 'react';
import { View, Text } from 'react-native';
import { Canvas, Path } from "@shopify/react-native-skia";
import useDrawing from '../hooks/useDrawing';

const DrawingScreen = () => {
  const { isReady, paths, renderPath, handleTouch } = useDrawing();

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

        {renderPath && (
          <Path
            path={renderPath}       
            color="#00ffa3"
            style="stroke"
            strokeWidth={4}
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      </Canvas>

      <View className="absolute bottom-10 left-0 right-0 items-center pointer-events-none">
        <Text className="text-slate-700 text-[10px] tracking-widest uppercase">
          Skia Hardware Accelerated
        </Text>
      </View>
    </View>
  );
};

export default DrawingScreen;
