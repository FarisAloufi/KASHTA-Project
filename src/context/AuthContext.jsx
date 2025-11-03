import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig'; // 1. استيراد db
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // 2. استيراد دوال جلب البيانات

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 3. State جديد لتخزين الدور
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // 4. إذا المستخدم سجل دخوله، اذهب واحضر "دوره" من Firestore
        const userDocRef = doc(db, "users", user.uid); // تحديد مستند المستخدم
        const userDoc = await getDoc(userDocRef); // جلب المستند

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role); // 5. تخزين "الدور" في الـ State
          console.log("AuthContext: المستخدم مسجل:", user.uid, "الدور:", userData.role);
        } else {
          console.log("AuthContext: المستخدم مسجل ولكن ليس له مستند role!");
          setUserRole(null);
        }
      } else {
        // 6. إذا سجل المستخدم خروجه، امسح كل شيء
        console.log("AuthContext: المستخدم غير مسجل.");
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole, // 7. إضافة الدور إلى "السياق"
    loading, // 8. إضافة حالة التحميل
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}