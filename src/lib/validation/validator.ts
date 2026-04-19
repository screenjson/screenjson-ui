/**
 * ScreenJSON Validation Layer
 * Uses AJV to validate documents against the schema
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { ScreenJSONDocument } from '../types/screenjson';

// Import schema at build time
import schema from '../../../schema.json';

/** Validation error with details */
export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
  params: Record<string, unknown>;
}

/** Validation result */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  document: ScreenJSONDocument | null;
}

/** Create and configure AJV instance */
function createValidator() {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false
  });
  
  // Add format validators (uri, date-time, uuid, etc.)
  addFormats(ajv);
  
  return ajv.compile(schema);
}

// Singleton validator instance
let validator: ReturnType<typeof createValidator> | null = null;

/** Get or create validator instance */
function getValidator() {
  if (!validator) {
    validator = createValidator();
  }
  return validator;
}

/**
 * Validate a ScreenJSON document
 * @param data - The parsed JSON data to validate
 * @returns Validation result with errors if any
 */
export function validateDocument(data: unknown): ValidationResult {
  const validate = getValidator();
  const valid = validate(data);
  
  if (valid) {
    return {
      valid: true,
      errors: [],
      document: data as unknown as ScreenJSONDocument
    };
  }
  
  const errors: ValidationError[] = (validate.errors ?? []).map((error) => ({
    path: error.instancePath || '/',
    message: error.message ?? 'Unknown validation error',
    keyword: error.keyword,
    params: error.params as Record<string, unknown>
  }));
  
  return {
    valid: false,
    errors,
    document: null
  };
}

/**
 * Quick check if data looks like a ScreenJSON document
 * (Basic structural check without full validation)
 */
export function isScreenJSONDocument(data: unknown): data is ScreenJSONDocument {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  
  const doc = data as Record<string, unknown>;
  
  // Check required top-level properties
  const hasRequiredProps = (
    typeof doc.id === 'string' &&
    typeof doc.version === 'string' &&
    typeof doc.title === 'object' &&
    typeof doc.lang === 'string' &&
    typeof doc.charset === 'string' &&
    typeof doc.dir === 'string' &&
    Array.isArray(doc.authors) &&
    typeof doc.document === 'object' &&
    doc.document !== null
  );
  
  return hasRequiredProps;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'No validation errors';
  }
  
  return errors
    .map((error, index) => {
      const path = error.path || 'root';
      return `${index + 1}. ${path}: ${error.message}`;
    })
    .join('\n');
}

/**
 * Get a summary of validation errors
 */
export function getValidationSummary(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return 'Document is valid';
  }
  
  if (errors.length === 1) {
    return `1 validation error found`;
  }
  
  return `${errors.length} validation errors found`;
}
