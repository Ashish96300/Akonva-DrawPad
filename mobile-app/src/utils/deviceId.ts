export const generateDeviceId = (): string => {
  const timestamp = Date.now().toString(36);    
  const random = Math.random().toString(36).substring(2, 11);  
  return `mobile_${timestamp}_${random}`;        
};