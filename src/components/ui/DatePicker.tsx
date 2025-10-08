import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { RegisterOptions, UseFormReturn, Path } from 'react-hook-form';
import { FieldValues } from 'react-hook-form';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps<T extends FieldValues = FieldValues> {
  name: string;
  label: string;
  rules?: Omit<RegisterOptions<T>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  methods: UseFormReturn<T>;
  className?: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  allowPastDates?: boolean;
  dateOnly?: boolean; // If true, only shows date picker without time
  timeOfDay?: 'start' | 'end'; // For dateOnly mode: 'start' = 00:00:00, 'end' = 23:59:59
}

// Helper function to format date to ISO string
const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('.')[0]; // Remove milliseconds
};

// Helper function to safely parse date
const safeParseDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    try {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Helper function to format date for datetime-local input
const formatDateForInput = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
};

// Helper function to format date for date-only input
const formatDateForDateInput = (date: Date | null): string => {
  if (!date) return '';
  return date.toISOString().slice(0, 10); // Format: YYYY-MM-DD
};

// Helper function to parse datetime-local input value
const parseInputValue = (value: string, timeOfDay?: 'start' | 'end'): string => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    
    // If timeOfDay is specified, set the time accordingly
    if (timeOfDay === 'start') {
      date.setHours(0, 0, 0, 0);
    } else if (timeOfDay === 'end') {
      date.setHours(23, 59, 59, 999);
    }
    
    return formatDateToISO(date);
  } catch (e) {
    return '';
  }
};

export function DatePicker<T extends FieldValues = FieldValues>({
  name,
  label,
  rules,
  methods,
  className = '',
  description,
  required = false,
  disabled = false,
  allowPastDates = false,
  dateOnly = false,
  timeOfDay,
}: DatePickerProps<T>) {
  const {
    control,
    formState: { errors },
  } = methods;

  const error = errors[name];
  const [isMounted, setIsMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  // Fallback input for SSR or when component is not mounted
  if (!isMounted) {
    return (
      <div className={className}>
        <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={dateOnly ? "date" : "datetime-local"}
          className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm ${
            error
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-200 dark:border-gray-700'
          }`}
          disabled={disabled}
        />
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
        {error && (
          <div className="mt-1 flex items-center gap-1 text-sm text-red-500">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error.message as string}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Controller
        name={name as Path<T>}
        control={control}
        rules={rules}
        render={({ field: { onChange, value } }) => {
          const handleDateChange = (date: Date | null) => {
            if (!date) {
              onChange('');
              return;
            }
            
            // Set time based on timeOfDay prop
            if (dateOnly) {
              if (timeOfDay === 'start') {
                date.setHours(0, 0, 0, 0);
              } else if (timeOfDay === 'end') {
                date.setHours(23, 59, 59, 999);
              }
            }
            
            onChange(date.toISOString());
          };

          const currentValue = safeParseDate(value);
          const minDate = allowPastDates ? undefined : new Date();

          return (
            <ReactDatePicker
              selected={currentValue}
              onChange={handleDateChange}
              minDate={minDate}
              dateFormat={dateOnly ? "MMMM d, yyyy" : "MMMM d, yyyy h:mm aa"}
              showTimeSelect={!dateOnly}
              timeIntervals={15}
              disabled={disabled}
              placeholderText={`Select ${dateOnly ? 'date' : 'date and time'}`}
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm ${
                error
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              wrapperClassName="w-full"
              calendarClassName="dark:bg-gray-800 dark:border-gray-600"
            />
          );
        }}
      />
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-500">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  );
}
