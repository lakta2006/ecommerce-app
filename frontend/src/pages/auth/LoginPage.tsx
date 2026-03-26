import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/authStore';
import { loginSchema } from '@/utils/validations';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input, Button } from '@/components/ui';
import { useToast } from '@/components/ui';
import { Mail, Lock } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';
import type { LoginFormData } from './types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      await login(data.email, data.password);

      toast.success('تم تسجيل الدخول بنجاح', 'مرحباً بك');
      navigate('/profile');
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error(errorMessage, 'فشل تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="مرحباً بك في لقطة"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="example@mail.com"
          icon={<Mail className="w-5 h-5" />}
          error={errors.email}
          {...register('email')}
        />

        <Input
          label="كلمة المرور"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-5 h-5" />}
          error={errors.password}
          {...register('password')}
        />

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          تسجيل الدخول
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ليس لديك حساب؟{' '}
          <Link
            to="/register"
            className="text-primary-600 font-medium hover:underline"
          >
            إنشاء حساب جديد
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
