import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authService } from '@/services/authService';
import { changePasswordSchema } from '@/utils/validations';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input, Button, Card, PasswordStrength } from '@/components/ui';
import { useToast } from '@/components/ui';
import { Lock, Mail, Shield, AlertTriangle } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';
import type { ChangePasswordData } from '@/types/auth';

type ChangePasswordFormData = ChangePasswordData & {
  confirm_password: string;
};

export const SecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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
    setIsPasswordLoading(true);

    try {
      await authService.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('تم تغيير كلمة المرور بنجاح');
      reset();
      setShowPasswordForm(false);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error(errorMessage, 'فشل تغيير كلمة المرور');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <AuthLayout
      title="كلمة المرور والأمان"
      subtitle="إدارة كلمة المرور وإعدادات الأمان"
      onBack={() => navigate('/settings')}
    >
      <div className="space-y-4">
        {/* Change Password Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold dark:text-gray-100">تغيير كلمة المرور</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  تحديث كلمة المرور الحالية
                </p>
              </div>
            </div>
          </div>

          {!showPasswordForm ? (
            <Button onClick={() => setShowPasswordForm(true)} className="w-full">
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

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={isPasswordLoading}
                >
                  تأكيد التغيير
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPasswordForm(false);
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

        {/* Forgot Password Section */}
        <Card>
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold dark:text-gray-100">نسيت كلمة المرور؟</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                إذا نسيت كلمة المرور الحالية، يمكنك إعادة تعيينها عبر البريد
                الإلكتروني
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleForgotPassword}
            className="w-full"
          >
            <Mail className="w-4 h-4 ml-2" />
            إعادة تعيين كلمة المرور
          </Button>
        </Card>

        {/* Security Tips */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">نصائح الأمان</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span>استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span>لا تشارك كلمة المرور مع أي شخص</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span>قم بتغيير كلمة المرور بشكل دوري</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                  <span>تجنب استخدام نفس كلمة المرور في حسابات متعددة</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};
