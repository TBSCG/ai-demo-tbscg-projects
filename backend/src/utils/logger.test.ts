import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestLogger } from './logger';
import { mockRequest, mockResponse, mockNext } from '../__tests__/mocks/db.mock';

describe('requestLogger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log request method and path', () => {
    const req = mockRequest({ method: 'GET', path: '/api/projects' });
    const res = mockResponse();
    const next = vi.fn();
    const consoleSpy = vi.spyOn(console, 'log');

    requestLogger(req as any, res as any, next);

    // Trigger response
    res.json({ data: 'test' });

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toContain('GET');
    expect(logCall).toContain('/api/projects');
  });

  it('should log status code', () => {
    const req = mockRequest({ method: 'POST', path: '/api/projects' });
    const res = mockResponse();
    res.statusCode = 201;
    const next = vi.fn();
    const consoleSpy = vi.spyOn(console, 'log');

    requestLogger(req as any, res as any, next);
    res.json({ data: 'created' });

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toContain('201');
  });

  it('should log response time', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();
    const consoleSpy = vi.spyOn(console, 'log');

    requestLogger(req as any, res as any, next);
    res.json({ data: 'test' });

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toMatch(/\d+ms/);
  });

  it('should call next middleware', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();

    requestLogger(req as any, res as any, next);

    expect(next).toHaveBeenCalled();
  });

  it('should preserve original res.json functionality', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();
    const data = { test: 'data' };
    const originalJsonSpy = res.json;

    requestLogger(req as any, res as any, next);
    res.json(data);

    // Verify the original json was called (it gets wrapped but should still be invoked)
    expect(originalJsonSpy).toHaveBeenCalled();
  });

  it('should include timestamp in log', () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = vi.fn();
    const consoleSpy = vi.spyOn(console, 'log');

    requestLogger(req as any, res as any, next);
    res.json({ data: 'test' });

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
