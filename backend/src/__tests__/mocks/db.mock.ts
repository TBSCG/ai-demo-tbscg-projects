import { vi } from 'vitest';

/**
 * Mock database connection
 * Used to prevent actual database calls in unit tests
 */
export const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockResolvedValue([]),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn().mockResolvedValue([]),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
};

/**
 * Mock Express Request object
 */
export const mockRequest = (overrides: any = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    path: '/test',
    ...overrides,
  };
};

/**
 * Mock Express Response object
 */
export const mockResponse = () => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    statusCode: 200,
  };
  return res;
};

/**
 * Mock Express Next function
 */
export const mockNext = vi.fn();

/**
 * Reset all mocks
 */
export const resetMocks = () => {
  vi.clearAllMocks();
};
