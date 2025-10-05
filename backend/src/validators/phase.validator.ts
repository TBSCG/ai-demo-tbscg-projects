import { z } from 'zod';

/**
 * Validation schema for creating a phase
 */
export const createPhaseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  body: z.object({
    name: z
      .string({ message: 'Phase name is required' })
      .min(1, 'Phase name cannot be empty')
      .max(255, 'Phase name must be 255 characters or less'),
    
    description: z
      .string()
      .max(2000, 'Description must be 2000 characters or less')
      .nullable()
      .optional(),
    
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .nullable()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Invalid start date'
      ),
    
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .nullable()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Invalid end date'
      ),
    
    status: z
      .enum(['planned', 'in-progress', 'completed'], {
        message: 'Status must be planned, in-progress, or completed',
      })
      .nullable()
      .optional(),
    
    order: z
      .number({ message: 'Order is required' })
      .int('Order must be an integer')
      .min(0, 'Order must be non-negative'),
  })
  // Cross-field validation
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  ),
});

/**
 * Validation schema for updating a phase
 */
export const updatePhaseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
    phaseId: z.string().uuid('Invalid phase ID format'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Phase name cannot be empty')
      .max(255, 'Phase name must be 255 characters or less')
      .optional(),
    
    description: z
      .string()
      .max(2000, 'Description must be 2000 characters or less')
      .nullable()
      .optional(),
    
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format')
      .nullable()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Invalid start date'
      ),
    
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
      .nullable()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        'Invalid end date'
      ),
    
    status: z
      .enum(['planned', 'in-progress', 'completed'])
      .nullable()
      .optional(),
    
    order: z
      .number()
      .int('Order must be an integer')
      .min(0, 'Order must be non-negative')
      .optional(),
  }),
});

/**
 * Validation schema for phase ID params
 */
export const phaseIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
    phaseId: z.string().uuid('Invalid phase ID format'),
  }),
});

// Export types
export type CreatePhaseInput = z.infer<typeof createPhaseSchema>['body'];
export type UpdatePhaseInput = z.infer<typeof updatePhaseSchema>['body'];

