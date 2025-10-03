# Project Management Web Application

A modern web application for organizing and managing projects with detailed information, roadmaps, and team members.

## Tech Stack

- **Frontend**: React 19.1.1 + TypeScript 5.9 + Vite 7.0 + Tailwind CSS 3.4.11
- **Backend**: Node.js 22.18.0 LTS + Express 5.0.0 + TypeScript 5.9
- **Database**: PostgreSQL 18.0 + Drizzle ORM
- **Package Manager**: NPM 10.2.0

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v22.18.0 (LTS) or higher
- **NPM**: v10.2.0 or higher
- **PostgreSQL**: v18.0 or higher

## Project Structure

```
demo-tbscg-projects/
├── frontend/          # React + Vite application
├── backend/           # Express API server
├── shared/            # Shared TypeScript types
├── func.md            # Functional requirements
├── tech-decisions.md  # Technical decisions
├── plan.md            # Implementation plan
├── api-spec.md        # API specification
└── README.md          # This file
```

## Getting Started

### 1. Install Dependencies

Install all dependencies for the monorepo:

```bash
npm install
```

### 2. Set Up Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/project_management_db
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 3. Set Up PostgreSQL Database

Create the database (if not using the database setup in Step 3 of the plan):

```bash
# Using psql
psql postgres
CREATE DATABASE project_management_db;
\q
```

### 4. Run Database Migrations

Once the database schema is created (Step 3 of implementation plan):

```bash
npm run db:migrate
```

### 5. Seed the Database (Optional)

Add sample data:

```bash
npm run db:seed
```

### 6. Start Development Servers

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api

## Available Scripts

### Root Level

- `npm run dev` - Run both frontend and backend concurrently
- `npm run dev:frontend` - Run frontend only
- `npm run dev:backend` - Run backend only
- `npm run build` - Build both applications
- `npm run lint` - Lint all code
- `npm run type-check` - Type check all code
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

### Frontend

- `npm run dev --workspace=frontend` - Start Vite dev server
- `npm run build --workspace=frontend` - Build for production
- `npm run lint --workspace=frontend` - Lint frontend code
- `npm run preview --workspace=frontend` - Preview production build

### Backend

- `npm run dev --workspace=backend` - Start Express server with hot reload
- `npm run build --workspace=backend` - Build TypeScript to JavaScript
- `npm run start --workspace=backend` - Run production build
- `npm run lint --workspace=backend` - Lint backend code

## Development Workflow

1. **Make Changes**: Edit files in `frontend/src/` or `backend/src/`
2. **Hot Reload**: Changes are automatically reflected (both frontend and backend)
3. **Type Check**: Run `npm run type-check` to verify TypeScript
4. **Lint**: Run `npm run lint` to check code quality
5. **Test**: Test functionality in the browser and with API calls

## API Documentation

See [api-spec.md](./api-spec.md) for complete API documentation.

**Quick Reference**:
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/phases` - Add phase
- `PUT /api/projects/:id/phases/:phaseId` - Update phase
- `DELETE /api/projects/:id/phases/:phaseId` - Delete phase

## Features

- ✅ View list of all projects
- ✅ Create new projects
- ✅ View detailed project information
- ✅ Edit projects (view/edit mode toggle)
- ✅ Delete projects
- ✅ Manage project phases (roadmap)
- ✅ Add/edit/delete phases
- ✅ Modern UI with #ff8204 orange primary color
- ✅ Desktop-optimized layout
- ✅ Type-safe frontend and backend

## Implementation Status

**Step 1**: ✅ Bootstrap, Tooling, and API Definition (**COMPLETE**)
- Monorepo structure set up
- Frontend with Vite, React, TypeScript, Tailwind CSS
- Backend with Express and TypeScript
- Shared types package
- API specification documented

**Step 2**: ✅ Frontend UI with Mocks (**COMPLETE**)
- All pages implemented (List, Detail, Edit, Create)
- 10 reusable UI components
- Full CRUD operations with mock API
- Phase management (add, edit, delete)
- Form validation and error handling
- 2,500+ lines of code
- **See STEP2_FINAL.md for complete details**

**Step 3**: ⏳ Database Schema and ORM Setup (Pending)

**Step 4**: ⏳ Backend Implementation (Pending)

**Step 5**: ⏳ Integration and Testing (Pending)

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use:

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill
lsof -ti:5173 | xargs kill
```

### PostgreSQL Connection Issues

Ensure PostgreSQL is running:

```bash
# macOS with Homebrew
brew services start postgresql

# Check status
brew services list
```

### TypeScript Errors

Clear TypeScript cache and rebuild:

```bash
# Remove build artifacts
rm -rf frontend/dist backend/dist
rm -rf frontend/.vite backend/.vite

# Reinstall dependencies
npm install

# Type check
npm run type-check
```

## Documentation

- [Functional Requirements](./func.md) - Complete feature specifications
- [Technical Decisions](./tech-decisions.md) - Technology stack rationale
- [Implementation Plan](./plan.md) - 5-step development plan
- [API Specification](./api-spec.md) - REST API documentation
- [Coding Standards](./coding-standards.md) - Code style and conventions (if available)

## Contributing

This is an internal project. Follow the implementation plan in `plan.md`.

## License

Internal Use Only

## Next Steps

Continue with Step 2 of the implementation plan:
1. Set up React Router for navigation
2. Create reusable UI components
3. Build project list page
4. Build project detail page with view/edit modes
5. Implement all CRUD operations with mocked API

See [plan.md](./plan.md) for detailed instructions.


