import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import MapPicker from "../components/map/MapPicker";
import { FaStar } from "react-icons/fa";
import { subscribeToAverageRating } from "../services/ratingService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import RatingForm from "../components/orders/RatingForm";
import DisplayRating from "../components/orders/DisplayRating";

const StarsReadOnly = ({ rating, size = 20 }) => {
  return (
    <div className="flex space-x-1 space-x-reverse">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={ratingValue}
            color={ratingValue <= rating ? "#ffc107" : "#3e2723"}
            stroke={ratingValue <= rating ? "#ffc107" : "#3e2723"}
            fill={ratingValue <= rating ? "#ffc107" : "none"}
            size={size}
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
  const { addToCart } = useCart();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookingDate, setBookingDate] = useState("");
  const [location, setLocation] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [individualRatings, setIndividualRatings] = useState([]);
  const [similarServices, setSimilarServices] = useState([]);

  useEffect(() => {
    setLoading(true);
    const fetchServiceAndRatings = async () => {
      try {
        const serviceDocRef = doc(db, "services", id);
        const docSnap = await getDoc(serviceDocRef);

        if (docSnap.exists()) {
          const serviceData = { id: docSnap.id, ...docSnap.data() };
          setService(serviceData);

          const ratingsRef = collection(db, "ratings");
          const ratingsQuery = query(
            ratingsRef,
            where("serviceId", "==", id),
            orderBy("createdAt", "desc"),
          );
          const ratingsSnap = await getDocs(ratingsQuery);
          setIndividualRatings(
            ratingsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
          );

          const similarQuery = query(
            collection(db, "services"),
            where("price", "<=", serviceData.price + 50),
            where("price", ">=", serviceData.price - 50),
          );
          const similarSnap = await getDocs(similarQuery);
          setSimilarServices(
            similarSnap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter((s) => s.id !== id)
              .slice(0, 3),
          );
        } else {
          setError("لم يتم العثور على هذه الخدمة.");
        }
      } catch (err) {
        console.error("خطأ في جلب الخدمة:", err);
        setError("حدث خطأ في جلب بيانات الخدمة.");
      }
      setLoading(false);
    };
    fetchServiceAndRatings();
    const unsubscribeRating = subscribeToAverageRating(id, (data) => {
      setAverageRating(data);
    });
    return () => {
      unsubscribeRating();
    };
  }, [id]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    setBookingError("");

    if (!currentUser) {
      setBookingError("يجب عليك تسجيل الدخول أولاً لإضافة خدمات للسلة.");
      setTimeout(() => navigate("/login"), 1500);
      return;
    }

    if (userRole !== "customer") {
      setBookingError("فقط العملاء يمكنهم الإضافة للسلة.");
      return;
    }

    if (!bookingDate || !location) {
      setBookingError("الرجاء اختيار تاريخ ووقت وموقع الحجز على الخريطة.");
      return;
    }

    const itemToAdd = {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      imageUrl: service.imageUrl,

      bookingDate: new Date(bookingDate).toISOString(),
      location: location,
    };

    addToCart(itemToAdd);
    navigate("/cart");
  };

  if (loading) {
    return (
      <h1 className="text-center text-2xl p-10 text-second-text">
        جاري تحميل الخدمة...
      </h1>
    );
  }
  if (error) {
    return <h1 className="text-center text-2xl p-10 text-red-400">{error}</h1>;
  }
  if (!service) {
    return null;
  }

  const minDate = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);

  return (
    <div className="bg-main-bg min-h-screen py-10 text-second-text">
      <div className="container mx-auto p-6 max-w-4xl space-y-12">
        <section className="bg-second-bg text-main-text p-6 rounded-2xl shadow-xl border border-black/50">
          <h1 className="text-4xl font-extrabold text-main-text mb-3">
            {service.name}
          </h1>
          <div className="flex items-center space-x-2 space-x-reverse mb-6">
            <StarsReadOnly rating={averageRating.average} size={24} />
            <span className="text-2xl font-bold text-main-accent">
              {averageRating.average}
            </span>
            <span className="text-lg text-main-text">
              ({averageRating.count} تقييم)
            </span>
          </div>
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-96 object-cover rounded-xl shadow-lg mb-6"
          />
          <div className="bg-second-bg p-4 rounded-xl mb-6 text-center font-bold text-main-text">
            <p className="text-3xl">السعر: {service.price} ريال / الليلة</p>
          </div>
          <h3 className="text-2xl font-bold text-main-text mt-6 mb-3 border-b border-black/50 pb-2">
            تفاصيل الخدمة
          </h3>
          <p className="text-main-text text-lg whitespace-pre-wrap">
            {service.description || "لا يوجد وصف متوفر حالياً."}
          </p>

          
        </section>

        <section
          className="bg-second-bg text-main-text p-6 rounded-2xl shadow-2xl border-2 border-main-bg/70"
          id="booking-section"
        >
          <h2 className="text-3xl font-extrabold text-center mb-6 text-main-text">
            إضافة للسلة
          </h2>

          {bookingError && (
            <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium">
              {bookingError}
            </p>
          )}

          <form onSubmit={handleAddToCart} className="space-y-4">
            <div>
              <label
                htmlFor="date"
                className="block text-main-text font-bold mb-2"
              >
                اختر تاريخ ووقت "الكشتة"
              </label>
              <input
                type="datetime-local"
                id="date"
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-main-text leading-tight focus:outline-none focus:ring-2 focus:ring-black transition"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={minDate}
                required
              />
            </div>

            <div>
              <label className="block text-main-text font-bold mb-2">
                حدد الموقع على الخريطة
              </label>
              <MapPicker onLocationChange={setLocation} />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300"
              disabled={bookingLoading}
            >
              {bookingLoading ? "جاري الإضافة..." : "أضف إلى السلة"}
            </button>
          </form>
        </section>

        <hr className="border-t-2 border-black" />

        {similarServices.length > 0 && (
          <section className="bg-second-bg text-main-text p-6 rounded-2xl shadow-xl border border-main-bg/70">
            <h3 className="text-3xl font-extrabold text-main-text mb-6">
              خدمات قد تعجبك
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarServices.map((simService) => (
                <Link
                  key={simService.id}
                  to={`/service/${simService.id}`}
                  className="block border rounded-lg hover:shadow-lg transition bg-white"
                >
                  <img
                    src={simService.imageUrl}
                    alt={simService.name}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                  <div className="p-3">
                    <p className="text-main-text font-bold">
                      {simService.name}
                    </p>
                    <p className="text-main-text font-bold">
                      {simService.price} ر.س
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <hr className="border-t-2 border-black" />

        <section className="bg-second-bg text-main-text p-6 rounded-2xl shadow-xl border border-main-bg/70">
          <h3 className="text-3xl font-extrabold text-main-text mb-6">
            آراء العملاء ({averageRating.count})
          </h3>
          <div className="space-y-6">
            {individualRatings.length > 0 ? (
              individualRatings.map((rating) => (
                <div
                  key={rating.id}
                  className="border-b border-main-bg/20 py-4 last:border-b-0"
                >
                  <div className="flex justify-between">
                    <StarsReadOnly rating={rating.rating} size={18} />
                    <p className="text-sm text-gray-500">
                      {rating.createdAt
                        ? new Date(
                            rating.createdAt.toDate(),
                          ).toLocaleDateString("ar-SA")
                        : "..."}
                    </p>
                  </div>
                  <p className="text-main-text italic text-lg my-2">
                    "{rating.comment}"
                  </p>
                  <p className="text-sm text-gray-600 font-medium">
                    - {rating.userName || "عميل"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-5">
                كن أول من يقيّم هذه الخدمة!
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ServiceDetailPage;
