import { pgTable, uuid, varchar, text, date, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/**
 * Projects Table
 * Stores all project information
 */
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  client: varchar('client', { length: 255 }).notNull(),
  description: text('description'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  projectManager: varchar('project_manager', { length: 255 }),
  members: jsonb('members').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Phases Table
 * Stores roadmap phases for each project
 */
export const phases = pgTable('phases', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  status: varchar('status', { length: 50 }).default('planned'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Relations
 */
export const projectsRelations = relations(projects, ({ many }) => ({
  phases: many(phases),
}));

export const phasesRelations = relations(phases, ({ one }) => ({
  project: one(projects, {
    fields: [phases.projectId],
    references: [projects.id],
  }),
}));

/**
 * Types inferred from schema
 */
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Phase = typeof phases.$inferSelect;
export type NewPhase = typeof phases.$inferInsert;

