import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore'; 
import { Link } from 'react-router-dom'; 
import { FaStar } from 'react-icons/fa';
import { subscribeToAverageRating } from '../services/ratingService'; 

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
                        size={16}
                    />
                );
            })}
        </div>
    );
};

// مكون بطاقة الخدمة
const HomeServiceCard = ({ service }) => {
    return (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden transition duration-300 hover:shadow-2xl hover:scale-[1.01] border border-gray-100">
            <img 
                src={service.imageUrl || "placeholder.jpg"} 
                alt={service.name} 
                className="w-full h-56 object-cover" 
            />
            <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{service.name}</h3>
                
                {/* عرض التقييم */}
                <div className="flex items-center space-x-2 space-x-reverse mb-4">
                    <StarsReadOnly rating={service.rating} />
                    <span className="text-md font-bold text-gray-700">{service.rating}</span>
                    <span className="text-sm text-gray-500">({service.ratingCount} تقييم)</span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-dashed">
                    <span className="text-3xl font-extrabold text-green-800">{service.price} ريال</span>
                    
                    <Link 
                        to={`/service/${service.id}`}
                        className="bg-orange-600 text-white px-5 py-2.5 rounded-full hover:bg-orange-700 transition font-bold text-lg shadow-md hover:shadow-lg"
                    >
                        عرض وحجز
                    </Link>
                </div>
            </div>
        </div>
    );
};


function HomePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const servicesCollectionRef = collection(db, "services"); 
      const data = await getDocs(query(servicesCollectionRef)); 

      const servicesData = data.docs.map((doc) => ({
        ...doc.data(), 
        id: doc.id,
        rating: 0, 
        ratingCount: 0,
      }));

      // جلب التقييمات وحساب المتوسط
      const servicesWithRatings = await Promise.all(
          servicesData.map(async (service) => {
              const ratingsRef = collection(db, "ratings");
              const q = query(ratingsRef, where("serviceId", "==", service.id));
              const ratingsSnapshot = await getDocs(q);

              let totalRating = 0;
              ratingsSnapshot.forEach(doc => {
                  totalRating += doc.data().rating;
              });

              const count = ratingsSnapshot.size;
              const average = count > 0 ? (totalRating / count).toFixed(1) : 0;
              
              return {
                  ...service,
                  rating: parseFloat(average),
                  ratingCount: count
              };
          })
      );

      setServices(servicesWithRatings);
      setLoading(false);
    };

    fetchServices();
  }, []);

  if (loading) {
    return <h1 className="text-center text-2xl p-10">جاري تحميل الخدمات...</h1>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      
      {/* قسم الترحيب (Hero Section) */}
      <header className="bg-green-800 text-white py-20 mb-12 shadow-xl">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold mb-3">جهز كشتتك بخطوة واحدة!</h1>
          <p className="text-xl font-light opacity-80">اكتشف أفضل الخيام والمستلزمات في منطقتك واحجزها بضغطة زر.</p>
        </div>
      </header>

      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-green-800 text-center mb-10">
          الخدمات المتاحة
        </h2>
        
        {services.length === 0 ? (
          <p className="text-center text-gray-500">لا توجد خدمات متاحة حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-20">
            {services.map(service => (
              <HomeServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;