import { db } from '../firebase/firebaseConfig';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

/**
 * دالة لحساب متوسط التقييمات لخدمة واحدة
 * @param {string} serviceId - معرف الخدمة
 * @param {function} callback - دالة لإعادة النتيجة (للتحديث التلقائي)
 * @returns {function} دالة لإيقاف الاستماع (unsubscribe)
 */
export const subscribeToAverageRating = (serviceId, callback) => {
    // 1. تحديد المجموعة والاستعلام: جلب كل التقييمات لهذه الخدمة
    const ratingsRef = collection(db, "ratings");
    const q = query(ratingsRef, where("serviceId", "==", serviceId));

    // 2. استخدام onSnapshot للاستماع للتحديثات التلقائية
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        let totalRating = 0;
        let count = 0;

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.rating && typeof data.rating === 'number') {
                totalRating += data.rating; // 3. جمع التقييمات
                count += 1;
            }
        });

        const average = count > 0 ? (totalRating / count) : 0;
        
        // 4. إرسال النتيجة إلى المكون الذي يستدعي الدالة
        callback({
            average: parseFloat(average.toFixed(1)), // تقريب لأقرب رقم عشري
            count: count
        });
    });

    return unsubscribe;
};