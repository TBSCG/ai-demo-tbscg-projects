# Step 2: Frontend UI with Mocked Backend - Detailed Plan

**Goal**: Build a complete, functional UI with all features using mocked API responses via axios-mock-adapter.

**Duration Estimate**: 5-7 days

**Status**: Ready to start (Step 1 complete)

---

## Overview

In this step, we'll build the entire frontend application with full functionality using mocked data. This approach allows us to:
- Develop and test the UI independently of the backend
- Iterate quickly on design and user experience
- Define the exact API contract through usage
- Validate all functional requirements before database integration

By the end of this step, you'll have a fully functional UI that can create, read, update, and delete projects with phases - all using in-memory mock data.

---

## Phase 1: Foundation (Day 1)

### 1.1 Routing Setup

**File**: `frontend/src/App.tsx`

**Tasks**:
- Install React Router DOM (already in package.json)
- Set up `BrowserRouter` wrapper
- Define all routes:
  - `/` → `ProjectListPage`
  - `/projects/new` → `NewProjectPage` (or reuse ProjectDetailPage)
  - `/projects/:id` → `ProjectDetailPage`
- Create basic layout component with header
- Add navigation helpers

**Implementation Details**:
```tsx
// App.tsx structure
<BrowserRouter>
  <Layout>
    <Routes>
      <Route path="/" element={<ProjectListPage />} />
      <Route path="/projects/new" element={<NewProjectPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Layout>
</BrowserRouter>
```

**Deliverables**:
- ✅ Routes configured
- ✅ Navigation working (browser back/forward)
- ✅ Layout component with header showing "Project Management"
- ✅ 404 page for invalid routes

---

### 1.2 API Client Layer

**Files**:
- `frontend/src/api/client.ts` - Axios instance
- `frontend/src/api/projects.ts` - Project API methods
- `frontend/src/api/mocks.ts` - Mock adapter setup
- `frontend/src/api/mockData.ts` - Sample data

**Tasks**:

#### 1.2.1 Create Axios Client
```typescript
// client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```

#### 1.2.2 Create Mock Data
**File**: `frontend/src/api/mockData.ts`

Create 8-10 sample projects with:
- Variety of clients
- Different date ranges
- Various project managers
- 2-5 phases per project with different statuses
- Diverse team members

**Example Structure**:
```typescript
export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Website Redesign',
    client: 'Acme Corp',
    description: 'Complete overhaul of company website...',
    startDate: '2025-01-15',
    endDate: '2025-06-30',
    projectManager: 'Sarah Johnson',
    members: ['Mike Chen', 'Emily Rodriguez', 'Tom Watson'],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  // ... 7-9 more projects
];

export const mockPhases: Record<string, Phase[]> = {
  '1': [
    {
      id: 'p1',
      projectId: '1',
      name: 'Discovery',
      description: 'Research and planning',
      startDate: '2025-01-15',
      endDate: '2025-02-28',
      status: 'completed',
      order: 1,
      createdAt: '2025-01-01T00:00:00Z',
    },
    // ... more phases
  ],
  // ... phases for other projects
};
```

#### 1.2.3 Set Up Mock Adapter
**File**: `frontend/src/api/mocks.ts`

```typescript
import MockAdapter from 'axios-mock-adapter';
import apiClient from './client';
import { mockProjects, mockPhases } from './mockData';

const mock = new MockAdapter(apiClient, { delayResponse: 300 });

// In-memory storage (will reset on refresh)
let projects = [...mockProjects];
let phases = { ...mockPhases };

// GET /api/projects
mock.onGet('/api/projects').reply(200, {
  success: true,
  data: projects,
});

// GET /api/projects/:id
mock.onGet(/\/api\/projects\/[^/]+$/).reply((config) => {
  // Implementation with phases
});

// POST /api/projects
// PUT /api/projects/:id
// DELETE /api/projects/:id
// POST /api/projects/:id/phases
// PUT /api/projects/:id/phases/:phaseId
// DELETE /api/projects/:id/phases/:phaseId

export default mock;
```

#### 1.2.4 Create API Methods
**File**: `frontend/src/api/projects.ts`

```typescript
import apiClient from './client';
import type { Project, CreateProjectDto, UpdateProjectDto, Phase, CreatePhaseDto, UpdatePhaseDto, ApiResponse } from '@demo-tbscg/shared';

export const projectsApi = {
  // Get all projects
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<ApiResponse<Project[]>>('/api/projects');
    return response.data.data;
  },

  // Get project by ID with phases
  getById: async (id: string): Promise<Project & { phases: Phase[] }> => {
    const response = await apiClient.get<ApiResponse<Project & { phases: Phase[] }>>(`/api/projects/${id}`);
    return response.data.data;
  },

  // Create project
  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>('/api/projects', data);
    return response.data.data;
  },

  // Update project
  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const response = await apiClient.put<ApiResponse<Project>>(`/api/projects/${id}`, data);
    return response.data.data;
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`);
  },

  // Phase methods
  phases: {
    create: async (projectId: string, data: CreatePhaseDto): Promise<Phase> => {
      const response = await apiClient.post<ApiResponse<Phase>>(`/api/projects/${projectId}/phases`, data);
      return response.data.data;
    },

    update: async (projectId: string, phaseId: string, data: UpdatePhaseDto): Promise<Phase> => {
      const response = await apiClient.put<ApiResponse<Phase>>(`/api/projects/${projectId}/phases/${phaseId}`, data);
      return response.data.data;
    },

    delete: async (projectId: string, phaseId: string): Promise<void> => {
      await apiClient.delete(`/api/projects/${projectId}/phases/${phaseId}`);
    },
  },
};
```

**Deliverables**:
- ✅ Axios client configured
- ✅ Mock adapter intercepting all API calls
- ✅ 8-10 realistic sample projects with phases
- ✅ All API methods implemented and typed
- ✅ Mock responses include 300ms delay (simulates network)
- ✅ In-memory CRUD operations working

---

## Phase 2: Component Library (Day 2)

### 2.1 Create Layout Components

#### 2.1.1 Layout Component
**File**: `frontend/src/components/Layout/Layout.tsx`

**Features**:
- Persistent header with app title
- Optional back button (show when not on home page)
- Main content area with proper max-width
- Proper spacing and structure

**Styling**:
- Use Tailwind classes
- Create `Layout.module.css` if needed for complex layouts
- Desktop-optimized (max-w-7xl)

#### 2.1.2 Header Component
**File**: `frontend/src/components/Header/Header.tsx`

**Features**:
- App title "Project Management"
- Optional breadcrumb navigation
- Uses primary orange color for accents

---

### 2.2 Create Base UI Components

Create reusable components in `frontend/src/components/ui/`:

#### 2.2.1 Button Component
**File**: `frontend/src/components/ui/Button/Button.tsx`

**Variants**:
- `primary` - Orange background (#ff8204)
- `secondary` - Gray outline
- `danger` - Red for delete actions
- `ghost` - Text only

**Sizes**: `sm`, `md`, `lg`

**Props**:
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

#### 2.2.2 Input Component
**File**: `frontend/src/components/ui/Input/Input.tsx`

**Features**:
- Label support
- Error message display
- Disabled state
- Full width by default

**Props**:
```typescript
interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
}
```

#### 2.2.3 TextArea Component
**File**: `frontend/src/components/ui/TextArea/TextArea.tsx`

Similar to Input but with:
- Multi-line support
- Rows configuration
- Auto-resize option

#### 2.2.4 DatePicker Component
**File**: `frontend/src/components/ui/DatePicker/DatePicker.tsx`

**Features**:
- Use native HTML5 date input (simple and accessible)
- Label and error support
- Format display value

**Future Enhancement**: Consider library like react-datepicker if needed

#### 2.2.5 Select Component
**File**: `frontend/src/components/ui/Select/Select.tsx`

**Features**:
- Options array
- Label support
- Error display

#### 2.2.6 Badge Component
**File**: `frontend/src/components/ui/Badge/Badge.tsx`

**Usage**: Display phase status, project status

**Variants**:
- `success` - Green (completed)
- `warning` - Yellow (in-progress)
- `info` - Blue (planned)
- `default` - Gray

#### 2.2.7 Card Component
**File**: `frontend/src/components/ui/Card/Card.tsx`

**Features**:
- White background
- Shadow
- Padding
- Optional header/footer slots

#### 2.2.8 Modal Component
**File**: `frontend/src/components/ui/Modal/Modal.tsx`

**Features**:
- Overlay backdrop
- Close on backdrop click (optional)
- Close button
- Header, body, footer sections

**Usage**: Confirmation dialogs (delete project, unsaved changes)

#### 2.2.9 Spinner Component
**File**: `frontend/src/components/ui/Spinner/Spinner.tsx`

**Features**:
- Loading indicator
- Different sizes
- Primary orange color

#### 2.2.10 Alert Component
**File**: `frontend/src/components/ui/Alert/Alert.tsx`

**Variants**:
- `success` - Green (saved successfully)
- `error` - Red (validation errors)
- `warning` - Yellow
- `info` - Blue

**Features**:
- Dismissible option
- Icon support

---

### 2.3 Component Testing

**Tasks**:
- Manually test each component in isolation
- Create a temporary `/components-demo` route to showcase all components
- Verify responsiveness
- Check accessibility (keyboard navigation, ARIA labels)

**Deliverables**:
- ✅ 10 reusable UI components
- ✅ All components styled with Tailwind
- ✅ Primary orange color (#ff8204) used for primary actions
- ✅ TypeScript interfaces for all props
- ✅ Components tested in isolation

---

## Phase 3: Project List Page (Day 3)

### 3.1 ProjectCard Component

**File**: `frontend/src/components/ProjectCard/ProjectCard.tsx`

**Display**:
- Project title (large, bold)
- Client name with icon
- Project manager with icon
- Date range (formatted)
- Member count badge
- Phase progress indicator (optional)

**Interactions**:
- Click anywhere to navigate to detail page
- Hover effect (subtle shadow, scale)

**Styling**:
- Card layout
- Grid of information
- Orange accent on hover
- Truncate long text with ellipsis

**Props**:
```typescript
interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}
```

---

### 3.2 ProjectListPage Component

**File**: `frontend/src/pages/ProjectListPage/ProjectListPage.tsx`

**Structure**:
```
- Header with title "Projects"
- "Create New Project" button (prominent, orange, top-right)
- Project count badge
- Grid of ProjectCard components (3-4 columns)
- Empty state if no projects
- Loading state with spinners
- Error state if API fails
```

**State Management**:
```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  loadProjects();
}, []);

const loadProjects = async () => {
  try {
    setLoading(true);
    const data = await projectsApi.getAll();
    setProjects(data);
  } catch (err) {
    setError('Failed to load projects');
  } finally {
    setLoading(false);
  }
};
```

**Features**:
- Fetch projects on mount
- Display loading spinner while fetching
- Show error alert if fetch fails
- Navigate to `/projects/:id` on card click
- Navigate to `/projects/new` on create button click
- Empty state: "No projects yet. Create your first project!"

**Styling**:
- Max-width container
- Responsive grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- Proper spacing between cards

**Deliverables**:
- ✅ ProjectCard component with all information
- ✅ ProjectListPage with grid layout
- ✅ Loading, error, and empty states
- ✅ Navigation to detail page on click
- ✅ Create button navigates to new project form

---

## Phase 4: Project Detail Page - View Mode (Day 4)

### 4.1 Project Detail Components

#### 4.1.1 ProjectHeader Component
**File**: `frontend/src/components/ProjectDetail/ProjectHeader.tsx`

**Display**:
- Project title (large heading)
- Edit button (orange, top-right)
- Delete button (danger, top-right)
- Back to projects link

#### 4.1.2 ProjectInfo Component
**File**: `frontend/src/components/ProjectDetail/ProjectInfo.tsx`

**Display in view mode**:
- Client (with icon)
- Project Manager (with icon)
- Date range (formatted: "Jan 15, 2025 - Jun 30, 2025")
- Description (multi-line, preserved formatting)
- Members list (badges or chips)

**Layout**: Two-column grid on desktop, single column on mobile

#### 4.1.3 PhaseTimeline Component
**File**: `frontend/src/components/ProjectDetail/PhaseTimeline.tsx`

**Display**:
- Timeline visualization of phases
- Each phase shows:
  - Phase name
  - Status badge (planned/in-progress/completed)
  - Date range
  - Description (if any)
- Phases ordered by `order` field
- Visual connection between phases (line/arrow)

**Styling**:
- Horizontal timeline on desktop
- Vertical timeline on mobile
- Use orange for in-progress, green for completed, gray for planned
- Make it visually appealing (modern timeline design)

---

### 4.2 ProjectDetailPage Component (View Mode)

**File**: `frontend/src/pages/ProjectDetailPage/ProjectDetailPage.tsx`

**Structure**:
```typescript
const [project, setProject] = useState<Project & { phases: Phase[] } | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [isEditMode, setIsEditMode] = useState(false);

const { id } = useParams<{ id: string }>();

useEffect(() => {
  if (id) {
    loadProject(id);
  }
}, [id]);

const loadProject = async (projectId: string) => {
  try {
    setLoading(true);
    const data = await projectsApi.getById(projectId);
    setProject(data);
  } catch (err) {
    setError('Project not found');
  } finally {
    setLoading(false);
  }
};
```

**Layout**:
```
- ProjectHeader (title, buttons)
- ProjectInfo section
- Phases section with PhaseTimeline
- Actions: Edit, Delete
```

**Delete Functionality**:
- Show confirmation modal: "Are you sure you want to delete this project?"
- On confirm, call API and navigate to project list
- Show success message after deletion

**Deliverables**:
- ✅ View mode displaying all project information
- ✅ Phase timeline visualization
- ✅ Delete functionality with confirmation
- ✅ Navigation back to list
- ✅ 404 handling for invalid project IDs
- ✅ Loading and error states

---

## Phase 5: Project Detail Page - Edit Mode (Day 5)

### 5.1 Edit Mode Toggle

**Implementation**:
- "Edit" button switches `isEditMode` to true
- All fields transform to editable inputs
- Show "Save" and "Cancel" buttons
- Hide "Edit" and "Delete" buttons in edit mode

---

### 5.2 ProjectForm Component

**File**: `frontend/src/components/ProjectDetail/ProjectForm.tsx`

**State**:
```typescript
const [formData, setFormData] = useState<UpdateProjectDto>({
  title: project.title,
  client: project.client,
  description: project.description,
  startDate: project.startDate,
  endDate: project.endDate,
  projectManager: project.projectManager,
  members: [...project.members],
});

const [errors, setErrors] = useState<Record<string, string>>({});
const [saving, setSaving] = useState(false);
```

**Fields**:
1. **Title** - Required text input
2. **Client** - Required text input
3. **Description** - TextArea (optional)
4. **Start Date** - DatePicker (optional)
5. **End Date** - DatePicker (optional, must be >= start date)
6. **Project Manager** - Text input (optional)
7. **Members** - Dynamic list:
   - Array of text inputs
   - "Add Member" button
   - Remove button for each member
   - At least one member recommended

**Validation**:
```typescript
const validate = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.title?.trim()) {
    newErrors.title = 'Title is required';
  }
  
  if (!formData.client?.trim()) {
    newErrors.client = 'Client is required';
  }
  
  if (formData.startDate && formData.endDate) {
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Actions**:
- **Save**: Validate, call API, show success, switch to view mode
- **Cancel**: Discard changes, switch to view mode
  - If significant changes: show confirmation modal

---

### 5.3 PhaseManager Component

**File**: `frontend/src/components/ProjectDetail/PhaseManager.tsx`

**Edit Mode Features**:
- List all phases with edit/delete buttons
- "Add Phase" button (orange)
- Inline editing or modal-based editing

#### 5.3.1 PhaseForm Component (Modal)
**File**: `frontend/src/components/ProjectDetail/PhaseForm.tsx`

**Fields**:
- Name (required)
- Description (optional)
- Start Date (optional)
- End Date (optional)
- Status (select: planned/in-progress/completed)
- Order (number, auto-assigned but editable)

**Usage**:
- Modal opens for new phase or editing existing phase
- Validation before save
- Call API to create/update phase

**Functionality**:
```typescript
// Add phase
const handleAddPhase = async (phaseData: CreatePhaseDto) => {
  try {
    const newPhase = await projectsApi.phases.create(project.id, phaseData);
    setProject({ ...project, phases: [...project.phases, newPhase] });
    // Show success message
  } catch (err) {
    // Show error
  }
};

// Update phase
const handleUpdatePhase = async (phaseId: string, phaseData: UpdatePhaseDto) => {
  try {
    const updatedPhase = await projectsApi.phases.update(project.id, phaseId, phaseData);
    setProject({
      ...project,
      phases: project.phases.map(p => p.id === phaseId ? updatedPhase : p)
    });
    // Show success message
  } catch (err) {
    // Show error
  }
};

// Delete phase
const handleDeletePhase = async (phaseId: string) => {
  if (!confirm('Delete this phase?')) return;
  
  try {
    await projectsApi.phases.delete(project.id, phaseId);
    setProject({
      ...project,
      phases: project.phases.filter(p => p.id !== phaseId)
    });
    // Show success message
  } catch (err) {
    // Show error
  }
};
```

**Deliverables**:
- ✅ Edit mode transforms all fields to inputs
- ✅ Form validation with error messages
- ✅ Save updates project via API
- ✅ Cancel discards changes (with confirmation if needed)
- ✅ Phase management: add, edit, delete
- ✅ Success/error notifications
- ✅ Disabled state while saving

---

## Phase 6: Create New Project Page (Day 6)

### 6.1 NewProjectPage Component

**File**: `frontend/src/pages/NewProjectPage/NewProjectPage.tsx`

**Options**:
1. **Reuse ProjectForm**: Navigate to `/projects/new` and render form in "create" mode
2. **Separate Component**: Create dedicated new project form

**Recommended**: Reuse existing components

**Implementation**:
```typescript
const NewProjectPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateProjectDto>({
    title: '',
    client: '',
    description: '',
    startDate: null,
    endDate: null,
    projectManager: '',
    members: [],
  });
  
  const handleCreate = async () => {
    if (!validate()) return;
    
    try {
      const newProject = await projectsApi.create(formData);
      // Show success message
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      // Show error
    }
  };
  
  return (
    <div>
      <h1>Create New Project</h1>
      <ProjectForm
        data={formData}
        onChange={setFormData}
        onSave={handleCreate}
        onCancel={() => navigate('/')}
        mode="create"
      />
    </div>
  );
};
```

**Features**:
- Same form fields as edit mode
- Empty initial values
- "Create Project" button instead of "Save"
- Navigate to new project detail page after creation
- Cancel returns to project list

**Note**: Phases can be added after project creation

**Deliverables**:
- ✅ Create new project form
- ✅ Validation same as edit mode
- ✅ Navigate to new project after creation
- ✅ Cancel navigation
- ✅ Success/error feedback

---

## Phase 7: Polish and Refinement (Day 7)

### 7.1 State Management Improvements

**Consider**:
- Toast notifications for success/error messages
- Loading states everywhere
- Optimistic updates (optional)

**Implementation**:
- Create `useToast` hook or use library like react-hot-toast
- Create `useProject` custom hook for data fetching

---

### 7.2 Styling Polish

**Tasks**:
- Review all pages for consistent spacing
- Ensure primary orange (#ff8204) is used for all primary actions
- Add hover states and transitions
- Polish animations (subtle fades, slides)
- Ensure proper loading skeletons
- Check responsive behavior on different screen sizes

**CSS Modules Usage**:
- Create `.module.css` files for complex component-specific styles
- Use Tailwind for 80% of styling
- Use CSS Modules for:
  - Complex animations
  - Hover effects with multiple properties
  - Custom timeline visualization styles

---

### 7.3 Accessibility (a11y)

**Checklist**:
- ✅ All buttons have proper labels
- ✅ Form inputs have labels (not just placeholders)
- ✅ Keyboard navigation works throughout
- ✅ Focus indicators visible
- ✅ ARIA labels for icons
- ✅ Semantic HTML (header, main, nav, etc.)
- ✅ Color contrast meets WCAG AA standards

---

### 7.4 Error Handling

**Implement**:
- Network error handling with retry option
- 404 page for invalid routes
- Graceful degradation if API fails
- Form validation error messages (clear and helpful)
- Empty states with helpful messages

---

### 7.5 User Experience Enhancements

**Add**:
- Confirmation before destructive actions (delete)
- Unsaved changes warning (if user navigates away)
- Loading indicators for all async operations
- Success messages after mutations
- Keyboard shortcuts (optional):
  - `Esc` to close modals
  - `Cmd+S` / `Ctrl+S` to save (in edit mode)
  - `E` to enter edit mode (in view mode)

---

### 7.6 Date Formatting

**Install**: `date-fns` or use native `Intl.DateTimeFormat`

**Format dates consistently**:
- List view: "Jan 15, 2025"
- Detail view: "January 15, 2025"
- Date inputs: "2025-01-15" (ISO format)

**Example**:
```typescript
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
```

---

### 7.7 Member Management UI

**Enhancement**: Make member input more user-friendly
- Tag-style display
- Easy add/remove
- Perhaps typeahead (mocked list of common names)

---

### 7.8 Phase Timeline Visualization

**Polish**:
- Make timeline visually striking
- Show progress percentage (optional)
- Color code by status
- Make it a standout feature of the app

**Inspiration**: Gantt chart style or modern timeline design

---

## Phase 8: Testing and Documentation (Included in Day 7)

### 8.1 Manual Testing Checklist

**Project List**:
- ✅ Loads all projects
- ✅ Displays correct information on cards
- ✅ Click navigates to detail page
- ✅ Create button navigates to new project page
- ✅ Empty state shows when no projects
- ✅ Loading state displays properly

**Project Detail - View Mode**:
- ✅ Displays all project information correctly
- ✅ Shows phases in timeline
- ✅ Edit button switches to edit mode
- ✅ Delete shows confirmation and removes project
- ✅ Back button returns to list
- ✅ 404 handling for invalid IDs

**Project Detail - Edit Mode**:
- ✅ All fields are editable
- ✅ Validation works (required fields, date logic)
- ✅ Save updates project
- ✅ Cancel discards changes
- ✅ Phase add/edit/delete works
- ✅ Success messages show
- ✅ Error handling works

**New Project**:
- ✅ Form allows creating new project
- ✅ Validation works
- ✅ Successfully creates and navigates to detail
- ✅ Cancel returns to list

**Navigation**:
- ✅ Browser back/forward works
- ✅ Direct URL navigation works
- ✅ 404 page for invalid routes

**Styling**:
- ✅ Desktop layout looks good (1280px, 1440px, 1920px)
- ✅ Primary orange color used consistently
- ✅ Hover effects work
- ✅ Transitions are smooth
- ✅ Forms are well-aligned

**Accessibility**:
- ✅ Tab navigation works
- ✅ Focus indicators visible
- ✅ Labels present for all inputs
- ✅ Modals can be closed with Esc

---

### 8.2 Browser Testing

**Test on**:
- Chrome (primary)
- Firefox
- Safari
- Edge

**Check**:
- Layout consistency
- Tailwind classes rendering
- Date picker behavior
- Modal behavior

---

### 8.3 Create User Flow Documentation

**File**: `frontend/USER_FLOWS.md`

Document:
1. How to view projects
2. How to create a project
3. How to edit a project
4. How to manage phases
5. How to delete a project

Include screenshots if helpful.

---

## Deliverables Summary

By the end of Step 2, you should have:

### ✅ Complete UI Implementation
- Project list page with cards
- Project detail page with view/edit modes
- New project creation page
- All CRUD operations working with mocks

### ✅ Reusable Component Library
- 10+ UI components (Button, Input, TextArea, etc.)
- Consistent styling with Tailwind
- Primary orange color (#ff8204) throughout

### ✅ Mock Data Layer
- axios-mock-adapter configured
- 8-10 sample projects with phases
- All API endpoints mocked
- CRUD operations working in-memory

### ✅ Polish and UX
- Loading, error, and empty states
- Form validation with helpful errors
- Confirmation modals for destructive actions
- Success/error notifications
- Smooth transitions and animations
- Phase timeline visualization

### ✅ Accessibility
- Keyboard navigation
- Proper labels and ARIA attributes
- Focus management
- Semantic HTML

### ✅ Testing
- All features manually tested
- Browser compatibility verified
- No console errors
- Responsive design validated

---

## Tips for Success

1. **Build incrementally**: Don't try to do everything at once. Build one page, test it, then move to the next.

2. **Use placeholder text**: Lorem ipsum is fine during development. Replace with real content in polish phase.

3. **Mock data should be realistic**: Use real company names, realistic dates, and varied data to catch edge cases.

4. **Don't overthink the timeline**: A simple visual representation is fine. Can be enhanced later.

5. **Reuse components**: If you find yourself copying code, extract a component.

6. **Keep the mock adapter separate**: This makes it easy to remove when connecting to real backend in Step 4.

7. **Console log liberally**: During development, log state changes, API calls, etc. Remove before committing.

8. **Test edge cases**:
   - Empty arrays (no members, no phases)
   - Null dates
   - Long text (description, title)
   - Special characters

9. **Mobile consideration**: While desktop-first, ensure it doesn't break on smaller screens.

10. **Have fun with the design**: This is your chance to make it look great before backend complexity.

---

## Next Steps After Completion

Once Step 2 is complete:
1. Review all features against functional requirements
2. Get feedback on UX and design
3. Fix any bugs or polish issues
4. Document any API contract changes needed
5. Proceed to Step 3: Database Schema and ORM setup

---

## File Structure Reference

```
frontend/src/
├── api/
│   ├── client.ts              # Axios instance
│   ├── projects.ts            # API methods
│   ├── mocks.ts               # Mock adapter setup
│   └── mockData.ts            # Sample data
├── components/
│   ├── Layout/
│   │   ├── Layout.tsx
│   │   └── Layout.module.css
│   ├── Header/
│   │   └── Header.tsx
│   ├── ProjectCard/
│   │   ├── ProjectCard.tsx
│   │   └── ProjectCard.module.css
│   ├── ProjectDetail/
│   │   ├── ProjectHeader.tsx
│   │   ├── ProjectInfo.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── PhaseTimeline.tsx
│   │   ├── PhaseManager.tsx
│   │   └── PhaseForm.tsx
│   └── ui/
│       ├── Button/
│       │   ├── Button.tsx
│       │   └── Button.module.css
│       ├── Input/
│       ├── TextArea/
│       ├── DatePicker/
│       ├── Select/
│       ├── Badge/
│       ├── Card/
│       ├── Modal/
│       ├── Spinner/
│       └── Alert/
├── pages/
│   ├── ProjectListPage/
│   │   ├── ProjectListPage.tsx
│   │   └── ProjectListPage.module.css
│   ├── ProjectDetailPage/
│   │   ├── ProjectDetailPage.tsx
│   │   └── ProjectDetailPage.module.css
│   ├── NewProjectPage/
│   │   └── NewProjectPage.tsx
│   └── NotFoundPage/
│       └── NotFoundPage.tsx
├── hooks/
│   ├── useProject.ts          # Custom hook for data fetching
│   └── useToast.ts            # Toast notifications
├── utils/
│   ├── dateFormat.ts          # Date formatting utilities
│   └── validation.ts          # Form validation helpers
├── App.tsx                     # Router setup
├── main.tsx                    # Entry point
└── index.css                   # Global styles + Tailwind
```

---

## Estimated Time Breakdown

- **Day 1**: Routing + API Client Layer (6-8 hours)
- **Day 2**: Component Library (8 hours)
- **Day 3**: Project List Page (6 hours)
- **Day 4**: Project Detail - View Mode (6-8 hours)
- **Day 5**: Project Detail - Edit Mode (8 hours)
- **Day 6**: New Project Page (4 hours)
- **Day 7**: Polish, Testing, Documentation (6-8 hours)

**Total**: ~45-50 hours of focused development

---

## Success Criteria

Step 2 is complete when:
1. ✅ All pages are functional with mocked data
2. ✅ All CRUD operations work (create, read, update, delete projects and phases)
3. ✅ UI is modern, clean, and uses #ff8204 orange
4. ✅ Form validation works correctly
5. ✅ Loading, error, and empty states are implemented
6. ✅ Confirmation dialogs for destructive actions
7. ✅ No console errors or warnings
8. ✅ Manual testing checklist is complete
9. ✅ Code is organized and components are reusable
10. ✅ Ready to remove mocks and connect to real backend

---

**Ready to start building! 🚀**

Begin with Phase 1 and work through systematically. Test each component and page as you go.

