
import { useRef, useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import socket from '../services/socket';

const EMIT_THROTTLE_MS = 10; 

const useMousepad = (sensitivity: number = 7) => {
  const lastEmitRef = useRef<number>(0);
  const prevX = useSharedValue(0);
  const prevY = useSharedValue(0);
  const sharedSensitivity = useSharedValue(sensitivity);
  sharedSensitivity.value = sensitivity;

  const emitMove = useCallback((deltaX: number, deltaY: number) => {
    const now = Date.now();
    if (now - lastEmitRef.current > EMIT_THROTTLE_MS) {
      socket.emit('draw', { type: 'move', deltaX, deltaY });
      lastEmitRef.current = now;
    }
  }, []);

  const emitGesture = useCallback((payload: object) => {
    socket.emit('gesture', payload);
  }, []);

  // ── 1. MOVEMENT ──
  const pan = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
      'worklet';
      prevX.value = 0;
      prevY.value = 0;
    })
    .onUpdate((e) => {
      'worklet';
      const dx = (e.translationX - prevX.value) * sharedSensitivity.value;
      const dy = (e.translationY - prevY.value) * sharedSensitivity.value;
      prevX.value = e.translationX;
      prevY.value = e.translationY;
      runOnJS(emitMove)(dx, dy);
    });

  // ── 2. SCROLLING (Two fingers) ──
  const twoFingerPan = Gesture.Pan()
    .minPointers(2)
    .maxPointers(2)
    .onUpdate((e) => {
      'worklet';
      runOnJS(emitGesture)({ type: 'scroll', deltaY: e.velocityY * 0.005 });
    });

  // ── 3. SWIPE (Three fingers) ──
  const threeFingerSwipe = Gesture.Pan()
    .minPointers(3)
    .maxPointers(3)
    .onEnd((e) => {
      'worklet';
      const direction = Math.abs(e.translationX) > Math.abs(e.translationY) 
        ? (e.translationX > 0 ? 'right' : 'left') 
        : (e.translationY > 0 ? 'down' : 'up');
      runOnJS(emitGesture)({ type: 'threeFingerSwipe', direction });
    });

  // ── 4. TAPS (The Click Logic) ──
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((_e, success) => {
      'worklet';
      if (success) runOnJS(emitGesture)({ type: 'doubleClick' });
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .maxDistance(15)
    .onEnd((_e, success) => {
      'worklet';
      if (success) runOnJS(emitGesture)({ type: 'click', button: 'left' });
    });

  const twoFingerTap = Gesture.Tap()
    .minPointers(2)
    .onEnd((_e, success) => {
      'worklet';
      if (success) runOnJS(emitGesture)({ type: 'click', button: 'right' });
    });
  const longPress = Gesture.LongPress()
    .minDuration(250) // Hold for 250ms to start drawing
    .onStart(() => {
      'worklet';
      runOnJS(emitGesture)({ type: 'dragStart' });
    })
    .onEnd(() => {
      'worklet';
      runOnJS(emitGesture)({ type: 'dragEnd' });
    });
  // ── 5. COMPOSITION (The Fix) ──
  
  // Taps need to be Exclusive: Single waits to see if Double happens.
  const tapGestures = Gesture.Exclusive(twoFingerTap, doubleTap, singleTap ,longPress);
  
  // Pans/Swipes can be Simultaneous so movement is instant.
  const panGestures = Gesture.Simultaneous(pan, twoFingerPan, threeFingerSwipe);

  // Combine both: Movement and Taps run in parallel.
  const composed = Gesture.Simultaneous(panGestures, tapGestures);

  return { composed };
};

export default useMousepad;

