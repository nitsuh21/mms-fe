/**
 * Utility functions for consistent error handling across services
 */

/**
 * Parses Django REST Framework error response and converts to user-friendly messages
 */
export function parseDRFError(error: any): string {
  if (!error?.response?.data) {
    return 'An unexpected error occurred. Please try again.';
  }

  const data = error.response.data;
  
  // Handle different DRF error formats
  
  // 1. Simple detail message
  if (data.detail) {
    return data.detail;
  }
  
  // 2. Non-field errors (general errors)
  if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
    return data.non_field_errors.join('. ');
  }
  
  // 3. Field-specific errors
  if (typeof data === 'object') {
    const fieldErrors: string[] = [];
    
    for (const [field, errors] of Object.entries(data)) {
      if (Array.isArray(errors)) {
        // Convert field names to user-friendly names
        const friendlyFieldName = getFriendlyFieldName(field);
        const errorMessages = errors.map((error: string) => 
          error.replace(/This field is required\./g, `${friendlyFieldName} is required.`)
               .replace(/This field may not be blank\./g, `${friendlyFieldName} cannot be blank.`)
               .replace(/Enter a valid email address\./g, 'Please enter a valid email address.')
               .replace(/Enter a valid phone number\./g, 'Please enter a valid phone number.')
               .replace(/Enter a valid URL\./g, 'Please enter a valid website URL.')
        );
        fieldErrors.push(`${friendlyFieldName}: ${errorMessages.join(', ')}`);
      }
    }
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join('. ');
    }
  }
  
  // 4. Custom error messages
  if (data.error) {
    return data.error;
  }
  
  if (data.message) {
    return data.message;
  }
  
  // 5. Fallback for unknown error format
  return 'Please check your input and try again.';
}

/**
 * Converts field names to user-friendly names
 */
function getFriendlyFieldName(field: string): string {
  const fieldMap: Record<string, string> = {
    'first_name': 'First name',
    'last_name': 'Last name',
    'email': 'Email',
    'phone': 'Phone number',
    'password': 'Password',
    'confirm_password': 'Confirm password',
    'business': 'Business',
    'name': 'Name',
    'description': 'Description',
    'price': 'Price',
    'currency': 'Currency',
    'interval': 'Billing interval',
    'trial_days': 'Trial days',
    'is_active': 'Active status',
    'discount_type': 'Discount type',
    'discount_value': 'Discount value',
    'discount_category': 'Discount category',
    'valid_from': 'Valid from date',
    'valid_until': 'Valid until date',
    'scope': 'Scope',
    'max_uses': 'Maximum uses',
    'code': 'Code',
    'address': 'Address',
    'website': 'Website',
    'customer_id': 'Customer ID',
    'plan_id': 'Plan',
    'start_date': 'Start date',
    'end_date': 'End date',
    'trial_end': 'Trial end date',
    'amount': 'Amount',
    'payment_method': 'Payment method',
    'due_date': 'Due date',
    'reference_number': 'Reference number',
    'subscription': 'Subscription',
    'invoice': 'Invoice',
    'type': 'Type',
    'status': 'Status',
    'role': 'Role',
    'message': 'Message'
  };
  
  return fieldMap[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

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

/**
 * Enhanced error handler that uses DRF error parsing
 */
export function createDRFErrorHandler(serviceName: string) {
  return function handleDRFError(error: any, operation: string): never {
    const errorMessage = parseDRFError(error);
    console.error(`${serviceName} error (${operation}):`, error);
    throw new Error(errorMessage);
  };
}
