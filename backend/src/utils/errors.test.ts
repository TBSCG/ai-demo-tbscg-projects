import { describe, it, expect } from 'vitest';
import { ApiError, BadRequestError, NotFoundError, InternalServerError } from './errors';

describe('Error Classes', () => {
  describe('ApiError', () => {
    it('should create error with status code and message', () => {
      const error = new ApiError(400, 'Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('ApiError');
    });

    it('should create error with details', () => {
      const details = { field: 'value' };
      const error = new ApiError(400, 'Test error', details);

      expect(error.details).toEqual(details);
    });

    it('should capture stack trace', () => {
      const error = new ApiError(500, 'Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('ApiError');
    });
  });

  describe('BadRequestError', () => {
    it('should create 400 error with default message', () => {
      const error = new BadRequestError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(BadRequestError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
    });

    it('should create 400 error with custom message', () => {
      const error = new BadRequestError('Custom bad request');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Custom bad request');
    });

    it('should create 400 error with details', () => {
      const details = { field: 'invalid' };
      const error = new BadRequestError('Validation failed', details);

      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 error with default message', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create 404 error with custom message', () => {
      const error = new NotFoundError('Project not found');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Project not found');
    });
  });

  describe('InternalServerError', () => {
    it('should create 500 error with default message', () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
    });

    it('should create 500 error with custom message', () => {
      const error = new InternalServerError('Database connection failed');

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Database connection failed');
    });

    it('should create 500 error with details', () => {
      const details = { error: 'Database timeout' };
      const error = new InternalServerError('Server error', details);

      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual(details);
    });
  });
});
