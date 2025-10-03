import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Project, Phase, UpdateProjectDto, CreatePhaseDto, UpdatePhaseDto } from '@demo-tbscg/shared';
import { projectsApi } from '../api';
import { Button, Input, TextArea, DatePicker, Alert, Spinner, Modal, Badge } from '../components/ui';

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<(Project & { phases: Phase[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<UpdateProjectDto>({});
  const [memberInput, setMemberInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Phase management state
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [phaseFormData, setPhaseFormData] = useState<CreatePhaseDto | UpdatePhaseDto>({
    name: '',
    description: '',
    startDate: null,
    endDate: null,
    status: null,
    order: 1,
  });

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    try {
      setLoading(true);
      const data = await projectsApi.getById(projectId);
      setProject(data);
      setFormData({
        title: data.title,
        client: data.client,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        projectManager: data.projectManager,
        members: [...data.members],
      });
    } catch (err) {
      setError('Project not found');
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.client?.trim()) {
      newErrors.client = 'Client is required';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMember = () => {
    if (memberInput.trim() && !formData.members?.includes(memberInput.trim())) {
      setFormData({
        ...formData,
        members: [...(formData.members || []), memberInput.trim()],
      });
      setMemberInput('');
    }
  };

  const handleRemoveMember = (index: number) => {
    setFormData({
      ...formData,
      members: formData.members?.filter((_, i) => i !== index) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || !id) return;

    try {
      setSaving(true);
      setError(null);
      await projectsApi.update(id, formData);
      setSuccess('Project updated successfully!');
      
      // Reload project data
      await loadProject(id);
      
      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 1500);
    } catch (err) {
      setError('Failed to update project. Please try again.');
      console.error('Error updating project:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPhaseModal = (phase?: Phase) => {
    if (phase) {
      setEditingPhase(phase);
      setPhaseFormData({
        name: phase.name,
        description: phase.description,
        startDate: phase.startDate,
        endDate: phase.endDate,
        status: phase.status,
        order: phase.order,
      });
    } else {
      setEditingPhase(null);
      const nextOrder = project?.phases.length ? Math.max(...project.phases.map(p => p.order)) + 1 : 1;
      setPhaseFormData({
        name: '',
        description: '',
        startDate: null,
        endDate: null,
        status: 'planned',
        order: nextOrder,
      });
    }
    setIsPhaseModalOpen(true);
  };

  const handleSavePhase = async () => {
    if (!id || !phaseFormData.name?.trim()) {
      setError('Phase name is required');
      return;
    }

    try {
      if (editingPhase) {
        // Update existing phase
        const updated = await projectsApi.phases.update(id, editingPhase.id, phaseFormData);
        setProject(prev => prev ? {
          ...prev,
          phases: prev.phases.map(p => p.id === editingPhase.id ? updated : p)
        } : null);
        setSuccess('Phase updated successfully!');
      } else {
        // Create new phase
        const created = await projectsApi.phases.create(id, phaseFormData as CreatePhaseDto);
        setProject(prev => prev ? {
          ...prev,
          phases: [...prev.phases, created]
        } : null);
        setSuccess('Phase added successfully!');
      }
      
      setIsPhaseModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save phase');
      console.error('Error saving phase:', err);
    }
  };

  const handleDeletePhase = async (phaseId: string) => {
    if (!id || !confirm('Are you sure you want to delete this phase?')) return;

    try {
      await projectsApi.phases.delete(id, phaseId);
      setProject(prev => prev ? {
        ...prev,
        phases: prev.phases.filter(p => p.id !== phaseId)
      } : null);
      setSuccess('Phase deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to delete phase');
      console.error('Error deleting phase:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="text-center py-12">
        <Alert variant="error">{error}</Alert>
        <div className="mt-6">
          <Button variant="secondary" onClick={() => navigate('/')}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
        <p className="text-gray-500 mt-1">Update project information and manage phases</p>
      </div>

      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} className="mb-6">
          {success}
        </Alert>
      )}

      {error && project && (
        <Alert variant="error" onClose={() => setError(null)} className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Information */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Project Information</h2>

          <Input
            label="Project Title"
            value={formData.title || ''}
            onChange={(value) => setFormData({ ...formData, title: value })}
            error={errors.title}
            required
            placeholder="Enter project title"
          />

          <Input
            label="Client"
            value={formData.client || ''}
            onChange={(value) => setFormData({ ...formData, client: value })}
            error={errors.client}
            required
            placeholder="Enter client name"
          />

          <TextArea
            label="Description"
            value={formData.description || ''}
            onChange={(value) => setFormData({ ...formData, description: value })}
            rows={4}
            placeholder="Enter project description"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker
              label="Start Date"
              value={formData.startDate ?? null}
              onChange={(value) => setFormData({ ...formData, startDate: value })}
              error={errors.startDate}
            />
            <DatePicker
              label="End Date"
              value={formData.endDate ?? null}
              onChange={(value) => setFormData({ ...formData, endDate: value })}
              error={errors.endDate}
            />
          </div>

          <Input
            label="Project Manager"
            value={formData.projectManager || ''}
            onChange={(value) => setFormData({ ...formData, projectManager: value })}
            placeholder="Enter project manager name"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember();
                  }
                }}
                placeholder="Enter member name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
              <Button type="button" onClick={handleAddMember} variant="secondary">
                Add
              </Button>
            </div>
            {formData.members && formData.members.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.members.map((member, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{member}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="hover:text-blue-900"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Phases */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Project Phases</h2>
            <Button type="button" onClick={() => handleOpenPhaseModal()} variant="primary">
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Phase
              </span>
            </Button>
          </div>

          {project?.phases && project.phases.length > 0 ? (
            <div className="space-y-3">
              {[...project.phases].sort((a, b) => a.order - b.order).map((phase) => (
                <div key={phase.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                    {phase.order}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                      {phase.status && (
                        <Badge variant={phase.status === 'completed' ? 'success' : phase.status === 'in-progress' ? 'warning' : 'default'}>
                          {phase.status}
                        </Badge>
                      )}
                    </div>
                    {phase.description && <p className="text-sm text-gray-600">{phase.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenPhaseModal(phase)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeletePhase(phase.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No phases yet. Add your first phase to get started.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/projects/${id}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      {/* Phase Modal */}
      <Modal
        isOpen={isPhaseModalOpen}
        onClose={() => setIsPhaseModalOpen(false)}
        title={editingPhase ? 'Edit Phase' : 'Add Phase'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPhaseModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePhase}>
              {editingPhase ? 'Update Phase' : 'Add Phase'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Phase Name"
            value={phaseFormData.name || ''}
            onChange={(value) => setPhaseFormData({ ...phaseFormData, name: value })}
            required
            placeholder="e.g., Planning, Development, Testing"
          />

          <TextArea
            label="Description"
            value={phaseFormData.description || ''}
            onChange={(value) => setPhaseFormData({ ...phaseFormData, description: value })}
            rows={3}
            placeholder="Brief description of this phase"
          />

          <div className="grid grid-cols-2 gap-4">
            <DatePicker
              label="Start Date"
              value={phaseFormData.startDate ?? null}
              onChange={(value) => setPhaseFormData({ ...phaseFormData, startDate: value })}
            />
            <DatePicker
              label="End Date"
              value={phaseFormData.endDate ?? null}
              onChange={(value) => setPhaseFormData({ ...phaseFormData, endDate: value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={phaseFormData.status || ''}
              onChange={(e) => setPhaseFormData({ ...phaseFormData, status: e.target.value as Phase['status'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Not set</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <Input
            label="Order"
            value={String(phaseFormData.order || 1)}
            onChange={(value) => setPhaseFormData({ ...phaseFormData, order: parseInt(value) || 1 })}
            type="number"
            required
          />
        </div>
      </Modal>
    </div>
  );
}

