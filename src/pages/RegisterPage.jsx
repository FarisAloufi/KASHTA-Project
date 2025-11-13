import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name) {
      setError("الرجاء إدخال اسمك الكامل.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

   
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: user.email,
        role: "customer",
        createdAt: new Date(),
      });

      navigate("/");
    } catch (err) {
      console.error("خطأ في إنشاء الحساب:", err.message);

      if (err.code === "auth/email-already-in-use") {
        setError("هذا البريد الإلكتروني مسجل مسبقاً.");
      } else if (err.code === "auth/weak-password") {
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
      } else {
        setError("حدث خطأ. الرجاء المحاولة مرة أخرى.");
      }
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "customer",
          createdAt: new Date(),
        });
      }

      navigate("/");
    } catch (err) {
      console.error("Google Register Error:", err);
      setError("حدث خطأ أثناء إنشاء الحساب عبر Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-main-bg p-6">
      <div className="max-w-md w-full bg-second-bg rounded-3xl shadow-2xl p-10 border border-main-bg-70">
        <h2 className="text-4xl font-extrabold text-center text-black mb-8">
          إنشاء حساب جديد
        </h2>

        {error && (
          <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              className="block text-black text-base font-semibold mb-2 text-right"
              htmlFor="name"
            >
              الاسم الكامل
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black focus:ring-2 focus:ring-black"
              id="name"
              type="text"
              placeholder="مثال: أحمد محمد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block text-black text-base font-semibold mb-2 text-right"
              htmlFor="email"
            >
              البريد الإلكتروني
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black focus:ring-2 focus:ring-black"
              id="email"
              type="email"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-8">
            <label
              className="block text-black text-base font-semibold mb-2 text-right"
              htmlFor="password"
            >
              كلمة المرور
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black focus:ring-2 focus:ring-black"
              id="password"
              type="password"
              placeholder="***********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            className="bg-black text-white w-full font-bold py-4 rounded-2xl hover:scale-105 transition-all"
            type="submit"
          >
            إنشاء الحساب
          </button>

          {/* Google Register Button */}
          <button
            onClick={handleGoogleRegister}
            type="button"
            className="bg-white mt-4 text-black px-7 py-3 rounded-2xl font-bold text-lg shadow-md hover:shadow-xl hover:scale-105 transition-all w-full flex items-center justify-center gap-3 border border-gray-300"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-6 h-6"
            />
            إنشاء حساب عبر Google
          </button>

          <Link
            to="/login"
            className="inline-block text-center w-full mt-4 font-semibold text-[#3e2723] hover:text-[#e48a4e]"
          >
            لديك حساب بالفعل؟ تسجيل الدخول
          </Link>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
