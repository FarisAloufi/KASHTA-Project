
const SAUDI_BOUNDS = {
  minLat: 16.5,  
  maxLat: 31.5, 
  minLng: 35.0,  
  maxLng: 55.0   
};

/**
 * يتحقق إذا كانت النقطة (lat, lng) تقع داخل حدود السعودية
 * @param {number} lat 
 * @param {number} lng 
 * @returns {boolean}
 */
export const isLocationAllowed = (lat, lng) => {
  

  const isInside = (
    lat >= SAUDI_BOUNDS.minLat &&
    lat <= SAUDI_BOUNDS.maxLat &&
    lng >= SAUDI_BOUNDS.minLng &&
    lng <= SAUDI_BOUNDS.maxLng
  );

  return isInside;
};