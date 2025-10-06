import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from './errorHandler';
import { ApiError, BadRequestError, NotFoundError, InternalServerError } from '../utils/errors';
import { mockRequest, mockResponse, mockNext } from '../__tests__/mocks/db.mock';

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset NODE_ENV
    process.env.NODE_ENV = 'test';
  });

  it('should handle ApiError with correct status code', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const error = new ApiError(400, 'Test error');

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Test error',
      })
    );
  });

  it('should handle BadRequestError', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const details = { field: 'invalid' };
    const error = new BadRequestError('Validation failed', details);

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Validation failed',
        details,
      })
    );
  });

  it('should handle NotFoundError', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const error = new NotFoundError('Project not found');

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Project not found',
      })
    );
  });

  it('should handle InternalServerError', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const error = new InternalServerError('Database error');

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Database error',
      })
    );
  });

  it('should handle generic Error as 500', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const error = new Error('Unexpected error');

    errorHandler(error, req as any, res as any, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Internal server error',
      })
    );
  });

  it('should include stack trace in development', () => {
    process.env.NODE_ENV = 'development';
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const error = new ApiError(400, 'Test error');

    errorHandler(error, req as any, res as any, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      })
    );
  });

  it('should not include stack trace in production', () => {
    process.env.NODE_ENV = 'production';
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const error = new ApiError(400, 'Test error');

    errorHandler(error, req as any, res as any, next);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall).not.toHaveProperty('stack');
  });

  it('should include details when provided', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const details = { field1: 'error1', field2: 'error2' };
    const error = new ApiError(400, 'Validation error', details);

    errorHandler(error, req as any, res as any, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        details,
      })
    );
  });

  it('should log error to console', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext;
    const error = new Error('Test error');
    const consoleErrorSpy = vi.spyOn(console, 'error');

    errorHandler(error, req as any, res as any, next);

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
