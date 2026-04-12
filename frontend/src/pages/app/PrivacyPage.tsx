import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { ArrowRight, Shield, Eye, Mail } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout title="سياسة الخصوصية" subtitle="آخر تحديث: ٢٠٢٥/٠١/٠١">
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        {/* Introduction */}
        <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Shield className="w-5 h-5 text-primary-600 dark:text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيف نجمع ونستخدم ونحمي بياناتك الشخصية.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">١</span>
              المعلومات التي نجمعها
            </h3>
            <ul className="space-y-2 text-sm pr-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>المعلومات الأساسية عند التسجيل (الاسم، البريد)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>بيانات الطلبات والمعاملات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>بيانات التصفح لتحسين تجربتك</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">٢</span>
              كيف نستخدم بياناتك
            </h3>
            <ul className="space-y-2 text-sm pr-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>معالجة الطلبات والشحن</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>تحسين خدماتنا وتجربة المستخدم</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>إرسال التحديثات والعروض (بموافقتك)</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">٣</span>
              حماية البيانات
            </h3>
            <ul className="space-y-2 text-sm pr-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>تشفير البيانات الحساسة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>مراقبة أمنية على مدار الساعة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>لا نبيع أو نشارك بياناتك مع أطراف ثالثة</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">٤</span>
              حقوقك
            </h3>
            <ul className="space-y-2 text-sm pr-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>الوصول إلى بياناتك الشخصية في أي وقت</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>طلب تعديل أو حذف بياناتك</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>إلغاء الاشتراك في الرسائل الإعلانية</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">٥</span>
              ملفات تعريف الارتباط
            </h3>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك. يمكنك التحكم بها عبر إعدادات المتصفح.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">٦</span>
              التواصل
            </h3>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm">privacy@lakta.com</span>
            </div>
          </section>
        </div>

        {/* Back to settings */}
        <button
          onClick={() => navigate(-1)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-h-[44px]"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة</span>
        </button>
      </div>
    </AuthLayout>
  );
};
