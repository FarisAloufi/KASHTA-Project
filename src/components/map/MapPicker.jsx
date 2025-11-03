import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'; // 1. استيراد أدوات البحث

// --- إعدادات الخريطة (كما كانت) ---
const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};
const center = [24.7136, 46.6753]; // الرياض

// --- مكون داخلي للتعامل مع نقرات الخريطة (كما كان) ---
function MapClickHandler({ onLocationChange, setMarkerPosition }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setMarkerPosition(newPos);
      onLocationChange({ lat: newPos[0], lng: newPos[1] });
      console.log("Leaflet: تم اختيار الموقع (بالنقر):", newPos);
    },
  });
  return null;
}

// --- 2. مكون البحث الجديد (هذا هو الاقتراح) ---
function SearchField({ setMarkerPosition, onLocationChange }) {
  const map = useMap(); // الوصول للخريطة الحالية
  
  useEffect(() => {
    // 3. إعداد مزود البحث (المجاني - OpenStreetMap)
    const provider = new OpenStreetMapProvider();

    // 4. إعداد شريط البحث
    const searchControl = new GeoSearchControl({
      provider: provider, // مزود البحث
      style: 'bar',       // شكل شريط البحث (bar)
      autoClose: true,    // إغلاق النتائج بعد الاختيار
      keepResult: true,   // إبقاء الدبوس بعد الاختيار
      searchLabel: 'ابحث عن حي أو مكان...' // النص داخل الشريط
    });

    map.addControl(searchControl); // 5. إضافة الشريط إلى الخريطة

    // 6. دالة للاستماع لنتيجة البحث
    const onResult = (e) => {
      // e.location.y هو lat
      // e.location.x هو lng
      const newPos = [e.location.y, e.location.x];
      setMarkerPosition(newPos); // تحديث الدبوس
      onLocationChange({ lat: newPos[0], lng: newPos[1] }); // إرسال الإحداثيات
      console.log("Leaflet: تم اختيار الموقع (بالبحث):", newPos);
    };

    map.on('geosearch/showlocation', onResult);

    // 7. التنظيف عند إغلاق المكون
    return () => {
      map.removeControl(searchControl);
      map.off('geosearch/showlocation', onResult);
    };
  }, [map, setMarkerPosition, onLocationChange]);

  return null; // المكون لا يعرض شيئاً بنفسه، بل يضيفه للخريطة
}


// --- 4. مكون الخريطة الرئيسي (المعدل) ---
function MapPicker({ onLocationChange }) {
  const [markerPosition, setMarkerPosition] = useState(center);

  return (
    <MapContainer 
      center={center} 
      zoom={10} 
      style={containerStyle}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={markerPosition} />

      <MapClickHandler 
        onLocationChange={onLocationChange}
        setMarkerPosition={setMarkerPosition}
      />
      
      {/* 5. إضافة مكون البحث الجديد هنا */}
      <SearchField 
        onLocationChange={onLocationChange}
        setMarkerPosition={setMarkerPosition}
      />
    </MapContainer>
  );
}

export default MapPicker;