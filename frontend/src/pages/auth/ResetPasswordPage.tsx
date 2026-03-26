import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import { resetPasswordSchema } from '@/utils/validations';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input, Button, PasswordStrength } from '@/components/ui';
import { useToast } from '@/components/ui';
import { Lock } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';
import type { ResetPasswordFormData } from './types';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get token from URL query param if available
  const tokenFromUrl = searchParams.get('token') || '';
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: tokenFromUrl,
    },
  });

  // Watch password for strength indicator
  useMemo(() => {
    const subscription = watch((value) => {
      if (value.new_password) {
        setPasswordValue(value.new_password);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    console.log('=== Reset Password Submit Started ===');
    console.log('Form data:', { 
      token: data.token ? `***${data.token.slice(-10)}` : 'empty', 
      tokenLength: data.token?.length,
      hasPassword: !!data.new_password,
      passwordLength: data.new_password?.length 
    });
    
    // Ensure loading state is set
    setIsLoading(true);
    console.log('Loading state set to true');

    try {
      console.log('Calling authService.resetPassword...');
      const response = await authService.resetPassword({
        token: data.token,
        new_password: data.new_password,
      });
      console.log('✓ Response received:', response);

      // Show success toast safely
      try {
        console.log('Showing success toast...');
        toast.success('تم إعادة تعيين كلمة المرور بنجاح', 'يرجى تسجيل الدخول');
      } catch (toastErr) {
        console.error('Toast failed, using alert:', toastErr);
        alert('تم إعادة تعيين كلمة المرور بنجاح. يرجى تسجيل الدخول.');
      }
      
      console.log('Navigating to login...');
      navigate('/login', {
        state: { message: 'تم إعادة تعيين كلمة المرور بنجاح. يرجى تسجيل الدخول.' }
      });
    } catch (err: any) {
      console.error('✗ Error caught:', err);
      console.error('Error details:', {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        status: err?.response?.status,
        data: err?.response?.data,
        config: {
          url: err?.config?.url,
          method: err?.config?.method,
          baseURL: err?.config?.baseURL,
          data: err?.config?.data,
        },
      });
      
      // Extract detailed error message from backend
      let errorMessage = 'حدث خطأ غير متوقع';
      let errorTitle = 'فشل إعادة التعيين';
      
      if (err?.response?.data?.detail) {
        const detail = err.response.data.detail;
        console.log('Backend error detail:', detail);
        
        // Handle different error types
        if (typeof detail === 'string') {
          errorMessage = getAuthErrorMessage(err);
        } else if (Array.isArray(detail)) {
          // Validation errors array
          const firstError = detail[0];
          errorMessage = firstError.msg || firstError.message || 'بيانات غير صحيحة';
          errorTitle = 'خطأ في التحقق';
        } else if (typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      } else if (err?.message) {
        errorMessage = getAuthErrorMessage(err);
      }
      
      console.log('Error message for user:', errorMessage);
      console.log('Error title:', errorTitle);
      
      // Show error toast safely
      try {
        console.log('Showing error toast...');
        toast.error(errorMessage, errorTitle);
      } catch (toastErr) {
        console.error('Toast failed, using alert:', toastErr);
        alert(`${errorTitle}: ${errorMessage}`);
      }
    } finally {
      // Always reset loading state
      console.log('=== Finally Block: Setting loading to false ===');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="كلمة مرور جديدة"
      subtitle="أدخل الرمز وكلمة المرور الجديدة"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="رمز إعادة التعيين"
          placeholder="أدخل الرمز المستلم عبر البريد الإلكتروني"
          error={errors.token}
          {...register('token')}
        />

        <div>
          <Input
            label="كلمة المرور الجديدة"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-5 h-5" />}
            error={errors.new_password}
            {...register('new_password')}
          />
          {passwordValue && (
            <div className="mt-2">
              <PasswordStrength password={passwordValue} />
            </div>
          )}
        </div>

        <Input
          label="تأكيد كلمة المرور الجديدة"
          type="password"
          placeholder="••••••••"
          icon={<Lock className="w-5 h-5" />}
          error={errors.confirm_password}
          {...register('confirm_password')}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          إعادة تعيين كلمة المرور
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm text-primary-600 hover:underline"
        >
          العودة لتسجيل الدخول
        </Link>
      </div>
    </AuthLayout>
  );
};
