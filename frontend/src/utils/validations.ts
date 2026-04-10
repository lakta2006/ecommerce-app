import { z } from 'zod';

// Password strength validation regex patterns
const passwordStrengthRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /\d/,
  special: /[!@#$%^&*(),.?":{}|<>]/,
};

export const validatePasswordStrength = (password: string): string | null => {
  if (password.length < 8) {
    return 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل';
  }
  if (!passwordStrengthRegex.uppercase.test(password)) {
    return 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
  }
  if (!passwordStrengthRegex.lowercase.test(password)) {
    return 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل';
  }
  if (!passwordStrengthRegex.digit.test(password)) {
    return 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
  }
  if (!passwordStrengthRegex.special.test(password)) {
    return 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل';
  }
  return null;
};

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل'),
  confirmPassword: z.string(),
  role: z.enum(['customer', 'store_owner', 'mall_owner', 'admin']).optional(),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  })
  .superRefine((data, ctx) => {
    const passwordError = validatePasswordStrength(data.password);
    if (passwordError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: passwordError,
        path: ['password'],
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'الرمز مطلوب'),
  new_password: z.string().min(8, 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل'),
  confirm_password: z.string(),
})
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirm_password'],
  })
  .superRefine((data, ctx) => {
    const passwordError = validatePasswordStrength(data.new_password);
    if (passwordError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: passwordError,
        path: ['new_password'],
      });
    }
  });

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').optional(),
  phone: z.string().optional().or(z.literal('')),
  avatar: z.string().url('رابط الصورة غير صحيح').optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  new_password: z.string().min(8, 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل'),
  confirm_password: z.string(),
})
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirm_password'],
  })
  .superRefine((data, ctx) => {
    const passwordError = validatePasswordStrength(data.new_password);
    if (passwordError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: passwordError,
        path: ['new_password'],
      });
    }
  });
