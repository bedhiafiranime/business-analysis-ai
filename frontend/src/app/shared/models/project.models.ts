export interface ProjectResponse {
  id: number;
  name: string;
  businessIdea?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isFavorite: boolean;
}

export interface CreateProjectRequest {
  name: string;
  businessIdea?: string;
}
