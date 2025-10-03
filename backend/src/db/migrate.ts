import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, closeDatabase } from './config.js';

/**
 * Run database migrations
 * This script applies all pending migrations to the database
 */
async function runMigrations() {
  console.log('🔄 Running database migrations...');

  try {
    await migrate(db, {
      migrationsFolder: './src/db/migrations',
    });

    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

runMigrations();

