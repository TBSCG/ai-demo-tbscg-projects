import apiClient from './client';
import type { 
  Project, 
  CreateProjectDto, 
  UpdateProjectDto, 
  Phase, 
  CreatePhaseDto, 
  UpdatePhaseDto, 
  ApiResponse 
} from '@demo-tbscg/shared';

export const projectsApi = {
  // Get all projects
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<ApiResponse<Project[]>>('/api/projects');
    return response.data.data;
  },

  // Get project by ID with phases
  getById: async (id: string): Promise<Project & { phases: Phase[] }> => {
    const response = await apiClient.get<ApiResponse<Project & { phases: Phase[] }>>(
      `/api/projects/${id}`
    );
    return response.data.data;
  },

  // Create project
  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>('/api/projects', data);
    return response.data.data;
  },

  // Update project
  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const response = await apiClient.put<ApiResponse<Project>>(
      `/api/projects/${id}`,
      data
    );
    return response.data.data;
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`);
  },

  // Phase operations
  phases: {
    // Create phase
    create: async (projectId: string, data: CreatePhaseDto): Promise<Phase> => {
      const response = await apiClient.post<ApiResponse<Phase>>(
        `/api/projects/${projectId}/phases`,
        data
      );
      return response.data.data;
    },

    // Update phase
    update: async (
      projectId: string,
      phaseId: string,
      data: UpdatePhaseDto
    ): Promise<Phase> => {
      const response = await apiClient.put<ApiResponse<Phase>>(
        `/api/projects/${projectId}/phases/${phaseId}`,
        data
      );
      return response.data.data;
    },

    // Delete phase
    delete: async (projectId: string, phaseId: string): Promise<void> => {
      await apiClient.delete(`/api/projects/${projectId}/phases/${phaseId}`);
    },
  },
};

