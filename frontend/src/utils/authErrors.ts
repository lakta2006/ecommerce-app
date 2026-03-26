/**
 * Map backend auth error codes to user-friendly Arabic messages
 */

interface ErrorMapping {
  [key: number]: string;
  [key: string]: string;
}

const authErrorMessages: ErrorMapping = {
  // HTTP 400 - Bad Request
  '400': 'بيانات غير صحيحة، يرجى التحقق من المدخلات',
  'Email already registered': 'البريد الإلكتروني مسجل مسبقاً',
  'Phone number already registered': 'رقم الهاتف مسجل مسبقاً',
  'Invalid or expired reset token': 'رمز إعادة التعيين غير صحيح أو منتهي الصلاحية',
  'Reset token has expired': 'انتهت صلاحية رمز إعادة التعيين',
  'User not found or inactive': 'المستخدم غير موجود أو الحساب معطل',

  // HTTP 401 - Unauthorized
  '401': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'Incorrect email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'Invalid refresh token': 'رمز التحديث غير صحيح',
  'Refresh token has been revoked or expired': 'رمز التحديث ملغٍ أو منتهي الصلاحية',
  'Could not validate credentials': 'تعذر التحقق من الهوية',

  // HTTP 403 - Forbidden
  '403': 'ليس لديك الصلاحية للوصول',
  'User account is deactivated': 'حساب المستخدم معطل',
  'Inactive user': 'الحساب غير نشط',
  'Not enough permissions': 'ليس لديك الصلاحية الكافية',

  // HTTP 422 - Unprocessable Entity (Validation Error)
  '422': 'بيانات غير صحيحة، يرجى التحقق من المدخلات',

  // HTTP 423 - Locked
  '423': 'تم قفل الحساب بسبب محاولات كثيرة فاشلة',
  'Account is locked due to too many failed attempts': 'تم قفل الحساب بسبب محاولات كثيرة فاشلة',

  // Password validation errors
  'Password must be at least 8 characters long': 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل',
  'Password must contain at least one uppercase letter': 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل',
  'Password must contain at least one lowercase letter': 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل',
  'Password must contain at least one digit': 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل',
  'Password must contain at least one special character': 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل',

  // Generic errors
  'Network Error': 'خطأ في الاتصال، يرجى التحقق من الإنترنت',
  'Request failed with status code 500': 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
};

/**
 * Get user-friendly error message from backend error
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) {
    return 'حدث خطأ غير متوقع';
  }

  // Check for network error
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return authErrorMessages['Network Error'];
  }

  // Check response error from Axios
  let detail = error.response?.data?.detail;
  const status = error.response?.status;

  // Handle HTTP 422 - Validation Error
  if (status === 422) {
    // If detail is an array of errors, extract the first message
    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0];
      const msg = firstError.msg || firstError.message || '';
      if (msg) {
        // Map common validation errors to Arabic messages
        if (msg.includes('email') || msg.includes('Email')) {
          return 'البريد الإلكتروني غير صحيح';
        }
        if (msg.includes('password') || msg.includes('Password')) {
          return 'كلمة المرور غير صحيحة';
        }
        if (msg.includes('token') || msg.includes('Token')) {
          return 'الرمز غير صحيح';
        }
        return msg;
      }
    }
    // If detail is an object with msg property
    else if (detail && typeof detail === 'object') {
      const objDetail = detail as Record<string, unknown>;
      const msg = objDetail.msg || objDetail.message || '';
      if (msg && typeof msg === 'string') {
        return msg;
      }
    }
    // No specific detail, use generic 422 message
    return authErrorMessages['422'];
  }

  // Handle other error objects
  if (detail && typeof detail === 'object') {
    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0];
      if (firstError.msg) {
        detail = firstError.msg;
      } else if (firstError.message) {
        detail = firstError.message;
      }
    }
    else if (detail.msg) {
      detail = detail.msg;
    }
    else if (detail.message) {
      detail = detail.message;
    }
    else {
      detail = JSON.stringify(detail);
    }
  }

  if (detail) {
    // Check for exact match first
    if (authErrorMessages[detail]) {
      return authErrorMessages[detail];
    }

    // Check for account locked with timestamp
    if (detail.includes('Account is locked')) {
      const match = detail.match(/after (.+?)$/);
      if (match) {
        return `تم قفل الحساب حتى ${match[1]}`;
      }
      return authErrorMessages['423'];
    }

    // Check for role-based errors
    if (detail.includes('role')) {
      return `ليس لديك الصلاحية الكافية (${detail})`;
    }

    // Return detail as string
    return String(detail);
  }

  // Check status code
  if (status && authErrorMessages[status]) {
    return authErrorMessages[status];
  }

  // Generic message
  return 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً';
}

/**
 * Get success message for auth actions
 */
export function getAuthSuccessMessage(action: string): string {
  const messages: Record<string, string> = {
    login: 'تم تسجيل الدخول بنجاح',
    register: 'تم إنشاء الحساب بنجاح',
    logout: 'تم تسجيل الخروج بنجاح',
    passwordReset: 'تم إعادة تعيين كلمة المرور بنجاح',
    passwordChanged: 'تم تغيير كلمة المرور بنجاح',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
    forgotPassword: 'تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني',
  };

  return messages[action] || 'تمت العملية بنجاح';
}
