import { Request, Response, NextFunction } from 'express';

/**
 * Simple request logger middleware
 * Logs: timestamp, method, path, status code, response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Store the original res.json to intercept it
  const originalJson = res.json.bind(res);
  
  res.json = (body: unknown) => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    console.log(
      `[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
    
    return originalJson(body);
  };
  
  next();
};

