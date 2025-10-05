import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

/**
 * Validates request against Zod schema
 * Extracts validation errors and throws BadRequestError
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Validate request (params, query, body)
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Transform Zod errors into readable format
        const details: Record<string, string> = {};
        
        error.issues.forEach((err) => {
          const path = err.path.slice(1).join('.'); // Remove 'body'/'params' prefix
          details[path] = err.message;
        });
        
        throw new BadRequestError('Validation failed', details);
      }
      
      next(error);
    }
  };
};

