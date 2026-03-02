const devices = new Map();
// const connections = new Map();

const addDevice = (deviceId, deviceType) => {
    devices.set(deviceId, {
        deviceId,
        deviceType,
        connectedAt: Date.now(),
        status: 'CONNECTED'
    })
}

const removeDevice = (deviceId) => {
    devices.delete(deviceId);
}


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

export { addDevice, removeDevice, getAllDevices, getStats }
