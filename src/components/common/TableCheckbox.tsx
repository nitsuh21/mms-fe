import React from 'react';

interface TableCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const TableCheckbox: React.FC<TableCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      disabled={disabled}
      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    />
  );
};

export default TableCheckbox; 