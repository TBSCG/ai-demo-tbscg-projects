import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as controller from './projects.controller';
import { NotFoundError } from '../utils/errors';
import { mockRequest, mockResponse } from '../__tests__/mocks/db.mock';

// Mock the query modules
vi.mock('../db/queries/projects.queries', () => ({
  getAllProjectsWithPhases: vi.fn(),
  getProjectByIdWithPhases: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  projectExists: vi.fn(),
}));

vi.mock('../db/queries/phases.queries', () => ({
  createPhase: vi.fn(),
  updatePhase: vi.fn(),
  deletePhase: vi.fn(),
  getPhaseByIdAndProjectId: vi.fn(),
}));

describe('Projects Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should return all projects with 200 status', async () => {
      const mockProjects = [
        { id: '1', title: 'Project 1', phases: [] },
        { id: '2', title: 'Project 2', phases: [] },
      ];

      const projectQueries = await import('../db/queries/projects.queries');
      vi.mocked(projectQueries.getAllProjectsWithPhases).mockResolvedValue(mockProjects);

      const req = mockRequest();
      const res = mockResponse();

      await controller.getAllProjects(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProjects,
      });
    });
  });

  describe('getProjectById', () => {
    it('should return project when found', async () => {
      const mockProject = { id: '1', title: 'Project 1', phases: [] };

      const projectQueries = await import('../db/queries/projects.queries');
      vi.mocked(projectQueries.getProjectByIdWithPhases).mockResolvedValue(mockProject);

      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await controller.getProjectById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockProject,
      });
    });

    it('should throw NotFoundError when project not found', async () => {
      const projectQueries = await import('../db/queries/projects.queries');
      vi.mocked(projectQueries.getProjectByIdWithPhases).mockResolvedValue(null);

      const req = mockRequest({ params: { id: 'non-existent' } });
      const res = mockResponse();

      await expect(async () => {
        await controller.getProjectById(req as any, res as any);
      }).rejects.toThrow(NotFoundError);
    });
  });

  describe('createProject', () => {
    it('should create project and return 201 status', async () => {
      const newProjectData = {
        title: 'New Project',
        client: 'Client Name',
      };

      const createdProject = { id: '1', ...newProjectData };

      const projectQueries = await import('../db/queries/projects.queries');
      vi.mocked(projectQueries.createProject).mockResolvedValue(createdProject);

      const req = mockRequest({ body: newProjectData });
      const res = mockResponse();

      await controller.createProject(req as any, res as any);

      expect(projectQueries.createProject).toHaveBeenCalledWith(newProjectData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdProject,
      });
    });
  });

  describe('updateProject', () => {
    it('should update project when it exists', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedProject = { id: '1', ...updateData };

      const projectQueries = await import('../db/queries/projects.queries');
      vi.mocked(projectQueries.projectExists).mockResolvedValue(true);
      vi.mocked(projectQueries.updateProject).mockResolvedValue(updatedProject);

      const req = mockRequest({ params: { id: '1' }, body: updateData });
      const res = mockResponse();

      await controller.updateProject(req as any, res as any);

      expect(projectQueries.projectExists).toHaveBeenCalledWith('1');
      expect(projectQueries.updateProject).toHaveBeenCalledWith('1', updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedProject,
      });
    });

    it('should throw NotFoundError when project does not exist', async () => {
      const projectQueries = await import('../db/queries/projects.queries');
      vi.mocked(projectQueries.projectExists).mockResolvedValue(false);

      const req = mockRequest({ params: { id: 'non-existent' }, body: {} });
      const res = mockResponse();

      await expect(async () => {
        await controller.updateProject(req as any, res as any);
      }).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteProject', () => {
    it('should delete project when it exists', async () => {
      const projectQueries = await import('../db/queries/projects.queries');
      vi.mocked(projectQueries.projectExists).mockResolvedValue(true);
      vi.mocked(projectQueries.deleteProject).mockResolvedValue({ id: '1' } as any);

      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await controller.deleteProject(req as any, res as any);

      expect(projectQueries.projectExists).toHaveBeenCalledWith('1');
      expect(projectQueries.deleteProject).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'Project deleted successfully',
        },
      });
    });

    it('should throw NotFoundError when project does not exist', async () => {
      const projectQueries = await import('../db/queries/projects.queries');
      vi.mocked(projectQueries.projectExists).mockResolvedValue(false);

      const req = mockRequest({ params: { id: 'non-existent' } });
      const res = mockResponse();

      await expect(async () => {
        await controller.deleteProject(req as any, res as any);
      }).rejects.toThrow(NotFoundError);
    });
  });

  describe('addPhase', () => {
    it('should add phase to project when project exists', async () => {
      const phaseData = {
        name: 'New Phase',
        order: 1,
      };

      const createdPhase = { id: 'phase-1', projectId: 'project-1', ...phaseData };

      const projectQueries = await import('../db/queries/projects.queries');
      const phaseQueries = await import('../db/queries/phases.queries');

      vi.mocked(projectQueries.projectExists).mockResolvedValue(true);
      vi.mocked(phaseQueries.createPhase).mockResolvedValue(createdPhase);

      const req = mockRequest({ params: { id: 'project-1' }, body: phaseData });
      const res = mockResponse();

      await controller.addPhase(req as any, res as any);

      expect(projectQueries.projectExists).toHaveBeenCalledWith('project-1');
      expect(phaseQueries.createPhase).toHaveBeenCalledWith({
        ...phaseData,
        projectId: 'project-1',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdPhase,
      });
    });

    it('should throw NotFoundError when project does not exist', async () => {
      const projectQueries = await import('../db/queries/projects.queries');
      vi.mocked(projectQueries.projectExists).mockResolvedValue(false);

      const req = mockRequest({ params: { id: 'non-existent' }, body: { name: 'Phase', order: 1 } });
      const res = mockResponse();

      await expect(async () => {
        await controller.addPhase(req as any, res as any);
      }).rejects.toThrow(NotFoundError);
    });
  });

  describe('updatePhase', () => {
    it('should update phase when it exists', async () => {
      const updateData = { name: 'Updated Phase' };
      const existingPhase = { id: 'phase-1', projectId: 'project-1', name: 'Old Phase' };
      const updatedPhase = { ...existingPhase, ...updateData };

      const phaseQueries = await import('../db/queries/phases.queries');
      vi.mocked(phaseQueries.getPhaseByIdAndProjectId).mockResolvedValue(existingPhase);
      vi.mocked(phaseQueries.updatePhase).mockResolvedValue(updatedPhase);

      const req = mockRequest({
        params: { id: 'project-1', phaseId: 'phase-1' },
        body: updateData,
      });
      const res = mockResponse();

      await controller.updatePhase(req as any, res as any);

      expect(phaseQueries.getPhaseByIdAndProjectId).toHaveBeenCalledWith('phase-1', 'project-1');
      expect(phaseQueries.updatePhase).toHaveBeenCalledWith('phase-1', updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedPhase,
      });
    });

    it('should throw NotFoundError when phase does not exist', async () => {
      const phaseQueries = await import('../db/queries/phases.queries');
      vi.mocked(phaseQueries.getPhaseByIdAndProjectId).mockResolvedValue(null);

      const req = mockRequest({
        params: { id: 'project-1', phaseId: 'non-existent' },
        body: {},
      });
      const res = mockResponse();

      await expect(async () => {
        await controller.updatePhase(req as any, res as any);
      }).rejects.toThrow(NotFoundError);
    });
  });

  describe('deletePhase', () => {
    it('should delete phase when it exists', async () => {
      const existingPhase = { id: 'phase-1', projectId: 'project-1', name: 'Phase' };

      const phaseQueries = await import('../db/queries/phases.queries');
      vi.mocked(phaseQueries.getPhaseByIdAndProjectId).mockResolvedValue(existingPhase);
      vi.mocked(phaseQueries.deletePhase).mockResolvedValue(existingPhase);

      const req = mockRequest({
        params: { id: 'project-1', phaseId: 'phase-1' },
      });
      const res = mockResponse();

      await controller.deletePhase(req as any, res as any);

      expect(phaseQueries.getPhaseByIdAndProjectId).toHaveBeenCalledWith('phase-1', 'project-1');
      expect(phaseQueries.deletePhase).toHaveBeenCalledWith('phase-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'Phase deleted successfully',
        },
      });
    });

    it('should throw NotFoundError when phase does not exist', async () => {
      const phaseQueries = await import('../db/queries/phases.queries');
      vi.mocked(phaseQueries.getPhaseByIdAndProjectId).mockResolvedValue(null);

      const req = mockRequest({
        params: { id: 'project-1', phaseId: 'non-existent' },
      });
      const res = mockResponse();

      await expect(async () => {
        await controller.deletePhase(req as any, res as any);
      }).rejects.toThrow(NotFoundError);
    });
  });
});
