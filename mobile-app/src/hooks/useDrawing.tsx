
import { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { Skia, SkPath } from "@shopify/react-native-skia";
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import socket from '../services/socket';

const EMIT_THROTTLE_MS = 20;

const useDrawing = () => {
  const [laptopDims, setLaptopDims] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 });
  const [isReady, setIsReady] = useState(false);
  const [paths, setPaths] = useState<SkPath[]>([]);
  const [renderPath, setRenderPath] = useState<SkPath | null>(null);

  const currentPathRef = useRef<SkPath | null>(null);
  const laptopDimsRef = useRef({ width: 0, height: 0, offsetX: 0, offsetY: 0 });
  const isReadyRef = useRef(false);
  const lastEmitRef = useRef<number>(0);

  useEffect(() => {
    socket.on('canvasDimensions', (data: any) => {
      if (data.width && data.height) {
        const dims = {
            width: data.width,
            height: data.height,
            offsetX: data.offsetX || 0,
            offsetY: data.offsetY || 0
        };
        setLaptopDims(dims);
        laptopDimsRef.current = dims;
        setIsReady(true);
        isReadyRef.current = true;
      }
    });
    socket.emit('drawingScreenReady');
    return () => { socket.off('canvasDimensions'); };
  }, []);

  // ── 1. ABSOLUTE WACOM MATH (Dynamic Scaling) ──
  const getLaptopCoords = useCallback((screenX: number, screenY: number) => {
    const { width: winW, height: winH } = Dimensions.get('window');
    const laptop = laptopDimsRef.current;

    if (laptop.width === 0 || laptop.height === 0) return { laptopX: 0, laptopY: 0 };

    // DYNAMIC SCALE: Stretch phone edges to perfectly fit laptop Safe Zone
    // winH (long edge) maps to laptop.width
    // winW (short edge) maps to laptop.height
    const scaleX = laptop.width / winH; 
    const scaleY = laptop.height / winW;

    // Landscape Rotation & Apply Dynamic Scale
    const targetX = screenY * scaleX;
    const targetY = (winW - screenX) * scaleY;

    // Add offsets to avoid toolbars
    return { 
      laptopX: Math.round(targetX + laptop.offsetX), 
      laptopY: Math.round(targetY + laptop.offsetY) 
    };
  }, []);

  const onStart = useCallback((x: number, y: number) => {
    if (!isReadyRef.current) return;
    
    // 1. Draw perfectly under finger on phone
    const newPath = Skia.Path.Make();
    newPath.moveTo(x, y);
    currentPathRef.current = newPath;
    setRenderPath(newPath.copy());

    // 2. Map to laptop and emit
    const { laptopX, laptopY } = getLaptopCoords(x, y);
    socket.emit('draw', { type: 'start', x: laptopX, y: laptopY });
  }, [getLaptopCoords]);

  const onMove = useCallback((x: number, y: number) => {
    if (!isReadyRef.current || !currentPathRef.current) return;
    
    // 1. Draw perfectly under finger on phone
    currentPathRef.current.lineTo(x, y);
    setRenderPath(currentPathRef.current.copy());

    // 2. Map to laptop and emit
    const { laptopX, laptopY } = getLaptopCoords(x, y);

    const now = Date.now();
    if (now - lastEmitRef.current > EMIT_THROTTLE_MS) {
      socket.emit('draw', { type: 'move', x: laptopX, y: laptopY, points: [{ x: laptopX, y: laptopY }] });
      lastEmitRef.current = now;
    }
  }, [getLaptopCoords]);

  const onEnd = useCallback(() => {
    const path = currentPathRef.current;
    if (!path) return;

    try {
      const copy = path.copy();
      setPaths(prev => [...prev, copy]);
    } catch (e) {
      console.log("⚠️ copy failed:", e);
    }

    currentPathRef.current = null;
    setRenderPath(null);
    socket.emit('draw', { type: 'end' });
  }, []);

  // ── 2. NEW GESTURE: 2-Finger Swipe = CLEAR/NEXT PAGE ──
  // Since you cover the whole screen now, panning the camera doesn't make sense.
  // Instead, a 2-finger swipe clears your phone and tells the laptop to scroll down!
  const swipeAction = Gesture.Pan()
    .minPointers(2).maxPointers(2)
    .onEnd((e) => {
        'worklet';
        // If they swipe left or up with 2 fingers, trigger "Next Page"
        if (e.translationX < -50 || e.translationY < -50) {
            runOnJS(turnToNextPage)();
        }
    });

  const stylusDraw = Gesture.Pan()
    .minPointers(1).maxPointers(1)
    .onStart((e) => { 'worklet'; runOnJS(onStart)(e.x, e.y); })
    .onUpdate((e) => { 'worklet'; runOnJS(onMove)(e.x, e.y); })
    .onEnd(() => { 'worklet'; runOnJS(onEnd)(); });

  const stylusGesture = Gesture.Simultaneous(stylusDraw, swipeAction);

  const clearCanvas = () => { setPaths([]); setRenderPath(null); };
  
  const turnToNextPage = () => {
    setPaths([]); 
    setRenderPath(null);
    // Remember to handle 'nextPage' in your backend nut-js code!
    socket.emit('draw', { type: 'nextPage' }); 
  };

  // Note: I removed scrollOffset and resetView since we don't need a camera anymore!
  return { isReady, paths, renderPath, stylusGesture, clearCanvas, turnToNextPage };
};

export default useDrawing;