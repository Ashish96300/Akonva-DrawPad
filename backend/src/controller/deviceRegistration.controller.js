import { getAllDevices ,getStats} from "../services/deviceRegistration.service.js";

//HTTP: Get all devices
const getDevices = (req, res) => {
  try {
    const devices = getAllDevices();
    
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

export {getDevices ,getDeviceStats }
