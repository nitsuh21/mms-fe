import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface SelectFieldProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  rules?: any;
  methods: any;
}

export function SelectField({
  name,
  label,
  options,
  rules,
  methods,
}: SelectFieldProps) {
  const {
    register,
    formState: { errors },
  } = methods;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        {...register(name, rules)}
        id={name}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
}
