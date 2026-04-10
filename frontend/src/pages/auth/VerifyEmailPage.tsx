import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button, Alert, Card } from '@/components/ui';
import { useToast } from '@/components/ui';
import { CheckCircle, XCircle } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';

/**
 * Email Verification Page
 * 
 * Handles email verification via token from URL query parameter.
 * 
 * Note: This is a placeholder page. Backend email verification endpoint needs to be implemented:
 * - GET /api/auth/verify-email?token=xxx - Verify email token
 * 
 * The backend should:
 * 1. Validate the token
 * 2. Mark user as verified
 * 3. Return success/error response
 */
export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('رمز التحقق غير موجود');
      setIsVerifying(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        // TODO: Replace with actual API call when backend is ready
        // const response = await axios.get('/api/auth/verify-email', {
        //   params: { token },
        // });
        
        // Mock verification for development
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // For development, assume success
        // In production, this would be determined by the API response
        toast.success('تم التحقق من بريدك الإلكتروني بنجاح');
      } catch (err: any) {
        const errorMessage = getAuthErrorMessage(err);
        setError(errorMessage);
        toast.error(errorMessage, 'فشل التحقق');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, toast]);

  if (isVerifying) {
    return (
      <AuthLayout
        title="جاري التحقق..."
        subtitle="يرجى الانتظار"
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">جاري التحقق من بريدك الإلكتروني...</p>
        </div>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout
        title="فشل التحقق"
        subtitle="لم نتمكن من التحقق من بريدك الإلكتروني"
      >
        <Card className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-500 dark:text-red-400" />
          </div>
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => navigate('/forgot-password')}
            >
              طلب رمز جديد
            </Button>
            <Link
              to="/login"
              className="block text-center text-primary-600 dark:text-primary-500 hover:underline"
            >
              العودة لتسجيل الدخول
            </Link>
          </div>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="تم التحقق بنجاح"
      subtitle="تم التحقق من بريدك الإلكتروني بنجاح"
    >
      <Card className="mb-6">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400" />
        </div>
        <Alert variant="success" className="mb-4">
          تم التحقق من بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول والوصول إلى جميع الميزات.
        </Alert>
      </Card>

      <div className="space-y-3">
        <Button
          className="w-full"
          onClick={() => navigate('/login')}
        >
          تسجيل الدخول
        </Button>
        <Link
          to="/"
          className="block text-center text-primary-600 dark:text-primary-500 hover:underline"
        >
          العودة للصفحة الرئيسية
        </Link>
      </div>
    </AuthLayout>
  );
};
