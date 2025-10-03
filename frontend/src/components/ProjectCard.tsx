import type { Project } from '@demo-tbscg/shared';
import { Card, Badge } from './ui';
import { formatDateRange } from '../utils/dateFormat';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Card onClick={onClick} className="hover:border-primary hover:border transition-all">
      <div className="space-y-3">
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
          {project.title}
        </h3>

        {/* Client */}
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-medium">{project.client}</span>
        </div>

        {/* Project Manager */}
        {project.projectManager && (
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{project.projectManager}</span>
          </div>
        )}

        {/* Date Range */}
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{formatDateRange(project.startDate, project.endDate)}</span>
        </div>

        {/* Members Count */}
        {project.members.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="info">
              {project.members.length} {project.members.length === 1 ? 'member' : 'members'}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

