/**
 * Utility functions for service files to improve type safety and error handling
 */
import { AxiosError } from 'axios';

/**
 * Type-safe error handler for API responses
 */
export function handleApiError(error: unknown, operation: string): never {
  console.error(`Error during ${operation}:`, error);
  
  // Handle Axios errors
  if (isAxiosError(error)) {
    const message = (error.response?.data as Record<string, unknown>)?.message as string || error.message || `Failed to ${operation}`;
    throw new Error(message);
  }
  
  // Handle regular errors
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  
  // Handle unknown errors
  throw new Error(`An unknown error occurred while trying to ${operation}`);
}

/**
 * Type guard for Axios errors
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return Boolean(
    error && 
    typeof error === 'object' && 
    'isAxiosError' in error && 
    (error as { isAxiosError?: boolean }).isAxiosError === true
  );
}

/**
 * Type-safe data converter for API responses
 * Helps convert string numbers to actual numbers
 */
export function convertNumericFields<T extends Record<string, unknown>>(data: Record<string, unknown>, fields: (keyof T)[]): Partial<T> {
  const result: Record<string, unknown> = { ...data };
  
  for (const field of fields) {
    const key = field as string;
    if (key in result) {
      const value = result[key];
      if (typeof value === 'string' && !isNaN(Number(value))) {
        result[key] = Number(value);
      }
    }
  }
  
  return result as Partial<T>;
}

/**
 * Type-safe data validator
 * Ensures required fields are present
 */
export function validateRequiredFields(data: Record<string, unknown>, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => !(field in data) || data[field] === undefined || data[field] === null);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Type-safe date validator
 */
export function validateDate(dateString: string | undefined, fieldName: string): void {
  if (!dateString) {
    throw new Error(`${fieldName} is required`);
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName} format`);
  }
}

/**
 * Type-safe comparison of two dates
 */
export function validateDateRange(startDate: string, endDate: string | undefined): void {
  if (!endDate) return;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end <= start) {
    throw new Error('End date must be after start date');
  }
}
