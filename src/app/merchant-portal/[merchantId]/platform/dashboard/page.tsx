"use client";

import { useState, useEffect, useRef } from 'react';
import {
  FiTrendingUp, FiUsers, FiRefreshCw, FiUser, FiActivity,
  FiCalendar, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import {
  format, subDays, addMonths, subMonths, startOfMonth,
  endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  addDays, startOfWeek, endOfWeek, isWithinInterval
} from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { UserData } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { platformService } from '@/services/platformService';
import type { DashboardResponse } from '@/types/platform';
import { useLoading } from '@/context/LoadingContext';

export default function PlatformDashboardPage() {
  const datePickerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [dateRange, setDateRange] = useState<[Date, Date]>([subDays(new Date(), 30), new Date()]);
  const [tempDateRange, setTempDateRange] = useState<[Date, Date]>(dateRange);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [nextMonth, setNextMonth] = useState<Date>(addMonths(new Date(), 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  // const [loading, setLoading] = useState(true);
    const { isLoading, setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const quickOptions = [
    { label: 'Today', range: [new Date(), new Date()] },
    { label: 'Last 7 Days', range: [subDays(new Date(), 6), new Date()] },
    { label: 'Last 30 Days', range: [subDays(new Date(), 29), new Date()] },
    { label: 'This Month', range: [startOfMonth(new Date()), endOfMonth(new Date())] },
    { label: 'Last Month', range: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
    { label: 'This Year', range: [new Date(new Date().getFullYear(), 0, 1), new Date()] },
    { label: 'Last Year', range: [new Date(new Date().getFullYear() - 1, 0, 1), new Date(new Date().getFullYear() - 1, 11, 31)] }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date) => {
    if (!tempDateRange[0] || tempDateRange[1]) {
      setTempDateRange([date, null as unknown as Date]);
    } else if (date < tempDateRange[0]) {
      setTempDateRange([date, null as unknown as Date]);
    } else {
      setTempDateRange([tempDateRange[0], date]);
      if (date.getMonth() !== tempDateRange[0].getMonth()) {
        setNextMonth(addMonths(tempDateRange[0], 1));
      }
    }
  };

  const applyQuickSelection = (range: [Date, Date]) => {
    setDateRange(range);
    setTempDateRange(range);
    setShowDatePicker(false);
    setIsFiltering(true);
  };

  const applyCustomRange = () => {
    if (tempDateRange[0] && tempDateRange[1]) {
      setDateRange(tempDateRange);
      setShowDatePicker(false);
      setIsFiltering(true);
    }
  };

  const renderMonthCalendar = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="w-full min-w-[240px]">
        <h2 className="text-sm font-semibold text-center mb-2">
          {format(month, 'MMMM yyyy')}
        </h2>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const isSelected = (tempDateRange[0] && isSameDay(day, tempDateRange[0])) ||
              (tempDateRange[1] && isSameDay(day, tempDateRange[1]));
            const isInRange = tempDateRange[0] && tempDateRange[1] &&
              isWithinInterval(day, { start: tempDateRange[0], end: tempDateRange[1] });
            const isCurrentMonth = isSameMonth(day, month);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toString()}
                onClick={() => handleDateSelect(day)}
                className={`
                  h-8 w-8 text-sm rounded-full flex items-center justify-center
                  transition duration-200 transform hover:scale-105
                  ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}
                  ${isSelected ? 'bg-blue-500 text-white' : ''}
                  ${isInRange && !isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : ''}
                  ${isToday && !isSelected ? 'border border-blue-500' : ''}
                  ${isCurrentMonth && !isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendar = () => (
    <div className="absolute z-20 right-0 top-full mt-2 w-screen max-w-[90vw] sm:max-w-[750px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white via-white/90 to-gray-50 dark:from-gray-800 dark:via-gray-800/90 dark:to-gray-900 shadow-2xl transition-all duration-300 ease-in-out">
      <div className="flex flex-col sm:flex-row">
        <div className="w-full sm:w-52 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Quick Selection</h3>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
            {quickOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => applyQuickSelection(option.range as [Date, Date])}
                className="text-left text-sm px-3 py-2 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 transition duration-200 transform hover:scale-[1.02]"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 p-4 overflow-x-auto hide-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                setCurrentMonth(subMonths(currentMonth, 1));
                setNextMonth(subMonths(nextMonth, 1));
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-transform transform hover:scale-110"
            >
              <FiChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="flex flex-col sm:flex-row gap-6">
              {renderMonthCalendar(currentMonth)}
              {tempDateRange[0] && !tempDateRange[1] && renderMonthCalendar(nextMonth)}
            </div>
            <button
              onClick={() => {
                setCurrentMonth(addMonths(currentMonth, 1));
                setNextMonth(addMonths(nextMonth, 1));
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-transform transform hover:scale-110"
            >
              <FiChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          {tempDateRange[0] && tempDateRange[1] && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Selected: {format(tempDateRange[0], 'MMM dd, yyyy')} - {format(tempDateRange[1], 'MMM dd, yyyy')}
              </p>
              <button
                onClick={applyCustomRange}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-transform transform hover:scale-105"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="absolute -top-8 -right-8 w-20 h-20 bg-blue-100/50 rounded-full blur-xl animate-pulse-slow dark:bg-blue-900/30" />
      <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-purple-100/50 rounded-full blur-xl animate-pulse-slow delay-1000 dark:bg-purple-900/30" />
    </div>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await platformService.getDashboardData(dateRange[0], dateRange[1]);
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setIsLoading(false);
        setIsFiltering(false);
      }
    };
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, dateRange]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/signin');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-blue-500"></div></div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-transform transform hover:scale-105"
          >
            <FiRefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white/80 to-gray-100 dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-950 px-4 sm:px-6 py-8 space-y-10 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-32 h-32 bg-purple-100/30 rounded-full blur-2xl animate-pulse-slow dark:bg-purple-900/30" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-100/30 rounded-full blur-2xl animate-pulse-slow delay-1000 dark:bg-blue-900/30" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome, {(user as UserData)?.first_name}!
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">View general performance and analytics.</p>
          <div className="mt-2 w-16 h-1 bg-blue-500 rounded-full animate-pulse-slow" />
        </div>
      </div>

      <div className="flex flex-col gap-6 items-end">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative" ref={datePickerRef}>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date Range:</label>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white/90 backdrop-blur-sm px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-lg transition-transform transform hover:scale-105 dark:border-gray-700 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-700/70"
              >
                <FiCalendar className="h-5 w-5" />
                {format(dateRange[0], 'MMM dd, yyyy')} - {format(dateRange[1], 'MMM dd, yyyy')}
              </button>
            </div>
            {showDatePicker && renderCalendar()}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch w-full">
          {/* Business Growth */}
          <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6 dark:border-gray-700 dark:bg-gray-800/80 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiTrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Growth</p>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {dashboardData?.businesses.total} Total
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {dashboardData?.businesses.active} Active
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {dashboardData?.businesses.growth_rate}% Growth
              </span>
            </div>
          </div>
          {/* Active Members */}
          <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6 dark:border-gray-700 dark:bg-gray-800/80 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-100 rounded-full">
                <FiUsers className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Members</p>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {dashboardData?.members.active} Active Members
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                {dashboardData?.members.total} Total Members
              </span>
            </div>
          </div>
          {/* Campaigns & Affiliates */}
          <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6 dark:border-gray-700 dark:bg-gray-800/80 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-green-100 rounded-full">
                <FiUser className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Campaigns & Affiliates</p>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {dashboardData?.campaigns.active} Active Campaigns
            </p>
            <div className="mt-4 space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                {dashboardData?.campaigns.total} Total Campaigns
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {dashboardData?.affiliates.active} Active Affiliates
              </span>
            </div>
          </div>
          {/* Subscriptions */}
          <div className="rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm p-6 dark:border-gray-700 dark:bg-gray-800/80 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-orange-100 rounded-full">
                <FiActivity className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscriptions</p>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              ${dashboardData?.subscriptions.monthly_revenue.toLocaleString()}
            </p>
            <div className="mt-4 space-y-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                {dashboardData?.subscriptions.active} Active
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                {dashboardData?.subscriptions.total} Total
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}