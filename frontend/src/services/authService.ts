import api from './api';
import type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  UpdateProfileData,
  ChangePasswordData,
  SendOTPData,
  VerifyOTPData,
  ResendOTPData,
  OTPResponse,
} from '@/types/auth';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<User> {
    console.log('[authService] register called with:', { email: data.email });
    const response = await api.post('/api/auth/register', data);
    console.log('[authService] register response:', response.data);
    return response.data;
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    console.log('[authService] login called with:', { email: credentials.email });
    const formData = new FormData();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('[authService] login response received');
    // Store tokens
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);

    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    console.log('[authService] logout called');
    const refreshToken = localStorage.getItem('refresh_token');
    await api.post('/api/auth/logout', { refresh_token: refreshToken });

    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<User> {
    console.log('[authService] getCurrentUser called');
    const response = await api.get('/api/auth/me');
    console.log('[authService] getCurrentUser response:', response.data);
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    console.log('[authService] updateProfile called');
    const response = await api.put('/api/profile', data);
    console.log('[authService] updateProfile response:', response.data);
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    console.log('[authService] changePassword called');
    const response = await api.put('/api/profile/password', data);
    console.log('[authService] changePassword response:', response.data);
    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string; reset_token?: string }> {
    console.log('[authService] forgotPassword called with:', { email: data.email });
    const response = await api.post('/api/auth/forgot-password', data);
    console.log('[authService] forgotPassword response:', response.data);
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    console.log('[authService] resetPassword called with:', { 
      token: data.token ? `***${data.token.slice(-10)}` : 'empty',
      tokenLength: data.token?.length,
      hasPassword: !!data.new_password,
      passwordLength: data.new_password?.length,
      fullToken: data.token, // Log full token for debugging
    });
    const response = await api.post('/api/auth/reset-password', data);
    console.log('[authService] resetPassword response:', response.data);
    return response.data;
  },

  /**
   * Send OTP for email verification
   */
  async sendOTP(data: SendOTPData): Promise<OTPResponse> {
    console.log('[authService] sendOTP called with:', { email: data.email });
    const response = await api.post('/api/auth/send-otp', data);
    console.log('[authService] sendOTP response:', response.data);
    return response.data;
  },

  /**
   * Verify OTP and auto-login
   */
  async verifyOTP(data: VerifyOTPData): Promise<AuthTokens> {
    console.log('[authService] verifyOTP called with:', { email: data.email });
    const response = await api.post('/api/auth/verify-otp', data);

    // Store tokens for auto-login
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);

    console.log('[authService] verifyOTP response received');
    return response.data;
  },

  /**
   * Resend OTP
   */
  async resendOTP(data: ResendOTPData): Promise<OTPResponse> {
    console.log('[authService] resendOTP called with:', { email: data.email });
    const response = await api.post('/api/auth/resend-otp', data);
    console.log('[authService] resendOTP response:', response.data);
    return response.data;
  },

  /**
   * Clear tokens (for client-side logout)
   */
  clearTokens(): void {
    console.log('[authService] clearTokens called');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};
