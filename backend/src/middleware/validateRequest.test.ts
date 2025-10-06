import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validateRequest } from './validateRequest';
import { BadRequestError } from '../utils/errors';
import { mockRequest, mockResponse, mockNext } from '../__tests__/mocks/db.mock';

describe('validateRequest', () => {
  it('should call next on valid data', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
    });

    const req = mockRequest({ body: { name: 'Test' } });
    const res = mockResponse();
    const next = vi.fn();

    const middleware = validateRequest(schema);
    await middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should throw BadRequestError on invalid data', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
    });

    const req = mockRequest({ body: { name: 123 } });
    const res = mockResponse();
    const next = vi.fn();

    const middleware = validateRequest(schema);

    await expect(async () => {
      await middleware(req as any, res as any, next);
    }).rejects.toThrow(BadRequestError);
  });

  it('should include validation details in error', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string().min(3),
        email: z.string().email(),
      }),
    });

    const req = mockRequest({ body: { name: 'ab', email: 'invalid' } });
    const res = mockResponse();
    const next = vi.fn();

    const middleware = validateRequest(schema);

    try {
      await middleware(req as any, res as any, next);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
      if (error instanceof BadRequestError) {
        expect(error.message).toBe('Validation failed');
        expect(error.details).toBeDefined();
      }
    }
  });

  it('should validate params', async () => {
    const schema = z.object({
      params: z.object({
        id: z.string().uuid(),
      }),
    });

    const req = mockRequest({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    });
    const res = mockResponse();
    const next = vi.fn();

    const middleware = validateRequest(schema);
    await middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should validate query', async () => {
    const schema = z.object({
      query: z.object({
        page: z.string(),
      }),
    });

    const req = mockRequest({ query: { page: '1' } });
    const res = mockResponse();
    const next = vi.fn();

    const middleware = validateRequest(schema);
    await middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should validate multiple fields at once', async () => {
    const schema = z.object({
      params: z.object({ id: z.string().uuid() }),
      body: z.object({ name: z.string() }),
    });

    const req = mockRequest({
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
      body: { name: 'Test' },
    });
    const res = mockResponse();
    const next = vi.fn();

    const middleware = validateRequest(schema);
    await middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should handle non-Zod errors by passing to next', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
    });

    // Mock schema to throw non-Zod error
    const mockSchema = {
      parseAsync: vi.fn().mockRejectedValue(new Error('Non-Zod error')),
    };

    const req = mockRequest({ body: { name: 'Test' } });
    const res = mockResponse();
    const next = vi.fn();

    const middleware = validateRequest(mockSchema as any);
    await middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should not call next with error on success', async () => {
    const schema = z.object({
      body: z.object({
        name: z.string(),
      }),
    });

    const req = mockRequest({ body: { name: 'Test' } });
    const res = mockResponse();
    const next = vi.fn();

    const middleware = validateRequest(schema);
    await middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledWith();
    expect(next.mock.calls[0]).toHaveLength(0);
  });
});
