
import { useCallback } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import socket from '../services/socket';

const MOVE_BATCH_INTERVAL_MS = 12;

const useMousepad = (sensitivity: number = 7) => {
  const prevX = useSharedValue(0);
  const prevY = useSharedValue(0);
  const pendingX = useSharedValue(0);
  const pendingY = useSharedValue(0);
  const lastEmitAt = useSharedValue(0);
  const sharedSensitivity = useSharedValue(sensitivity);
  sharedSensitivity.value = sensitivity;

  const emitMove = useCallback((deltaX: number, deltaY: number) => {
    if (deltaX || deltaY) socket.emit('draw', { type: 'move', deltaX, deltaY });
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
      pendingX.value = 0;
      pendingY.value = 0;
      lastEmitAt.value = Date.now();
    })
    // This callback executes later as a UI-thread worklet; runOnJS accesses JS refs only on dispatch.
    // eslint-disable-next-line react-hooks/refs
    .onUpdate((e) => {
      'worklet';
      const dx = (e.translationX - prevX.value) * sharedSensitivity.value;
      const dy = (e.translationY - prevY.value) * sharedSensitivity.value;
      prevX.value = e.translationX;
      prevY.value = e.translationY;
      // Throttle on the UI thread, but accumulate every sample so throttling
      // never throws away small movements (which made the cursor feel sticky).
      pendingX.value += dx;
      pendingY.value += dy;
      const now = Date.now();
      if (now - lastEmitAt.value >= MOVE_BATCH_INTERVAL_MS) {
        const batchX = pendingX.value;
        const batchY = pendingY.value;
        pendingX.value = 0;
        pendingY.value = 0;
        lastEmitAt.value = now;
        runOnJS(emitMove)(batchX, batchY);
      }
    })
    .onFinalize(() => {
      'worklet';
      if (pendingX.value || pendingY.value) {
        const batchX = pendingX.value;
        const batchY = pendingY.value;
        pendingX.value = 0;
        pendingY.value = 0;
        runOnJS(emitMove)(batchX, batchY);
      }
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

