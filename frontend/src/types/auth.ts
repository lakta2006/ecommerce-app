export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  avatar?: string;
  created_at: string;
  last_login?: string;
}

export type UserRole = 'customer' | 'store_owner' | 'mall_owner' | 'admin';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  new_password: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// OTP Verification types
export interface SendOTPData {
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp_code: string;
}

export interface ResendOTPData {
  email: string;
}

export interface OTPResponse {
  message: string;
  expires_in_seconds?: number;
}
