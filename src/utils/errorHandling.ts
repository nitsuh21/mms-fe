/**
 * Utility functions for consistent error handling across services
 */

/**
 * Extracts an error message from an unknown error object
 * Handles API errors with response.data.message structure
 */
export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  // If it's an Error instance, use its message
  if (error instanceof Error) {
    return error.message;
  }
  
  // If it's an object that might be an API error response
  if (error && typeof error === 'object') {
    // Check for response property (axios error structure)
    if ('response' in error) {
      const response = (error as { response: unknown }).response;
      if (response && typeof response === 'object' && 'data' in response) {
        const data = (response as { data: unknown }).data;
        if (data && typeof data === 'object' && 'message' in data) {
          return String((data as { message: unknown }).message);
        }
      }
    }
    
    // Check for direct message property
    if ('message' in error) {
      return String((error as { message: unknown }).message);
    }
  }
  
  // Default fallback message
  return defaultMessage;
}

/**
 * Creates a typed error handler function for a specific service
 */
export function createErrorHandler(serviceName: string) {
  return function handleServiceError(error: unknown, operation: string): never {
    const errorMessage = extractErrorMessage(error, `Failed to ${operation}`);
    console.error(`${serviceName} error (${operation}):`, error);
    throw new Error(errorMessage);
  };
}
