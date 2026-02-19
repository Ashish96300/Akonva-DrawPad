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


export {registerDevice}