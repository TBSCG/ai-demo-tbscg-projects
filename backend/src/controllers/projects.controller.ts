import { Request, Response } from 'express';
import {
  getAllProjectsWithPhases,
  getProjectByIdWithPhases,
  createProject as createProjectQuery,
  updateProject as updateProjectQuery,
  deleteProject as deleteProjectQuery,
  projectExists,
} from '../db/queries/projects.queries';
import {
  createPhase as createPhaseQuery,
  updatePhase as updatePhaseQuery,
  deletePhase as deletePhaseQuery,
  getPhaseByIdAndProjectId,
} from '../db/queries/phases.queries';
import { NotFoundError } from '../utils/errors';
import { CreateProjectInput, UpdateProjectInput } from '../validators/project.validator';
import { CreatePhaseInput, UpdatePhaseInput } from '../validators/phase.validator';

/**
 * Controller: Get all projects with their phases
 * 
 * @route GET /api/projects
 * @returns {Array} List of projects with nested phases
 */
export const getAllProjects = async (_req: Request, res: Response) => {
  const projects = await getAllProjectsWithPhases();
  
  res.status(200).json({
    success: true,
    data: projects,
  });
};

/**
 * Controller: Get single project by ID with phases
 * 
 * @route GET /api/projects/:id
 * @param {string} req.params.id - Project UUID
 * @throws {NotFoundError} If project doesn't exist
 * @returns {Object} Project with nested phases
 */
export const getProjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const project = await getProjectByIdWithPhases(id);
  
  if (!project) {
    throw new NotFoundError('Project not found');
  }
  
  res.status(200).json({
    success: true,
    data: project,
  });
};

/**
 * Controller: Create new project
 * 
 * @route POST /api/projects
 * @body {CreateProjectInput} Project data
 * @returns {Object} Created project
 */
export const createProject = async (
  req: Request,
  res: Response
) => {
  const projectData = req.body as CreateProjectInput;
  
  // Create project using query function
  const newProject = await createProjectQuery(projectData);
  
  res.status(201).json({
    success: true,
    data: newProject,
  });
};

/**
 * Controller: Update existing project
 * 
 * @route PUT /api/projects/:id
 * @param {string} req.params.id - Project UUID
 * @body {UpdateProjectInput} Updated project data
 * @throws {NotFoundError} If project doesn't exist
 * @returns {Object} Updated project
 */
export const updateProject = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const updateData = req.body as UpdateProjectInput;
  
  // Check if project exists
  const exists = await projectExists(id);
  if (!exists) {
    throw new NotFoundError('Project not found');
  }
  
  // Update project
  const updatedProject = await updateProjectQuery(id, updateData);
  
  res.status(200).json({
    success: true,
    data: updatedProject,
  });
};

/**
 * Controller: Delete project and all its phases
 * 
 * @route DELETE /api/projects/:id
 * @param {string} req.params.id - Project UUID
 * @throws {NotFoundError} If project doesn't exist
 * @returns {Object} Success message
 */
export const deleteProject = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  // Check if project exists
  const exists = await projectExists(id);
  if (!exists) {
    throw new NotFoundError('Project not found');
  }
  
  // Delete project (phases cascade automatically)
  await deleteProjectQuery(id);
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Project deleted successfully',
    },
  });
};

/**
 * Controller: Add phase to project
 * 
 * @route POST /api/projects/:id/phases
 * @param {string} req.params.id - Project UUID
 * @body {CreatePhaseInput} Phase data
 * @throws {NotFoundError} If project doesn't exist
 * @returns {Object} Created phase
 */
export const addPhase = async (
  req: Request,
  res: Response
) => {
  const { id: projectId } = req.params;
  const phaseData = req.body as CreatePhaseInput;
  
  // Check if project exists
  const exists = await projectExists(projectId);
  if (!exists) {
    throw new NotFoundError('Project not found');
  }
  
  // Create phase
  const newPhase = await createPhaseQuery({
    ...phaseData,
    projectId,
  });
  
  res.status(201).json({
    success: true,
    data: newPhase,
  });
};

/**
 * Controller: Update phase
 * 
 * @route PUT /api/projects/:id/phases/:phaseId
 * @param {string} req.params.id - Project UUID
 * @param {string} req.params.phaseId - Phase UUID
 * @body {UpdatePhaseInput} Updated phase data
 * @throws {NotFoundError} If project or phase doesn't exist
 * @returns {Object} Updated phase
 */
export const updatePhase = async (
  req: Request,
  res: Response
) => {
  const { id: projectId, phaseId } = req.params;
  const updateData = req.body as UpdatePhaseInput;
  
  // Verify phase belongs to project
  const phase = await getPhaseByIdAndProjectId(phaseId, projectId);
  if (!phase) {
    throw new NotFoundError('Phase not found');
  }
  
  // Update phase
  const updatedPhase = await updatePhaseQuery(phaseId, updateData);
  
  res.status(200).json({
    success: true,
    data: updatedPhase,
  });
};

/**
 * Controller: Delete phase
 * 
 * @route DELETE /api/projects/:id/phases/:phaseId
 * @param {string} req.params.id - Project UUID
 * @param {string} req.params.phaseId - Phase UUID
 * @throws {NotFoundError} If project or phase doesn't exist
 * @returns {Object} Success message
 */
export const deletePhase = async (req: Request, res: Response) => {
  const { id: projectId, phaseId } = req.params;
  
  // Verify phase belongs to project
  const phase = await getPhaseByIdAndProjectId(phaseId, projectId);
  if (!phase) {
    throw new NotFoundError('Phase not found');
  }
  
  // Delete phase
  await deletePhaseQuery(phaseId);
  
  res.status(200).json({
    success: true,
    data: {
      message: 'Phase deleted successfully',
    },
  });
};

