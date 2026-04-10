import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import { forgotPasswordSchema } from '@/utils/validations';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input, Button, Alert } from '@/components/ui';
import { useToast } from '@/components/ui';
import { Mail } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';
import type { ForgotPasswordFormData } from './types';

export const ForgotPasswordPage: React.FC = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword({ email: data.email });
      setIsSent(true);

      // In development, show the reset token
      if (response.reset_token) {
        console.log('Reset token (development):', response.reset_token);
      }

      toast.success('تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const errorMessage = getAuthErrorMessage(err);
      try {
        toast.error(errorMessage, 'فشل الإرسال');
      } catch (toastErr) {
        console.error('Toast error:', toastErr);
        // Fallback: show alert if toast fails
        alert(`فشل الإرسال: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <AuthLayout
        title="تم إرسال البريد الإلكتروني"
        subtitle="تحقق من بريدك الإلكتروني للحصول على رمز إعادة تعيين كلمة المرور"
      >
        <Alert variant="success" className="mb-4">
          تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
        </Alert>

        <div className="space-y-4">
          <Link
            to="/reset-password"
            className="block w-full btn-primary py-2 px-4 rounded-lg text-center"
          >
            إعادة تعيين كلمة المرور
          </Link>
          <Link
            to="/login"
            className="block text-center text-primary-600 dark:text-primary-500 hover:underline"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="إعادة تعيين كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رمز إعادة التعيين"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="example@gmail.com"
          icon={<Mail className="w-5 h-5" />}
          error={errors.email}
          {...register('email')}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          إرسال رمز إعادة التعيين
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm text-primary-600 dark:text-primary-500 hover:underline"
        >
          العودة لتسجيل الدخول
        </Link>
      </div>
    </AuthLayout>
  );
};
