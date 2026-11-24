
import { mouse, Point, Button } from '@nut-tree-fork/nut-js';
import { processDelta, resetSmoothing } from '../utils/smoothing.js';

// Track button state per room so one device can't release another's button
const mouseDownRooms = new Set();

export const handleDraw = async (data, roomId, mode) => {
    try {
        if (mode === 'stylus') {
            
            // 1. Map coordinates (ensure these are rounded)
            const targetX = Math.round(data.x);
            const targetY = Math.round(data.y);

            // ── STYLUS START ──
            if (data.type === 'start') {
                if (!mouseDownRooms.has(roomId)) {
                    resetSmoothing(roomId);
                    await mouse.setPosition(new Point(targetX, targetY));
                    await mouse.pressButton(Button.LEFT);
                    mouseDownRooms.add(roomId);
                }
            } 
            
            // ── STYLUS MOVE (High Speed) ──
            else if (data.type === 'move') {
                // If we missed a 'start' packet, force the pen down
                if (!mouseDownRooms.has(roomId)) {
                    await mouse.pressButton(Button.LEFT);
                    mouseDownRooms.add(roomId);
                }

                // OPTIMIZATION: Take the last point in the buffer to avoid 'await' lag
                const p = (data.points && data.points.length > 0) 
                          ? data.points[data.points.length - 1] 
                          : { x: targetX, y: targetY };

                // We don't 'await' here so the socket can keep up with your hand
                mouse.setPosition(new Point(Math.round(p.x), Math.round(p.y)));
            } 
            
            // ── STYLUS END ──
            else if (data.type === 'end') {
                if (mouseDownRooms.has(roomId)) {
                    mouseDownRooms.delete(roomId);
                    await mouse.releaseButton(Button.LEFT);
                    resetSmoothing(roomId);
                }
            }
        } 
        else {
            // ── MOUSEPAD MODE (Relative) ──
            if (data.type === 'start') {
                resetSmoothing(roomId);
            } else if (data.type === 'move') {
                if (data.deltaX !== undefined && data.deltaY !== undefined) {
                    const { moveX, moveY } = processDelta(roomId, data.deltaX, data.deltaY);
                    if (moveX !== 0 || moveY !== 0) {
                        const current = await mouse.getPosition();
                        // Mousepad still uses await because it's relative
                        await mouse.setPosition(new Point(
                            current.x + moveX,
                            current.y + moveY
                        ));
                    }
                }
            } else if (data.type === 'end') {
                resetSmoothing(roomId);
            }
        }
    } catch (err) {
        console.error('Draw error:', err.message);
    }
};

export const releaseMouseIfDown = (roomId) => {
    if (mouseDownRooms.has(roomId)) {
        mouseDownRooms.delete(roomId);
        mouse.releaseButton(Button.LEFT).catch(() => {});
    }
};