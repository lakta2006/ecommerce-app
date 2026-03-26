import { z } from 'zod';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '@/utils/validations';

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export type UserRole = 'customer' | 'store_owner' | 'mall_owner' | 'admin';

export const roleLabels: Record<UserRole, string> = {
  customer: 'زبون',
  store_owner: 'صاحب متجر',
  mall_owner: 'صاحب مول',
  admin: 'مدير',
};
