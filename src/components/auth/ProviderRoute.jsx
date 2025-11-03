import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProviderRoute() {
  const { currentUser, userRole, loading } = useAuth(); // 1. جلب المستخدم والدور وحالة التحميل

  if (loading) {
    // 2. إذا كان التطبيق لا يزال يتحقق، أظهر شاشة تحميل
    return <div className="text-center p-10"><h1>جاري التحقق...</h1></div>;
  }

  if (!currentUser) {
    // 3. إذا لم يكن مسجلاً، أعد توجيهه لصفحة الدخول
    return <Navigate to="/login" replace />;
  }

  if (currentUser && userRole !== 'provider') {
    // 4. إذا كان مسجلاً ولكنه ليس "مزود خدمة"، أعد توجيهه للرئيسية
    console.warn("تم منع الوصول: المستخدم ليس مزود خدمة.");
    return <Navigate to="/" replace />;
  }

  // 5. إذا كان مسجلاً وهو "مزود خدمة"، اسمح له بالمرور
  return <Outlet />;
}

export default ProviderRoute;