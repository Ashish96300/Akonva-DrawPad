import { mouse, Button } from '@nut-tree-fork/nut-js';

export const handleGesture = async ({ type, button, deltaY }) => {
    try {
        if (type === 'click') {
            const btn = button === 'right' ? Button.RIGHT
                      : button === 'middle' ? Button.MIDDLE
                      : Button.LEFT;
            await mouse.click(btn);

        } else if (type === 'doubleClick') {
            await mouse.doubleClick(Button.LEFT);

        } else if (type === 'scroll') {
            const scrollAmount = Math.round(Math.abs(deltaY) * 5);
            if (scrollAmount === 0) return;
            deltaY > 0
                ? await mouse.scrollDown(scrollAmount)
                : await mouse.scrollUp(scrollAmount);
        }
    } catch (err) {
        console.error('Gesture error:', err.message);
    }
};