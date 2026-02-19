import { registerDevice } from "../services/deviceRegistration.service.js";
import { MESSAGE_TYPES ,DEVICE_TYPES } from "../configs/constants.js";

const handleRegistration = (ws, message) => {
  const { type, deviceId } = message;

  if (!deviceId || typeof deviceId !== 'string') {
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.ERROR,
      message: 'Invalid deviceId'
    }));
    return;
  }

  let deviceType;
  
  if (type === MESSAGE_TYPES.REGISTER_DESKTOP) {
    deviceType = DEVICE_TYPES.DESKTOP;
  } else if (type === MESSAGE_TYPES.REGISTER_MOBILE) {
    deviceType = DEVICE_TYPES.MOBILE;
  } else {
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.ERROR,
      message: 'Invalid registration type'
    }));
    return;
  }

  const device = registerDevice(deviceId, deviceType, ws);

  ws.send(JSON.stringify({
    type: MESSAGE_TYPES.REGISTRATION_SUCCESS,
    message: `${deviceType} registered successfully`,
    deviceId: device.deviceId
  }));
};

export {handleRegistration}