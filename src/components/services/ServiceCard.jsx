import React from 'react';
import { Link } from 'react-router-dom'; // 1. تأكد من استيراد Link

// المكون يستقبل "بيانات الخدمة" كـ prop
function ServiceCard({ service }) {
  return (
    // 2. تغليف البطاقة بالكامل بـ Link
    // هذا هو السطر الأهم، هو الذي يحولها لرابط
    <Link to={`/service/${service.id}`} className="block border rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
      
      {/* صورة الخدمة */}
      <img 
        src={service.imageUrl} 
        alt={service.name} 
        className="w-full h-48 object-cover" 
      />
      
      <div className="p-4">
        {/* اسم الخدمة */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">{service.name}</h3>
        
        {/* السعر */}
        <p className="text-lg text-green-700 font-semibold mb-4">
          {service.price} ريال / الليلة
        </p>
        
        {/* 3. تغيير الزر إلى مجرد شكل جمالي */}
        <div className="w-full bg-green-700 text-white text-center font-bold py-2 px-4 rounded">
          عرض التفاصيل والحجز
        </div>
      </div>
    </Link>
  );
}

export default ServiceCard;