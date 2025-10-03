export interface Phase {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  startDate: string | null; // ISO date string
  endDate: string | null; // ISO date string
  status: 'planned' | 'in-progress' | 'completed' | null;
  order: number;
  createdAt: string; // ISO timestamp
}

export interface CreatePhaseDto {
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: 'planned' | 'in-progress' | 'completed' | null;
  order: number;
}

export interface UpdatePhaseDto {
  name?: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status?: 'planned' | 'in-progress' | 'completed' | null;
  order?: number;
}


