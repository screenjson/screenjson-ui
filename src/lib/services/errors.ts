/**
 * Error Types and Handling for ScreenJSON-UI
 * Provides user-friendly error messages for common issues
 */

/** Error codes for categorization */
export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  CORS_ERROR = 'CORS_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // HTTP errors
  HTTP_400 = 'HTTP_400',
  HTTP_401 = 'HTTP_401',
  HTTP_403 = 'HTTP_403',
  HTTP_404 = 'HTTP_404',
  HTTP_500 = 'HTTP_500',
  HTTP_OTHER = 'HTTP_OTHER',
  
  // JSON errors
  INVALID_JSON = 'INVALID_JSON',
  SCHEMA_VALIDATION = 'SCHEMA_VALIDATION',
  
  // Document errors
  EMPTY_DOCUMENT = 'EMPTY_DOCUMENT',
  MISSING_SCENES = 'MISSING_SCENES',
  
  // Encryption errors
  ENCRYPTED_CONTENT = 'ENCRYPTED_CONTENT',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  
  // General errors
  UNKNOWN = 'UNKNOWN'
}

/** Structured error with user-friendly information */
export interface LoaderError {
  code: ErrorCode;
  title: string;
  message: string;
  details?: string;
  suggestion?: string;
  technical?: string;
}

/** Map HTTP status codes to error information */
export function httpStatusToError(status: number, statusText: string, url: string): LoaderError {
  const baseError = {
    technical: `HTTP ${status} ${statusText} for ${url}`
  };
  
  switch (status) {
    case 400:
      return {
        ...baseError,
        code: ErrorCode.HTTP_400,
        title: 'Bad Request',
        message: 'The server could not understand the request.',
        suggestion: 'Check that the URL is correctly formatted.'
      };
    
    case 401:
      return {
        ...baseError,
        code: ErrorCode.HTTP_401,
        title: 'Authentication Required',
        message: 'This document requires authentication to access.',
        suggestion: 'Ensure you have the correct credentials or access token.'
      };
    
    case 403:
      return {
        ...baseError,
        code: ErrorCode.HTTP_403,
        title: 'Access Denied',
        message: 'You do not have permission to access this document.',
        suggestion: 'Contact the document owner for access, or verify your permissions.'
      };
    
    case 404:
      return {
        ...baseError,
        code: ErrorCode.HTTP_404,
        title: 'Document Not Found',
        message: 'The requested screenplay could not be found.',
        suggestion: 'Check that the URL is correct and the document exists.'
      };
    
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        ...baseError,
        code: ErrorCode.HTTP_500,
        title: 'Server Error',
        message: 'The server encountered an error while processing your request.',
        suggestion: 'Try again later, or contact the server administrator.'
      };
    
    default:
      return {
        ...baseError,
        code: ErrorCode.HTTP_OTHER,
        title: `HTTP Error ${status}`,
        message: statusText || 'An unexpected HTTP error occurred.',
        suggestion: 'Check the URL and try again.'
      };
  }
}

/** Detect and format CORS errors */
export function detectCORSError(error: Error, url: string): LoaderError | null {
  const message = error.message.toLowerCase();
  
  // Common CORS error patterns
  if (
    message.includes('cors') ||
    message.includes('cross-origin') ||
    message.includes('blocked by cors') ||
    message.includes('no \'access-control-allow-origin\'')
  ) {
    return {
      code: ErrorCode.CORS_ERROR,
      title: 'Cross-Origin Request Blocked',
      message: 'The document server does not allow requests from this origin.',
      details: 'CORS (Cross-Origin Resource Sharing) policy prevents loading the document.',
      suggestion: 'The document server needs to add appropriate CORS headers, or use a CORS proxy.',
      technical: `CORS error fetching ${url}: ${error.message}`
    };
  }
  
  return null;
}

/** Create error for network failures */
export function createNetworkError(error: Error, url: string): LoaderError {
  // Check for CORS first
  const corsError = detectCORSError(error, url);
  if (corsError) return corsError;
  
  // Check for timeout
  if (error.name === 'AbortError') {
    return {
      code: ErrorCode.TIMEOUT,
      title: 'Request Timeout',
      message: 'The request took too long to complete.',
      suggestion: 'Check your internet connection and try again.',
      technical: `Timeout fetching ${url}`
    };
  }
  
  // Generic network error
  return {
    code: ErrorCode.NETWORK_ERROR,
    title: 'Network Error',
    message: 'Could not connect to the document server.',
    suggestion: 'Check your internet connection and verify the URL is accessible.',
    technical: `Network error fetching ${url}: ${error.message}`
  };
}

/** Create error for invalid JSON */
export function createJSONError(error: Error, url: string): LoaderError {
  return {
    code: ErrorCode.INVALID_JSON,
    title: 'Invalid JSON',
    message: 'The document could not be parsed as valid JSON.',
    details: 'The file may be corrupted or not a valid ScreenJSON document.',
    suggestion: 'Verify the file is a valid JSON document.',
    technical: `JSON parse error for ${url}: ${error.message}`
  };
}

/** Create error for schema validation failures */
export function createValidationError(errors: string[], url: string): LoaderError {
  return {
    code: ErrorCode.SCHEMA_VALIDATION,
    title: 'Invalid ScreenJSON Document',
    message: 'The document does not conform to the ScreenJSON schema.',
    details: errors.slice(0, 5).join('\n'),
    suggestion: 'Validate the document against the ScreenJSON schema.',
    technical: `Schema validation failed for ${url}`
  };
}

/** Create error for empty documents */
export function createEmptyDocumentError(url: string): LoaderError {
  return {
    code: ErrorCode.EMPTY_DOCUMENT,
    title: 'Empty Document',
    message: 'The document appears to be empty.',
    suggestion: 'Verify the document has content.',
    technical: `Empty response from ${url}`
  };
}

/** Create error for missing scenes */
export function createMissingScenesError(url: string): LoaderError {
  return {
    code: ErrorCode.MISSING_SCENES,
    title: 'No Scenes Found',
    message: 'The screenplay document has no scenes.',
    suggestion: 'The document structure may be incomplete.',
    technical: `No scenes in document from ${url}`
  };
}

/** Create error for encrypted content */
export function createEncryptedError(): LoaderError {
  return {
    code: ErrorCode.ENCRYPTED_CONTENT,
    title: 'Encrypted Content',
    message: 'This screenplay contains encrypted content.',
    suggestion: 'Enter the password to decrypt and view the content.'
  };
}

/** Create error for decryption failure */
export function createDecryptionError(message?: string): LoaderError {
  return {
    code: ErrorCode.DECRYPTION_FAILED,
    title: 'Decryption Failed',
    message: 'Could not decrypt the document content.',
    details: message,
    suggestion: 'Check that you entered the correct password.'
  };
}

/** Create generic unknown error */
export function createUnknownError(error: Error): LoaderError {
  return {
    code: ErrorCode.UNKNOWN,
    title: 'Unexpected Error',
    message: 'An unexpected error occurred while loading the document.',
    technical: error.message
  };
}
