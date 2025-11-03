import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import MyBookingsPage from './pages/MyBookingsPage';
import BookingDetailPage from './pages/BookingDetailPage';
import AddServicePage from './pages/provider/AddServicePage';
import ManageBookingsPage from './pages/provider/ManageBookingsPage';
import Footer from './components/layout/Footer';

// 2. استيراد المسارات المحمية
import ProtectedRoute from './components/auth/ProtectedRoute'; // المسار المحمي للعملاء
import ProviderRoute from './components/auth/ProviderRoute'; // المسار المحمي للمزودين

function App() {
  return (
    <>
      {/* الـ Navbar يظهر في كل الصفحات */}
      <Navbar />

      {/* 3. تعريف كل المسارات في التطبيق */}
      <Routes>
        
        {/* === المسارات العامة (للجميع) === */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/service/:id" element={<ServiceDetailPage />} />

        {/* === المسارات المحمية (للمسجلين فقط - عملاء أو مزودين) === */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/booking/:id" element={<BookingDetailPage />} /> 
        </Route>

        {/* === المسارات المحمية (للمزودين "provider" فقط) === */}
        <Route element={<ProviderRoute />}>
          <Route path="/add-service" element={<AddServicePage />} />
          <Route path="/manage-bookings" element={<ManageBookingsPage />} />
        </Route>

      </Routes>
    </>
  );
}

export default App;