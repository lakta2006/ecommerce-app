import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { updateProfileSchema } from '@/utils/validations';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Input, Button, Card } from '@/components/ui';
import { useToast } from '@/components/ui';
import { User as UserIcon, Camera } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';
import type { UpdateProfileData } from '@/types/auth';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      avatar: user?.avatar || '',
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة صالح', 'ملف غير صالح');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        // Update the form value with the base64 string
        setValue('avatar', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: UpdateProfileData) => {
    setIsLoading(true);

    try {
      const updatedUser = await authService.updateProfile(data);
      updateUser(updatedUser);
      toast.success('تم تحديث الملف الشخصي بنجاح');
      
      // Reset form with new data
      reset({
        name: updatedUser.name,
        avatar: updatedUser.avatar || '',
      });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error(errorMessage, 'فشل التحديث');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <AuthLayout title="تعديل المعلومات" subtitle="يجب تسجيل الدخول أولاً">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">يرجى تسجيل الدخول أولاً</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            تسجيل الدخول
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="تعديل المعلومات الشخصية"
      subtitle="تحديث معلومات حسابك الشخصي"
      onBack={() => navigate('/settings')}
    >
      <div className="space-y-6">
        {/* Avatar Section */}
        <Card>
          <div className="flex flex-col items-center">
            <div
              className="relative cursor-pointer group mb-4"
              onClick={handleAvatarClick}
            >
              <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-primary-600 dark:text-primary-400" />
                )}
              </div>
              {/* Camera Icon Overlay */}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg group-hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </div>
              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              انقر على الصورة لتغييرها
            </p>
          </div>
        </Card>

        {/* Edit Form */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="الاسم"
              placeholder="أدخل اسمك"
              error={errors.name}
              {...register('name')}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" isLoading={isLoading}>
                حفظ التغييرات
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/settings')}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Card>

        {/* Info Card */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">ملاحظة</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                لتغيير البريد الإلكتروني، يرجى التواصل مع دعم العملاء
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};
