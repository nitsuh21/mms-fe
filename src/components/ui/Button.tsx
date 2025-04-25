import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: 'default' | 'outline' | 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export function Button({ children, className = '', variant = 'default', ...props }: ButtonProps) {
  let variantClass = '';
  switch (variant) {
    case 'outline':
      variantClass = 'border border-gray-300 bg-transparent text-gray-600 hover:bg-gray-50';
      break;
    case 'primary':
      variantClass = 'bg-blue-500 hover:bg-blue-700 text-white';
      break;
    case 'secondary':
      variantClass = 'bg-gray-500 hover:bg-gray-700 text-white';
      break;
    case 'danger':
      variantClass = 'bg-red-500 hover:bg-red-700 text-white';
      break;
    default:
      variantClass = 'bg-blue-500 hover:bg-blue-700 text-white';
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
