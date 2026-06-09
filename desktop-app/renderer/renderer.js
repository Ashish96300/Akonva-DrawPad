// const SERVER_URL = 'http://localhost:3000';

// const statusEl = document.getElementById('status');
// const spinnerEl = document.getElementById('spinner');
// const otpEl = document.getElementById('otp');
// const otpHintEl = document.getElementById('otp-hint');
// const pairedContainer = document.getElementById('paired-container');
// const modeSwitcher = document.getElementById('mode-switcher'); // ✅ new

// const socket = io(SERVER_URL, {
//     transports: ['websocket'],
//     reconnection: true,
//     reconnectionDelay: 1000,
//     reconnectionAttempts: 10,
// });

// // --- State helpers ---
// const setStatus = (text, type) => {
//     statusEl.textContent = text;
//     statusEl.className = `status-${type}`;
// };

// const showSpinner = () => spinnerEl.style.display = 'block';
// const hideSpinner = () => spinnerEl.style.display = 'none';

// const showOTP = (otp) => {
//     otpEl.textContent = otp;
//     otpEl.style.display = 'block';
//     otpHintEl.style.display = 'block';
// };

// const showPaired = () => {
//     otpEl.style.display = 'none';
//     otpHintEl.style.display = 'none';
//     pairedContainer.style.display = 'flex';
// };

// // ✅ Mode switcher logic
// const setMode = (mode) => {
//     document.getElementById('btn-mousepad').classList.toggle('active', mode === 'mousepad');
//     document.getElementById('btn-stylus').classList.toggle('active', mode === 'stylus');
//     socket.emit('setMode', { mode });
//     console.log('Mode switched to:', mode);
// };

// // ✅ Expose to HTML onclick buttons
// window.setMode = setMode;

// // --- Socket events ---
// socket.on('connect', () => {
//     setStatus('Connected', 'connected');
//     hideSpinner();
//     socket.emit('registerDesktop');
// });

// socket.on('otp', ({ otp }) => {
//     setStatus('Waiting for phone...', 'connected');
//     showOTP(otp);
// });

// socket.on('getCanvasDimensions', () => {
//     console.log('📐 Server asked for dimensions, resending...');
//     socket.emit('canvasDimensions', {
//         width: window.screen.width,
//         height: window.screen.height
//     });
// });

// socket.on('pairingSuccess', () => {
//     setStatus('Paired ✓', 'paired');
//     showPaired();

//     // ✅ Show mode switcher and set default mode
//     modeSwitcher.style.display = 'flex';
//     setMode('mousepad');

//     socket.emit('canvasDimensions', {
//         width: window.screen.width,
//         height: window.screen.height
//     });
// });

// socket.on('partnerDisconnected', () => {
//     setStatus('Phone disconnected', 'error');
//     pairedContainer.style.display = 'none';
//     modeSwitcher.style.display = 'none'; // ✅ hide on disconnect
//     showSpinner();
//     setTimeout(() => socket.emit('registerDesktop'), 1000);
// });

// socket.on('disconnect', () => {
//     setStatus('Reconnecting...', 'connecting');
//     showSpinner();
//     otpEl.style.display = 'none';
//     otpHintEl.style.display = 'none';
//     pairedContainer.style.display = 'none';
//     modeSwitcher.style.display = 'none'; // ✅ hide on disconnect
// });

// socket.on('connect_error', (err) => {
//     console.error('Connection error:', err.message);
//     setStatus('Server unreachable', 'error');
// });

const SERVER_URL = 'http://localhost:3000';

const statusEl = document.getElementById('status');
const spinnerEl = document.getElementById('spinner');
const otpEl = document.getElementById('otp');
const otpHintEl = document.getElementById('otp-hint');
const pairedContainer = document.getElementById('paired-container');
const modeSwitcher = document.getElementById('mode-switcher');

const socket = io(SERVER_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
});

// ✅ 1. Track current mode and define OneNote/Paint toolbars
let currentMode = 'mousepad';

const STYLUS_SAFE_ZONE = {
    offsetX: 0,   // Left sidebar width (0 if none)
    offsetY: 150  // Top ribbon/menu height (e.g., OneNote's top bar)
};

// ✅ 2. Smart Dimension Emitter
const emitCurrentDimensions = () => {
    if (currentMode === 'stylus') {
        console.log('📐 Sending STYLUS Canvas Dimensions (Skipping Toolbars)');
        socket.emit('canvasDimensions', {
            // Send only the remaining drawing area
            width: window.screen.width - STYLUS_SAFE_ZONE.offsetX,
            height: window.screen.height - STYLUS_SAFE_ZONE.offsetY,
            // Send the offsets so the phone knows where to jump
            offsetX: STYLUS_SAFE_ZONE.offsetX,
            offsetY: STYLUS_SAFE_ZONE.offsetY
        });
    } else {
        console.log('🖥️ Sending FULL MOUSEPAD Dimensions');
        socket.emit('canvasDimensions', {
            width: window.screen.width,
            height: window.screen.height,
            offsetX: 0,
            offsetY: 0
        });
    }
};

// --- State helpers ---
const setStatus = (text, type) => {
    statusEl.textContent = text;
    statusEl.className = `status-${type}`;
};

const showSpinner = () => spinnerEl.style.display = 'block';
const hideSpinner = () => spinnerEl.style.display = 'none';

const showOTP = (otp) => {
    otpEl.textContent = otp;
    otpEl.style.display = 'block';
    otpHintEl.style.display = 'block';
};

const showPaired = () => {
    otpEl.style.display = 'none';
    otpHintEl.style.display = 'none';
    pairedContainer.style.display = 'flex';
};

// ✅ 3. Update setMode to trigger new dimensions
const setMode = (mode) => {
    currentMode = mode; // Save state
    document.getElementById('btn-mousepad').classList.toggle('active', mode === 'mousepad');
    document.getElementById('btn-stylus').classList.toggle('active', mode === 'stylus');
    
    socket.emit('setMode', { mode });
    console.log('Mode switched to:', mode);
    
    // Tell the phone the dimensions changed because the mode changed!
    emitCurrentDimensions();
};

window.setMode = setMode;

// --- Socket events ---
socket.on('connect', () => {
    setStatus('Connected', 'connected');
    hideSpinner();
    socket.emit('registerDesktop');
});

socket.on('otp', ({ otp }) => {
    setStatus('Waiting for phone...', 'connected');
    showOTP(otp);
});

// ✅ 4. Use the smart emitter when asked
socket.on('getCanvasDimensions', () => {
    emitCurrentDimensions();
});

socket.on('pairingSuccess', () => {
    setStatus('Paired ✓', 'paired');
    showPaired();

    modeSwitcher.style.display = 'flex';
    setMode('mousepad'); // This will automatically call emitCurrentDimensions
});

socket.on('partnerDisconnected', () => {
    setStatus('Phone disconnected', 'error');
    pairedContainer.style.display = 'none';
    modeSwitcher.style.display = 'none';
    showSpinner();
    setTimeout(() => socket.emit('registerDesktop'), 1000);
});

socket.on('disconnect', () => {
    setStatus('Reconnecting...', 'connecting');
    showSpinner();
    otpEl.style.display = 'none';
    otpHintEl.style.display = 'none';
    pairedContainer.style.display = 'none';
    modeSwitcher.style.display = 'none';
});