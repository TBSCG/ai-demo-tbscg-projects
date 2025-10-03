# Implementation Plan
## Project Management Web Application

---

## Overview

This plan outlines a 5-step approach to implement the project management web application, building from foundation to completion. Each step is designed to be independently testable and builds upon the previous step.

**Timeline Estimate**: 2-3 weeks for initial implementation

---

## Step 1: Bootstrap, Tooling and API Definition

**Goal**: Set up the project structure, tooling, and define the API contract

### 1.1 Project Structure Setup
- Initialize monorepo with npm workspaces
- Create three directories: `frontend/`, `backend/`, `shared/`
- Set up root `package.json` with workspace configuration
- Configure scripts for running frontend and backend concurrently

### 1.2 Frontend Bootstrap
- Initialize Vite project with React + TypeScript template
- Install dependencies:
  - `react@19.1.1`, `react-dom@19.1.1`
  - `react-router-dom` for routing
  - `axios` for API calls
  - `axios-mock-adapter` for mocking (dev dependency)
  - `tailwindcss@3.4.11`, `postcss`, `autoprefixer`
- Configure Tailwind with custom theme (primary color: #ff8204)
- Set up CSS Modules support in Vite config
- Configure TypeScript (`tsconfig.json`) with strict mode
- Set up ESLint with React and TypeScript rules

### 1.3 Backend Bootstrap
- Initialize Express TypeScript project
- Install dependencies:
  - `express@5.0.0`
  - `typescript@5.9`, `@types/node`, `@types/express`
  - `tsx` for development
  - `cors` for CORS handling
  - `dotenv` for environment variables
- Configure TypeScript (`tsconfig.json`) for Node.js
- Set up ESLint for backend
- Create basic Express server structure with health check endpoint

### 1.4 Shared Types Definition
- Create `shared/types/` directory
- Define TypeScript interfaces:
  - `Project` interface with all fields
  - `Phase` interface for roadmap phases
  - `ApiResponse<T>` generic type for API responses
  - `CreateProjectDto`, `UpdateProjectDto` types
  - `CreatePhaseDto`, `UpdatePhaseDto` types
- Export types from `shared/types/index.ts`
- Configure TypeScript path aliases to import from shared

### 1.5 API Contract Definition
- Document RESTful API endpoints in `api-spec.md`:
  - `GET /api/projects` - List all projects
  - `POST /api/projects` - Create project
  - `GET /api/projects/:id` - Get project by ID
  - `PUT /api/projects/:id` - Update project
  - `DELETE /api/projects/:id` - Delete project
  - `POST /api/projects/:id/phases` - Add phase
  - `PUT /api/projects/:id/phases/:phaseId` - Update phase
  - `DELETE /api/projects/:id/phases/:phaseId` - Delete phase
- Define request/response schemas for each endpoint
- Define error response format

### 1.6 Development Environment
- Create `.env.example` files for both frontend and backend
- Set up NPM scripts:
  - `npm run dev` - Run both frontend and backend
  - `npm run dev:frontend` - Run frontend only
  - `npm run dev:backend` - Run backend only
  - `npm run lint` - Lint all code
  - `npm run type-check` - Type check all code
  - `npm run build` - Build both apps

**Deliverables**:
- Working project structure
- Development servers running
- Shared types accessible from both frontend and backend
- API contract documented
- Linting and type checking configured

---

## Step 2: Frontend UI with Mocked Backend

**Goal**: Build complete UI with all features using mocked API responses

### 2.1 Routing Setup
- Configure React Router with routes:
  - `/` - Project list page
  - `/projects/new` - New project page
  - `/projects/:id` - Project detail page
- Create `App.tsx` with router setup
- Add basic layout with header

### 2.2 API Client Layer
- Create `frontend/src/api/client.ts` with axios instance
- Create `frontend/src/api/projects.ts` with all API methods:
  - `getProjects()`, `getProject(id)`, `createProject(data)`, etc.
- Set up axios-mock-adapter for development
- Create mock data for 5-10 sample projects with phases
- Configure mock responses for all endpoints

### 2.3 Shared UI Components
- Create reusable components in `frontend/src/components/`:
  - `Button` - Primary, secondary, and danger variants
  - `Input` - Text input with label and validation
  - `TextArea` - Multi-line text input
  - `DatePicker` - Date selection component
  - `Select` - Dropdown selection
  - `Modal` - Confirmation dialog
  - `Card` - Container component
  - `Badge` - Status indicators
- Style with Tailwind classes
- Use CSS Modules for component-specific styles
- Ensure all components use #ff8204 for primary actions

### 2.4 Project List Page
- Create `frontend/src/pages/ProjectList.tsx`
- Display all projects in a grid or list layout
- Each project card shows:
  - Title
  - Client name
  - Project manager
  - Start/end dates
  - Visual status indicator
- Add "Create New Project" button (prominent, orange)
- Implement click navigation to detail page
- Add loading and error states

### 2.5 Project Detail Page - View Mode
- Create `frontend/src/pages/ProjectDetail.tsx`
- Display all project information in read-only mode:
  - Title
  - Client
  - Description
  - Start/end dates (formatted nicely)
  - Project manager
  - Members list
  - Roadmap phases timeline
- Add "Edit" button to switch to edit mode
- Add "Delete" button with confirmation modal
- Add "Back to Projects" navigation
- Create visual timeline for roadmap phases

### 2.6 Project Detail Page - Edit Mode
- Implement state management for view/edit mode toggle
- Transform all fields to editable inputs in edit mode:
  - Title input (required validation)
  - Client input (required validation)
  - Description textarea
  - Start/end date pickers
  - Project manager input
  - Members multi-input (add/remove)
- Implement phase management:
  - Add new phase button
  - Edit existing phases (inline or modal)
  - Remove phase button
  - Reorder phases (optional)
- Add "Save" and "Cancel" buttons
- Implement validation before save
- Show success/error messages

### 2.7 Create New Project Page
- Create `frontend/src/pages/NewProject.tsx` or reuse ProjectDetail
- Show empty form with all fields
- Same validation as edit mode
- Save creates new project via API
- Navigate to detail page after creation

### 2.8 State Management
- Use React hooks (useState, useEffect) for local state
- Consider Context API if needed for global state
- Implement optimistic UI updates where appropriate
- Handle loading states consistently

### 2.9 Styling and Polish
- Ensure consistent spacing and typography
- Desktop-optimized layout (max-width: 1280px)
- Add hover effects and transitions
- Ensure accessibility (keyboard navigation, ARIA labels)
- Test on Chrome, Firefox, Safari, Edge

**Deliverables**:
- Fully functional UI with mocked data
- All CRUD operations working with mock adapter
- Modern, clean design with orange primary color
- Responsive and accessible interface
- No backend dependencies yet

---

## Step 3: Database Schema and ORM Setup

**Goal**: Design and implement the database schema with Drizzle ORM

### 3.1 Database Setup
- Install PostgreSQL 18.0 locally
- Create database: `project_management_db`
- Configure connection settings in `.env`

### 3.2 Drizzle ORM Installation
- Install Drizzle dependencies:
  - `drizzle-orm`
  - `drizzle-kit` (dev dependency)
  - `postgres` or `pg` (PostgreSQL driver)
- Create `backend/src/db/config.ts` for database connection
- Configure `drizzle.config.ts` for migrations

### 3.3 Schema Definition
- Create `backend/src/db/schema.ts`
- Define `projects` table:
  - `id` (UUID, primary key)
  - `title` (varchar, not null)
  - `client` (varchar, not null)
  - `description` (text, nullable)
  - `start_date` (date, nullable)
  - `end_date` (date, nullable)
  - `project_manager` (varchar, nullable)
  - `members` (JSON array or separate table)
  - `created_at` (timestamp, default now)
  - `updated_at` (timestamp, default now)
- Define `phases` table:
  - `id` (UUID, primary key)
  - `project_id` (UUID, foreign key to projects)
  - `name` (varchar, not null)
  - `description` (text, nullable)
  - `start_date` (date, nullable)
  - `end_date` (date, nullable)
  - `status` (varchar, nullable)
  - `order` (integer, for sorting)
  - `created_at` (timestamp)
- Add indexes on foreign keys and frequently queried fields

### 3.4 Migrations
- Generate initial migration: `npm run db:generate`
- Review generated SQL
- Apply migration: `npm run db:migrate`
- Verify tables created in PostgreSQL

### 3.5 Seed Data
- Create `backend/src/db/seed.ts`
- Add 5-10 sample projects with phases
- Script should be idempotent (check if data exists)
- Run seed script: `npm run db:seed`

### 3.6 Database Utilities
- Create `backend/src/db/client.ts` - Database connection pool
- Create `backend/src/db/queries/` directory for query functions:
  - `projects.queries.ts` - All project-related queries
  - `phases.queries.ts` - All phase-related queries
- Implement type-safe query functions using Drizzle

**Deliverables**:
- PostgreSQL database running locally
- Drizzle ORM configured and working
- Database schema created and migrated
- Seed data populated
- Type-safe query functions ready

---

## Step 4: Backend Implementation in Express

**Goal**: Implement RESTful API with Express and connect to database

### 4.1 Express Server Configuration
- Update `backend/src/server.ts`:
  - Set up CORS for frontend origin
  - Add JSON body parser middleware
  - Add error handling middleware
  - Configure port (3000) from environment
  - Add request logging (simple console or morgan)

### 4.2 Controller Layer
- Create `backend/src/controllers/projects.controller.ts`
- Implement controller functions:
  - `getAllProjects` - Get all projects with phases
  - `getProjectById` - Get single project with phases
  - `createProject` - Create new project
  - `updateProject` - Update existing project
  - `deleteProject` - Delete project
  - `addPhase` - Add phase to project
  - `updatePhase` - Update phase
  - `deletePhase` - Delete phase
- Add error handling and validation
- Return appropriate HTTP status codes

### 4.3 Routes Setup
- Create `backend/src/routes/projects.routes.ts`
- Define all routes matching API spec:
  - `GET /api/projects`
  - `POST /api/projects`
  - `GET /api/projects/:id`
  - `PUT /api/projects/:id`
  - `DELETE /api/projects/:id`
  - `POST /api/projects/:id/phases`
  - `PUT /api/projects/:id/phases/:phaseId`
  - `DELETE /api/projects/:id/phases/:phaseId`
- Connect routes to controllers
- Mount routes in main server

### 4.4 Data Validation
- Install validation library (Zod recommended)
- Create validation schemas in `backend/src/validators/`:
  - `project.validator.ts` - Project validation schemas
  - `phase.validator.ts` - Phase validation schemas
- Add validation middleware to routes
- Return clear validation errors to frontend

### 4.5 Error Handling
- Create custom error classes
- Implement global error handler middleware
- Return consistent error response format:
  - `{ success: false, error: string, details?: any }`
- Handle common errors (not found, validation, database)
- Log errors appropriately

### 4.6 Integration with Database
- Connect controller functions to Drizzle query functions
- Ensure transactions where needed (e.g., creating project with phases)
- Handle database errors gracefully
- Add connection pool management

### 4.7 Testing Backend with Thunder Client/Postman
- Test all endpoints manually
- Verify CRUD operations work correctly
- Check error handling
- Verify data validation
- Test edge cases (invalid IDs, missing fields, etc.)

**Deliverables**:
- Fully functional REST API
- All endpoints working and tested
- Data validation implemented
- Error handling consistent
- Database integration complete
- API matches specification

---

## Step 5: Integration, Testing, and Documentation

**Goal**: Connect frontend to real backend, test thoroughly, and document

### 5.1 Frontend-Backend Integration
- Remove axios-mock-adapter from frontend
- Update axios base URL to backend server (localhost:3000)
- Test all frontend features with real backend:
  - List projects
  - View project details
  - Create new project
  - Edit project
  - Delete project
  - Manage phases
- Fix any integration issues
- Ensure error messages display correctly
- Test loading states

### 5.2 End-to-End Testing
- Test complete user workflows:
  - Create project → Add phases → Edit → Delete
  - Navigate between pages
  - Browser back/forward buttons
  - Refresh page scenarios
- Test validation:
  - Required fields
  - Date validation (end > start)
  - Empty states
- Test error scenarios:
  - Network errors
  - Server errors
  - Invalid data
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)

### 5.3 Bug Fixes and Polish
- Fix any bugs discovered during testing
- Polish animations and transitions
- Improve error messages
- Optimize performance:
  - Check for unnecessary re-renders
  - Optimize database queries
  - Add indexes if needed
- Ensure consistent styling
- Final accessibility check

### 5.4 Code Quality Review
- Run linter on all code: `npm run lint`
- Fix all linting errors
- Run type checking: `npm run type-check`
- Fix any type errors
- Review code for best practices
- Add comments where needed
- Remove console.logs and debug code

### 5.5 Documentation

#### User Documentation
- Create `USER_GUIDE.md`:
  - How to use the application
  - Feature overview with screenshots
  - Common workflows

#### Developer Documentation
- Create `README.md`:
  - Project overview
  - Prerequisites (Node.js, PostgreSQL versions)
  - Installation instructions
  - Environment setup
  - Running the application
  - Available npm scripts
  - Project structure overview
- Update `api-spec.md`:
  - Add examples for each endpoint
  - Document error responses
  - Add curl examples

#### Technical Documentation
- Add inline code comments for complex logic
- Document component props with TypeScript
- Add JSDoc comments for utility functions
- Document database schema decisions

### 5.6 Final Verification
- Clean database and re-seed
- Test fresh installation process:
  - Clone repo
  - Install dependencies
  - Set up database
  - Run migrations and seed
  - Start servers
  - Verify everything works
- Create checklist of all functional requirements
- Verify each requirement is met
- Test all success criteria from func.md

### 5.7 Deployment Preparation (Optional)
- Create production build scripts
- Document deployment requirements
- Prepare environment variable templates
- Document backup and restore procedures
- Consider Docker setup for easier deployment

**Deliverables**:
- Fully integrated and working application
- All features tested and verified
- Bugs fixed and UI polished
- Complete documentation
- Clean, linted, type-safe codebase
- Ready for use or deployment

---

## Success Metrics

The implementation will be considered complete when:
1. ✅ All functional requirements from func.md are implemented
2. ✅ All CRUD operations work correctly
3. ✅ Frontend and backend are fully integrated
4. ✅ Database persists data correctly
5. ✅ UI is modern and matches design requirements (#ff8204 orange primary)
6. ✅ Application is desktop-optimized and responsive
7. ✅ Code is linted, type-checked, and documented
8. ✅ Application can be installed and run by following README

---

## Risk Mitigation

**Potential Risks**:
- React 19.1.1 compatibility issues → Use stable React 18 if needed
- Express 5.0.0 breaking changes → Verify middleware compatibility
- Drizzle ORM learning curve → Review documentation thoroughly
- Date handling complexities → Use standard Date objects, consider date-fns

**Mitigation Strategy**:
- Build incrementally and test each step
- Keep each step independent
- Use TypeScript to catch issues early
- Test on real data throughout development

---

## Next Steps After Completion

Future enhancements to consider:
- Add search and filter functionality
- Implement project templates
- Add file attachments
- Create activity log
- Add data export (PDF, Excel)
- Implement authentication if needed
- Mobile-responsive design
- Real-time collaboration features

---

## Document Information
- **Version**: 1.0
- **Created**: October 3, 2025
- **Estimated Duration**: 2-3 weeks
- **Prerequisites**: Node.js 22.18.0, PostgreSQL 18.0, NPM 10.2.0

