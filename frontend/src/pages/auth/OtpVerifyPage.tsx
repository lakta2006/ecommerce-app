import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Button, useToast } from '@/components/ui';
import { Shield, Mail } from 'lucide-react';
import { getAuthErrorMessage } from '@/utils/authErrors';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

interface OtpVerifyPageProps {
  /** Type of OTP verification */
  type?: 'email' | 'phone';
  /** Where to redirect after successful verification */
  redirectTo?: string;
}

/**
 * OTP Verification Page
 *
 * Verifies user's email via OTP code and auto-logs them in.
 */
export const OtpVerifyPage: React.FC<OtpVerifyPageProps> = ({
  type = 'email',
  redirectTo = '/',
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { verifyOTP } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [email, setEmail] = useState<string>('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const title = type === 'email' ? 'تحقق من البريد الإلكتروني' : 'تحقق من رقم الهاتف';
  const subtitle = type === 'email'
    ? 'أدخل الرمز المرسل إلى بريدك الإلكتروني'
    : 'أدخل الرمز المرسل إلى رقم هاتفك';

  // Get email from URL query params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // If no email in URL, redirect to register
      toast.error('يرجى التسجيل أولاً');
      navigate('/register');
    }
  }, [searchParams, navigate, toast]);

  // Handle countdown for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (!email) {
      toast.error('البريد الإلكتروني غير موجود');
      return;
    }

    if (otpCode.length !== 6) {
      toast.error('يرجى إدخال الرمز الكامل المكون من ٦ أرقام');
      return;
    }

    setIsLoading(true);

    try {
      // Verify OTP and auto-login
      await verifyOTP(email, otpCode);

      toast.success('تم التحقق بنجاح، جاري تحويلك...');
      
      // Small delay to ensure state is updated
      setTimeout(() => {
        navigate(redirectTo);
      }, 500);
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error(errorMessage, 'فشل التحقق');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) return;

    setIsResending(true);

    try {
      await authService.resendOTP({ email });

      toast.success('تم إعادة إرسال الرمز');
      setCountdown(60); // 60 seconds cooldown
      
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast.error(errorMessage, 'فشل الإرسال');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
            {type === 'email' ? (
              <Mail className="w-8 h-8 text-primary-600" />
            ) : (
              <Shield className="w-8 h-8 text-primary-600" />
            )}
          </div>
        </div>

        {/* Show email being verified */}
        {email && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">جاري التحقق من:</p>
            <p className="font-medium text-gray-900">{email}</p>
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              disabled={isLoading}
            />
          ))}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          isLoading={isLoading}
        >
          تحقق من الرمز
        </Button>

        {/* Resend */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            لم يصلك الرمز؟{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isResending || !email}
              className="text-primary-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending
                ? 'جاري الإرسال...'
                : countdown > 0
                ? `أعد المحاولة خلال ${countdown} ثانية`
                : 'إعادة إرسال الرمز'}
            </button>
          </p>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="text-sm text-primary-600 hover:underline"
        >
          العودة لتسجيل الدخول
        </Link>
      </div>
    </AuthLayout>
  );
};
