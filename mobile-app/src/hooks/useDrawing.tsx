
import { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { Skia, SkPath } from "@shopify/react-native-skia";
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import socket from '../services/socket';

const EMIT_THROTTLE_MS = 12;

const useDrawing = () => {
  const [laptopDims, setLaptopDims] = useState({ width: 0, height: 0 });
  const [isReady, setIsReady] = useState(false);
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [renderPath, setRenderPath] = useState<SkPath | null>(null);

  const currentPathRef = useRef<SkPath | null>(null);
  const laptopDimsRef = useRef({ width: 0, height: 0 });
  const isReadyRef = useRef(false);
  const lastEmitRef = useRef<number>(0);

  useEffect(() => {
    socket.on('canvasDimensions', (data: any) => {
      if (data.width && data.height) {
        setLaptopDims({ width: data.width, height: data.height });
        laptopDimsRef.current = { width: data.width, height: data.height };
        setIsReady(true);
        isReadyRef.current = true;
      }
    });
    socket.emit('drawingScreenReady');
    return () => { socket.off('canvasDimensions'); };
  }, []);

  // ── THE NORMALIZATION ENGINE ──
const STYLUS_SCALE = 0.4; 

const getMappedCoords = useCallback((phoneX: number, phoneY: number) => {
    const { width: winW, height: winH } = Dimensions.get('window');
    const laptop = laptopDimsRef.current;

    if (laptop.width === 0) return { x: 0, y: 0 };

    const scale = (laptop.width / winH) * STYLUS_SCALE;

    let targetX = phoneY * scale;
    let targetY = (winW - phoneX) * scale;

    const offsetX = (laptop.width - (winH * scale)) / 2;
    const offsetY = (laptop.height - (winW * scale)) / 2;

    return {
      x: Math.round(targetX + offsetX),
      y: Math.round(targetY + offsetY)
    };
}, []);

  const onStart = useCallback((x: number, y: number) => {
    if (!isReadyRef.current) return;
    
    const { x: tx, y: ty } = getMappedCoords(x, y);

    const newPath = Skia.Path.Make();
    newPath.moveTo(x, y);
    currentPathRef.current = newPath;
    setRenderPath(newPath.copy());

    socket.emit('draw', { type: 'start', x: tx, y: ty });
  }, [getMappedCoords]);

  const onMove = useCallback((x: number, y: number) => {
    if (!isReadyRef.current || !currentPathRef.current) return;
    
    const { x: tx, y: ty } = getMappedCoords(x, y);

    currentPathRef.current.lineTo(x, y);
    setRenderPath(currentPathRef.current.copy());

    const now = Date.now();
    if (now - lastEmitRef.current > EMIT_THROTTLE_MS) {
      socket.emit('draw', {
        type: 'move',
        x: tx,
        y: ty,
        points: [{ x: tx, y: ty }]
      });
      lastEmitRef.current = now;
    }
  }, [getMappedCoords]);

  const onEnd = useCallback(() => {
    if (!currentPathRef.current) return;
    try {
      const completedPath = currentPathRef.current.copy();
      setPaths(prev => [...prev, completedPath]);
    } catch (e) {}
    
    currentPathRef.current = null;
    setRenderPath(null);
    socket.emit('draw', { type: 'end' });
  }, []);

  const stylusGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart((e) => { 
      'worklet';
      runOnJS(onStart)(e.x, e.y);
    })
    .onUpdate((e) => {
      'worklet';
      runOnJS(onMove)(e.x, e.y);
    })
    .onEnd(() => {
      'worklet';
      runOnJS(onEnd)();
    });

  const clearCanvas = () => {
    setPaths([]);
    setRenderPath(null);
  };

  return { isReady, paths, renderPath, stylusGesture, clearCanvas };
};

export default useDrawing;