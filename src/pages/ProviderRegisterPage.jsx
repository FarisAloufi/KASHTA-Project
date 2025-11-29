import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; 
import Select from 'react-select'; 

// خيارات الجنسيات مع روابط الأعلام
const NATIONALITIES_OPTIONS = [
  { value: "سعودي", label: "سعودي", flag: "https://flagcdn.com/w40/sa.png" },
  { value: "مصري", label: "مصري", flag: "https://flagcdn.com/w40/eg.png" },
  { value: "أردني", label: "أردني", flag: "https://flagcdn.com/w40/jo.png" },
  { value: "إماراتي", label: "إماراتي", flag: "https://flagcdn.com/w40/ae.png" },
  { value: "كويتي", label: "كويتي", flag: "https://flagcdn.com/w40/kw.png" },
  { value: "لبناني", label: "لبناني", flag: "https://flagcdn.com/w40/lb.png" },
  { value: "جنسية أخرى", label: "جنسية أخرى", flag: null }, 
];

// تنسيق القائمة المنسدلة
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    borderColor: state.isFocused ? 'black' : '#e5e7eb', 
    borderRadius: '0.75rem', 
    padding: '0.5rem', 
    boxShadow: state.isFocused ? '0 0 0 2px rgba(0, 0, 0, 0.1)' : 'none', 
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: 'black',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#f3f4f6' : state.isFocused ? '#f9fafb' : 'white', 
    color: 'black',
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#e5e7eb',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
    color: 'black',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
    overflow: 'hidden',
    zIndex: 50, 
  }),
  dropdownIndicator: (provided) => ({
      ...provided,
      color: '#9ca3af', 
      '&:hover': {
          color: 'black',
      }
  }),
    indicatorSeparator: () => ({ display: 'none' }), 
};


function ProviderRegisterPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+966"); 
  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState(null); 
  const [idNumber, setIdNumber] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [hasCommercialRecord, setHasCommercialRecord] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // التحقق من الحقول الفارغة
    if (!email || !phone || !fullName || !nationality || !idNumber || !birthDate) {
      setError("الرجاء ملء جميع الحقول المطلوبة.");
      return;
    }
    
    // التحقق من رقم الهوية
    if (idNumber.length !== 10 || isNaN(idNumber)) {
      setError("الرجاء إدخال رقم هوية صحيح مكون من 10 أرقام.");
      return;
    }

    // التحقق من رقم الجوال (يبدأ بـ 5 وطوله 9 أرقام)
    if (!phone.startsWith("5") || phone.length !== 9) {
      setError("رقم الجوال يجب أن يبدأ بـ 5 ويتكون من 9 أرقام.");
      return;
    }

    setLoading(true);

    try {
      // تجهيز البيانات
      const applicationData = {
        email: email,
        fullName: fullName,
        phone: `${countryCode}${phone}`, 
        nationality: nationality.value, 
        idNumber: idNumber,
        birthDate: birthDate,
        hasCommercialRecord: hasCommercialRecord,
        status: "pending",
        submittedAt: serverTimestamp(),
      };

      // إرسال البيانات إلى Firestore (كولكشن جديد)
      await addDoc(collection(db, "providerApplications"), applicationData);
      
      setSuccess("تم إرسال طلبك بنجاح! سيتم مراجعة البيانات والرد عليك قريباً.");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      console.error("خطأ في إرسال طلب الانضمام:", err);
      setError("حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };
  
  // دالة لعرض العلم بجانب الاسم في القائمة
  const formatOptionLabel = ({ label, flag }) => (
    <div className="flex items-center">
      {flag && <img src={flag} alt={label} className="w-6 h-4 ml-3 rounded-sm object-cover shadow-sm" />}
      <span className="font-medium">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-main-bg">
      <div className="max-w-2xl w-full bg-second-bg text-main-text rounded-3xl shadow-2xl p-10 border border-main-bg/10">
        <h1 className="text-4xl font-extrabold text-center text-main-text mb-6">
          طلب الانضمام كمقدم خدمة
        </h1>
        <p className="text-center text-gray-600 mb-8">
          املأ البيانات لتتم مراجعة طلبك من قبل فريق الإدارة.
        </p>

        {error && <p className="bg-red-100 text-red-700 p-3 rounded-xl mb-6 text-center font-medium">{error}</p>}
        {success && <p className="bg-green-100 text-green-700 p-3 rounded-xl mb-6 text-center font-medium">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* الإيميل */}
          <div>
            <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="email">
              البريد الإلكتروني
            </label>
            <input className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com"/>
          </div>
          
          {/* الاسم ورقم الهوية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="fullName">الاسم الكامل</label>
              <input className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition" id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required/>
            </div>
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="idNumber">رقم الهوية (10 أرقام)</label>
              <input className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition" id="idNumber" type="text" maxLength="10" value={idNumber} onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ''))} required/>
            </div>
          </div>

          {/* الجوال */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="countryCode">المفتاح</label>
              <select className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition" id="countryCode" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} required>
                <option value="+966">+966 (السعودية)</option>
                <option value="+971">+971 (الإمارات)</option>
                <option value="+965">+965 (الكويت)</option>
                <option value="+20">+20 (مصر)</option>
                <option value="+962">+962 (الأردن)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="phone">رقم الجوال</label>
              <input 
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition" 
                id="phone" 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                maxLength={9} 
                placeholder="5xxxxxxxx"
                required
              />
            </div>
          </div>

          {/* الجنسية والميلاد */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative"> 
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="nationality">
                الجنسية
              </label>
              <Select
                id="nationality"
                options={NATIONALITIES_OPTIONS}
                value={nationality}
                onChange={setNationality}
                placeholder="-- اختر جنسيتك --"
                styles={customStyles}
                formatOptionLabel={formatOptionLabel} 
                isSearchable={true} 
                required 
              />
            </div>
            <div>
              <label className="block text-main-text text-base font-semibold mb-2 text-right" htmlFor="birthDate">
                تاريخ الميلاد
              </label>
              <input
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-black transition"
                id="birthDate" type="date"
                value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
              />
            </div>
          </div>

          {/* السجل التجاري */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <label className="text-main-text text-base font-semibold cursor-pointer" htmlFor="commercialRecord">
              هل تمتلك سجل تجاري لتأجير المعدات؟
            </label>
            <input
              type="checkbox"
              id="commercialRecord"
              checked={hasCommercialRecord}
              onChange={(e) => setHasCommercialRecord(e.target.checked)}
              className="h-5 w-5 text-main-accent rounded cursor-pointer accent-black"
            />
          </div>

          {/* زر الإرسال */}
          <div className="flex items-center justify-center pt-4">
            <button
              className="w-full bg-black text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-gray-800/50 hover:scale-105 transition-all duration-300 disabled:bg-gray-500"
              type="submit"
              disabled={loading}
            >
              {loading ? "جاري إرسال الطلب..." : "إرسال طلب الانضمام"}
            </button>
          </div>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link to="/login" className="text-main-accent hover:underline font-bold">
            العودة لصفحة تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ProviderRegisterPage;