import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { ArrowRight, Shield, FileText, Mail } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout title="شروط الاستخدام" subtitle="آخر تحديث: ٢٠٢٥/٠١/٠١">
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        {/* Introduction */}
        <div className="flex items-start gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <FileText className="w-5 h-5 text-primary-600 dark:text-primary-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            مرحباً بك في لقطة. باستخدامك لمنصتنا، فإنك توافق على هذه الشروط. يرجى قراءتها بعناية.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">١</span>
              استخدام المنصة
            </h3>
            <ul className="space-y-2 text-sm pr-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>يجب أن يكون عمرك ١٨ عاماً أو أكثر للاستخدام</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>تقديم معلومات دقيقة وصحيحة عند التسجيل</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>الحفاظ على سرية بيانات حسابك</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">٢</span>
              المنتجات والطلبات
            </h3>
            <ul className="space-y-2 text-sm pr-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>المنتجات المعروضة مقدمة من متاجر مستقلة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>الأسعار قد تتغير دون إشعار مسبق</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>يحق لنا رفض أو إلغاء أي طلب وفقاً للسياسات</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">٣</span>
              الملكية الفكرية
            </h3>
            <ul className="space-y-2 text-sm pr-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>جميع المحتويات محمية بحقوق الملكية الفكرية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>يمنع نسخ أو توزيع أي محتوى دون إذن كتابي</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">٤</span>
              المسؤولية والقيود
            </h3>
            <ul className="space-y-2 text-sm pr-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>لا نتحمل مسؤولية الأخطاء من أطراف ثالثة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                <span>يحق لنا تعليق الحسابات المخالفة للشروط</span>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 flex items-center justify-center text-xs font-bold">٥</span>
              التواصل
            </h3>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm">support@lakta.com</span>
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
