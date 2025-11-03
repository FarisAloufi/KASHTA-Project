import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from 'firebase/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("تم تسجيل الدخول بنجاح");
      navigate('/');
    } catch (err) {
      console.error("خطأ في تسجيل الدخول:", err.message);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else {
        setError('حدث خطأ. الرجاء المحاولة مرة أخرى.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8">تسجيل الدخول</h2>
        
        {error && <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-base font-semibold mb-2 text-right" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-800 transition"
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
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-800 transition"
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
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:shadow-outline w-full text-lg transition shadow-md"
              type="submit"
            >
              تسجيل الدخول
            </button>
            <Link to="/register" className="inline-block align-baseline font-semibold text-base text-green-800 hover:text-green-700 mt-4">
              ليس لديك حساب؟ أنشئ حساباً
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;