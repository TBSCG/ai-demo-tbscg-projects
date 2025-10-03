# API Specification
## Project Management REST API

**Base URL**: `http://localhost:3000`

**Response Format**: All responses follow a standard format with `success` field and either `data` or `error` field.

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": <response data>
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {} // Optional, only in development
}
```

---

## Endpoints

### Health Check

#### GET /health
Check if the server is running.

**Response**:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

## Projects

### List All Projects

#### GET /api/projects
Get a list of all projects with their phases.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Project Alpha",
      "client": "Acme Corp",
      "description": "A description of the project",
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "projectManager": "John Doe",
      "members": ["Jane Smith", "Bob Johnson"],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### Get Project by ID

#### GET /api/projects/:id
Get a single project with all its details and phases.

**Parameters**:
- `id` (string, required): Project UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Project Alpha",
    "client": "Acme Corp",
    "description": "A detailed description",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31",
    "projectManager": "John Doe",
    "members": ["Jane Smith", "Bob Johnson"],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z",
    "phases": [
      {
        "id": "uuid",
        "projectId": "uuid",
        "name": "Planning",
        "description": "Initial planning phase",
        "startDate": "2025-01-01",
        "endDate": "2025-03-31",
        "status": "completed",
        "order": 1,
        "createdAt": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

### Create Project

#### POST /api/projects
Create a new project.

**Request Body**:
```json
{
  "title": "Project Beta",
  "client": "Tech Inc",
  "description": "Optional description",
  "startDate": "2025-02-01",
  "endDate": "2025-08-31",
  "projectManager": "Jane Doe",
  "members": ["Alice Brown", "Charlie Green"]
}
```

**Required Fields**:
- `title` (string)
- `client` (string)

**Optional Fields**:
- `description` (string | null)
- `startDate` (string | null) - ISO date format
- `endDate` (string | null) - ISO date format
- `projectManager` (string | null)
- `members` (string[]) - defaults to empty array

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Project Beta",
    "client": "Tech Inc",
    "description": "Optional description",
    "startDate": "2025-02-01",
    "endDate": "2025-08-31",
    "projectManager": "Jane Doe",
    "members": ["Alice Brown", "Charlie Green"],
    "createdAt": "2025-10-03T12:00:00Z",
    "updatedAt": "2025-10-03T12:00:00Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "Validation error",
  "details": {
    "title": "Title is required",
    "client": "Client is required"
  }
}
```

---

### Update Project

#### PUT /api/projects/:id
Update an existing project.

**Parameters**:
- `id` (string, required): Project UUID

**Request Body** (all fields optional):
```json
{
  "title": "Updated Title",
  "client": "Updated Client",
  "description": "Updated description",
  "startDate": "2025-02-15",
  "endDate": "2025-09-30",
  "projectManager": "Updated Manager",
  "members": ["New Member 1", "New Member 2"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "client": "Updated Client",
    "description": "Updated description",
    "startDate": "2025-02-15",
    "endDate": "2025-09-30",
    "projectManager": "Updated Manager",
    "members": ["New Member 1", "New Member 2"],
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-10-03T12:30:00Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

### Delete Project

#### DELETE /api/projects/:id
Delete a project and all its phases.

**Parameters**:
- `id` (string, required): Project UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

## Phases

### Add Phase to Project

#### POST /api/projects/:id/phases
Add a new phase to a project.

**Parameters**:
- `id` (string, required): Project UUID

**Request Body**:
```json
{
  "name": "Development",
  "description": "Development phase",
  "startDate": "2025-04-01",
  "endDate": "2025-08-31",
  "status": "in-progress",
  "order": 2
}
```

**Required Fields**:
- `name` (string)
- `order` (number)

**Optional Fields**:
- `description` (string | null)
- `startDate` (string | null)
- `endDate` (string | null)
- `status` ('planned' | 'in-progress' | 'completed' | null)

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "name": "Development",
    "description": "Development phase",
    "startDate": "2025-04-01",
    "endDate": "2025-08-31",
    "status": "in-progress",
    "order": 2,
    "createdAt": "2025-10-03T12:00:00Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Project not found"
}
```

---

### Update Phase

#### PUT /api/projects/:id/phases/:phaseId
Update an existing phase.

**Parameters**:
- `id` (string, required): Project UUID
- `phaseId` (string, required): Phase UUID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Phase Name",
  "description": "Updated description",
  "startDate": "2025-04-15",
  "endDate": "2025-09-15",
  "status": "completed",
  "order": 3
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "name": "Updated Phase Name",
    "description": "Updated description",
    "startDate": "2025-04-15",
    "endDate": "2025-09-15",
    "status": "completed",
    "order": 3,
    "createdAt": "2025-10-03T12:00:00Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Phase not found"
}
```

---

### Delete Phase

#### DELETE /api/projects/:id/phases/:phaseId
Delete a phase from a project.

**Parameters**:
- `id` (string, required): Project UUID
- `phaseId` (string, required): Phase UUID

**Response**:
```json
{
  "success": true,
  "data": {
    "message": "Phase deleted successfully"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Phase not found"
}
```

---

## HTTP Status Codes

- `200 OK` - Successful GET, PUT requests
- `201 Created` - Successful POST requests
- `400 Bad Request` - Validation errors
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server errors

---

## CORS

CORS is enabled for all origins in development. In production, configure allowed origins in the backend.

---

## Example Requests

### Using curl

**Get all projects**:
```bash
curl http://localhost:3000/api/projects
```

**Create a project**:
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"New Project","client":"Client Name"}'
```

**Get project by ID**:
```bash
curl http://localhost:3000/api/projects/[project-id]
```

**Update project**:
```bash
curl -X PUT http://localhost:3000/api/projects/[project-id] \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

**Delete project**:
```bash
curl -X DELETE http://localhost:3000/api/projects/[project-id]
```

**Add phase**:
```bash
curl -X POST http://localhost:3000/api/projects/[project-id]/phases \
  -H "Content-Type: application/json" \
  -d '{"name":"Phase Name","order":1}'
```

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD)
- All UUIDs are version 4 UUIDs
- Timestamps are in ISO 8601 format with timezone
- The `members` field is stored as a JSON array of strings
- Phases are returned with the project in GET /api/projects/:id
- Deleting a project cascades to delete all its phases


