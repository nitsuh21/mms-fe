import React from 'react';
import { Controller } from 'react-hook-form';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/material_blue.css';
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
}

// Helper function to format date to ISO string
const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('.')[0]; // Remove milliseconds
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
}: DatePickerProps<T>) {
  const {
    control,
    formState: { errors },
  } = methods;

  const error = errors[name];

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
          const handleDateChange = (selectedDates: Date[]) => {
            const selectedDate = selectedDates[0];
            if (selectedDate) {
              // Format date to ISO string before passing to onChange
              onChange(formatDateToISO(selectedDate));
            } else {
              onChange('');
            }
          };

          return (
            <Flatpickr
              value={value ? new Date(value) : ''}
              onChange={handleDateChange}
              options={{
                enableTime: true,
                dateFormat: 'Y-m-d H:i',
                time_24hr: true,
                allowInput: true,
                defaultDate: value ? new Date(value) : undefined,
                enable: [(date) => date >= new Date()],
              }}
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
