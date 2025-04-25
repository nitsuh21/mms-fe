import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  className?: string;
  label?: string;
  id?: string;
}

export function Input({ className, error, label, id, ...props }: InputProps) {
  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        className={`
          block w-full rounded-md border-gray-300 shadow-sm
          focus:border-brand-500 focus:ring-brand-500 sm:text-sm
          dark:bg-gray-700 dark:border-gray-600 dark:text-white
          ${error ? 'border-red-500' : ''}
          ${className || ''}
        `}
      />
      {error && (
        <div className="mt-1 text-sm text-red-500">{error}</div>
      )}
    </div>
  );
}
