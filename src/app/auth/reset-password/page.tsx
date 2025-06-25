// mms-fe/src/app/auth/reset-password/page.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { AuthService } from '@/services/authService';

interface FormData {
  email: string;
  password: string;
  confirm_password: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    email: searchParams?.get('email') || '',
    password: '',
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

    console.log('Reset password form submission started'); // Debug log

    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const token = searchParams?.get('token') || undefined;
      const response = await AuthService.resetPassword({
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        token
      });
      setSuccess(response.message);
      setFormData(prev => ({ ...prev, password: '', confirm_password: '' })); // Clear password fields
    } catch (err: unknown) {
      console.error('Reset password error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      console.log('Reset password form submission completed'); // Debug log
    }
  }, [formData, searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 dark:bg-gray-800/50 z-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
          </div>
        )}
        {/* Title and Links */}
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter a new password for your account.
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

        {/* Reset Password Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} aria-label="Reset password form" noValidate>
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
                  className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                New Password
                <span className="sr-only">(required)</span>
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  aria-describedby={error ? 'error-message' : success ? 'success-message' : undefined}
                  className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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
                  className="block w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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
              className={`flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-500 dark:hover:bg-brand-600 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
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