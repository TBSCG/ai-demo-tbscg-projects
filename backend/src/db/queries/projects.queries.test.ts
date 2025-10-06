import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as projectQueries from './projects.queries';

// Mock the database module
vi.mock('../config.js', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  },
}));

vi.mock('../schema.js', () => ({
  projects: {
    id: 'id',
    createdAt: 'createdAt',
  },
  phases: {
    projectId: 'projectId',
    order: 'order',
  },
}));

describe('Projects Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllProjects', () => {
    it('should return all projects ordered by createdAt', async () => {
      const mockProjects = [
        { id: '1', title: 'Project 1' },
        { id: '2', title: 'Project 2' },
      ];

      const { db } = await import('../config.js');
      vi.mocked(db.orderBy).mockResolvedValue(mockProjects);

      const result = await projectQueries.getAllProjects();

      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.orderBy).toHaveBeenCalled();
      expect(result).toEqual(mockProjects);
    });
  });

  describe('getProjectById', () => {
    it('should return project when found', async () => {
      const mockProject = { id: '1', title: 'Project 1' };
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([mockProject]);

      const result = await projectQueries.getProjectById('1');

      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(db.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProject);
    });

    it('should return null when project not found', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([]);

      const result = await projectQueries.getProjectById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createProject', () => {
    it('should create project with timestamps', async () => {
      const newProject = {
        title: 'New Project',
        client: 'Client Name',
        description: 'Description',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        projectManager: 'Manager',
        members: ['Member 1'],
      };

      const createdProject = { id: '1', ...newProject };
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([createdProject]);

      const result = await projectQueries.createProject(newProject);

      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          ...newProject,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toEqual(createdProject);
    });
  });

  describe('updateProject', () => {
    it('should update project and set updatedAt', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedProject = { id: '1', ...updateData };
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([updatedProject]);

      const result = await projectQueries.updateProject('1', updateData);

      expect(db.update).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date),
        })
      );
      expect(db.where).toHaveBeenCalled();
      expect(result).toEqual(updatedProject);
    });

    it('should return null when project not found', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([]);

      const result = await projectQueries.updateProject('non-existent', { title: 'New' });

      expect(result).toBeNull();
    });
  });

  describe('deleteProject', () => {
    it('should delete project and return it', async () => {
      const deletedProject = { id: '1', title: 'Deleted Project' };
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([deletedProject]);

      const result = await projectQueries.deleteProject('1');

      expect(db.delete).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(result).toEqual(deletedProject);
    });

    it('should return null when project not found', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([]);

      const result = await projectQueries.deleteProject('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('projectExists', () => {
    it('should return true when project exists', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([{ id: '1' }]);

      const result = await projectQueries.projectExists('1');

      expect(result).toBe(true);
    });

    it('should return false when project does not exist', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([]);

      const result = await projectQueries.projectExists('non-existent');

      expect(result).toBe(false);
    });
  });
});
