import { Request, Response } from 'express';

/**
 * 404 handler for undefined routes
 * This should be registered AFTER all other routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
};

