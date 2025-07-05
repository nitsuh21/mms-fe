"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiEye, FiEyeOff, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
      ease: cubicBezier(0.16, 1, 0.3, 1)
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
      ease: cubicBezier(0.42, 0, 0.58, 1)
    } 
  },
};

const businessFeatures = [
  {
    title: "Affiliate Management",
    description: "Track and manage your affiliate partners with ease.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  {
    title: "Business Analytics",
    description: "Gain insights into your business performance with detailed reports and dashboards.",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: "Customer CRM",
    description: "Manage customer relationships and track interactions to improve service.",
     icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    )
  },
  {
    title: "Subscription Management",
    description: "Easily manage customer subscriptions and billing cycles.",
     icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    )
  },
  {
    title: "Payment Processing",
    description: "Securely process payments with multiple gateways and currencies.",
     icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )
  }
];

export default function SignInPage() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const slideWidth = container.clientWidth;
      container.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
      setCurrentSlide(index);
    }
  };

  const scrollLeft = () => {
    const newIndex = (currentSlide - 1 + businessFeatures.length) % businessFeatures.length;
    scrollToSlide(newIndex);
  };

  const scrollRight = () => {
    const newIndex = (currentSlide + 1) % businessFeatures.length;
    scrollToSlide(newIndex);
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    slideInterval.current = setInterval(() => {
      scrollRight();
    }, 5000);
  };

  const stopAutoSlide = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentSlide]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
        router.push(`/auth/verify-otp?email=${encodeURIComponent(formData.email)}&purpose=login`);
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
    <div className="flex min-h-screen bg-white flex-col md:flex-row p-5 md:p-0 relative overflow-hidden">
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

      {/* Sign In Form Section (White) - Left Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-8 md:py-12">
        <motion.div 
          className="w-full max-w-md space-y-6 md:space-y-8 p-6 md:p-10 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <div className="text-start relative z-20">
              <h2 className="mt-2 md:mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Welcome Back
              </h2>
              <p className="mt-2 md:mt-4 text-sm md:text-base text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/auth/signup"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                >
                  Create one now
                </Link>
              </p>
            </div>

            <form className="mt-6 md:mt-8 space-y-4 md:space-y-6" onSubmit={handleSubmit} aria-label="Sign in form">
              <div className="space-y-4 md:space-y-5">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl bg-red-50 p-3 md:p-4 text-sm font-medium text-red-700 border border-red-200 shadow-sm"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}

                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm md:text-base font-semibold text-gray-700 mb-1 md:mb-2"
                  >
                    Email Address
                    <span className="sr-only">(required)</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 md:pl-4">
                      <FiMail className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
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
                      className="block w-full rounded-xl border border-gray-200 bg-white pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ease-in-out hover:border-gray-300 hover:shadow-sm"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm md:text-base font-semibold text-gray-700 mb-1 md:mb-2"
                  >
                    Password
                    <span className="sr-only">(required)</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 md:pl-4">
                      <FiLock className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
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
                      className="block w-full rounded-xl border border-gray-200 bg-white pl-10 md:pl-12 pr-10 md:pr-12 py-2 md:py-3 text-sm md:text-base text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 ease-in-out hover:border-gray-300 hover:shadow-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 md:pr-4 focus:outline-none hover:text-blue-600 transition-colors duration-200"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                      ) : (
                        <FiEye className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
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
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all duration-200"
                    />
                    <label 
                      htmlFor="remember-me" 
                      className="ml-2 block text-sm md:text-base font-medium text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm md:text-base">
                    <Link
                      href="/auth/forgot-password"
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className={`group flex w-full justify-center rounded-xl bg-blue-600 px-4 py-2.5 md:px-6 md:py-3.5 text-sm md:text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 ${
                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 mr-2 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Sign in
                      <FiChevronRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" />
                    </span>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="relative mt-6 md:mt-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm md:text-base">
                <span className="px-2 bg-white text-gray-500 font-medium">
                  Eytta
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Information Section (Dim Blue) - Right Side - Hidden on small screens */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-blue-50 px-6 md:px-10 py-8 md:py-12 relative rounded-tl-4xl">
        <motion.div 
          className="w-full max-w-2xl space-y-6 md:space-y-8 p-6 md:p-10 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <div className="relative z-20">
              <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
                Elevate Your <span className="text-blue-600">Business</span> Operations
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-6 md:mb-8">
                Discover how our platform can transform your business workflow
              </p>

              <div className="relative">
                <div className="flex items-center">
                  <button 
                    onClick={scrollLeft}
                    className="mr-4 z-10 bg-white p-1 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Scroll left"
                  >
                    <FiChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-gray-700" />
                  </button>
                  
                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-x-hidden py-2 md:py-4 scroll-smooth"
                    onMouseEnter={stopAutoSlide}
                    onMouseLeave={startAutoSlide}
                  >
                    <div className="flex w-full">
                      {businessFeatures.map((feature, index) => (
                        <div key={index} className="flex-shrink-0 w-full">
                          <motion.div
                            className="w-full bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 mx-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 p-1 md:p-2 rounded-lg bg-blue-100 text-blue-600">
                                {feature.icon}
                              </div>
                              <div className="ml-3 md:ml-4">
                                <h4 className="text-base md:text-lg font-semibold text-gray-900">{feature.title}</h4>
                                <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-600">{feature.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={scrollRight}
                    className="ml-4 z-10 bg-white p-1 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Scroll right"
                  >
                    <FiChevronRight className="h-3 w-3 md:h-4 md:w-4 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Slide indicators */}
              <div className="flex justify-center mt-4 md:mt-6 space-x-1 md:space-x-2">
                {businessFeatures.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToSlide(index)}
                    className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-blue-600 w-4 md:w-6' : 'bg-gray-300'}`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="mt-8 md:mt-10 pt-4 md:pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
                  <div>
                    <h4 className="text-base md:text-lg font-semibold text-gray-900">Ready to transform your business?</h4>
                    <p className="text-sm md:text-base text-gray-600">
                      Join thousands of businesses thriving on our platform.
                    </p>
                  </div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 hover:shadow-md text-sm md:text-base"
                    >
                      Create Account
                      <FiChevronRight className="ml-1 md:ml-2 h-3 w-3 md:h-4 md:w-4" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Add this to your global CSS */}
      <style jsx global>{`
        .scroll-smooth {
          scroll-behavior: smooth;
        }
        .overflow-x-hidden::-webkit-scrollbar {
          display: none;
        }
        .overflow-x-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}