# Step 4 Detailed Implementation Plan
## Backend Implementation in Express

**Goal**: Implement RESTful API with Express and connect to database

**Estimated Time**: 2-3 hours

**Prerequisites**: 
- Step 3 complete (Database, migrations, seed data, query functions)
- PostgreSQL running
- Database seeded with sample data

---

## Overview

This document provides a detailed, low-level implementation plan for Step 4 of the project management application. It includes file-by-file specifications, function signatures, validation rules, error handling patterns, and testing guidelines.

### What We're Building

A production-ready REST API that:
- Serves 8 RESTful endpoints for project and phase management
- Validates all incoming data using Zod schemas
- Handles errors gracefully with consistent responses
- Integrates with PostgreSQL via Drizzle ORM query functions
- Follows SOLID principles and clean code standards
- Returns standardized JSON responses
- Supports CORS for frontend integration

### File Structure

```
backend/src/
├── server.ts                      # Express app setup & startup (UPDATE)
├── types/
│   └── express.d.ts              # Extended Express types (NEW)
├── middleware/
│   ├── errorHandler.ts           # Global error handler (NEW)
│   ├── validateRequest.ts        # Validation middleware (NEW)
│   └── notFound.ts               # 404 handler (NEW)
├── validators/
│   ├── project.validator.ts      # Project validation schemas (NEW)
│   └── phase.validator.ts        # Phase validation schemas (NEW)
├── controllers/
│   └── projects.controller.ts    # Project & phase controllers (NEW)
├── routes/
│   └── projects.routes.ts        # Route definitions (NEW)
└── utils/
    ├── errors.ts                 # Custom error classes (NEW)
    ├── logger.ts                 # Simple request logger (NEW)
    └── asyncHandler.ts           # Async error wrapper (NEW)
```

---

## Phase 1: Foundation Setup (30 minutes)

### 1.1 Install Dependencies

First, add validation and CORS packages to backend:

```bash
cd backend
npm install zod cors
npm install --save-dev @types/cors
```

**Packages:**
- `zod` - Runtime type validation
- `cors` - CORS middleware
- `@types/cors` - TypeScript types for CORS

---

### 1.2 Create Custom Error Classes

**File**: `backend/src/utils/errors.ts`

**Purpose**: Define custom error classes for different HTTP scenarios

**Implementation**:

```typescript
/**
 * Base API Error class
 * All custom errors extend from this
 */
export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
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
  constructor(message: string = 'Bad Request', details?: any) {
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
  constructor(message: string = 'Internal server error', details?: any) {
    super(500, message, details);
  }
}
```

**Key Points**:
- Extends native `Error` class
- Stores HTTP status code
- Optional `details` field for validation errors
- Stack trace captured for debugging

---

### 1.3 Create Async Handler Utility

**File**: `backend/src/utils/asyncHandler.ts`

**Purpose**: Wrap async route handlers to catch errors automatically

**Implementation**:

```typescript
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
```

**Usage Example**:
```typescript
// Without asyncHandler - requires try-catch
app.get('/api/projects', async (req, res, next) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// With asyncHandler - cleaner
app.get('/api/projects', asyncHandler(async (req, res) => {
  const projects = await getProjects();
  res.json(projects);
}));
```

---

### 1.4 Create Request Logger

**File**: `backend/src/utils/logger.ts`

**Purpose**: Simple console logging for requests (Morgan alternative)

**Implementation**:

```typescript
import { Request, Response, NextFunction } from 'express';

/**
 * Simple request logger middleware
 * Logs: timestamp, method, path, status code, response time
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Store the original res.json to intercept it
  const originalJson = res.json.bind(res);
  
  res.json = (body: any) => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    
    console.log(
      `[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
    
    return originalJson(body);
  };
  
  next();
};
```

**Log Format**: `[2025-10-03T12:00:00.000Z] GET /api/projects - 200 - 45ms`

---

### 1.5 Create Not Found Handler

**File**: `backend/src/middleware/notFound.ts`

**Purpose**: Handle 404 errors for undefined routes

**Implementation**:

```typescript
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
```

---

### 1.6 Create Global Error Handler

**File**: `backend/src/middleware/errorHandler.ts`

**Purpose**: Centralized error handling with consistent response format

**Implementation**:

```typescript
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';

/**
 * Global error handler middleware
 * Catches all errors and returns consistent JSON response
 * Must be registered LAST in middleware chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error to console (in production, use proper logging service)
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);

  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
      // Include stack trace only in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack,
    }),
  });
};
```

**Error Response Examples**:

```json
// Custom error (NotFoundError)
{
  "success": false,
  "error": "Project not found"
}

// Validation error (BadRequestError)
{
  "success": false,
  "error": "Validation failed",
  "details": {
    "title": "Title is required",
    "client": "Client is required"
  }
}

// Development mode - includes stack trace
{
  "success": false,
  "error": "Database connection failed",
  "stack": "Error: Database connection failed\n    at ..."
}
```

---

## Phase 2: Validation Layer (30 minutes)

### 2.1 Create Project Validators

**File**: `backend/src/validators/project.validator.ts`

**Purpose**: Define Zod schemas for project validation

**Implementation**:

```typescript
import { z } from 'zod';

/**
 * Validation schema for creating a project
 * Enforces: required fields, types, constraints
 */
export const createProjectSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: 'Title is required' })
      .min(1, 'Title cannot be empty')
      .max(255, 'Title must be 255 characters or less'),
    
    client: z
      .string({ required_error: 'Client is required' })
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
```

**Validation Rules**:
- `title`: Required, 1-255 chars
- `client`: Required, 1-255 chars
- `description`: Optional, max 5000 chars
- `startDate`: Optional, YYYY-MM-DD format
- `endDate`: Optional, YYYY-MM-DD format, must be >= startDate
- `projectManager`: Optional, max 255 chars
- `members`: Optional array of strings

---

### 2.2 Create Phase Validators

**File**: `backend/src/validators/phase.validator.ts`

**Purpose**: Define Zod schemas for phase validation

**Implementation**:

```typescript
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
      .string({ required_error: 'Phase name is required' })
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
        errorMap: () => ({ message: 'Status must be planned, in-progress, or completed' }),
      })
      .nullable()
      .optional(),
    
    order: z
      .number({ required_error: 'Order is required' })
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
```

**Validation Rules**:
- `name`: Required, 1-255 chars
- `description`: Optional, max 2000 chars
- `startDate`: Optional, YYYY-MM-DD format
- `endDate`: Optional, YYYY-MM-DD format, must be >= startDate
- `status`: Optional, enum ('planned', 'in-progress', 'completed')
- `order`: Required integer, non-negative

---

### 2.3 Create Validation Middleware

**File**: `backend/src/middleware/validateRequest.ts`

**Purpose**: Middleware to validate requests using Zod schemas

**Implementation**:

```typescript
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

/**
 * Validates request against Zod schema
 * Extracts validation errors and throws BadRequestError
 * 
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
        
        error.errors.forEach((err) => {
          const path = err.path.slice(1).join('.'); // Remove 'body'/'params' prefix
          details[path] = err.message;
        });
        
        throw new BadRequestError('Validation failed', details);
      }
      
      next(error);
    }
  };
};
```

**Usage Example**:
```typescript
router.post(
  '/api/projects',
  validateRequest(createProjectSchema),
  asyncHandler(createProject)
);
```

---

## Phase 3: Controller Layer (45 minutes)

### 3.1 Create Projects Controller

**File**: `backend/src/controllers/projects.controller.ts`

**Purpose**: Business logic for all project and phase operations

**Implementation**:

```typescript
import { Request, Response } from 'express';
import {
  getAllProjectsWithPhases,
  getProjectByIdWithPhases,
  createProject as createProjectQuery,
  updateProject as updateProjectQuery,
  deleteProject as deleteProjectQuery,
  projectExists,
} from '../db/queries/projects.queries';
import {
  createPhase as createPhaseQuery,
  updatePhase as updatePhaseQuery,
  deletePhase as deletePhaseQuery,
  getPhaseByIdAndProjectId,
  phaseExists,
} from '../db/queries/phases.queries';
import { NotFoundError } from '../utils/errors';
import { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator';
import { CreatePhaseInput, UpdatePhaseInput } from '../validators/phase.validator';

/**
 * Controller: Get all projects with their phases
 * 
 * @route GET /api/projects
 * @returns {Array} List of projects with nested phases
 */
export const getAllProjects = async (req: Request, res: Response) => {
  const projects = await getAllProjectsWithPhases();
  
  res.status(200).json({
    success: true,
    data: projects,
  });
};

/**
 * Controller: Get single project by ID with phases
 * 
 * @route GET /api/projects/:id
 * @param {string} req.params.id - Project UUID
 * @throws {NotFoundError} If project doesn't exist
 * @returns {Object} Project with nested phases
 */
export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const project = await getProjectByIdWithPhases(id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  res.status(200).json({
    success: true,
    data: project,
  });
};

/**
 * Controller: Create new project
 * 
 * @route POST /api/projects
 * @body {CreateProjectInput} Project data
 * @returns {Object} Created project
 */
export const createProject = async (
  req: Request<{}, {}, CreateProjectInput>,
  res: Response
) => {
  const projectData = req.body;
  
  // Create project using query function
  const newProject = await createProjectQuery(projectData);
  
  res.status(201).json({
    success: true,
    data: newProject,
  });
};

/**
 * Controller: Update existing project
 * 
 * @route PUT /api/projects/:id
 * @param {string} req.params.id - Project UUID
 * @body {UpdateProjectInput} Updated project data
 * @throws {NotFoundError} If project doesn't exist
 * @returns {Object} Updated project
 */
export const updateProject = async (
  req: Request<{ id: string }, {}, UpdateProjectInput>,
  res: Response
) => {
  const { id } = req.params;
  const updateData = req.body;
  
  // Check if project exists
  const exists = await projectExists(id);
  if (!exists) {
    throw new NotFoundError('Project not found');
  }
  
  // Update project
  const updatedProject = await updateProjectQuery(id, updateData);
  
  res.status(200).json({
    success: true,
    data: updatedProject,
  });
};

/**
 * Controller: Delete project and all its phases
 * 
 * @route DELETE /api/projects/:id
 * @param {string} req.params.id - Project UUID
 * @throws {NotFoundError} If project doesn't exist
 * @returns {Object} Success message
 */
export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Check if project exists
  const exists = await projectExists(id);
  if (!exists) {
    throw new NotFoundError('Project not found');
  }
  
  // Delete project (phases cascade automatically)
  await deleteProjectQuery(id);
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Project deleted successfully',
    },
  });
};

/**
 * Controller: Add phase to project
 * 
 * @route POST /api/projects/:id/phases
 * @param {string} req.params.id - Project UUID
 * @body {CreatePhaseInput} Phase data
 * @throws {NotFoundError} If project doesn't exist
 * @returns {Object} Created phase
 */
export const addPhase = async (
  req: Request<{ id: string }, {}, CreatePhaseInput>,
  res: Response
) => {
  const { id: projectId } = req.params;
  const phaseData = req.body;
  
  // Check if project exists
  const exists = await projectExists(projectId);
  if (!exists) {
    throw new NotFoundError('Project not found');
  }
  
  // Create phase
  const newPhase = await createPhaseQuery({
    ...phaseData,
    projectId,
  });
  
  res.status(201).json({
    success: true,
    data: newPhase,
  });
};

/**
 * Controller: Update phase
 * 
 * @route PUT /api/projects/:id/phases/:phaseId
 * @param {string} req.params.id - Project UUID
 * @param {string} req.params.phaseId - Phase UUID
 * @body {UpdatePhaseInput} Updated phase data
 * @throws {NotFoundError} If project or phase doesn't exist
 * @returns {Object} Updated phase
 */
export const updatePhase = async (
  req: Request<{ id: string; phaseId: string }, {}, UpdatePhaseInput>,
  res: Response
) => {
  const { id: projectId, phaseId } = req.params;
  const updateData = req.body;
  
  // Verify phase belongs to project
  const phase = await getPhaseByIdAndProjectId(phaseId, projectId);
  if (!phase) {
    throw new NotFoundError('Phase not found');
  }
  
  // Update phase
  const updatedPhase = await updatePhaseQuery(phaseId, updateData);
  
  res.status(200).json({
    success: true,
    data: updatedPhase,
  });
};

/**
 * Controller: Delete phase
 * 
 * @route DELETE /api/projects/:id/phases/:phaseId
 * @param {string} req.params.id - Project UUID
 * @param {string} req.params.phaseId - Phase UUID
 * @throws {NotFoundError} If project or phase doesn't exist
 * @returns {Object} Success message
 */
export const deletePhase = async (req: Request, res: Response) => {
  const { id: projectId, phaseId } = req.params;
  
  // Verify phase belongs to project
  const phase = await getPhaseByIdAndProjectId(phaseId, projectId);
  if (!phase) {
    throw new NotFoundError('Phase not found');
  }
  
  // Delete phase
  await deletePhaseQuery(phaseId);
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Phase deleted successfully',
    },
  });
};
```

**Controller Functions Summary**:

| Function | Method | Route | Purpose |
|----------|--------|-------|---------|
| `getAllProjects` | GET | `/api/projects` | List all projects with phases |
| `getProjectById` | GET | `/api/projects/:id` | Get single project |
| `createProject` | POST | `/api/projects` | Create new project |
| `updateProject` | PUT | `/api/projects/:id` | Update project |
| `deleteProject` | DELETE | `/api/projects/:id` | Delete project |
| `addPhase` | POST | `/api/projects/:id/phases` | Add phase |
| `updatePhase` | PUT | `/api/projects/:id/phases/:phaseId` | Update phase |
| `deletePhase` | DELETE | `/api/projects/:id/phases/:phaseId` | Delete phase |

**Design Principles Applied**:
- ✅ Single Responsibility - Each function does one thing
- ✅ Command-Query Separation - Functions either query or modify
- ✅ Fail Fast - Validate existence before operations
- ✅ Consistent Error Handling - Throws NotFoundError when appropriate
- ✅ TypeScript Types - Full type safety with generics

---

## Phase 4: Routes Layer (15 minutes)

### 4.1 Create Routes File

**File**: `backend/src/routes/projects.routes.ts`

**Purpose**: Define all routes and connect to controllers

**Implementation**:

```typescript
import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addPhase,
  updatePhase,
  deletePhase,
} from '../controllers/projects.controller';
import { validateRequest } from '../middleware/validateRequest';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from '../validators/project.validator';
import {
  createPhaseSchema,
  updatePhaseSchema,
  phaseIdSchema,
} from '../validators/phase.validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// ============================================
// PROJECT ROUTES
// ============================================

/**
 * @route   GET /api/projects
 * @desc    Get all projects with phases
 * @access  Public
 */
router.get('/', asyncHandler(getAllProjects));

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID with phases
 * @access  Public
 */
router.get(
  '/:id',
  validateRequest(projectIdSchema),
  asyncHandler(getProjectById)
);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Public
 */
router.post(
  '/',
  validateRequest(createProjectSchema),
  asyncHandler(createProject)
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Public
 */
router.put(
  '/:id',
  validateRequest(updateProjectSchema),
  asyncHandler(updateProject)
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project and all its phases
 * @access  Public
 */
router.delete(
  '/:id',
  validateRequest(projectIdSchema),
  asyncHandler(deleteProject)
);

// ============================================
// PHASE ROUTES
// ============================================

/**
 * @route   POST /api/projects/:id/phases
 * @desc    Add phase to project
 * @access  Public
 */
router.post(
  '/:id/phases',
  validateRequest(createPhaseSchema),
  asyncHandler(addPhase)
);

/**
 * @route   PUT /api/projects/:id/phases/:phaseId
 * @desc    Update phase
 * @access  Public
 */
router.put(
  '/:id/phases/:phaseId',
  validateRequest(updatePhaseSchema),
  asyncHandler(updatePhase)
);

/**
 * @route   DELETE /api/projects/:id/phases/:phaseId
 * @desc    Delete phase
 * @access  Public
 */
router.delete(
  '/:id/phases/:phaseId',
  validateRequest(phaseIdSchema),
  asyncHandler(deletePhase)
);

export default router;
```

**Route Summary**:
- All routes wrapped with `asyncHandler` for automatic error catching
- Validation middleware runs before controller
- Clear documentation comments for each route
- RESTful design (verbs match HTTP methods)

---

## Phase 5: Server Setup (20 minutes)

### 5.1 Update Server File

**File**: `backend/src/server.ts`

**Purpose**: Configure Express app with all middleware and routes

**Implementation**:

Update the existing `server.ts` file:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRouter from './routes/projects.routes';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFound';
import { requestLogger } from './utils/logger';
import { db, closeDatabase } from './db/config';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS - Allow frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// JSON body parser
app.use(express.json());

// URL-encoded body parser
app.use(express.urlencoded({ extended: true }));

// Request logger (must be after body parsers)
app.use(requestLogger);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/projects', projectsRouter);

// 404 handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database connected: ${db ? '✓' : '✗'}`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await closeDatabase();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(async () => {
    console.log('HTTP server closed');
    await closeDatabase();
    process.exit(0);
  });
});

export default app;
```

**Server Startup Log Example**:
```
🚀 Server running on http://localhost:3000
📊 Database connected: ✓
🌍 CORS enabled for: http://localhost:5173
📝 Environment: development
```

---

### 5.2 Update Environment Variables

**File**: `backend/.env`

Add missing environment variables:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/project_management_db
FRONTEND_URL=http://localhost:5173
```

**File**: `backend/.env.example`

Update the example file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/project_management_db

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## Phase 6: Testing (30 minutes)

### 6.1 Test Checklist

**Manual Testing with Thunder Client / Postman / curl**

#### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-04T12:00:00.000Z"
}
```

---

#### Test 2: Get All Projects
```bash
curl http://localhost:3000/api/projects
```

**Expected**:
- Status: 200
- Response contains array of projects with phases
- Each project has all required fields

---

#### Test 3: Get Project by ID
```bash
# Replace {id} with actual project ID from database
curl http://localhost:3000/api/projects/{id}
```

**Expected**:
- Status: 200
- Response contains single project with phases array

**Error Case**:
```bash
curl http://localhost:3000/api/projects/invalid-uuid
```
- Status: 400
- Error: "Invalid project ID format"

---

#### Test 4: Create Project (Valid)
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "client": "Test Client",
    "description": "A test project",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "projectManager": "John Doe",
    "members": ["Jane", "Bob"]
  }'
```

**Expected**:
- Status: 201
- Response contains created project with `id`, `createdAt`, `updatedAt`

---

#### Test 5: Create Project (Validation Error)
```bash
# Missing required fields
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"description": "Missing title and client"}'
```

**Expected**:
- Status: 400
- Response contains validation errors for `title` and `client`

---

#### Test 6: Create Project (Date Validation Error)
```bash
# End date before start date
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "client": "Test",
    "startDate": "2025-12-31",
    "endDate": "2025-01-01"
  }'
```

**Expected**:
- Status: 400
- Error: "End date must be on or after start date"

---

#### Test 7: Update Project
```bash
curl -X PUT http://localhost:3000/api/projects/{id} \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

**Expected**:
- Status: 200
- Response contains updated project
- Only specified fields are updated

---

#### Test 8: Update Non-Existent Project
```bash
curl -X PUT http://localhost:3000/api/projects/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated"}'
```

**Expected**:
- Status: 404
- Error: "Project not found"

---

#### Test 9: Delete Project
```bash
curl -X DELETE http://localhost:3000/api/projects/{id}
```

**Expected**:
- Status: 200
- Success message

**Verify**: Phases are also deleted (cascade)

---

#### Test 10: Add Phase to Project
```bash
curl -X POST http://localhost:3000/api/projects/{id}/phases \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Planning Phase",
    "description": "Initial planning",
    "startDate": "2025-01-01",
    "endDate": "2025-03-31",
    "status": "planned",
    "order": 1
  }'
```

**Expected**:
- Status: 201
- Response contains created phase with `id` and `projectId`

---

#### Test 11: Add Phase to Non-Existent Project
```bash
curl -X POST http://localhost:3000/api/projects/00000000-0000-0000-0000-000000000000/phases \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "order": 1}'
```

**Expected**:
- Status: 404
- Error: "Project not found"

---

#### Test 12: Update Phase
```bash
curl -X PUT http://localhost:3000/api/projects/{projectId}/phases/{phaseId} \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

**Expected**:
- Status: 200
- Response contains updated phase

---

#### Test 13: Delete Phase
```bash
curl -X DELETE http://localhost:3000/api/projects/{projectId}/phases/{phaseId}
```

**Expected**:
- Status: 200
- Success message

---

#### Test 14: 404 Route
```bash
curl http://localhost:3000/api/nonexistent
```

**Expected**:
- Status: 404
- Error: "Route GET /api/nonexistent not found"

---

### 6.2 Testing Matrix

| Scenario | Endpoint | Method | Expected Status | Notes |
|----------|----------|--------|----------------|-------|
| Get all projects | `/api/projects` | GET | 200 | Returns array |
| Get project (valid ID) | `/api/projects/:id` | GET | 200 | Returns object |
| Get project (invalid UUID) | `/api/projects/abc` | GET | 400 | Validation error |
| Get project (not found) | `/api/projects/{uuid}` | GET | 404 | Project not found |
| Create project (valid) | `/api/projects` | POST | 201 | Returns created project |
| Create project (missing fields) | `/api/projects` | POST | 400 | Validation errors |
| Create project (invalid dates) | `/api/projects` | POST | 400 | Date validation error |
| Update project (valid) | `/api/projects/:id` | PUT | 200 | Returns updated project |
| Update project (not found) | `/api/projects/:id` | PUT | 404 | Project not found |
| Delete project (valid) | `/api/projects/:id` | DELETE | 200 | Success message |
| Delete project (not found) | `/api/projects/:id` | DELETE | 404 | Project not found |
| Add phase (valid) | `/api/projects/:id/phases` | POST | 201 | Returns created phase |
| Add phase (project not found) | `/api/projects/:id/phases` | POST | 404 | Project not found |
| Update phase (valid) | `/api/projects/:id/phases/:phaseId` | PUT | 200 | Returns updated phase |
| Update phase (not found) | `/api/projects/:id/phases/:phaseId` | PUT | 404 | Phase not found |
| Delete phase (valid) | `/api/projects/:id/phases/:phaseId` | DELETE | 200 | Success message |
| Delete phase (not found) | `/api/projects/:id/phases/:phaseId` | DELETE | 404 | Phase not found |
| Non-existent route | `/api/invalid` | GET | 404 | Route not found |

---

### 6.3 Database Verification

After creating/updating/deleting, verify in PostgreSQL:

```sql
-- Check project count
SELECT COUNT(*) FROM projects;

-- Check newest project
SELECT * FROM projects ORDER BY created_at DESC LIMIT 1;

-- Check phases for a project
SELECT * FROM phases WHERE project_id = 'your-project-id';

-- Verify cascade delete (phases should be deleted when project is deleted)
-- First create a project and add phases, then delete the project
SELECT COUNT(*) FROM phases WHERE project_id = 'deleted-project-id';
-- Should return 0
```

---

## Phase 7: Code Quality (15 minutes)

### 7.1 Run Linter

```bash
cd backend
npm run lint
```

**Fix any linting errors**:
- Unused imports
- Missing types
- Console.logs in production code (keep only in error handler and logger)

---

### 7.2 Run Type Checker

```bash
cd backend
npx tsc --noEmit
```

**Fix any type errors**:
- Ensure all function parameters are typed
- Ensure all return types are explicit or inferred correctly
- No `any` types (unless absolutely necessary)

---

### 7.3 Test Build

```bash
cd backend
npm run build
```

**Expected**:
- No errors
- `dist/` directory created
- All `.ts` files compiled to `.js`

---

### 7.4 Test Production Build

```bash
npm run start
```

**Expected**:
- Server starts successfully
- All endpoints work
- No TypeScript errors

---

## Success Criteria

Step 4 is complete when all of the following are true:

- [x] All 8 API endpoints are implemented and working
- [x] Validation is enforced on all inputs (Zod schemas)
- [x] Error handling is consistent across all endpoints
- [x] Database operations work correctly (create, read, update, delete)
- [x] Foreign key relationships are respected (phases belong to projects)
- [x] Cascade delete works (deleting project deletes phases)
- [x] All HTTP status codes are correct (200, 201, 400, 404, 500)
- [x] Response format is consistent (`{ success, data/error }`)
- [x] CORS is configured for frontend origin
- [x] Request logging is working
- [x] All tests in testing checklist pass
- [x] No linting errors
- [x] No TypeScript errors
- [x] Production build works

---

## Troubleshooting Guide

### Issue: "Cannot find module" errors

**Solution**: Ensure all imports use correct paths
```bash
# Verify file exists
ls backend/src/utils/errors.ts

# Check tsconfig paths are correct
cat backend/tsconfig.json
```

---

### Issue: Validation not working

**Solution**: Ensure middleware order is correct
```typescript
// Correct order:
router.post('/',
  validateRequest(schema),  // <-- Validation first
  asyncHandler(controller)  // <-- Controller second
);
```

---

### Issue: 500 errors with no details

**Solution**: Check NODE_ENV and error handler
```typescript
// In development, stack traces are shown
process.env.NODE_ENV === 'development'

// Check error handler is registered last
app.use(errorHandler); // <-- Must be last middleware
```

---

### Issue: CORS errors from frontend

**Solution**: Verify CORS configuration
```typescript
app.use(cors({
  origin: 'http://localhost:5173', // <-- Must match frontend URL
  credentials: true,
}));
```

---

### Issue: Database connection errors

**Solution**: Check PostgreSQL and environment variables
```bash
# Verify PostgreSQL is running
pg_isready

# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

---

## Next Steps

After completing Step 4:

1. **Test all endpoints manually** with Thunder Client/Postman
2. **Verify database operations** in PostgreSQL
3. **Check logs** for any warnings or errors
4. **Document any issues** or edge cases discovered
5. **Proceed to Step 5**: Frontend-Backend Integration

---

## Estimated Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Foundation (errors, utils, middleware) | 30 min |
| 2 | Validation (Zod schemas) | 30 min |
| 3 | Controllers (8 functions) | 45 min |
| 4 | Routes (8 routes) | 15 min |
| 5 | Server Setup | 20 min |
| 6 | Testing (manual) | 30 min |
| 7 | Code Quality (lint, type-check) | 15 min |
| **Total** | | **~3 hours** |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                       CLIENT                            │
│                 (Frontend - React)                      │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP Requests
                      ▼
┌─────────────────────────────────────────────────────────┐
│                   EXPRESS SERVER                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Middleware Stack (in order)                      │  │
│  │  1. CORS                                          │  │
│  │  2. Body Parser (JSON)                            │  │
│  │  3. Request Logger                                │  │
│  │  4. Routes                                        │  │
│  │     ├─ Validation Middleware (Zod)               │  │
│  │     └─ Async Handler (error catching)            │  │
│  │  5. 404 Handler                                   │  │
│  │  6. Global Error Handler                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    ┌────────┐  ┌─────────┐  ┌─────────┐
    │ Routes │→ │Controllers│→│Validators│
    └────────┘  └────┬────┘  └─────────┘
                     │
                     ▼
           ┌──────────────────┐
           │  Query Functions │
           │   (Drizzle ORM)  │
           └────────┬─────────┘
                    │
                    ▼
           ┌──────────────────┐
           │   PostgreSQL DB  │
           │   - projects     │
           │   - phases       │
           └──────────────────┘
```

---

## File Checklist

### New Files to Create (13 files):

- [ ] `backend/src/utils/errors.ts`
- [ ] `backend/src/utils/asyncHandler.ts`
- [ ] `backend/src/utils/logger.ts`
- [ ] `backend/src/middleware/errorHandler.ts`
- [ ] `backend/src/middleware/validateRequest.ts`
- [ ] `backend/src/middleware/notFound.ts`
- [ ] `backend/src/validators/project.validator.ts`
- [ ] `backend/src/validators/phase.validator.ts`
- [ ] `backend/src/controllers/projects.controller.ts`
- [ ] `backend/src/routes/projects.routes.ts`

### Files to Update (3 files):

- [ ] `backend/src/server.ts` - Add middleware and routes
- [ ] `backend/.env` - Add FRONTEND_URL
- [ ] `backend/.env.example` - Update with new variables

### Total Lines of Code: ~1,200 lines

---

## Final Notes

### Coding Standards Compliance

This implementation follows the principles from `coding-standards.md`:

1. **Single Responsibility**: Each function does one thing
   - Controllers handle business logic
   - Validators handle validation
   - Middleware handles cross-cutting concerns

2. **SOLID Principles**:
   - **S**: Each file has single purpose
   - **O**: Can extend with new error types without modifying existing code
   - **L**: Error classes are properly substitutable
   - **I**: Small, focused interfaces (validators, controllers)
   - **D**: Controllers depend on query abstractions, not concrete implementations

3. **Command-Query Separation**:
   - GET endpoints return data (queries)
   - POST/PUT/DELETE endpoints modify state (commands)

4. **Error Handling**:
   - Exceptions instead of sentinel values
   - Context provided in error messages
   - Fail fast validation

5. **Clean Code**:
   - Intention-revealing names
   - Functions ≤ 20 lines
   - Few arguments (using parameter objects)
   - No side effects in queries

### Performance Considerations

- Database queries use indexes (from Step 3)
- Cascade delete reduces application logic
- Connection pooling configured
- Async operations throughout

### Security Considerations

- Input validation on all endpoints
- UUID validation prevents SQL injection
- No sensitive data in error messages (production)
- CORS configured for specific origin

---

**Document Version**: 1.0  
**Created**: October 4, 2025  
**Estimated Completion**: 2-3 hours  
**Dependencies**: Step 3 complete

---

**Ready to implement! 🚀**

