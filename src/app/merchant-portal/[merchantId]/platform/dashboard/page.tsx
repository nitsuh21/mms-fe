"use client";

import { useState, useEffect, useRef } from 'react';
import { FiTrendingUp, FiUsers, FiRefreshCw, FiUser, FiActivity, FiFilter, FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, subDays, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { UserData } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { platformService } from '@/services/platformService';
import type { DashboardResponse } from '@/types/platform';



export default function PlatformDashboardPage() {
  const startPickerRef = useRef<HTMLDivElement>(null);
  const endPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (startPickerRef.current && !startPickerRef.current.contains(event.target as Node)) {
        setShowStartDatePicker(false);
      }
      if (endPickerRef.current && !endPickerRef.current.contains(event.target as Node)) {
        setShowEndDatePicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  
  // Initialize dates as Date objects
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()]);
  const [startDate, endDate] = dateRange;
  const [tempStartDate, setTempStartDate] = useState<Date>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date>(endDate);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);

  const handleDateSelect = (date: Date, isStart: boolean) => {
    if (isStart) {
      setTempStartDate(date);
      setShowStartDatePicker(false);
    } else {
      setTempEndDate(date);
      setShowEndDatePicker(false);
    }
  };

  const renderCalendar = (isStart: boolean) => {
    const days = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });

    return (
      <div className="absolute z-10 mt-1 bg-white rounded-lg shadow-lg p-4 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-700"
          >
            <FiChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-700"
          >
            <FiChevronRight className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              {day}
            </div>
          ))}
          {days.map(day => {
            const isSelected = isStart
              ? isSameDay(day, tempStartDate)
              : isSameDay(day, tempEndDate);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={day.toString()}
                onClick={() => handleDateSelect(day, isStart)}
                className={`
                  p-2 text-sm rounded-lg
                  ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : ''}
                  ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                  ${isToday && !isSelected ? 'border border-blue-500' : ''}
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await platformService.getDashboardData(startDate, endDate);
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
        setIsFiltering(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, startDate, endDate]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/signin');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600"
          >
            <FiRefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Welcome, {(user as UserData)?.first_name}! View general performance and analytics.
          </h4>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
              <div className="relative" ref={startPickerRef}>
                <button
                  onClick={() => {
                    setShowEndDatePicker(false);
                    setShowStartDatePicker(!showStartDatePicker);
                    setCurrentMonth(tempStartDate);
                  }}
                  className="w-full sm:w-44 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70 text-left"
                >
                  {format(tempStartDate, 'MMM dd, yyyy')}
                </button>
                <FiCalendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                {showStartDatePicker && renderCalendar(true)}
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">End Date</label>
              <div className="relative" ref={endPickerRef}>
                <button
                  onClick={() => {
                    setShowStartDatePicker(false);
                    setShowEndDatePicker(!showEndDatePicker);
                    setCurrentMonth(tempEndDate);
                  }}
                  className="w-full sm:w-44 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/70 text-left"
                >
                  {format(tempEndDate, 'MMM dd, yyyy')}
                </button>
                <FiCalendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                {showEndDatePicker && renderCalendar(false)}
              </div>
            </div>
            <button
              onClick={() => {
                setIsFiltering(true);
                setDateRange([tempStartDate, tempEndDate]);
              }}
              disabled={isFiltering}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${isFiltering ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'} text-white`}
            >
              {isFiltering ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Filtering...
                </>
              ) : (
                <>
                  <FiFilter className="h-4 w-4" />
                  Apply Filter
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Business Growth */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-blue-100 rounded-full">
            <FiTrendingUp className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Business Growth</p>
        </div>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {dashboardData?.businesses.total} Total
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {dashboardData?.businesses.growth_rate}% Growth
          </span>
        </div>
      </div>

      {/* Active Members */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-purple-100 rounded-full">
            <FiUsers className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Members</p>
        </div>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {dashboardData?.members.active} Active Members
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
            {dashboardData?.members.total} Total Members
          </span>
        </div>
      </div>

      {/* Campaigns & Affiliates */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-green-100 rounded-full">
            <FiUser className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Campaigns & Affiliates</p>
        </div>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {dashboardData?.campaigns.active} Active Campaigns
        </p>
        <div className="mt-2 space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            {dashboardData?.campaigns.total} Total Campaigns
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            {dashboardData?.affiliates.active} Active Affiliates
          </span>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="p-2 bg-orange-100 rounded-full">
            <FiActivity className="h-6 w-6 text-orange-500" />
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Subscriptions</p>
        </div>
        <p className="mt-2 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          ${dashboardData?.subscriptions.monthly_revenue.toLocaleString()}
        </p>
        <div className="mt-2 space-y-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
            {dashboardData?.subscriptions.active} Active
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            {dashboardData?.subscriptions.total} Total
          </span>
        </div>
      </div>
    </div>
    </div>
  );
}
