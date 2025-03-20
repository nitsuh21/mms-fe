import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full h-11 px-4 text-sm text-gray-800 placeholder:text-gray-400 bg-white border border-gray-200 rounded-lg focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:bg-white/5 dark:border-gray-800 dark:text-white/90 dark:placeholder:text-gray-400 dark:focus:border-brand-500 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
