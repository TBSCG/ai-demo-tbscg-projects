export interface Project {
  id: string;
  title: string;
  client: string;
  description: string | null;
  startDate: string | null; // ISO date string
  endDate: string | null; // ISO date string
  projectManager: string | null;
  members: string[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface CreateProjectDto {
  title: string;
  client: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  projectManager?: string | null;
  members?: string[];
}

export interface UpdateProjectDto {
  title?: string;
  client?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  projectManager?: string | null;
  members?: string[];
}


