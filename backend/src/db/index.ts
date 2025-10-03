/**
 * Database module exports
 * Central export point for all database functionality
 */

export { db, sql, closeDatabase } from './config.js';
export * from './schema.js';
export * from './queries/index.js';

