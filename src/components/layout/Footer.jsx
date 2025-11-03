import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaEnvelope } from 'react-icons/fa';

function Footer() {
  return (
    // 1. خلفية داكنة ونصوص بيضاء
    <footer className="bg-gray-900 border-t border-gray-700 mt-auto py-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* العمود 1: عن كشتة */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-orange-500 pb-1">KASHTA</h3>
            <p className="text-gray-400 text-sm">منصة متكاملة لتجهيز موقع كشتتك وحجز أفضل المستلزمات بكل سهولة.</p>
          </div>

          {/* العمود 2: الروابط السريعة */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-orange-500 pb-1">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">من نحن</a></li>
              <li><a href="#" className="text-gray-400 hover:text-orange-500 transition">الشروط والأحكام</a></li>
            </ul>
          </div>

          {/* العمود 3: تواصل معنا */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-orange-500 pb-1">تواصل</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 flex items-center">
                <FaEnvelope className="ml-2 text-orange-500" /> support@kashta.com
              </li>
            </ul>
          </div>

          {/* العمود 4: وسائل التواصل */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-orange-500 pb-1">تابعنا</h3>
            <div className="flex space-x-4 text-2xl space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-orange-500 transition"><FaTwitter /></a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition"><FaInstagram /></a>
              <a href="#" className="text-gray-400 hover:text-orange-500 transition"><FaFacebook /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} KASHTA. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;