import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to catch errors and pass to error middleware
 * This eliminates the need for try-catch in every controller function
 * 
 * @param fn - Async function that handles the route
 * @returns Express middleware function
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

