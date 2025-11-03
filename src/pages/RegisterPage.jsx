import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "customer", // كل مستخدم جديد هو "عميل" افتراضي
      });

      console.log("تم إنشاء الحساب بنجاح");
      navigate('/');

    } catch (err) {
      console.error("خطأ في إنشاء الحساب:", err.message);
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل مسبقاً.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      } else {
        setError('حدث خطأ. الرجاء المحاولة مرة أخرى.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8">إنشاء حساب جديد</h2>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-base font-semibold mb-2 text-right" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-gray-700 text-base font-semibold mb-2 text-right" htmlFor="password">
              كلمة المرور
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col items-center">
            <button
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline w-full text-lg transition shadow-md"
              type="submit"
            >
              إنشاء الحساب
            </button>
            <Link to="/login" className="inline-block align-baseline font-semibold text-base text-orange-500 hover:text-orange-600 mt-4">
              لديك حساب بالفعل؟ تسجيل الدخول
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;