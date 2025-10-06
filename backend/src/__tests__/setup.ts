import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables
beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
});

// Suppress console logs during tests
beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// Restore console after tests
afterAll(() => {
  vi.restoreAllMocks();
});
