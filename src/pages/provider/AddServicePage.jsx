import React, { useState } from 'react';
import { db } from '../../firebase/firebaseConfig'; // 1. لا نحتاج storage هنا
import { collection, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function AddServicePage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState(''); // إضافة حقل وصف
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || price <= 0 || !imageUrl || !description) {
      setError('الرجاء ملء جميع الحقول (بما في ذلك الوصف) بسعر صحيح.');
      return;
    }

    setLoading(true);

    try {
      // حفظ البيانات في Firestore (باستخدام الرابط من Cloudinary)
      await addDoc(collection(db, "services"), {
        name: name,
        price: Number(price),
        imageUrl: imageUrl,
        description: description, // حفظ الوصف الجديد
        createdAt: new Date(),
      });
      
      setSuccess('تمت إضافة الخدمة بنجاح! شكراً لك.');
      
      setName('');
      setPrice(0);
      setImageUrl('');
      setDescription('');

      setTimeout(() => {
        navigate('/manage-bookings'); // توجيه للمزود لصفحة إدارة الطلبات
      }, 2000);

    } catch (err) {
      console.error("خطأ في إضافة الخدمة:", err);
      setError('حدث خطأ أثناء إضافة الخدمة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto p-6 max-w-2xl">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">
          إضافة خدمة جديدة
        </h1>

        {error && <p className="bg-red-100 border-2 border-red-300 text-red-700 p-3 rounded-xl mb-6 text-center font-medium">{error}</p>}
        {success && <p className="bg-green-100 border-2 border-green-300 text-green-700 p-3 rounded-xl mb-6 text-center font-medium">{success}</p>}

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
          
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-semibold mb-2 text-right" htmlFor="name">
              اسم الخدمة
            </label>
            <input
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-semibold mb-2 text-right" htmlFor="description">
              وصف الخدمة
            </label>
            <textarea
              className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب تفاصيل الخيمة، مساحتها، والملحقات المرفقة..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2 text-right" htmlFor="price">
                السعر (بالريال)
              </label>
              <input
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2 text-right" htmlFor="imageUrl">
                رابط صورة الخدمة (Cloudinary)
              </label>
              <input
                className="shadow appearance-none border rounded-xl w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-teal-600 transition"
                id="imageUrl"
                type="text"
                placeholder="https://res.cloudinary.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-center">
            <button
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl focus:outline-none focus:shadow-outline text-xl transition shadow-lg disabled:bg-gray-400"
              type="submit"
              disabled={loading}
            >
              {loading ? 'جاري الإضافة...' : 'إضافة الخدمة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddServicePage;