"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiClock, FiHeadphones, FiLink, FiArrowRight } from 'react-icons/fi';
import { motion, cubicBezier } from 'framer-motion';
import { AuthService } from '@/services/authService';

interface FormData {
  email: string;
  password: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      ease: cubicBezier(0.16, 1, 0.3, 1) // equivalent to 'easeOut'
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.5, 
      delay: 0.2,
      ease: cubicBezier(0.42, 0, 0.58, 1) // equivalent to 'easeInOut'
    } 
  },
};

const featureCardVariants = {
  hover: { 
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { 
      duration: 0.3,
      ease: cubicBezier(0.42, 0, 0.58, 1) // equivalent to 'easeInOut'
    }
  }
};

export default function SignInPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic client-side validation
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    if (formData.password.length < 5) {
      setError('Password must be at least 5 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.signIn({ email: formData.email, password: formData.password, remember_me: rememberMe });
      console.log('Initial sign-in response:', response);

      if (response.require_otp) {
        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError('Unexpected response: OTP not required but no user data');
      }
    } catch (err: unknown) {
      console.error('Signin error details:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-12 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-24 h-24 rounded-full bg-brand-600/20 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-purple-500/20 animate-pulse delay-1000" />
        <svg className="absolute inset-0 w-full h-full opacity-10 dark:opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,0 50,50 T100,50" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="2" />
          <path d="M0,50 Q25,100 50,50 T100,50" fill="none" stroke="rgba(139, 92, 246, 0.1)" strokeWidth="2" />
        </svg>
      </div>

      <motion.div 
        className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Sign In Form */}
        <motion.div 
          className="w-full md:w-1/2 lg:w-2/5 space-y-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-gray-200/30 dark:border-gray-700/30 relative overflow-hidden z-10"
          variants={itemVariants}
        >
          {/* Decorative Elements */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-brand-600/15 blur-3xl animate-spin-slow" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl animate-spin-slow delay-1000" />

          <div className="text-center relative z-20">
            {/* Dummy Logo */}
            <motion.svg
              className="mx-auto h-16 w-16 text-brand-600 animate-pulse-slow"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              variants={itemVariants}
            >
              <circle cx="50" cy="50" r="40" fill="currentColor" />
              <path d="M30 30 L70 70 M70 30 L30 70" stroke="white" strokeWidth="8" strokeLinecap="round" />
            </motion.svg>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 animate-pulse-slow">
              Welcome Back
            </h2>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200 hover:underline"
              >
                Create one now
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} aria-label="Sign in form">
            <div className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800/50 shadow-md"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                >
                  Email Address
                  <span className="sr-only">(required)</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
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
                    aria-describedby={error ? 'error-message' : undefined}
                    className="block w-full rounded-xl border border-gray-200 bg-white/80 pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 dark:border-gray-600 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400 transition-all duration-200 ease-in-out hover:border-gray-300 hover:shadow-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
                >
                  Password
                  <span className="sr-only">(required)</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    aria-describedby={error ? 'error-message' : undefined}
                    className="block w-full rounded-xl border border-gray-200 bg-white/80 pl-12 pr-12 py-3 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/50 dark:border-gray-600 dark:bg-gray-700/80 dark:text-white dark:placeholder-gray-400 transition-all duration-200 ease-in-out hover:border-gray-300 hover:shadow-sm"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 focus:outline-none hover:text-brand-600 dark:hover:text-brand-400 transition-colors duration-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="refreshToken"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-700 transition-all duration-200"
                  />
                  <label 
                    htmlFor="remember-me" 
                    className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/auth/forgot-password"
                    className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors duration-200 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`group flex w-full justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3.5 text-base font-semibold text-white hover:from-brand-700 hover:to-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:from-brand-500 dark:to-brand-600 dark:hover:from-brand-600 dark:hover:to-brand-700 transition-all duration-300 ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:glow'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Sign in
                    <FiArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                  </span>
                )}
              </motion.button>
            </div>
          </form>

          {/* Social login options */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/95 dark:bg-gray-800/95 text-gray-500 dark:text-gray-400 font-medium">
                Eytta
              </span>
            </div>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div 
          className="w-full md:w-1/2 lg:w-3/5 space-y-8 p-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/30 dark:border-gray-700/30 relative overflow-hidden z-10"
          variants={itemVariants}
        >
          {/* Decorative Elements */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-brand-600/15 blur-3xl animate-spin-slow" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl animate-spin-slow delay-1000" />

          <div className="relative z-20">
            <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-700 mb-6 leading-tight animate-pulse-slow">
              Elevate Your <span className="text-white-600 dark:text-brand-400 ">Business</span> Experience with <span className="text-white-600 dark:text-brand-400 "> X</span>
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Sign in to access powerful tools designed to streamline your operations and boost productivity.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div 
                className="p-5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all duration-300"
                variants={featureCardVariants}
                whileHover="hover"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-brand-100/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                    <FiShield className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Secure Authentication</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Industry-leading security to protect your business data.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="p-5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all duration-300"
                variants={featureCardVariants}
                whileHover="hover"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-brand-100/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                    <FiClock className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Real-Time Management</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Monitor and manage your business operations instantly.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="p-5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all duration-300"
                variants={featureCardVariants}
                whileHover="hover"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-brand-100/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                    <FiHeadphones className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">24/7 Support</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Dedicated customer support whenever you need it.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="p-5 bg-white/80 dark:bg-gray-800/80 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-md hover:shadow-lg transition-all duration-300"
                variants={featureCardVariants}
                whileHover="hover"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-brand-100/50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                    <FiLink className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Seamless Integrations</h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      Connect with your existing business tools effortlessly.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Ready to get started with X?</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    Join thousands of businesses thriving on our platform.
                  </p>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-semibold hover:from-brand-700 hover:to-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:from-brand-500 dark:to-brand-600 dark:hover:from-brand-600 dark:hover:to-brand-700 transition-all duration-300 hover:shadow-xl"
                  >
                    Create Free Account
                    <FiArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

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
        .hover\:glow { box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); }
      `}</style>
    </div>
  );
}