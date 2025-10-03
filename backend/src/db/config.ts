import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Database connection URL
 * Default to a local PostgreSQL instance if not specified
 */
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/project_management_db';

/**
 * PostgreSQL connection
 */
export const sql = postgres(connectionString, {
  max: 10, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Timeout for new connections
});

/**
 * Drizzle ORM instance
 * Provides type-safe database operations
 */
export const db = drizzle(sql, { schema });

/**
 * Close the database connection
 * Should be called when the application shuts down
 */
export async function closeDatabase() {
  await sql.end();
}

