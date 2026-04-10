import React, { useState, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { updateProfileSchema, changePasswordSchema } from '@/utils/validations';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input, Button, Alert, Card, PasswordStrength } from '@/components/ui';
import { useToast } from '@/components/ui';
import { User as UserIcon, Lock, Camera } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';
import type { UpdateProfileData } from '@/types/auth';
import type { ChangePasswordFormData } from './types';

export const ProfilePage: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const toast = useToast();
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة صالح', 'ملف غير صالح');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('يجب أن يكون حجم الصورة أقل من 5 ميجابايت', 'ملف كبير جداً');
        return;
      }

      setSelectedAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('تم اختيار الصورة بنجاح');
    }
  };

  const onProfileUpdate = async (data: UpdateProfileData) => {
    setIsProfileLoading(true);

    try {
      // TODO: If there's a selected avatar file, upload it first
      // For now, we'll send the profile update with the existing/new avatar URL
      // The backend integration for file upload will be added later
      const updatedUser = await authService.updateProfile(data);
      updateUser(updatedUser);
      toast.success('تم تحديث الملف الشخصي بنجاح');
      
      // Reset avatar states after successful update
      if (selectedAvatarFile) {
        setSelectedAvatarFile(null);
      }
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error(errorMessage, 'فشل التحديث');
    } finally {
      setIsProfileLoading(false);
    }
  };

  const onPasswordChange = async (data: ChangePasswordFormData) => {
    setIsPasswordLoading(true);

    try {
      await authService.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success('تم تغيير كلمة المرور بنجاح');
      resetPassword();
      setShowPasswordForm(false);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error(errorMessage, 'فشل تغيير كلمة المرور');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('تم تسجيل الخروج بنجاح');
  };

  if (!user) {
    return (
      <AuthLayout title="الملف الشخصي" subtitle="يجب تسجيل الدخول أولاً">
        <Alert variant="warning">
          يرجى تسجيل الدخول للوصول إلى الملف الشخصي
        </Alert>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="الملف الشخصي" subtitle="إدارة معلومات حسابك">
      <div className="space-y-6">
        {/* User Info Display */}
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-8 h-8 text-primary-600" />
                )}
              </div>
              {/* Camera Icon Overlay */}
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white">
                <Camera className="w-3 h-3 text-white" />
              </div>
              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
            </div>
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate">{user.name}</h3>
              <p className="text-gray-500 text-sm truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded">
                  {user.role === 'customer' && 'زبون'}
                  {user.role === 'store_owner' && 'صاحب متجر'}
                  {user.role === 'mall_owner' && 'صاحب مول'}
                  {user.role === 'admin' && 'مدير'}
                </span>
                {user.is_verified && (
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    موثق
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Profile Form */}
        <Card title="تعديل المعلومات الشخصية">
          <form onSubmit={handleProfileSubmit(onProfileUpdate)} className="space-y-4">
            <Input
              label="الاسم"
              placeholder="الاسم"
              error={profileErrors.name}
              {...registerProfile('name')}
            />

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                isLoading={isProfileLoading}
              >
                حفظ التغييرات
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => resetProfile()}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Section */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5" />
              كلمة المرور
            </h3>
            {!showPasswordForm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(true)}
              >
                تغيير كلمة المرور
              </Button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-4">
              <Input
                label="كلمة المرور الحالية"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.current_password}
                {...registerPassword('current_password')}
              />

              <div>
                <Input
                  label="كلمة المرور الجديدة"
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.new_password}
                  {...registerPassword('new_password')}
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
                error={passwordErrors.confirm_password}
                {...registerPassword('confirm_password')}
              />

              <div className="flex gap-2">
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
                    resetPassword();
                    setPasswordValue('');
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Danger Zone */}
        <Card>
          <h3 className="text-lg font-semibold text-red-600 mb-4">منطقة الخطر</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">تسجيل الخروج</p>
                <p className="text-sm text-gray-500">
                  تسجيل الخروج من حسابك الحالي
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};
