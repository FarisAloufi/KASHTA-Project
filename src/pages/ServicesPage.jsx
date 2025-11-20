import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { 
  Palmtree, Tent, ShoppingCart, Check, Package, Layers, Loader 
} from "lucide-react";

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState("services"); 
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { addToCart } = useCart();
  const navigate = useNavigate();

useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesPromise = getDocs(collection(db, "services"));
        const packagesPromise = getDocs(collection(db, "packages"));


        const [servicesSnapshot, packagesSnapshot] = await Promise.all([
          servicesPromise,
          packagesPromise
        ]);

        const servicesData = servicesSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                displayName: data.name || data.title || data.serviceName,
                displayPrice: data.price,
                displayCategory: data.category || "general"
            };
        });
        setServices(servicesData);

        const packagesData = packagesSnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id, 
                ...data,
                displayName: data.packageName || data.name,     
                displayPrice: data.totalBasePrice || data.price, 
                features: data.items || data.features || [],
                displayCategory: data.category || "general" 
            };
        });
        setPackages(packagesData);

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToCart = (e, item, isPkg = false) => {
    e.stopPropagation();
    
    const itemToAdd = {
      serviceId: item.id,
      serviceName: item.displayName || "منتج غير معروف",
      servicePrice: Number(item.displayPrice) || 0,
      imageUrl: item.imageUrl,
      quantity: 1,
      type: isPkg ? 'package' : 'service'
    };
    addToCart(itemToAdd);
    alert(`تم إضافة ${itemToAdd.serviceName} للسلة!`);
  };

  const handleCardClick = (id) => {
    navigate(`/service/${id}`); 
  };

  const getDisplayedItems = () => {
    const data = viewMode === "services" ? services : packages;
    if (categoryFilter === "all") return data;
    return data.filter(item => item.displayCategory === categoryFilter);
  };

  const displayedItems = getDisplayedItems();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-main-bg">
        <div className="text-center">
          <Loader className="animate-spin text-second-text mx-auto mb-4" size={48} />
          <p className="text-second-text">جاري تحميل الخدمات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-main-bg min-h-screen py-10 px-4">
      <div className="container mx-auto max-w-7xl">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-second-text mb-2">
            اختر كشتتك
          </h1>
          <p className="text-second-text/70 text-lg">
            جهزنا لك كل شيء، تبي تجمع أغراضك بنفسك أو تختار بكج جاهز؟
          </p>
        </div>


        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setViewMode("services")}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 border-2
              ${viewMode === "services" 
                ? "bg-second-text text-main-text border-second-text shadow-lg scale-105" 
                : "bg-transparent text-second-text border-second-text/30 hover:bg-second-text/10"}
            `}
          >
            <Layers size={24} />
            خدمات فردية
          </button>
          <button
            onClick={() => setViewMode("packages")}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 border-2
              ${viewMode === "packages" 
                ? "bg-second-text text-main-text border-second-text shadow-lg scale-105" 
                : "bg-transparent text-second-text border-second-text/30 hover:bg-second-text/10"}
            `}
          >
            <Package size={24} />
            بكجات التوفير
          </button>
        </div>

      
        <div className="flex justify-center gap-3 mb-12">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all 
              ${categoryFilter === "all" 
                ? "bg-second-text text-main-text" 
                : "bg-second-text/40 text-second-text"}`}
          >
            الكل
          </button>
          <button
            onClick={() => setCategoryFilter("sea")}
            className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all 
              ${categoryFilter === "sea" 
                ? "bg-blue-200 text-blue-900" 
                : "bg-second-text/40 text-second-text"}`}
          >
            <Palmtree size={16} /> بحر
          </button>
          <button
            onClick={() => setCategoryFilter("land")}
            className={`flex items-center gap-1 px-4 py-2 rounded-full font-bold text-sm transition-all 
              ${categoryFilter === "land" 
                ? "bg-main-accent text-main-bg" 
                : "bg-second-text/40 text-second-text"}`}
          >
            <Tent size={16} /> بر
          </button>
        </div>

     
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedItems.length === 0 ? (
            <div className="col-span-full text-center py-20 text-second-text/50 bg-second-text/5 rounded-3xl border-2 border-dashed border-second-text/10">
              <div className="text-4xl mb-4">🤔</div>
              <p className="text-2xl font-bold">ما حصلنا شيء في هذا القسم حالياً</p>
            </div>
          ) : (
            displayedItems.map((item) => (
              <div 
                key={item.id} 
                onClick={() => handleCardClick(item.id)}
                className={`
                  relative bg-second-bg rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col cursor-pointer group
                  ${viewMode === "packages" ? "border-4 border-main-accent/50" : "border border-main-text/10"}
                `}
              >
                
                {viewMode === "packages" && (
                  <div className="absolute top-0 left-0 right-0 bg-main-accent text-main-text text-center py-1 text-xs font-black z-10">
                    ✨ بكج مميز ✨
                  </div>
                )}

               
                <div className="h-56 overflow-hidden relative">
                  <img 
                    src={item.imageUrl || "https://placehold.co/600x400?text=Kashta"} 
                    alt={item.displayName} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
              
                  <div className="absolute top-4 right-4 bg-main-text/80 backdrop-blur-sm text-second-text px-3 py-1 rounded-full text-sm font-bold">
                    {item.displayCategory === "sea" ? "بحر 🌊" : item.displayCategory === "land" ? "بر ⛺" : "عام"}
                  </div>
                </div>

              
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-main-text">{item.displayName}</h3>
                  </div>
                  
                  <p className="text-main-text/70 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

               
                  {viewMode === "packages" && item.features && item.features.length > 0 && (
                    <div className="mb-6 bg-main-bg/5 p-4 rounded-xl flex-1">
                      <h4 className="font-bold text-main-text mb-2 text-xs uppercase tracking-wider">المحتويات:</h4>
                      <ul className="space-y-2">
                        {item.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-main-text/90 font-medium">
                            <Check size={14} className="text-green-600 stroke-[3]" />
                            {typeof feature === 'object' ? feature.itemName : feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-main-text/10">
                    <div>
                      <span className="text-xs text-main-text/60 block font-bold">السعر</span>
                      <span className="text-2xl font-extrabold text-green-700">
                        {item.displayPrice} <span className="text-sm font-normal text-main-text">ريال</span>
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, item, viewMode === "packages")}
                      className="bg-main-text text-second-text p-3 rounded-xl hover:bg-main-bg transition-colors flex items-center gap-2 font-bold shadow-md active:scale-95 z-20 relative"
                    >
                      <ShoppingCart size={20} />
                      {viewMode === "packages" ? "احجز البكج" : "أضف للسلة"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ServicesPage;