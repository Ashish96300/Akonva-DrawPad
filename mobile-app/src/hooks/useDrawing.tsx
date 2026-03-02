
import { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions, GestureResponderEvent } from 'react-native';
import { Skia, SkPath } from "@shopify/react-native-skia";
import socket from '../services/socket';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const EMIT_THROTTLE_MS = 15;

const useDrawing = () => {
  const [laptopDims, setLaptopDims] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [paths, setPaths] = useState<SkPath[]>([]);

  // ✅ Ref for mutation (no re-renders on lineTo)
  const currentPathRef = useRef<SkPath | null>(null);
  // ✅ Separate state ONLY for passing to Skia <Path> prop
  const [renderPath, setRenderPath] = useState<SkPath | null>(null);

  const lastEmitRef = useRef<number>(0);
  const strokeIdRef = useRef<string>('');
  const pointBufferRef = useRef<{ x: number; y: number }[]>([]);

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

  const handleTouch = useCallback((eventType: 'start' | 'move' | 'end', e: GestureResponderEvent) => {
    if (!isReady) return;

    const { locationX, locationY } = e.nativeEvent;
    const scaleX = laptopDims.width / SCREEN_WIDTH;
    const scaleY = laptopDims.height / SCREEN_HEIGHT;
    const scaledX = locationX * scaleX;
    const scaledY = locationY * scaleY;

    if (eventType === 'start') {
      const newPath = Skia.Path.Make();
      newPath.moveTo(locationX, locationY);
      currentPathRef.current = newPath;

      // ✅ Give Skia a fresh copy to render
      setRenderPath(newPath.copy());

      strokeIdRef.current = `stroke_${Date.now()}`;
      pointBufferRef.current = [{ x: scaledX, y: scaledY }];

      socket.emit('draw', {
        type: 'start',
        strokeId: strokeIdRef.current,
        x: scaledX,
        y: scaledY,
        color: '#00ffa3',
        size: 4,
      });

    } else if (eventType === 'move' && currentPathRef.current) {
      // Mutate ref directly
      currentPathRef.current.lineTo(locationX, locationY);

      // ✅ Always give Skia a fresh copy — never the raw ref
      setRenderPath(currentPathRef.current.copy());

      pointBufferRef.current.push({ x: scaledX, y: scaledY });

      const now = Date.now();
      if (now - lastEmitRef.current > EMIT_THROTTLE_MS) {
        socket.emit('draw', {
          type: 'move',
          strokeId: strokeIdRef.current,
          points: [...pointBufferRef.current],
          color: '#00ffa3',
          size: 4,
        });
        pointBufferRef.current = [];
        lastEmitRef.current = now;
      }

    } else if (eventType === 'end' && currentPathRef.current) {
  // Flush remaining buffer
  if (pointBufferRef.current.length > 0) {
    socket.emit('draw', {
      type: 'move',
      strokeId: strokeIdRef.current,
      points: [...pointBufferRef.current],
      color: '#00ffa3',
      size: 4,
    });
    pointBufferRef.current = [];
  }

  // ✅ Capture BEFORE nulling the ref
  const completedPath = currentPathRef.current.copy();
  currentPathRef.current = null;
  setRenderPath(null);

  // ✅ Now safe — no longer touches the ref
  setPaths(prev => [...prev, completedPath]);

  socket.emit('draw', {
    type: 'end',
    strokeId: strokeIdRef.current,
  });
}
  }, [isReady, laptopDims]);

  return { isReady, paths, renderPath, handleTouch };
};

export default useDrawing;