"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

interface FormData {
  email: string;
  otp: string[];
}

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: searchParams?.get('email') || '',
    otp: Array(6).fill('')
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const otpInputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    // Update email if query parameter changes
    const email = searchParams?.get('email') || '';
    setFormData(prev => ({ ...prev, email }));
    console.log('Email updated to:', email);
  }, [searchParams]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(prev => ({ ...prev, otp: newOtp }));
    setError('');
    setSuccess('');
    setResendSuccess('');

    // Auto focus to next input
    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pasteData.length === 6) {
      const newOtp = pasteData.split('');
      setFormData(prev => ({ ...prev, otp: newOtp }));
      if (otpInputRefs.current[5]) {
        otpInputRefs.current[5].focus();
      }
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const otpString = formData.otp.join('');
    console.log('Verify OTP form submission started');
    console.log('Submitting with:', { email: formData.email, otp: otpString, purpose: 'login' });

    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (otpString.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.verifyOTP(formData.email, otpString, 'login');
      console.log('OTP verification response:', response);

      if ('access' in response && 'refresh' in response && 'user' in response) {
        const { user, access, refresh } = response;

        // Validate user object
        if (!user || typeof user !== 'object' || !user.id) {
          throw new Error('User data is missing or invalid');
        }

        // Store tokens and user info
        const userData = {
          ...user,
          id: Number(user.id)
        };
        if (refresh) {
          localStorage.setItem('refreshToken', refresh);
        }
        login(access, userData);

        // Redirect to dashboard
        const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || '/merchant-portal';
        console.log('Redirecting to dashboard:', user.id ? `${DASHBOARD_URL}/${user.id}/platform/dashboard` : DASHBOARD_URL);
        router.push(
          user.id
            ? `${DASHBOARD_URL}/${user.id}/platform/dashboard`
            : DASHBOARD_URL
        );
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data: any; headers: any } };
      console.error('Verify OTP error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        } : 'No response data',
      });
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      console.log('Verify OTP form submission completed');
    }
  }, [formData.email, formData.otp, router, login]);

  const handleResendOTP = useCallback(async () => {
    console.log('Resend OTP button clicked, email:', formData.email);

    setError('');
    setSuccess('');
    setResendSuccess('');
    setResendLoading(true);

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setResendLoading(false);
      console.log('Resend failed: Invalid email');
      return;
    }

    try {
      console.log('Attempting to resend OTP for:', formData.email);
      const response = await AuthService.resendOTP(formData.email);
      console.log('Resend OTP response:', response);
      setResendSuccess(response.message || 'OTP resent successfully');
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data: any; headers: any } };
      console.error('Resend OTP error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        } : 'No response data',
      });
      setError(error instanceof Error ? error.message : 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
      console.log('Resend OTP process completed');
    }
  }, [formData.email]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-12 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-brand-600/20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-purple-500/20 animate-pulse delay-1000" />
        <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="2" />
          <path d="M0,50 Q25,100 50,50 T100,50" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="2" />
        </svg>
      </div>

      <div className="w-full max-w-md space-y-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 relative overflow-hidden z-10">
        {/* Decorative Elements */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-600/15 blur-3xl animate-spin-slow" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl animate-spin-slow delay-1000" />

        <div className="text-center relative z-20">
          <FiMail className="mx-auto h-12 w-12 text-brand-600 animate-pulse-slow" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 dark:text-white">
            Verify OTP with <span className="text-brand-600 dark:text-brand-500">X</span>
          </h2>
          
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Code sent to:
            </p>
            <p className="font-medium text-gray-900 dark:text-white mt-1">
              {formData.email}
            </p>
          </div>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Return to{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-500 dark:hover:text-brand-400 transition-colors duration-200 hover:underline"
            >
              Sign in
            </Link>
            {' '}or{' '}
            <Link
              href="/auth/forgot-password"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-500 dark:hover:text-brand-400 transition-colors duration-200 hover:underline"
            >
              Forgot Password
            </Link>
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit} onPaste={handlePaste}>
          <div className="space-y-4 rounded-xl bg-white/90 dark:bg-gray-800/90 p-6 shadow-md">
            {error && (
              <div
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200/50 dark:border-red-800/50 shadow-sm"
                role="alert"
              >
                {error}
              </div>
            )}
            {resendSuccess && (
              <div
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200/50 dark:border-green-800/50 shadow-sm"
                role="alert"
              >
                {resendSuccess}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter 6-digit code
              </label>
              <div className="flex justify-between space-x-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    ref={el => { if (el) otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={formData.otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-full h-14 text-center text-2xl font-semibold rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading || loading}
                className={`text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-500 dark:hover:text-brand-400 transition-colors duration-200 ${
                  (resendLoading || loading) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {resendLoading ? 'Resending...' : 'Resend code'}
              </button>
              <button
                type="submit"
                disabled={loading || resendLoading}
                className={`flex items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-200 ${
                  (loading || resendLoading) ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                }`}
              >
                {loading ? 'Verifying...' : (
                  <>
                    Verify <FiArrowRight className="ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-spin-slow { animation: spin-slow 15s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}