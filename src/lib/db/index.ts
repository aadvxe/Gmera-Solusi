/**
 * Barrel file for the db module.
 * Re-exports everything from all domain-specific files.
 * All existing imports using "@/lib/db" continue to work unchanged.
 */

export * from './types';
export * from './clients';
export * from './categories';
export * from './invoices';
export * from './income';
export * from './expense';
export * from './users';
export * from './dashboard';
