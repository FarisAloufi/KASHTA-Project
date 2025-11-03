import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/firebaseConfig';
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import MapPicker from '../components/map/MapPicker';
import { FaStar } from 'react-icons/fa'; 
import { subscribeToAverageRating } from '../services/ratingService'; 
import { useAuth } from '../context/AuthContext';


// مكون النجوم (للعرض فقط)
const StarsReadOnly = ({ rating }) => {
    return (
        <div className="flex space-x-1 space-x-reverse">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <FaStar
                        key={ratingValue}
                        color={ratingValue <= rating ? "#ffc107" : "#e4e5e9"}
                        size={20}
                    />
                );
            })}
        </div>
    );
};


function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States للحجز
  const [bookingDate, setBookingDate] = useState('');
  const [location, setLocation] = useState(null);
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // State جديد للتقييم
  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 }); 

  useEffect(() => {
    const fetchService = async () => {
      try {
        const serviceDocRef = doc(db, 'services', id);
        const docSnap = await getDoc(serviceDocRef);

        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError('لم يتم العثور على هذه الخدمة.');
        }
      } catch (err) {
        console.error("خطأ في جلب الخدمة:", err);
        setError('حدث خطأ في جلب بيانات الخدمة.');
      }
      setLoading(false);
    };

    fetchService();

    // *** الاستماع للتقييمات الجديدة ***
    const unsubscribeRating = subscribeToAverageRating(id, (data) => {
        setAverageRating(data); // تحديث المتوسط عند أي تغيير في التقييمات
    });

    // دالة التنظيف (لإيقاف استماع التقييم)
    return () => {
        unsubscribeRating();
    };

  }, [id]); 

  // دالة الحجز
  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError('');
    
    if (!currentUser || userRole !== 'customer') {
      navigate('/login');
      return;
    }

    if (!bookingDate || !location) {
      setBookingError('الرجاء اختيار تاريخ ووقت وموقع الحجز على الخريطة.');
      return;
    }
    
    setBookingLoading(true);
    
    try {
      await addDoc(collection(db, "bookings"), {
        userId: currentUser.uid,
        userName: currentUser.email, 
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        bookingDate: new Date(bookingDate).getTime(), 
        location: location,
        status: 'pending', 
        createdAt: serverTimestamp(),
      });

      alert('تم إرسال طلب الحجز بنجاح! سيتم مراجعته من قبل المزود.');
      setBookingDate('');
      setLocation(null);
      navigate('/my-bookings');

    } catch (err) {
      console.error("خطأ في عملية الحجز:", err);
      setBookingError('حدث خطأ أثناء الحجز. الرجاء المحاولة مرة أخرى.');
    } finally {
      setBookingLoading(false);
    }
  };


  if (loading) {
    return <h1 className="text-center text-2xl p-10">جاري تحميل الخدمة...</h1>;
  }
  if (error) {
    return <h1 className="text-center text-2xl p-10 text-red-600">{error}</h1>;
  }
  if (!service) { return null; }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{service.name}</h1>
      
      {/* *** عرض متوسط التقييم هنا *** */}
      <div className="flex items-center space-x-2 space-x-reverse mb-4">
        <StarsReadOnly rating={averageRating.average} />
        <span className="text-xl font-bold text-gray-700">{averageRating.average}</span>
        <span className="text-gray-500">({averageRating.count} تقييم)</span>
      </div>
      
      <img 
        src={service.imageUrl} 
        alt={service.name} 
        className="w-full h-96 object-cover rounded-lg shadow-lg mb-6" 
      />
      
      <p className="text-gray-700 text-lg mb-6">{service.description}</p>

      <div className="bg-green-50 p-6 rounded-lg shadow-inner mb-8">
        <p className="text-3xl font-bold text-green-700">
          السعر: {service.price} ريال
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">احجز الآن</h2>
        
        {bookingError && <p className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{bookingError}</p>}

        <form onSubmit={handleBooking} className="space-y-4">
          
          <div>
            <label htmlFor="date" className="block text-gray-700 font-bold mb-2">
              اختر تاريخ ووقت "الكشتة"
            </label>
            <input
              type="datetime-local"
              id="date"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              حدد الموقع على الخريطة
            </label>
            <MapPicker onLocationChange={setLocation} />
            {location && (
              <p className="text-sm text-gray-500 mt-2">
                الموقع المحدد: (خط عرض: {location.lat.toFixed(4)}, خط طول: {location.lng.toFixed(4)})
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
            disabled={bookingLoading}
          >
            {bookingLoading ? 'جاري إرسال الطلب...' : 'تأكيد الحجز والدفع لاحقاً'}
          </button>
        </form>
      </div>

      {/* هنا يمكنك إضافة قسم لعرض التقييمات الفردية لاحقًا */}

    </div>
  );
}

export default ServiceDetailPage;