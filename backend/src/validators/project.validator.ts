import { z } from 'zod';

/**
 * Validation schema for creating a project
 * Enforces: required fields, types, constraints
 */
export const createProjectSchema = z.object({
  body: z.object({
    title: z
      .string({ message: 'Title is required' })
      .min(1, 'Title cannot be empty')
      .max(255, 'Title must be 255 characters or less'),
    
    client: z
      .string({ message: 'Client is required' })
      .min(1, 'Client cannot be empty')
      .max(255, 'Client must be 255 characters or less'),
    
    description: z
      .string()
      .max(5000, 'Description must be 5000 characters or less')
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
    
    projectManager: z
      .string()
      .max(255, 'Project manager name must be 255 characters or less')
      .nullable()
      .optional(),
    
    members: z
      .array(z.string().max(255, 'Member name must be 255 characters or less'))
      .default([]),
  })
  // Cross-field validation: endDate must be after startDate
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
 * Validation schema for updating a project
 * All fields optional (partial update)
 */
export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(255, 'Title must be 255 characters or less')
      .optional(),
    
    client: z
      .string()
      .min(1, 'Client cannot be empty')
      .max(255, 'Client must be 255 characters or less')
      .optional(),
    
    description: z
      .string()
      .max(5000, 'Description must be 5000 characters or less')
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
    
    projectManager: z
      .string()
      .max(255, 'Project manager name must be 255 characters or less')
      .nullable()
      .optional(),
    
    members: z
      .array(z.string().max(255, 'Member name must be 255 characters or less'))
      .optional(),
  }),
});

/**
 * Validation schema for project ID param
 */
export const projectIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid project ID format'),
  }),
});

// Export types for TypeScript inference
export type CreateProjectInput = z.infer<typeof createProjectSchema>['body'];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body'];

