import { create } from 'zustand';
import { authService } from '@/services/authService';
import type { User, UserRole } from '@/types/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; name: string; phone?: string; password: string; role?: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  verifyOTP: (email: string, otpCode: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.login({ email, password });
      const user = await authService.getCurrentUser();

      // Check if user is verified (DISABLED FOR TESTING - set to false to re-enable)
      const REQUIRE_EMAIL_VERIFICATION = false; // Set to true to enforce email verification
      if (REQUIRE_EMAIL_VERIFICATION && !user.is_verified) {
        // Clear tokens and redirect to verification
        authService.clearTokens();
        throw new Error('EMAIL_NOT_VERIFIED');
      }

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      // Handle unverified email case
      if (error.message === 'EMAIL_NOT_VERIFIED') {
        throw {
          response: {
            data: {
              detail: 'يرجى التحقق من بريدك الإلكتروني أولاً. تم إرسال رمز التحقق إلى بريدك.'
            }
          }
        };
      }

      const errorMessage = error.response?.data?.detail || 'فشل تسجيل الدخول';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },

  register: async (data: { email: string; name: string; phone?: string; password: string; role?: UserRole }) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      // Note: No auto-login anymore - user must verify email first
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'فشل التسجيل';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.clearTokens();
      set({ user: null, isAuthenticated: false, error: null });
    }
  },

  updateUser: (user: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...user } });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false });
      return;
    }

    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  },

  verifyOTP: async (email: string, otpCode: string) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyOTP({ email, otp_code: otpCode });
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'فشل التحقق';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },
}));
