import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CreateProjectDto } from '@demo-tbscg/shared';
import { projectsApi } from '../api';
import { Button, Input, TextArea, DatePicker, Alert } from '../components/ui';

export default function NewProjectPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<CreateProjectDto>({
    title: '',
    client: '',
    description: '',
    startDate: null,
    endDate: null,
    projectManager: '',
    members: [],
  });

  const [memberInput, setMemberInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.client.trim()) {
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

    if (!validate()) return;

    try {
      setSaving(true);
      setError(null);
      const newProject = await projectsApi.create(formData);
      navigate(`/projects/${newProject.id}`);
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error('Error creating project:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-500 mt-1">Add a new project to your portfolio</p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)} className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Title */}
        <Input
          label="Project Title"
          value={formData.title}
          onChange={(value) => setFormData({ ...formData, title: value })}
          error={errors.title}
          required
          placeholder="Enter project title"
        />

        {/* Client */}
        <Input
          label="Client"
          value={formData.client}
          onChange={(value) => setFormData({ ...formData, client: value })}
          error={errors.client}
          required
          placeholder="Enter client name"
        />

        {/* Description */}
        <TextArea
          label="Description"
          value={formData.description || ''}
          onChange={(value) => setFormData({ ...formData, description: value })}
          error={errors.description}
          rows={4}
          placeholder="Enter project description"
        />

        {/* Dates */}
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

        {/* Project Manager */}
        <Input
          label="Project Manager"
          value={formData.projectManager || ''}
          onChange={(value) => setFormData({ ...formData, projectManager: value })}
          error={errors.projectManager}
          placeholder="Enter project manager name"
        />

        {/* Team Members */}
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

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}

