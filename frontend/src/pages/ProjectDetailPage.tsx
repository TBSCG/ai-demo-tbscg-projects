import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Project, Phase } from '@demo-tbscg/shared';
import { projectsApi } from '../api';
import { Button, Spinner, Alert, Badge, Modal } from '../components/ui';
import PhaseTimeline from '../components/PhaseTimeline';
import PhaseGanttTimeline from '../components/PhaseGanttTimeline';
import { formatDateLong } from '../utils/dateFormat';

type ViewMode = 'list' | 'timeline';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<(Project & { phases: Phase[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getById(projectId);
      setProject(data);
    } catch (err) {
      setError('Project not found');
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await projectsApi.delete(id);
      navigate('/', { state: { message: 'Project deleted successfully' } });
    } catch (err) {
      setError('Failed to delete project');
      console.error('Error deleting project:', err);
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <Alert variant="error">{error || 'Project not found'}</Alert>
        <div className="mt-6">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-gray-500 mt-1">Project Details</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(`/projects/${id}/edit`)}>
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </span>
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
            <span className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </span>
          </Button>
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{project.client}</span>
            </div>
          </div>

          {/* Project Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
            <div className="flex items-center gap-2 text-gray-900">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{project.projectManager || 'Not assigned'}</span>
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="text-gray-900">{formatDateLong(project.startDate)}</div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="text-gray-900">{formatDateLong(project.endDate)}</div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <p className="text-gray-900 whitespace-pre-wrap">{project.description || 'No description provided'}</p>
        </div>

        {/* Team Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
          {project.members.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.members.map((member, index) => (
                <Badge key={index} variant="info">{member}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No team members assigned</p>
          )}
        </div>
      </div>

      {/* Roadmap / Phases */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Project Roadmap</h2>
          
          {/* View Toggle */}
          <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Timeline
              </span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                List
              </span>
            </button>
          </div>
        </div>

        {/* Render appropriate view based on mode */}
        {viewMode === 'timeline' ? (
          <PhaseGanttTimeline phases={project.phases} />
        ) : (
          <PhaseTimeline phases={project.phases} />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Are you sure you want to delete <strong>{project.title}</strong>? This action cannot be undone
          and will also delete all associated phases.
        </p>
      </Modal>
    </div>
  );
}

