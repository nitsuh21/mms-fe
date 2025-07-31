'use client';

import { useLoading } from '@/context/LoadingContext';
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { dashboardService, type DashboardData, type TimeFilter } from '@/services/dashboardService';
import { 
  FiUsers, FiDollarSign, FiTrendingDown, FiCheckCircle, 
  FiRefreshCw, FiTarget, FiCalendar, FiChevronLeft, 
  FiChevronRight, FiTrendingUp 
} from 'react-icons/fi';
import { IconType } from 'react-icons';
import { formatNumber } from '../../../../../../../src/utils/format';
import { 
  format, subDays, addMonths, subMonths, startOfMonth,
  endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
  addDays, startOfWeek, endOfWeek, isWithinInterval 
} from 'date-fns';
import dynamic from 'next/dynamic';

// Interfaces (keep your existing ones)
interface MemberActivity {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
  lastActive: string;
}

interface ChartProps {
  data: Record<string, unknown>[];
  type: 'line' | 'donut';
  title: string;
  xKey?: string;
  yKey?: string;
  nameKey?: string;
  valueKey?: string;
}

// Dynamic chart import
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const Chart: React.FC<ChartProps> = ({ data, type, title, xKey, yKey, nameKey, valueKey }) => {
  if (type === 'line') {
    return (
      <ReactApexChart
        options={{
          chart: { type: 'line', toolbar: { show: false } },
          xaxis: { type: 'category' },
          stroke: { curve: 'smooth' },
          title: { text: title, style: { fontSize: '14px' } }
        }}
        series={[{
          name: title,
          data: data.map(d => ({
            x: d[xKey || 'x'] as string | number,
            y: d[yKey || 'y'] as number
          }))
        }]}
        type="line"
        height={200}
      />
    );
  }

  if (type === 'donut') {
    return (
      <ReactApexChart
        options={{
          chart: { type: 'donut' },
          labels: data.map(d => String(d[nameKey || 'name'])),
          legend: { position: 'bottom' },
          title: { text: title, style: { fontSize: '14px' } },
          plotOptions: {
            pie: {
              donut: {
                size: '65%',
                background: 'transparent'
              }
            }
          },
          dataLabels: { enabled: false }
        }}
        series={data.map(d => Number(d[valueKey || 'value']))}
        type="donut"
        height={200}
      />
    );
  }

  return null;
};

function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params?.merchantId as string;
  const businessId = params?.businessId as string;
  const { showNotification } = useNotification();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // State management
  // const [isLoading, setIsLoading] = useState(true);
  const { isLoading, setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  // Date picker state
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [dateRange, setDateRange] = useState<[Date, Date]>([subDays(new Date(), 30), new Date()]);
  const [tempDateRange, setTempDateRange] = useState<[Date, Date]>(dateRange);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [nextMonth, setNextMonth] = useState<Date>(addMonths(new Date(), 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // Quick selection options
  const quickOptions = [
    { label: 'Today', range: [new Date(), new Date()] },
    { label: 'Last 7 Days', range: [subDays(new Date(), 6), new Date()] },
    { label: 'Last 30 Days', range: [subDays(new Date(), 29), new Date()] },
    { label: 'This Month', range: [startOfMonth(new Date()), endOfMonth(new Date())] },
    { label: 'Last Month', range: [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))] },
    { label: 'This Year', range: [new Date(new Date().getFullYear(), 0, 1), new Date()] },
    { label: 'Last Year', range: [new Date(new Date().getFullYear() - 1, 0, 1), new Date(new Date().getFullYear() - 1, 11, 31)] }
  ];

  // Handle clicks outside date picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Date selection handlers
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

  // Render month calendar
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

  // Render full calendar component
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
    </div>
  );

  // Fetch dashboard data
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin');
        return;
      }
      const fetchDashboardData = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await dashboardService.getDashboardData(businessId, {
            // filterType: 'range',
            startDate: dateRange[0],
            endDate: dateRange[1]
          });
          setDashboardData(data);
        } catch (error: any) {
          console.error('Error fetching dashboard data:', error);
          setError(error.message || 'Failed to fetch dashboard data');
          showNotification({
            title: 'Error',
            message: error.message || 'Failed to fetch dashboard data',
            type: 'error'
          });
        } finally {
          setIsLoading(false);
          setIsFiltering(false);
        }
      };
      if (businessId) {
        fetchDashboardData();
      }
    }
  }, [dateRange, isAuthenticated, authLoading, businessId, showNotification]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent border-blue-500"></div>
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
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-transform transform hover:scale-105"
          >
            <FiRefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
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

      {/* Metrics Grid - Keep your existing metrics components */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Members Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiUsers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Members</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.members?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.members?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.members?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.members?.total ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.members?.active ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">New This Month</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.members?.newThisMonth ?? 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* MRR Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiDollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">MRR</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.revenue?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.revenue?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.revenue?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.revenue?.mrr ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.revenue?.totalRevenue ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.revenue?.growthPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiTrendingDown className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.performance?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.performance?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.performance?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{dashboardData?.metrics?.performance?.performancePercent ?? 0}%</h4>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Churn Rate</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.performance?.churnRate ?? 0}%</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">ARPU</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.performance?.arpu ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.performance?.growthPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
        {/* Subscriptions Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiCheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subscriptions</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.subscriptions?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.subscriptions?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.subscriptions?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.subscriptions?.total ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.subscriptions?.active ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Trial</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.subscriptions?.trial ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.subscriptions?.growthPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
        {/* Renewals Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiRefreshCw className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Renewals</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.renewals?.growthRate ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.renewals?.growthRate ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.renewals?.growthRate ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.renewals?.total ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.renewals?.thisMonth ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Next Month</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.renewals?.nextMonth ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth Rate</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.renewals?.growthRate ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
        {/* Campaigns Metric */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent dark:from-primary-900/20 dark:to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
                  <FiTarget className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Campaigns</h3>
              </div>
              <span className={`flex items-center text-sm font-medium ${(dashboardData?.metrics?.campaigns?.growthPercent ?? 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {(dashboardData?.metrics?.campaigns?.growthPercent ?? 0) >= 0 ? '↑' : '↓'} {Math.abs(dashboardData?.metrics?.campaigns?.growthPercent ?? 0)}%
              </span>
            </div>
            <div className="mt-3">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(dashboardData?.metrics?.campaigns?.total ?? 0)}</h4>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.campaigns?.active ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Draft</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatNumber(dashboardData?.metrics?.campaigns?.draft ?? 0)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{dashboardData?.metrics?.campaigns?.growthPercent ?? 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {/* Subscription Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <Chart
            data={dashboardData?.metrics.analytics.subscriptionTrends || []}
            type="line"
            title="Subscription Trends"
            xKey="date"
            yKey="value"
          />
        </div>

        {/* Plan Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <Chart
            data={dashboardData?.metrics.analytics.planDistribution || []}
            type="donut"
            title="Plan Distribution"
            nameKey="name"
            valueKey="value"
          />
        </div>
      </div>

      {/* Recent Members */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-800/30">
            <FiUsers className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {dashboardData?.recentMembers?.map((member: MemberActivity) => (
                <tr key={member.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{member.plan}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'active' ? 'bg-green-100 text-green-800' : member.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;