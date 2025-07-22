import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { RegisterOptions, UseFormReturn, Path } from 'react-hook-form';
import { FieldValues } from 'react-hook-form';

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

// Helper function to parse datetime-local input value
const parseInputValue = (value: string): string => {
  if (!value) return '';
  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
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
          type="datetime-local"
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
          const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            if (inputValue) {
              const isoValue = parseInputValue(inputValue);
              onChange(isoValue);
            } else {
              onChange('');
            }
          };

          const currentValue = safeParseDate(value);
          const inputValue = formatDateForInput(currentValue);

          // Debug logging for edit mode
          if (name.includes('valid_')) {
            console.log(`DatePicker ${name}:`, { value, currentValue, inputValue });
          }

          return (
            <input
              type="datetime-local"
              value={inputValue}
              onChange={handleDateChange}
              min={allowPastDates ? undefined : new Date().toISOString().slice(0, 16)}
              className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:text-sm ${
                error
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              disabled={disabled}
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
