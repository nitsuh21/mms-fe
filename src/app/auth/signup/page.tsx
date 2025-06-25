"use client";

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiUser, FiBriefcase, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

import { motion, cubicBezier } from 'framer-motion';
import { AuthService } from '@/services/authService';
import { SignUpData } from '@/types/auth';

interface FormData extends SignUpData {}


const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: cubicBezier(0.16, 1, 0.3, 1),
      staggerChildren: 0.1
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5, 
      ease: cubicBezier(0.34, 1.56, 0.64, 1)
    } 
  },
};

const buttonVariants = {
  hover: { 
    scale: 1.03, 
    boxShadow: '0 5px 20px rgba(59, 130, 246, 0.5)',
    background: 'linear-gradient(to right, #3b82f6, #6366f1)',
    transition: { 
      duration: 0.3,
      ease: cubicBezier(0.42, 0, 0.58, 1)
    } 
  },
  tap: { scale: 0.98 },
};
export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [businessName, setBusinessName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.getElementById('first_name')?.focus();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'businessName') {
      setBusinessName(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

    console.log('Sign up form submission started');

    setError('');
    setSuccess('');
    setLoading(true);

    if (!/^[A-Za-z\s]+$/.test(formData.first_name.trim())) {
      setError('First name must contain only letters and spaces');
      setLoading(false);
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(formData.last_name.trim())) {
      setError('Last name must contain only letters and spaces');
      setLoading(false);
      return;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (formData.password.length < 8 || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError('Password must be at least 8 characters, include an uppercase letter and a number');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const signUpData = {
        ...formData,
        business_name: businessName.trim() || undefined,
      };
      const response = await AuthService.signUp(signUpData);
      setFormData(prev => ({ ...prev, id: response.user.id }));
      setSuccess('Account created successfully! Redirecting to dashboard...');
      setTimeout(() => router.push('/merchant-portal'), 2000); // Redirect after 2s
    } catch (err: unknown) {
      console.error('Sign up error in frontend:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      console.log('Sign up form submission completed');
    }
  }, [formData, businessName, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-12 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-brand-500/20 blur-md animate-float-1" />
        <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-brand-600/15 blur-md animate-float-2" />
        <div className="absolute bottom-1/4 right-1/3 w-10 h-10 rounded-full bg-brand-400/15 blur-md animate-float-3" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <motion.div 
        className="w-full max-w-md space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {loading && (
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm z-20 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
              <motion.p 
                className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Creating your account...
              </motion.p>
            </div>
          </motion.div>
        )}

        <div className="text-center">
          <motion.h2 
            className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
            variants={itemVariants}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-brand-700">
              Join Our Community
            </span>
          </motion.h2>
          <motion.p 
            className="mt-3 text-sm text-gray-600 dark:text-gray-400"
            variants={itemVariants}
          >
            Already have an account?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200 hover:underline"
            >
              Sign in
            </Link>
          </motion.p>
        </div>

        <motion.div 
          className="space-y-6 rounded-2xl bg-white/95 dark:bg-gray-800/95 p-8 shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-md"
          variants={itemVariants}
          whileHover={{ 
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            transition: { duration: 0.3 }
          }}
        >
          {error && (
            <motion.div
              id="error-message"
              className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200/50 dark:border-red-800/50"
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              id="success-message"
              className="rounded-lg bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-900/20 dark:text-green-300 border border-green-200/50 dark:border-green-800/50"
              role="alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {success}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit} aria-label="Sign up form" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  First Name
                  <span className="text-red-500"> *</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    aria-describedby={error ? 'error-message' : success ? 'success-message' : undefined}
                    className="block w-full rounded-lg border border-gray-300 bg-white/90 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-700/90 dark:text-white dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                    placeholder="First name"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Last Name
                  <span className="text-red-500"> *</span>
                </label>
                <div className="relative mt-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    aria-describedby={error ? 'error-message' : success ? 'success-message' : undefined}
                    className="block w-full rounded-lg border border-gray-300 bg-white/90 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-700/90 dark:text-white dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                    placeholder="Last name"
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                Email address
                <span className="text-red-500"> *</span>
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
                  className="block w-full rounded-lg border border-gray-300 bg-white/90 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-700/90 dark:text-white dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  placeholder="Enter your email"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label
                htmlFor="businessName"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
              >
                Business Name (Optional)
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiBriefcase className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={businessName}
                  onChange={handleChange}
                  aria-describedby={error ? 'error-message' : success ? 'success-message' : undefined}
                  className="block w-full rounded-lg border border-gray-300 bg-white/90 pl-10 pr-3 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-700/90 dark:text-white dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  placeholder="Enter your business name (optional)"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password
                  <span className="text-red-500"> *</span>
                </label>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
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
                  className="block w-full rounded-lg border border-gray-300 bg-white/90 pl-10 pr-10 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-700/90 dark:text-white dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Must be at least 8 characters with a number and uppercase letter
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Confirm Password
                  <span className="text-red-500"> *</span>
                </label>
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200"
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
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
                  className="block w-full rounded-lg border border-gray-300 bg-white/90 pl-10 pr-10 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-gray-600 dark:bg-gray-700/90 dark:text-white dark:placeholder-gray-400 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500 transition-colors duration-200"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              className={`group flex w-full justify-center rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-3 text-sm font-semibold text-white hover:from-brand-700 hover:to-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:from-brand-500 dark:to-brand-600 dark:hover:from-brand-600 dark:hover:to-brand-700 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              } transition-all duration-300`}
            >
              <span className="flex items-center">
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && (
                  <FiArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                )}
              </span>
            </motion.button>
          </form>
        </motion.div>

        <motion.div 
          className="text-center text-xs text-gray-500 dark:text-gray-400"
          variants={itemVariants}
        >
          By signing up, you agree to our{' '}
          <Link href="/terms" className="hover:underline text-brand-600 dark:text-brand-400">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:underline text-brand-600 dark:text-brand-400">
            Privacy Policy
          </Link>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, 10px); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, 15px); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(5px, -10px); }
        }
        .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 12s ease-in-out infinite; }
      `}</style>
    </div>
  );
}