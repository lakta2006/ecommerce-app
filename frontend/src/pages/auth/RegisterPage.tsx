import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/authStore';
import { registerSchema } from '@/utils/validations';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input, Button, Select, PasswordStrength } from '@/components/ui';
import { useToast } from '@/components/ui';
import { Mail, Lock, User, Phone, Shield } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';
import type { RegisterFormData, UserRole } from './types';

const roleOptions = [
  { value: 'customer', label: 'زبون' },
  { value: 'store_owner', label: 'صاحب متجر' },
  { value: 'mall_owner', label: 'صاحب مول' },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Watch password for strength indicator
  useMemo(() => {
    const subscription = watch((value) => {
      if (value.password) {
        setPasswordValue(value.password);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      await registerUser({
        email: data.email,
        name: data.name,
        phone: data.phone || undefined,
        password: data.password,
        role: data.role as UserRole | undefined,
      });

      toast.success('تم إنشاء الحساب بنجاح', 'مرحباً بك في لقطة');

      // Send OTP and redirect to verification page
      try {
        await import('@/services/authService').then(async ({ authService }) => {
          await authService.sendOTP({ email: data.email });
        });
      } catch (err) {
        // Continue even if OTP sending fails - user can resend from verification page
        console.error('Failed to send OTP:', err);
      }

      // Redirect to OTP verification page with email
      navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = getAuthErrorMessage(error);
      try {
        toast.error(errorMessage, 'فشل إنشاء الحساب');
      } catch (toastErr) {
        console.error('Toast error:', toastErr);
        alert(`فشل إنشاء الحساب: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="انضم إلى لقطة اليوم وابدأ التسوق"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="الاسم الكامل"
          placeholder="محمد أحمد"
          icon={<User className="w-5 h-5" />}
          error={errors.name}
          {...register('name')}
        />

        <Input
          label="البريد الإلكتروني"
          type="email"
          placeholder="example@mail.com"
          icon={<Mail className="w-5 h-5" />}
          error={errors.email}
          {...register('email')}
        />

        <Input
          label="رقم الهاتف (اختياري)"
          type="tel"
          placeholder="+963912345678"
          icon={<Phone className="w-5 h-5" />}
          error={errors.phone}
          {...register('phone')}
        />

        <Select
          label="نوع الحساب"
          icon={<Shield className="w-5 h-5" />}
          options={roleOptions}
          placeholder="اختر نوع الحساب"
          error={errors.role}
          {...register('role')}
        />

        <div>
          <Input
            label="كلمة المرور"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-5 h-5" />}
            error={errors.password}
            {...register('password')}
          />
          {passwordValue && (
            <div className="mt-2">
              <PasswordStrength password={passwordValue} />
            </div>
          )}
        </div>

        <Input
          label="تأكيد كلمة المرور"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-5 h-5" />}
          error={errors.confirmPassword}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          إنشاء الحساب
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          لديك حساب بالفعل؟{' '}
          <Link
            to="/login"
            className="text-primary-600 font-medium hover:underline"
          >
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
