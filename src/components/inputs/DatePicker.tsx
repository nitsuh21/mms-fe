import React, { useState, useRef, useEffect } from 'react';
import { FiCalendar } from 'react-icons/fi';

interface DatePickerProps {
  value?: string | null;
  onChange: (date: string) => void;
  className?: string;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
}

export default function DatePicker({
  value,
  onChange,
  className = '',
  minDate,
  maxDate,
  placeholder = 'Select date'
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = value || '';
    }
  }, [value]);

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <FiCalendar className="h-5 w-5 text-gray-400 mr-3" />
        <input
          type="date"
          ref={inputRef}
          value={value || ''}
          onChange={(e) => {
            const date = e.target.value;
            onChange(date);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 pl-3"
          min={minDate}
          max={maxDate}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
