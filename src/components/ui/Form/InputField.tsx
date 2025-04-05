import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface InputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'tel' | 'date';
  rules?: any;
  methods: any;
}

export function InputField({
  name,
  label,
  placeholder,
  type = 'text',
  rules,
  methods,
}: InputFieldProps) {
  const {
    register,
    formState: { errors },
  } = methods;

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        {...register(name, rules)}
        id={name}
        type={type}
        placeholder={placeholder}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
}
