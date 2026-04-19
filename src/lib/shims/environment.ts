/**
 * Shim for $app/environment when building the library
 */

export const browser = typeof window !== 'undefined';
export const dev = false;
export const building = false;
export const version = '1.0.0';
