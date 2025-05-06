import { FieldValues, UseFormReturn, Path } from 'react-hook-form';
import React from 'react';

type Option = {
  value: string;
  label: string;
};

export interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  description?: string;
  options: Option[];
  rules?: any;
  methods: UseFormReturn<T>;
  disabled?: boolean;
}

export const SelectField = <T extends FieldValues>({
  name,
  label,
  description,
  options,
  rules,
  methods,
  disabled
}: SelectFieldProps<T>): React.ReactElement => {
  const {
    register,
    formState: { errors },
  } = methods;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      <select
        {...register(name, rules)}
        id={name}
        disabled={disabled}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">Select {label}</option>
        {options?.map((option: Option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )) || []}
      </select>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors[name]?.message as React.ReactNode}
        </p>
      )}
    </div>
  );
};

