import { eq } from 'drizzle-orm';
import { db } from '../config.js';
import { projects, phases } from '../schema.js';
import type { NewProject } from '../schema.js';

/**
 * Get all projects without phases
 */
export async function getAllProjects() {
  return await db.select().from(projects).orderBy(projects.createdAt);
}

/**
 * Get all projects with their phases
 */
export async function getAllProjectsWithPhases() {
  const allProjects = await db.select().from(projects).orderBy(projects.createdAt);

  const projectsWithPhases = await Promise.all(
    allProjects.map(async (project) => {
      const projectPhases = await db
        .select()
        .from(phases)
        .where(eq(phases.projectId, project.id))
        .orderBy(phases.order);

      return {
        ...project,
        phases: projectPhases,
      };
    })
  );

  return projectsWithPhases;
}

/**
 * Get a single project by ID
 */
export async function getProjectById(projectId: string) {
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

  return result[0] || null;
}

/**
 * Get a single project by ID with its phases
 */
export async function getProjectByIdWithPhases(projectId: string) {
  const project = await getProjectById(projectId);

  if (!project) {
    return null;
  }

  const projectPhases = await db
    .select()
    .from(phases)
    .where(eq(phases.projectId, projectId))
    .orderBy(phases.order);

  return {
    ...project,
    phases: projectPhases,
  };
}

/**
 * Create a new project
 */
export async function createProject(data: NewProject) {
  const result = await db
    .insert(projects)
    .values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, data: Partial<NewProject>) {
  const result = await db
    .update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  return result[0] || null;
}

/**
 * Delete a project
 * Note: Phases will be automatically deleted due to CASCADE constraint
 */
export async function deleteProject(projectId: string) {
  const result = await db.delete(projects).where(eq(projects.id, projectId)).returning();

  return result[0] || null;
}

/**
 * Check if a project exists
 */
export async function projectExists(projectId: string): Promise<boolean> {
  const result = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).limit(1);

  return result.length > 0;
}

