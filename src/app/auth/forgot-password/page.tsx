// mms-fe/src/app/auth/forgot-password/page.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import { AuthService } from '@/services/authService';

interface FormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({ email: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData({ email: value });
    setError(''); // Clear error on input change
    setSuccess(''); // Clear success message on input change
    setResendSuccess(''); // Clear resend success
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Forgot password form submission started');

    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.forgotPassword(formData.email);
      setSuccess('An OTP has been sent to your email. Please check your inbox.');
      setIsSubmitted(true);
      console.log('Redirecting to verify OTP page');
      router.replace(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: unknown) {
      console.error('Forgot password error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      console.log('Forgot password form submission completed');
    }
  }, [formData.email, router]);

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
      const response = await AuthService.forgotPassword(formData.email); // Reuse forgotPassword for resend
      console.log('Resend OTP response:', response);
      setResendSuccess('OTP resent successfully');
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

  // Clear success or resendSuccess message after 5 seconds
  useEffect(() => {
    if (success || resendSuccess) {
      const timer = setTimeout(() => {
        setSuccess('');
        setResendSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, resendSuccess]);

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
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email address to receive a one-time password (OTP).
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-500 dark:hover:text-brand-400 transition-colors duration-200 hover:underline"
            >
              Sign in
            </Link>
            {' '}or{' '}
            <Link
              href="/auth/signup"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-500 dark:hover:text-brand-400 transition-colors duration-200 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit} aria-label="Forgot password form" noValidate>
          <div className="space-y-4 rounded-xl bg-white/90 dark:bg-gray-800/90 p-6 shadow-md">
            {error && (
              <div
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200/50 dark:border-red-800/50 shadow-sm"
                role="alert"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200/50 dark:border-green-800/50 shadow-sm"
                role="alert"
              >
                {success}
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

            {!isSubmitted ? (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email address
                  <span className="sr-only">(required)</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    aria-describedby={error ? 'error-message' : success ? 'success-message' : undefined}
                    className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  OTP sent to:
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {formData.email}
                </p>
              </div>
            )}

            {!isSubmitted ? (
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:from-brand-500 dark:to-brand-600 dark:hover:from-brand-600 dark:hover:to-brand-700 transition-all duration-200 ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                }`}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            ) : (
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
                  type="button"
                  onClick={() => router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`)}
                  disabled={loading || resendLoading}
                  className={`flex items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-medium text-white hover:from-brand-700 hover:to-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:from-brand-500 dark:to-brand-600 dark:hover:from-brand-600 dark:hover:to-brand-700 transition-all duration-200 ${
                    (loading || resendLoading) ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                  }`}
                >
                  Verify OTP <FiArrowRight className="ml-1" />
                </button>
              </div>
            )}
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