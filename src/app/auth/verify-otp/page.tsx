"use client";

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMail, FiLock } from 'react-icons/fi';
import { AuthService } from '@/services/authService';

interface FormData {
  email: string;
  otp: string;
}

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    email: searchParams?.get('email') || '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  useEffect(() => {
    // Update email if query parameter changes
    const email = searchParams?.get('email') || '';
    setFormData(prev => ({ ...prev, email }));
  }, [searchParams]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'otp' ? value.replace(/\D/g, '') : value }));
    setError('');
    setSuccess('');
    setResendSuccess('');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Verify OTP form submission started'); // Debug log

    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!/^\d{6}$/.test(formData.otp)) {
      setError('Please enter a 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.verifyOTP(formData.email, formData.otp);
      setSuccess(response.message);
      // Redirect to reset password page with token (if provided)
      console.log('OTP verified, redirecting'); // Debug log
      router.replace(`/auth/reset-password?email=${encodeURIComponent(formData.email)}${response.token ? `&token=${response.token}` : ''}`);
    } catch (err: unknown) {
      console.error('Verify OTP error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      console.log('Verify OTP form submission completed'); // Debug log
    }
  }, [formData.email, formData.otp, router]);

  const handleResendOTP = useCallback(async () => {
    console.log('Resend OTP started'); // Debug log

    setError('');
    setSuccess('');
    setResendSuccess('');
    setResendLoading(true);

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setResendLoading(false);
      return;
    }

    try {
      const response = await AuthService.resendOTP(formData.email);
      setResendSuccess(response.message);
    } catch (err: unknown) {
      console.error('Resend OTP error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setResendLoading(false);
      console.log('Resend OTP completed'); // Debug log
    }
  }, [formData.email]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Title and Links */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Verify OTP
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter the 6-digit code sent to your email.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Return to{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-500 dark:hover:text-brand-400"
            >
              Sign in
            </Link>
            {' '}or{' '}
            <Link
              href="/auth/forgot-password"
              className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-500 dark:hover:text-brand-400"
            >
              Forgot Password
            </Link>
          </p>
        </div>

        {/* Verify OTP Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} aria-label="Verify OTP form" noValidate>
          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            {error && (
              <div
                id="error-message"
                className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/50 dark:text-red-400"
                role="alert"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                id="success-message"
                className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/50 dark:text-green-400"
                role="alert"
              >
                {success}
              </div>
            )}
            {resendSuccess && (
              <div
                id="resend-success-message"
                className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/50 dark:text-green-400"
                role="alert"
              >
                {resendSuccess}
              </div>
            )}

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
                  aria-describedby={error ? 'error-message' : success ? 'success-message' : resendSuccess ? 'resend-success-message' : undefined}
                  className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                OTP Code
                <span className="sr-only">(required)</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  required
                  value={formData.otp}
                  onChange={handleChange}
                  aria-describedby={error ? 'error-message' : success ? 'success-message' : resendSuccess ? 'resend-success-message' : undefined}
                  className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter 6-digit code"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading || loading}
                className={`text-sm font-medium text-brand-600 hover:text-brand-500 dark:text-brand-500 dark:hover:text-brand-400 ${
                  (resendLoading || loading) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {resendLoading ? 'Resending...' : 'Resend OTP'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || resendLoading}
              className={`flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600 ${
                (loading || resendLoading) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}