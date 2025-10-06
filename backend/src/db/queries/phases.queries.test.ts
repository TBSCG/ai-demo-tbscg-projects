import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as phaseQueries from './phases.queries';

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
  phases: {
    id: 'id',
    projectId: 'projectId',
    order: 'order',
  },
}));

describe('Phases Queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPhasesByProjectId', () => {
    it('should return phases ordered by order field', async () => {
      const mockPhases = [
        { id: '1', name: 'Phase 1', order: 1 },
        { id: '2', name: 'Phase 2', order: 2 },
      ];

      const { db } = await import('../config.js');
      vi.mocked(db.orderBy).mockResolvedValue(mockPhases);

      const result = await phaseQueries.getPhasesByProjectId('project-1');

      expect(db.select).toHaveBeenCalled();
      expect(db.from).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(db.orderBy).toHaveBeenCalled();
      expect(result).toEqual(mockPhases);
    });
  });

  describe('getPhaseById', () => {
    it('should return phase when found', async () => {
      const mockPhase = { id: '1', name: 'Phase 1' };
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([mockPhase]);

      const result = await phaseQueries.getPhaseById('1');

      expect(db.select).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(db.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPhase);
    });

    it('should return null when phase not found', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([]);

      const result = await phaseQueries.getPhaseById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getPhaseByIdAndProjectId', () => {
    it('should return phase when found with matching project', async () => {
      const mockPhase = { id: '1', projectId: 'project-1', name: 'Phase 1' };
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([mockPhase]);

      const result = await phaseQueries.getPhaseByIdAndProjectId('1', 'project-1');

      expect(db.select).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(result).toEqual(mockPhase);
    });

    it('should return null when phase not found', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([]);

      const result = await phaseQueries.getPhaseByIdAndProjectId('1', 'wrong-project');

      expect(result).toBeNull();
    });
  });

  describe('createPhase', () => {
    it('should create phase with provided order', async () => {
      const newPhase = {
        projectId: 'project-1',
        name: 'New Phase',
        description: 'Description',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        status: 'planned' as const,
        order: 5,
      };

      const createdPhase = { id: '1', ...newPhase };
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([createdPhase]);

      const result = await phaseQueries.createPhase(newPhase);

      expect(db.insert).toHaveBeenCalled();
      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          ...newPhase,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toEqual(createdPhase);
    });

    it('should auto-generate order when not provided', async () => {
      const newPhase = {
        projectId: 'project-1',
        name: 'New Phase',
        order: 0,
      };

      const existingPhases = [
        { id: '1', order: 1 },
        { id: '2', order: 2 },
      ];

      const { db } = await import('../config.js');
      vi.mocked(db.orderBy).mockResolvedValueOnce(existingPhases);
      vi.mocked(db.returning).mockResolvedValue([{ id: '3', ...newPhase, order: 3 }]);

      await phaseQueries.createPhase(newPhase);

      expect(db.values).toHaveBeenCalledWith(
        expect.objectContaining({
          order: 3,
        })
      );
    });
  });

  describe('updatePhase', () => {
    it('should update phase and set updatedAt', async () => {
      const updateData = { name: 'Updated Phase' };
      const updatedPhase = { id: '1', ...updateData };
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([updatedPhase]);

      const result = await phaseQueries.updatePhase('1', updateData);

      expect(db.update).toHaveBeenCalled();
      expect(db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date),
        })
      );
      expect(result).toEqual(updatedPhase);
    });

    it('should return null when phase not found', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([]);

      const result = await phaseQueries.updatePhase('non-existent', { name: 'New' });

      expect(result).toBeNull();
    });
  });

  describe('deletePhase', () => {
    it('should delete phase and return it', async () => {
      const deletedPhase = { id: '1', name: 'Deleted Phase' };
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([deletedPhase]);

      const result = await phaseQueries.deletePhase('1');

      expect(db.delete).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(result).toEqual(deletedPhase);
    });

    it('should return null when phase not found', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue([]);

      const result = await phaseQueries.deletePhase('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('phaseExists', () => {
    it('should return true when phase exists', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([{ id: '1' }]);

      const result = await phaseQueries.phaseExists('1');

      expect(result).toBe(true);
    });

    it('should return false when phase does not exist', async () => {
      const { db } = await import('../config.js');
      vi.mocked(db.limit).mockResolvedValue([]);

      const result = await phaseQueries.phaseExists('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('deletePhasesByProjectId', () => {
    it('should delete all phases for a project', async () => {
      const deletedPhases = [
        { id: '1', name: 'Phase 1' },
        { id: '2', name: 'Phase 2' },
      ];
      const { db } = await import('../config.js');
      vi.mocked(db.returning).mockResolvedValue(deletedPhases);

      const result = await phaseQueries.deletePhasesByProjectId('project-1');

      expect(db.delete).toHaveBeenCalled();
      expect(db.where).toHaveBeenCalled();
      expect(result).toEqual(deletedPhases);
    });
  });

  describe('reorderPhases', () => {
    it('should update order for multiple phases', async () => {
      const phaseIds = ['phase-1', 'phase-2', 'phase-3'];
      const reorderedPhases = [
        { id: 'phase-1', order: 1 },
        { id: 'phase-2', order: 2 },
        { id: 'phase-3', order: 3 },
      ];

      const { db } = await import('../config.js');
      vi.mocked(db.orderBy).mockResolvedValue(reorderedPhases);

      const result = await phaseQueries.reorderPhases(phaseIds, 'project-1');

      expect(db.update).toHaveBeenCalledTimes(phaseIds.length);
      expect(result).toEqual(reorderedPhases);
    });
  });
});
