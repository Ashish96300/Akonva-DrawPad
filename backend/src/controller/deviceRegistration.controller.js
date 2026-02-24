import { getAllDevices ,getStats} from "../services/deviceRegistration.service.js";

// const handleRegistration = (ws, message) => {
//   const { type, deviceId } = message;

//   if (!deviceId || typeof deviceId !== 'string') {
//     ws.send(JSON.stringify({
//       type: MESSAGE_TYPES.ERROR,
//       message: 'Invalid deviceId'
//     }));
//     return;
//   }

//   let deviceType;
  
//   if (type === MESSAGE_TYPES.REGISTER_DESKTOP) {
//     deviceType = DEVICE_TYPES.DESKTOP;
//   } else if (type === MESSAGE_TYPES.REGISTER_MOBILE) {
//     deviceType = DEVICE_TYPES.MOBILE;
//   } else {
//     ws.send(JSON.stringify({
//       type: MESSAGE_TYPES.ERROR,
//       message: 'Invalid registration type'
//     }));
//     return;
//   }

//   const device = registerDevice(deviceId, deviceType, ws);

//   ws.send(JSON.stringify({
//     type: MESSAGE_TYPES.REGISTRATION_SUCCESS,
//     message: `${deviceType} registered successfully`,
//     deviceId: device.deviceId
//   }));
// };

//HTTP: Get all devices
const getDevices = (req, res) => {
  try {
    const devices = getAllDevices();
    
    // Don't send WebSocket objects in response
    const sanitizedDevices = devices.map(d => ({
      deviceId: d.deviceId,
      deviceType: d.deviceType,
      connectedAt: d.connectedAt,
      status: d.status
    }));
    
    res.json({
      success: true,
      data: sanitizedDevices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

//HTTP: Get device statistics
const getDeviceStats = (req, res) => {
  try {
    const stats = getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

 //WebSocket: Handle disconnection
// const handleDisconnection = (ws) => {
//   const device = getDeviceByConnection(ws);
  
//   if (device) {
//     console.log(`Device disconnecting: ${device.deviceId}`);
//     deviceService.removeDevice(device.deviceId); /* <-- Doubt Here Bug: deviceService not imported */
//   }
// };

export {getDevices ,getDeviceStats }