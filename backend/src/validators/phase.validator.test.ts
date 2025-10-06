import { describe, it, expect } from 'vitest';
import { createPhaseSchema, updatePhaseSchema, phaseIdSchema } from './phase.validator';

describe('Phase Validators', () => {
  describe('createPhaseSchema', () => {
    it('should validate valid phase data', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: 'Planning',
          description: 'Initial planning phase',
          startDate: '2025-01-01',
          endDate: '2025-03-31',
          status: 'planned' as const,
          order: 1,
        },
      };

      expect(() => createPhaseSchema.parse(validData)).not.toThrow();
    });

    it('should require name field', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          order: 1,
        },
      };

      expect(() => createPhaseSchema.parse(invalidData)).toThrow(/Phase name is required/);
    });

    it('should require order field', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: 'Planning',
        },
      };

      expect(() => createPhaseSchema.parse(invalidData)).toThrow(/Order is required/);
    });

    it('should reject empty name', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: '',
          order: 1,
        },
      };

      expect(() => createPhaseSchema.parse(invalidData)).toThrow(/Phase name cannot be empty/);
    });

    it('should reject name longer than 255 characters', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: 'a'.repeat(256),
          order: 1,
        },
      };

      expect(() => createPhaseSchema.parse(invalidData)).toThrow(/255 characters/);
    });

    it('should reject invalid status values', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: 'Planning',
          status: 'invalid-status',
          order: 1,
        },
      };

      expect(() => createPhaseSchema.parse(invalidData)).toThrow(/Status must be/);
    });

    it('should accept valid status values', () => {
      const statuses = ['planned', 'in-progress', 'completed'] as const;

      statuses.forEach((status) => {
        const validData = {
          params: {
            id: '550e8400-e29b-41d4-a716-446655440000',
          },
          body: {
            name: 'Planning',
            status,
            order: 1,
          },
        };

        expect(() => createPhaseSchema.parse(validData)).not.toThrow();
      });
    });

    it('should reject negative order', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: 'Planning',
          order: -1,
        },
      };

      expect(() => createPhaseSchema.parse(invalidData)).toThrow(/Order must be non-negative/);
    });

    it('should reject non-integer order', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: 'Planning',
          order: 1.5,
        },
      };

      expect(() => createPhaseSchema.parse(invalidData)).toThrow(/Order must be an integer/);
    });

    it('should reject end date before start date', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: 'Planning',
          startDate: '2025-12-31',
          endDate: '2025-01-01',
          order: 1,
        },
      };

      expect(() => createPhaseSchema.parse(invalidData)).toThrow(/End date must be on or after start date/);
    });

    it('should accept null optional fields', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: 'Planning',
          description: null,
          startDate: null,
          endDate: null,
          status: null,
          order: 1,
        },
      };

      expect(() => createPhaseSchema.parse(validData)).not.toThrow();
    });
  });

  describe('updatePhaseSchema', () => {
    it('should validate valid update data', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          phaseId: '660e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          name: 'Updated Phase',
        },
      };

      expect(() => updatePhaseSchema.parse(validData)).not.toThrow();
    });

    it('should require valid project UUID', () => {
      const invalidData = {
        params: {
          id: 'not-a-uuid',
          phaseId: '660e8400-e29b-41d4-a716-446655440000',
        },
        body: {},
      };

      expect(() => updatePhaseSchema.parse(invalidData)).toThrow(/Invalid project ID format/);
    });

    it('should require valid phase UUID', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          phaseId: 'not-a-uuid',
        },
        body: {},
      };

      expect(() => updatePhaseSchema.parse(invalidData)).toThrow(/Invalid phase ID format/);
    });

    it('should allow partial updates', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          phaseId: '660e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          status: 'completed' as const,
        },
      };

      expect(() => updatePhaseSchema.parse(validData)).not.toThrow();
    });

    it('should allow empty body', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          phaseId: '660e8400-e29b-41d4-a716-446655440000',
        },
        body: {},
      };

      expect(() => updatePhaseSchema.parse(validData)).not.toThrow();
    });
  });

  describe('phaseIdSchema', () => {
    it('should validate valid UUIDs', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          phaseId: '660e8400-e29b-41d4-a716-446655440000',
        },
      };

      expect(() => phaseIdSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid project UUID', () => {
      const invalidData = {
        params: {
          id: 'invalid',
          phaseId: '660e8400-e29b-41d4-a716-446655440000',
        },
      };

      expect(() => phaseIdSchema.parse(invalidData)).toThrow(/Invalid project ID format/);
    });

    it('should reject invalid phase UUID', () => {
      const invalidData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          phaseId: 'invalid',
        },
      };

      expect(() => phaseIdSchema.parse(invalidData)).toThrow(/Invalid phase ID format/);
    });
  });
});
