import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { auth } from '../../firebase/firebaseConfig';
import { signOut } from 'firebase/auth'; 
import { FaSignOutAlt, FaUserCircle, FaStore, FaList } from 'react-icons/fa';
import KashtaLogo from '../../assets/kashta_logo.png'; 

function Navbar() {
  const { currentUser, userRole } = useAuth(); 
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("خطأ في تسجيل الخروج:", err);
    }
  };

  return (
    // 1. خلفية داكنة وظل خفيف
    <nav className="bg-gray-900 shadow-xl sticky top-0 z-50"> 
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo (سنعتمد على لوجو بخلفية شفافة هنا) */}
        <Link to="/" className="flex items-center">
          <img src={KashtaLogo} alt="KASHTA Logo" className="h-12 w-auto" /> 
        </Link>

        <div className="space-x-6 flex items-center">
          {/* 2. لون النص أبيض */}
          <Link to="/" className="text-white hover:text-orange-400 transition duration-150 font-semibold">
            الرئيسية
          </Link>

          {currentUser ? (
            <>
              {/* === روابط العميل === */}
              {userRole === 'customer' && (
                <Link to="/my-bookings" className="text-white font-medium hover:text-orange-400 flex items-center">
                  <FaList className="ml-1" /> طلباتي
                </Link>
              )}

              {/* === روابط المزود === */}
              {userRole === 'provider' && (
                <>
                  <Link to="/manage-bookings" className="text-white font-medium hover:text-orange-400 flex items-center">
                    <FaStore className="ml-1" /> إدارة الطلبات
                  </Link>
                  <Link to="/add-service" className="text-white font-medium hover:text-orange-400 flex items-center">
                    <FaUserCircle className="ml-1" /> إضافة خدمة
                  </Link>
                </>
              )}

              {/* 3. زر الخروج بلون التمييز (البرتقالي) */}
              <button
                onClick={handleLogout}
                className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition flex items-center text-sm font-semibold shadow-md"
              >
                <FaSignOutAlt className="ml-2" /> تسجيل الخروج
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-white hover:text-orange-400 font-semibold"
              >
                تسجيل الدخول
              </Link>
              {/* 4. زر الإنشاء بلون الأخضر الداكن (Primary) */}
              <Link 
                to="/register" 
                className="bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-600 transition font-semibold shadow-md"
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;