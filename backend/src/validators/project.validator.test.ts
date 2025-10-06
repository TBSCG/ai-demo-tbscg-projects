import { describe, it, expect } from 'vitest';
import { createProjectSchema, updateProjectSchema, projectIdSchema } from './project.validator';

describe('Project Validators', () => {
  describe('createProjectSchema', () => {
    it('should validate valid project data', () => {
      const validData = {
        body: {
          title: 'Test Project',
          client: 'Test Client',
          description: 'Test description',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          projectManager: 'John Doe',
          members: ['Alice', 'Bob'],
        },
      };

      expect(() => createProjectSchema.parse(validData)).not.toThrow();
    });

    it('should require title field', () => {
      const invalidData = {
        body: {
          client: 'Test Client',
        },
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow();
    });

    it('should require client field', () => {
      const invalidData = {
        body: {
          title: 'Test Project',
        },
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty title', () => {
      const invalidData = {
        body: {
          title: '',
          client: 'Test Client',
        },
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow(/Title cannot be empty/);
    });

    it('should reject title longer than 255 characters', () => {
      const invalidData = {
        body: {
          title: 'a'.repeat(256),
          client: 'Test Client',
        },
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow(/255 characters/);
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        body: {
          title: 'Test Project',
          client: 'Test Client',
          startDate: '01/01/2025',
        },
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow(/YYYY-MM-DD/);
    });

    it('should reject end date before start date', () => {
      const invalidData = {
        body: {
          title: 'Test Project',
          client: 'Test Client',
          startDate: '2025-12-31',
          endDate: '2025-01-01',
        },
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow(/End date must be on or after start date/);
    });

    it('should accept null or undefined optional fields', () => {
      const validData = {
        body: {
          title: 'Test Project',
          client: 'Test Client',
          description: null,
          startDate: null,
          endDate: null,
          projectManager: null,
        },
      };

      expect(() => createProjectSchema.parse(validData)).not.toThrow();
    });

    it('should default members to empty array', () => {
      const data = {
        body: {
          title: 'Test Project',
          client: 'Test Client',
        },
      };

      const result = createProjectSchema.parse(data);
      expect(result.body.members).toEqual([]);
    });

    it('should reject invalid member names (too long)', () => {
      const invalidData = {
        body: {
          title: 'Test Project',
          client: 'Test Client',
          members: ['a'.repeat(256)],
        },
      };

      expect(() => createProjectSchema.parse(invalidData)).toThrow(/255 characters/);
    });
  });

  describe('updateProjectSchema', () => {
    it('should validate valid update data with UUID', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          title: 'Updated Project',
        },
      };

      expect(() => updateProjectSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid UUID format', () => {
      const invalidData = {
        params: {
          id: 'not-a-uuid',
        },
        body: {},
      };

      expect(() => updateProjectSchema.parse(invalidData)).toThrow(/Invalid project ID format/);
    });

    it('should allow partial updates', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          client: 'New Client',
        },
      };

      expect(() => updateProjectSchema.parse(validData)).not.toThrow();
    });

    it('should allow empty body', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {},
      };

      expect(() => updateProjectSchema.parse(validData)).not.toThrow();
    });
  });

  describe('projectIdSchema', () => {
    it('should validate valid UUID', () => {
      const validData = {
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
      };

      expect(() => projectIdSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        params: {
          id: '123',
        },
      };

      expect(() => projectIdSchema.parse(invalidData)).toThrow(/Invalid project ID format/);
    });
  });
});
