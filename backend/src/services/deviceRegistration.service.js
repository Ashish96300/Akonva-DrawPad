const devices = new Map();
const connections = new Map();

const registerDevice = (deviceId ,deviceType ,ws)=>{
    const device ={
        deviceId,
        deviceType,
        ws,
        connectedAt:Date.now(),
        status:'CONNECTED'
    }
    devices.set(deviceId ,device);
    connections.set(ws ,deviceId);

    console.log(`Device registered: ${deviceId} (${deviceType})`);

    return device;
};

//get device by deviceId
const getDeviceById = (deviceId) => {
  return devices.get(deviceId) || null;
};

//Get device by WebSocket connection
const getDeviceByConnection = (ws) => {
  const deviceId = connections.get(ws);
  return deviceId ? devices.get(deviceId) : null;
};

//remove device
const removeDevice = (deviceId) => {
  const device = devices.get(deviceId);
  
  if (device) {
    connections.delete(device.ws);
    devices.delete(deviceId);
    console.log(`Device removed: ${deviceId}`);
  }
  
  return device;
};

//Get all devices
const getAllDevices = () => {
  return Array.from(devices.values());
};

//get statistics
const getStats = () => {
  const allDevices = getAllDevices();
  
  return {
    total: allDevices.length,
    desktops: allDevices.filter(d => d.deviceType === 'DESKTOP').length,
    mobiles: allDevices.filter(d => d.deviceType === 'MOBILE').length
  };
};

export {registerDevice ,getDeviceById ,getDeviceByConnection ,removeDevice ,getAllDevices ,getStats}