import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

function ProtectedRoute() {
  const { currentUser, loading } = useAuth(); // 1. جلب المستخدم وحالة التحميل

  if (loading) {
    return <div>جاري التحقق...</div>; // 2. انتظار التحقق
  }

  if (!currentUser) {
    // 3. إذا لم يكن مسجلاً، أعد توجيهه لصفحة الدخول
    return <Navigate to="/login" replace />;
  }

  // 4. إذا كان مسجلاً، اسمح له بالمرور
  return <Outlet />;
}

export default ProtectedRoute;