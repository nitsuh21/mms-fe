import { useForm, SubmitHandler, FieldValues, UseFormReturn } from 'react-hook-form';
import { ReactNode } from 'react';

interface FormProps<T extends FieldValues> {
  onSubmit: SubmitHandler<T>;
  children: (methods: UseFormReturn<T>) => ReactNode;
  className?: string;
}

export function Form<T extends FieldValues>({ onSubmit, children, className }: FormProps<T>) {
  const methods = useForm<T>();

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
      {children(methods)}
    </form>
  );
}
