import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import { changePasswordSchema } from '@/utils/validations';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input, Button, Card, PasswordStrength } from '@/components/ui';
import { useToast } from '@/components/ui';
import { Lock } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';
import type { ChangePasswordData } from '@/types/auth';

type ChangePasswordFormData = ChangePasswordData & {
  confirm_password: string;
};

export const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useMemo(() => {
    const subscription = watch((value) => {
      if (value.new_password) {
        setPasswordValue(value.new_password);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('تم تغيير كلمة المرور بنجاح');
      reset();
      setShowForm(false);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error(errorMessage, 'فشل تغيير كلمة المرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="كلمة المرور والأمان"
      subtitle=""
      onBack={() => navigate('/settings')}
    >
      <div className="space-y-3">
        <Card>
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="w-full">
              تغيير كلمة المرور
            </Button>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="كلمة المرور الحالية"
                type="password"
                placeholder="أدخل كلمة المرور الحالية"
                showPasswordToggle
                error={errors.current_password}
                {...register('current_password')}
              />

              <div>
                <Input
                  label="كلمة المرور الجديدة"
                  type="password"
                  placeholder="أدخل كلمة المرور الجديدة"
                  showPasswordToggle
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
                placeholder="أعد إدخال كلمة المرور الجديدة"
                showPasswordToggle
                error={errors.confirm_password}
                {...register('confirm_password')}
              />

              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400"
              >
                نسيت كلمة المرور
              </button>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isLoading}
                >
                  تأكيد التغيير
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                    setPasswordValue('');
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </AuthLayout>
  );
};
