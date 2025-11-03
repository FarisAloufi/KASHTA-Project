import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

const containerStyle = {
  width: '100%',
  height: '300px', // أصغر حجماً
  borderRadius: '8px',
  pointerEvents: 'none' // 1. لجعل الخريطة غير قابلة للتفاعل (للعرض فقط)
};

function MapDisplay({ location }) {
  // 2. استخدام الموقع (location) كمركز ودبوس
  const position = [location.lat, location.lng];

  return (
    <MapContainer 
      center={position} 
      zoom={13} // 3. تقريب أعلى ليكون واضحاً
      style={containerStyle}
      scrollWheelZoom={false} // إيقاف التقريب بالعجلة
      dragging={false} // إيقاف السحب
      zoomControl={false} // إخفاء أزرار التقريب
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={position} />
    </MapContainer>
  );
}

export default MapDisplay;