import { Button } from '../Button';

export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <Button
      type="submit"
      className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
    >
      {children}
    </Button>
  );
}
