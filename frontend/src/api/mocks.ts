import MockAdapter from 'axios-mock-adapter';
import apiClient from './client';
import { mockProjects, mockPhases } from './mockData';
import type { Project, Phase, CreateProjectDto, UpdateProjectDto, CreatePhaseDto, UpdatePhaseDto } from '@demo-tbscg/shared';

// Create mock adapter with 300ms delay to simulate network
const mock = new MockAdapter(apiClient, { delayResponse: 300 });

// In-memory storage (resets on page refresh)
let projects = [...mockProjects];
let phases = JSON.parse(JSON.stringify(mockPhases)) as Record<string, Phase[]>;

// Helper to generate UUID
const generateId = () => Math.random().toString(36).substring(2, 15);

// GET /api/projects - List all projects
mock.onGet('/api/projects').reply(() => {
  return [200, { success: true, data: projects }];
});

// GET /api/projects/:id - Get project by ID with phases
mock.onGet(/\/api\/projects\/([^/]+)$/).reply((config) => {
  const id = config.url?.split('/').pop();
  const project = projects.find((p) => p.id === id);
  
  if (!project || !id) {
    return [404, { success: false, error: 'Project not found' }];
  }
  
  const projectPhases = phases[id] || [];
  return [200, { success: true, data: { ...project, phases: projectPhases } }];
});

// POST /api/projects - Create new project
mock.onPost('/api/projects').reply((config) => {
  const data: CreateProjectDto = JSON.parse(config.data);
  
  // Validation
  if (!data.title || !data.client) {
    return [400, { 
      success: false, 
      error: 'Validation error',
      details: {
        title: !data.title ? 'Title is required' : undefined,
        client: !data.client ? 'Client is required' : undefined,
      }
    }];
  }
  
  const newProject: Project = {
    id: generateId(),
    title: data.title,
    client: data.client,
    description: data.description || null,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    projectManager: data.projectManager || null,
    members: data.members || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  projects.push(newProject);
  phases[newProject.id] = [];
  
  return [201, { success: true, data: newProject }];
});

// PUT /api/projects/:id - Update project
mock.onPut(/\/api\/projects\/([^/]+)$/).reply((config) => {
  const id = config.url?.split('/').pop();
  const projectIndex = projects.findIndex((p) => p.id === id);
  
  if (projectIndex === -1) {
    return [404, { success: false, error: 'Project not found' }];
  }
  
  const data: UpdateProjectDto = JSON.parse(config.data);
  
  // Validation
  if (data.title !== undefined && !data.title) {
    return [400, { 
      success: false, 
      error: 'Validation error',
      details: { title: 'Title is required' }
    }];
  }
  
  if (data.client !== undefined && !data.client) {
    return [400, { 
      success: false, 
      error: 'Validation error',
      details: { client: 'Client is required' }
    }];
  }
  
  const updatedProject: Project = {
    ...projects[projectIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  projects[projectIndex] = updatedProject;
  
  return [200, { success: true, data: updatedProject }];
});

// DELETE /api/projects/:id - Delete project
mock.onDelete(/\/api\/projects\/([^/]+)$/).reply((config) => {
  const id = config.url?.split('/').pop();
  const projectIndex = projects.findIndex((p) => p.id === id);
  
  if (projectIndex === -1) {
    return [404, { success: false, error: 'Project not found' }];
  }
  
  projects.splice(projectIndex, 1);
  delete phases[id!];
  
  return [200, { success: true, data: { message: 'Project deleted successfully' } }];
});

// POST /api/projects/:id/phases - Add phase to project
mock.onPost(/\/api\/projects\/([^/]+)\/phases$/).reply((config) => {
  const matches = config.url?.match(/\/api\/projects\/([^/]+)\/phases/);
  const projectId = matches?.[1];
  
  const project = projects.find((p) => p.id === projectId);
  if (!project) {
    return [404, { success: false, error: 'Project not found' }];
  }
  
  const data: CreatePhaseDto = JSON.parse(config.data);
  
  // Validation
  if (!data.name) {
    return [400, { 
      success: false, 
      error: 'Validation error',
      details: { name: 'Phase name is required' }
    }];
  }
  
  const newPhase: Phase = {
    id: generateId(),
    projectId: projectId!,
    name: data.name,
    description: data.description || null,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    status: data.status || null,
    order: data.order,
    createdAt: new Date().toISOString(),
  };
  
  if (!phases[projectId!]) {
    phases[projectId!] = [];
  }
  
  phases[projectId!].push(newPhase);
  
  return [201, { success: true, data: newPhase }];
});

// PUT /api/projects/:id/phases/:phaseId - Update phase
mock.onPut(/\/api\/projects\/([^/]+)\/phases\/([^/]+)$/).reply((config) => {
  const matches = config.url?.match(/\/api\/projects\/([^/]+)\/phases\/([^/]+)/);
  const projectId = matches?.[1];
  const phaseId = matches?.[2];
  
  const projectPhases = phases[projectId!];
  if (!projectPhases) {
    return [404, { success: false, error: 'Project not found' }];
  }
  
  const phaseIndex = projectPhases.findIndex((p) => p.id === phaseId);
  if (phaseIndex === -1) {
    return [404, { success: false, error: 'Phase not found' }];
  }
  
  const data: UpdatePhaseDto = JSON.parse(config.data);
  
  const updatedPhase: Phase = {
    ...projectPhases[phaseIndex],
    ...data,
  };
  
  projectPhases[phaseIndex] = updatedPhase;
  
  return [200, { success: true, data: updatedPhase }];
});

// DELETE /api/projects/:id/phases/:phaseId - Delete phase
mock.onDelete(/\/api\/projects\/([^/]+)\/phases\/([^/]+)$/).reply((config) => {
  const matches = config.url?.match(/\/api\/projects\/([^/]+)\/phases\/([^/]+)/);
  const projectId = matches?.[1];
  const phaseId = matches?.[2];
  
  const projectPhases = phases[projectId!];
  if (!projectPhases) {
    return [404, { success: false, error: 'Project not found' }];
  }
  
  const phaseIndex = projectPhases.findIndex((p) => p.id === phaseId);
  if (phaseIndex === -1) {
    return [404, { success: false, error: 'Phase not found' }];
  }
  
  projectPhases.splice(phaseIndex, 1);
  
  return [200, { success: true, data: { message: 'Phase deleted successfully' } }];
});

// Health check endpoint
mock.onGet('/health').reply(200, { success: true, message: 'Mock API is running' });

console.log('🎭 Mock API adapter initialized');

export default mock;

