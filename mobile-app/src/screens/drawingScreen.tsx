
import React from 'react';
import { View, Text } from 'react-native';
import { Canvas, Path ,Group} from "@shopify/react-native-skia";
import { GestureDetector ,GestureHandlerRootView ,TouchableOpacity} from 'react-native-gesture-handler';
import useDrawing from '../hooks/useDrawing';
import useMousepad from '../hooks/useMousepad';

const DrawingScreen = ({ mode = 'mousepad', sensitivity = 1.5 }: {
  mode?: 'mousepad' | 'stylus';
  sensitivity?: number;
}) => {
  // const { isReady, paths, renderPath, handleTouch } = useDrawing();
   const { isReady, paths, renderPath, stylusGesture, clearCanvas ,turnToNextPage } = useDrawing();

  const { composed } = useMousepad(sensitivity);

  if (!isReady) {
    return (
      <View className="flex-1 bg-slate-950 justify-center items-center">
        <Text className="text-cyan-400 font-bold">Initializing Skia Engine...</Text>
      </View>
    );
  }
if (mode === 'stylus') {
  return (
    <GestureHandlerRootView className="flex-1">
      <GestureDetector gesture={stylusGesture}>
        {/* Make sure the parent View has flex-1 too! */}
        <View className="flex-1 bg-slate-950">
          
          <Canvas style={{ flex: 1 }} pointerEvents="none">
            {paths.map((path, index) => (
              <Path key={index} path={path} color="#00ffa3" style="stroke" strokeWidth={4} strokeCap="round" strokeJoin="round" />
            ))}
            {renderPath && (
              <Path path={renderPath} color="#00ffa3" style="stroke" strokeWidth={4} strokeCap="round" strokeJoin="round" />
            )}
          </Canvas>

          {/* UI BUTTONS */}
          <View className="absolute top-8 right-8 flex-row items-center">
            <TouchableOpacity onPress={clearCanvas} className="bg-red-900/80 px-4 py-3 rounded-xl mr-3 border border-red-500/30 shadow-lg shadow-black/50">
              <Text className="text-white text-xs font-bold tracking-wider">CLEAR PAGE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={turnToNextPage} className="bg-emerald-600/90 px-6 py-3 rounded-xl border border-emerald-400/50">
              <Text className="text-white text-xs font-extrabold tracking-widest">NEXT PAGE ⬇️</Text>
            </TouchableOpacity>
          </View>

        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
 // ── Mousepad mode: use RNGH gestures ──
return (
    <GestureDetector gesture={composed}>
      <View 
        className="flex-1 bg-slate-900 justify-center items-center"
      >
        <Text className="text-slate-600 text-xs tracking-widest uppercase">
          🖱️ Mouse Pad
        </Text>
        <Text className="text-slate-700 text-[10px] mt-2">
          1 finger = move • 2 finger = scroll • tap = click
        </Text>
        <Text className="text-slate-700 text-[10px]">
          2 finger tap = right click • 3 finger tap = middle click
        </Text>
      </View>
    </GestureDetector>
);
};

export default DrawingScreen;

