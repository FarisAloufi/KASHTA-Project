import React from 'react';
import { Link } from 'react-router-dom';

// 1. تحديث الألوان والنصوص
const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800'; // تغيير للأزرق
    case 'ready':
      return 'bg-green-100 text-green-800'; // تغيير للأخضر
    case 'completed':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
const getStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'قيد الانتظار';
    case 'confirmed':
      return 'قيد التجهيز'; // نص جديد
    case 'ready':
      return 'في الطريق'; // نص جديد
    case 'completed':
      return 'مكتمل'; // نص جديد
    case 'cancelled':
      return 'ملغي';
    default:
      return 'غير معروف';
  }
};

function BookingCard({ booking, children }) {
  const bookingDate = new Date(booking.bookingDate).toLocaleString('ar-SA', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const handleChildClick = (e) => {
    e.stopPropagation(); // إيقاف انتشار الحدث (Bubbling)
    e.preventDefault();  // *** هذا هو السطر الناقص ***
                         // (يمنع السلوك الافتراضي للـ Link وهو التنقل)
  };
  return (
    <Link 
      to={`/booking/${booking.id}`} 
      className="block bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow duration-300"
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-800">{booking.serviceName}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
            {getStatusText(booking.status)}
          </span>
        </div>

        <p className="text-lg text-green-700 font-semibold mb-2">
          {booking.servicePrice} ريال
        </p>
        
        <p className="text-gray-600 mb-4"> {/* 2. تعديل المسافة السفلية */}
          <strong>التاريخ:</strong> {bookingDate}
        </p>

        {/* 3. *** تم حذف سطر الإحداثيات (lat, lng) من هنا *** */}

        {children && (
          <div className="border-t pt-4 mt-4" onClick={handleChildClick}>
            {children}
          </div>
        )}
      </div>
    </Link>
  );
}

export default BookingCard;