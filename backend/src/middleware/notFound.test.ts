import { describe, it, expect } from 'vitest';
import { notFoundHandler } from './notFound';
import { mockRequest, mockResponse } from '../__tests__/mocks/db.mock';

describe('notFoundHandler', () => {
  it('should return 404 status', () => {
    const req = mockRequest({ method: 'GET', path: '/unknown' });
    const res = mockResponse();

    notFoundHandler(req as any, res as any);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('should return error message with method and path', () => {
    const req = mockRequest({ method: 'POST', path: '/api/unknown' });
    const res = mockResponse();

    notFoundHandler(req as any, res as any);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Route POST /api/unknown not found',
    });
  });

  it('should handle GET requests', () => {
    const req = mockRequest({ method: 'GET', path: '/test' });
    const res = mockResponse();

    notFoundHandler(req as any, res as any);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Route GET /test not found',
      })
    );
  });

  it('should handle DELETE requests', () => {
    const req = mockRequest({ method: 'DELETE', path: '/api/test/123' });
    const res = mockResponse();

    notFoundHandler(req as any, res as any);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Route DELETE /api/test/123 not found',
      })
    );
  });

  it('should always set success to false', () => {
    const req = mockRequest();
    const res = mockResponse();

    notFoundHandler(req as any, res as any);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
      })
    );
  });
});
