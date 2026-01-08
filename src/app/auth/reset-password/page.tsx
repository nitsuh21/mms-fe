// mms-fe/src/app/auth/reset-password/page.tsx
"use client";

import { useState, useCallback, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiKey } from 'react-icons/fi';
import { AuthService } from '@/services/authService';
import { motion } from 'framer-motion';

interface FormData {
  email: string;
  otp_code: string;
  new_password: string;
  confirm_password: string;
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    email: searchParams?.get('email') || '',
    otp_code: '',
    new_password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Update email if query parameter changes
    const email = searchParams?.get('email') || '';
    setFormData(prev => ({ ...prev, email }));
  }, [searchParams]);

  useEffect(() => {
    // Clear success message after 5 seconds and redirect to sign-in
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
        router.replace('/auth/signin');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Reset password form submission started');

    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (!formData.otp_code || formData.otp_code.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      setLoading(false);
      return;
    }
    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.resetPassword({
        email: formData.email,
        otp_code: formData.otp_code,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      setSuccess(response.message);
      setFormData(prev => ({ ...prev, new_password: '', confirm_password: '', otp_code: '' })); // Clear sensitive fields
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      console.log('Reset password form submission completed');
    }
  }, [formData, searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 relative overflow-hidden">
      {/* Logo in top left corner */}
      <Link href="/" className="absolute top-10 left-10 z-50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center"
        >
          <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="ml-2 text-xl font-bold text-gray-800">Eytta</span>
        </motion.div>
      </Link>

      <div className="w-full max-w-md space-y-8 bg-white rounded-3xl shadow-lg p-8 relative overflow-hidden z-10">
        {/* Decorative Elements */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-100 blur-3xl" />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-20 rounded-3xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}
        
        {/* Title and Links */}
        <div className="text-center relative z-20">
          <FiLock className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter the OTP code and your new password
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Return to{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
            >
              Sign in
            </Link>
            {' '}or{' '}
            <Link
              href="/auth/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline"
            >
              Forgot Password
            </Link>
          </p>
        </div>

        {/* Reset Password Form */}
        <form className="mt-6 space-y-6" onSubmit={handleSubmit} aria-label="Reset password form" noValidate>
          <div className="space-y-4 rounded-xl bg-white p-6 shadow-sm ">
            {error && (
              <div
                id="error-message"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200 shadow-sm"
                role="alert"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                id="success-message"
                className="rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-200 shadow-sm"
                role="alert"
              >
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
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
                  className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="otp_code"
                className="block text-sm font-medium text-gray-700"
              >
                OTP Code
                <span className="sr-only">(required)</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiKey className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp_code"
                  name="otp_code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={formData.otp_code}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="new_password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
                <span className="sr-only">(required)</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="new_password"
                  name="new_password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.new_password}
                  onChange={handleChange}
                  aria-describedby={error ? 'error-message' : success ? 'success-message' : undefined}
                  className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
                <span className="sr-only">(required)</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                  aria-describedby={error ? 'error-message' : success ? 'success-message' : undefined}
                  className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`flex w-full justify-center rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
              }`}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}