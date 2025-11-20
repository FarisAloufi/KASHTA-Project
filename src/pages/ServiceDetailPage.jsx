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
  documentId,
} from "firebase/firestore";
import { FaStar } from "react-icons/fa";
import { 
  Plus, Minus, ShoppingCart, ArrowRight, Star, CheckCircle, Loader, Package 
} from "lucide-react";
import { subscribeToAverageRating } from "../services/ratingService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import ServiceCard from "../components/services/ServiceCard"; 

const StarsReadOnly = ({ rating, size = 20 }) => {
  return (
    <div className="flex space-x-1 space-x-reverse">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={ratingValue}
            size={size}
            className={ratingValue <= rating ? "text-main-accent" : "text-gray-300"}
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
  const { addToCart, cartItems, updateCartItemQuantity } = useCart();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPackage, setIsPackage] = useState(false);

  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [averageRating, setAverageRating] = useState({ average: 0, count: 0 });
  const [individualRatings, setIndividualRatings] = useState([]);
  const [similarServices, setSimilarServices] = useState([]);

  useEffect(() => {
    setLoading(true);
    
    const fetchAllData = async () => {
      try {
        const ratingsRef = collection(db, "ratings");
        const ratingsQuery = query(
          ratingsRef,
          where("serviceId", "==", id),
          orderBy("createdAt", "desc")
        );
        const ratingsPromise = getDocs(ratingsQuery);
        const history = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
        const filteredHistory = history.filter((itemId) => itemId !== id);
        const newHistory = [id, ...filteredHistory];
        localStorage.setItem("recentlyViewed", JSON.stringify(newHistory.slice(0, 5)));
        
        const historyToFetch = newHistory.filter((itemId) => itemId !== id).slice(0, 3);
        let similarPromise = Promise.resolve([]); 

        if (historyToFetch.length > 0) {
            const similarQuery = query(
              collection(db, "services"),
              where(documentId(), "in", historyToFetch) 
            );
            similarPromise = getDocs(similarQuery);
        }


        let docRef = doc(db, "services", id);
        let docSnap = await getDoc(docRef);
        let foundIsPackage = false;

        if (!docSnap.exists()) {
          docRef = doc(db, "packages", id);
          docSnap = await getDoc(docRef);
          foundIsPackage = true;
        }

        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsPackage(foundIsPackage);
          
          const normalizedData = {
            id: docSnap.id,
            ...data,
            name: data.name || data.title || data.packageName || data.serviceName,
            price: data.price || data.totalBasePrice,
            description: data.description,
            features: data.features || data.items || [],
            imageUrl: data.imageUrl
          };
          setService(normalizedData);

   
          const [ratingsSnap, similarSnap] = await Promise.all([
            ratingsPromise,
            similarPromise
          ]);
          setIndividualRatings(
            ratingsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
          );


          if (Array.isArray(similarSnap) === false && similarSnap.docs) { 
             const similarServicesData = similarSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
             

             const servicesWithRatings = await Promise.all(
               similarServicesData.map(async (simService) => {
                 const serviceRatingsRef = collection(db, "ratings");
                 const q = query(serviceRatingsRef, where("serviceId", "==", simService.id));
                 const ratingsSnapshot = await getDocs(q);
                 
                 let totalRating = 0;
                 ratingsSnapshot.forEach((doc) => { totalRating += doc.data().rating; });
                 const count = ratingsSnapshot.size;
                 const average = count > 0 ? (totalRating / count).toFixed(1) : 0;
                 
                 return { ...simService, rating: parseFloat(average), ratingCount: count };
               })
             );

             const sortedServices = servicesWithRatings.sort(
               (a, b) => historyToFetch.indexOf(a.id) - historyToFetch.indexOf(b.id)
             );
             setSimilarServices(sortedServices);
          }

        } else {
          setError("لم يتم العثور على هذه الخدمة.");
        }
      } catch (err) {
        console.error("خطأ:", err);
        setError("حدث خطأ في جلب البيانات.");
      }
      setLoading(false);
    };

    fetchAllData();

    const unsubscribeRating = subscribeToAverageRating(id, (data) => {
      setAverageRating(data);
    });
    return () => {
      unsubscribeRating();
    };
  }, [id]); 

  const cartItem = cartItems.find((item) => item.serviceId === id);
  const isItemInCart = !!cartItem;

  const handleInitialAddToCart = () => {
    setBookingError("");
    setBookingLoading(true);

    if (!currentUser) {
      setBookingError("يجب عليك تسجيل الدخول أولاً.");
      setTimeout(() => navigate("/login"), 1500);
      setBookingLoading(false);
      return;
    }

    const itemToAdd = {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: Number(service.price),
      imageUrl: service.imageUrl,
      quantity: 1,
      type: isPackage ? 'package' : 'service'
    };

    addToCart(itemToAdd);
    setBookingLoading(false);
  };

  const handleUpdateQuantity = (newQuantity) => {
    if (cartItem) {
      updateCartItemQuantity(cartItem.cartId, newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <Loader className="animate-spin text-second-text" size={48} />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-main-bg flex flex-col items-center justify-center text-second-text">
        <h2 className="text-3xl font-bold mb-4">{error || "لم يتم العثور على الخدمة"}</h2>
        <button onClick={() => navigate("/services")} className="text-main-accent underline">
          العودة للخدمات
        </button>
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-second-text mb-8 hover:opacity-80 transition font-bold"
        >
          <ArrowRight className="ml-2" /> العودة للقائمة
        </button>

        <div className="bg-second-bg rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row mb-12">

          <div className="md:w-1/2 h-80 md:h-auto relative group">
            <img 
              src={service.imageUrl || "https://placehold.co/600x600"} 
              alt={service.name} 
              fetchPriority="high" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {isPackage && (
               <div className="absolute top-4 right-4 bg-main-accent text-main-text px-4 py-1 rounded-full font-bold shadow-lg flex items-center gap-2 z-10">
                 <Package size={18} /> بكج توفير
               </div>
            )}
          </div>

          <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-main-text leading-tight">
                {service.name}
              </h1>
              <div className="flex items-center gap-1 bg-main-text/10 px-2 py-1 rounded-lg shrink-0">
                <Star className="text-main-accent" size={16} />
                <span className="font-bold text-main-text">{averageRating.average}</span>
                <span className="text-xs text-main-text/60">({averageRating.count})</span>
              </div>
            </div>

            <p className="text-main-text/70 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
              {service.description || "لا يوجد وصف متوفر حالياً."}
            </p>

            {service.features && service.features.length > 0 && (
              <div className="mb-8 bg-main-bg/5 p-4 rounded-2xl border border-main-text/5">
                <h3 className="font-bold text-main-text mb-3 border-b border-main-text/10 pb-2 text-sm uppercase tracking-wide">
                  يشمل هذا العرض:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-main-text/90">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm font-medium">
                        {typeof feature === 'object' ? feature.itemName : feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-6 border-t border-main-text/10">
              {bookingError && (
                 <p className="bg-red-100 text-red-700 p-2 rounded-lg mb-4 text-center text-sm font-bold">
                   {bookingError}
                 </p>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-main-text/60 font-bold">السعر الإجمالي</p>
                  <p className="text-3xl font-extrabold text-main-text">
                    {service.price} <span className="text-lg font-medium text-main-text">ريال</span>
                  </p>
                </div>

                {isItemInCart ? (
                  <div className="flex items-center gap-4 bg-main-text/10 p-2 rounded-2xl">
                     <button onClick={() => handleUpdateQuantity(cartItem.quantity - 1)} className="bg-main-text text-second-text w-10 h-10 rounded-xl hover:bg-main-bg transition flex items-center justify-center"><Minus size={20} /></button>
                     <span className="text-2xl font-bold text-main-text w-8 text-center">{cartItem.quantity}</span>
                     <button onClick={() => handleUpdateQuantity(cartItem.quantity + 1)} className="bg-main-text text-second-text w-10 h-10 rounded-xl hover:bg-main-bg transition flex items-center justify-center"><Plus size={20} /></button>
                  </div>
                ) : (
                  <button
                    onClick={handleInitialAddToCart}
                    disabled={bookingLoading}
                    className="bg-main-text text-second-text px-8 py-3 rounded-xl font-bold text-lg shadow-xl hover:bg-main-bg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-70"
                  >
                    <ShoppingCart size={20} />
                    {bookingLoading ? "جاري الإضافة..." : "أضف للسلة"}
                  </button>
                )}
              </div>
              
              {isItemInCart && (
                <div className="text-center mt-3">
                  <Link to="/cart" className="text-sm font-bold text-main-text underline hover:text-main-accent">
                    الذهاب لإتمام الطلب
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {similarServices.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-extrabold text-second-text mb-6 border-r-4 border-second-text pr-4">
              خدمات شاهدتها مؤخراً
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {similarServices.map((simService) => (
                <ServiceCard
                  key={simService.id}
                  service={simService} 
                  userRole={userRole}
                />
              ))}
            </div>
          </section>
        )}

        <section className="bg-second-bg rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-extrabold text-main-text">
              آراء العملاء ({averageRating.count})
            </h3>
          </div>
          
          <div className="space-y-4">
            {individualRatings.length > 0 ? (
              individualRatings.map((rating) => (
                <div key={rating.id} className="bg-main-bg/5 p-4 rounded-xl border border-main-text/5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                         <div className="w-8 h-8 bg-main-text rounded-full flex items-center justify-center text-second-text font-bold text-xs">
                            {rating.userName ? rating.userName.charAt(0) : "U"}
                         </div>
                         <div>
                            <p className="text-sm font-bold text-main-text">{rating.userName || "عميل"}</p>
                            <div className="flex">
                                <StarsReadOnly rating={rating.rating} size={14} />
                            </div>
                         </div>
                    </div>
                    <p className="text-xs text-main-text/60">
                      {rating.createdAt ? new Date(rating.createdAt.toDate()).toLocaleDateString("ar-SA") : ""}
                    </p>
                  </div>
                  <p className="mt-3 text-main-text italic">"{rating.comment}"</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-main-text/60">
                <p>كن أول من يقيّم هذه الخدمة!</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default ServiceDetailPage;