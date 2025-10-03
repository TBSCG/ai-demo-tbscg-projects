import { eq, and } from 'drizzle-orm';
import { db } from '../config.js';
import { phases } from '../schema.js';
import type { NewPhase } from '../schema.js';

/**
 * Get all phases for a project
 */
export async function getPhasesByProjectId(projectId: string) {
  return await db.select().from(phases).where(eq(phases.projectId, projectId)).orderBy(phases.order);
}

/**
 * Get a single phase by ID
 */
export async function getPhaseById(phaseId: string) {
  const result = await db.select().from(phases).where(eq(phases.id, phaseId)).limit(1);

  return result[0] || null;
}

/**
 * Get a phase by ID and project ID (for authorization)
 */
export async function getPhaseByIdAndProjectId(phaseId: string, projectId: string) {
  const result = await db
    .select()
    .from(phases)
    .where(and(eq(phases.id, phaseId), eq(phases.projectId, projectId)))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new phase
 */
export async function createPhase(data: NewPhase) {
  // If order is not provided, set it to be last
  let order = data.order;
  if (order === undefined || order === 0) {
    const existingPhases = await getPhasesByProjectId(data.projectId);
    order = existingPhases.length > 0 ? Math.max(...existingPhases.map((p) => p.order)) + 1 : 1;
  }

  const result = await db
    .insert(phases)
    .values({
      ...data,
      order,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return result[0];
}

/**
 * Update a phase
 */
export async function updatePhase(phaseId: string, data: Partial<NewPhase>) {
  const result = await db
    .update(phases)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(phases.id, phaseId))
    .returning();

  return result[0] || null;
}

/**
 * Delete a phase
 */
export async function deletePhase(phaseId: string) {
  const result = await db.delete(phases).where(eq(phases.id, phaseId)).returning();

  return result[0] || null;
}

/**
 * Delete all phases for a project
 */
export async function deletePhasesByProjectId(projectId: string) {
  return await db.delete(phases).where(eq(phases.projectId, projectId)).returning();
}

/**
 * Check if a phase exists
 */
export async function phaseExists(phaseId: string): Promise<boolean> {
  const result = await db.select({ id: phases.id }).from(phases).where(eq(phases.id, phaseId)).limit(1);

  return result.length > 0;
}

/**
 * Reorder phases for a project
 * Updates the order field for multiple phases
 */
export async function reorderPhases(phaseIds: string[], projectId: string) {
  const updates = phaseIds.map(async (phaseId, index) => {
    return await db
      .update(phases)
      .set({
        order: index + 1,
        updatedAt: new Date(),
      })
      .where(and(eq(phases.id, phaseId), eq(phases.projectId, projectId)));
  });

  await Promise.all(updates);

  return await getPhasesByProjectId(projectId);
}

