import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from './asyncHandler';
import { mockRequest, mockResponse, mockNext } from '../__tests__/mocks/db.mock';

describe('asyncHandler', () => {
  it('should call the async function with req, res, next', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const asyncFn = vi.fn().mockResolvedValue(undefined);

    const handler = asyncHandler(asyncFn);
    await handler(req as any, res as any, next);

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
  });

  it('should pass resolved value through', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const expectedValue = { data: 'test' };
    const asyncFn = vi.fn().mockResolvedValue(expectedValue);

    const handler = asyncHandler(asyncFn);
    await handler(req as any, res as any, next);

    expect(asyncFn).toHaveBeenCalled();
  });

  it('should catch errors and pass to next', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();
    const error = new Error('Test error');
    const asyncFn = vi.fn().mockRejectedValue(error);

    const handler = asyncHandler(asyncFn);
    await handler(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle thrown errors in async function', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();
    const error = new Error('Async error');
    const asyncFn = vi.fn().mockImplementation(async () => {
      throw error;
    });

    const handler = asyncHandler(asyncFn);
    await handler(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should not call next if async function succeeds', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();
    const asyncFn = vi.fn().mockResolvedValue(undefined);

    const handler = asyncHandler(asyncFn);
    await handler(req as any, res as any, next);

    expect(next).not.toHaveBeenCalled();
  });
});
