
const roomSmoothing = new Map();

const createSmoothingState = () => ({
    velocityX: 0,
    velocityY: 0,
    residualX: 0,
    residualY: 0,
    lastTime: 0,
});

export const getRoomSmoothing = (roomId) => {
    if (!roomSmoothing.has(roomId)) {
        roomSmoothing.set(roomId, createSmoothingState());
    }
    return roomSmoothing.get(roomId);
};

export const resetSmoothing = (roomId) => {
    roomSmoothing.set(roomId, createSmoothingState());
};

export const deleteSmoothing = (roomId) => {
    roomSmoothing.delete(roomId);
};

export const processDelta = (roomId, rawDx, rawDy) => {
    const state = getRoomSmoothing(roomId);
    const now = Date.now();
    
    state.lastTime = now;

    // A lower blend factor filters small touch jitter without making the cursor feel heavy.
    const SMOOTH = 0.2;
    state.velocityX = state.velocityX * (1 - SMOOTH) + rawDx * SMOOTH;
    state.velocityY = state.velocityY * (1 - SMOOTH) + rawDy * SMOOTH;

    const speed = Math.sqrt(state.velocityX ** 2 + state.velocityY ** 2);
    
    const BASE_SENSITIVITY = 1.2;
    const CURVE_FACTOR = 0.02;
    const ACCELERATION = BASE_SENSITIVITY + (speed * CURVE_FACTOR);

    const smoothedDx = state.velocityX * ACCELERATION;
    const smoothedDy = state.velocityY * ACCELERATION;

    state.residualX += smoothedDx;
    state.residualY += smoothedDy;

    const moveX = Math.trunc(state.residualX);
    const moveY = Math.trunc(state.residualY);

    state.residualX -= moveX;
    state.residualY -= moveY;

    return { moveX, moveY };
};
