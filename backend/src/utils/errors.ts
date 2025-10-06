/**
 * Custom API Error classes for consistent error handling
 */

/**
 * Base API Error class
 * All custom errors extend from this
 */
export class ApiError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(statusCode: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 * Use for validation errors and malformed requests
 */
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request', details?: Record<string, unknown>) {
    super(400, message, details);
  }
}

/**
 * 404 Not Found Error
 * Use when requested resource doesn't exist
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
  }
}

/**
 * 500 Internal Server Error
 * Use for unexpected server errors
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', details?: Record<string, unknown>) {
    super(500, message, details);
  }
}

