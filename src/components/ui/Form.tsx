"use client";

import React from 'react';
import { useForm, UseFormReturn, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { FiAlertCircle } from 'react-icons/fi';

interface FormProps<TFormValues extends FieldValues> {
  onSubmit: (data: TFormValues) => void;
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  className?: string;
  defaultValues?: Partial<TFormValues>;
}

export function Form<TFormValues extends FieldValues>({
  onSubmit,
  children,
  className = '',
  defaultValues,
}: FormProps<TFormValues>) {
  const methods = useForm<TFormValues>({ defaultValues });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
      {children(methods)}
    </form>
  );
}

// Input Field
interface InputFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  rules?: RegisterOptions;
  methods: UseFormReturn<TFormValues>;
  className?: string;
  description?: string;
}

export function InputField<TFormValues extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  rules,
  methods,
  className = '',
  description,
}: InputFieldProps<TFormValues>) {
  const {
    register,
    formState: { errors },
  } = methods;

  const error = errors[name];

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </label>
      <input
        {...register(name, rules)}
        type={type}
        id={name}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 ${
          error
            ? 'border-red-500 dark:border-red-500'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      />
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-500">
          <FiAlertCircle className="h-4 w-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  );
}

// Select Field
interface SelectFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  options: { value: string; label: string }[];
  rules?: RegisterOptions;
  methods: UseFormReturn<TFormValues>;
  className?: string;
  description?: string;
}

export function SelectField<TFormValues extends FieldValues>({
  name,
  label,
  options,
  rules,
  methods,
  className = '',
  description,
}: SelectFieldProps<TFormValues>) {
  const {
    register,
    formState: { errors },
  } = methods;

  const error = errors[name];

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </label>
      <select
        {...register(name, rules)}
        id={name}
        className={`w-full rounded-lg border bg-white px-4 py-2.5 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${
          error
            ? 'border-red-500 dark:border-red-500'
            : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-500">
          <FiAlertCircle className="h-4 w-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  );
}

// Checkbox Field
interface CheckboxFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label: string;
  rules?: RegisterOptions;
  methods: UseFormReturn<TFormValues>;
  className?: string;
  description?: string;
}

export function CheckboxField<TFormValues extends FieldValues>({
  name,
  label,
  rules,
  methods,
  className = '',
  description,
}: CheckboxFieldProps<TFormValues>) {
  const {
    register,
    formState: { errors },
  } = methods;

  const error = errors[name];

  return (
    <div className={className}>
      <div className="flex items-start">
        <div className="flex h-5 items-center">
          <input
            {...register(name, rules)}
            type="checkbox"
            id={name}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:focus:ring-brand-400"
          />
        </div>
        <div className="ml-3">
          <label htmlFor={name} className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-1 text-sm text-red-500">
          <FiAlertCircle className="h-4 w-4" />
          <span>{error.message as string}</span>
        </div>
      )}
    </div>
  );
}

// Submit Button
interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function SubmitButton({ children, isLoading = false, className = '' }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={`inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600 dark:focus:ring-offset-gray-900 ${className}`}
    >
      {isLoading ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
}
