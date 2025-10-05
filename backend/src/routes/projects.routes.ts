import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addPhase,
  updatePhase,
  deletePhase,
} from '../controllers/projects.controller';
import { validateRequest } from '../middleware/validateRequest';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from '../validators/project.validator';
import {
  createPhaseSchema,
  updatePhaseSchema,
  phaseIdSchema,
} from '../validators/phase.validator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// ============================================
// PROJECT ROUTES
// ============================================

/**
 * @route   GET /api/projects
 * @desc    Get all projects with phases
 * @access  Public
 */
router.get('/', asyncHandler(getAllProjects));

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID with phases
 * @access  Public
 */
router.get(
  '/:id',
  validateRequest(projectIdSchema),
  asyncHandler(getProjectById)
);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Public
 */
router.post(
  '/',
  validateRequest(createProjectSchema),
  asyncHandler(createProject)
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Public
 */
router.put(
  '/:id',
  validateRequest(updateProjectSchema),
  asyncHandler(updateProject)
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project and all its phases
 * @access  Public
 */
router.delete(
  '/:id',
  validateRequest(projectIdSchema),
  asyncHandler(deleteProject)
);

// ============================================
// PHASE ROUTES
// ============================================

/**
 * @route   POST /api/projects/:id/phases
 * @desc    Add phase to project
 * @access  Public
 */
router.post(
  '/:id/phases',
  validateRequest(createPhaseSchema),
  asyncHandler(addPhase)
);

/**
 * @route   PUT /api/projects/:id/phases/:phaseId
 * @desc    Update phase
 * @access  Public
 */
router.put(
  '/:id/phases/:phaseId',
  validateRequest(updatePhaseSchema),
  asyncHandler(updatePhase)
);

/**
 * @route   DELETE /api/projects/:id/phases/:phaseId
 * @desc    Delete phase
 * @access  Public
 */
router.delete(
  '/:id/phases/:phaseId',
  validateRequest(phaseIdSchema),
  asyncHandler(deletePhase)
);

export default router;

