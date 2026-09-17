export interface AnalysisResponse {
  id: number;
  projectId: number;
  generationStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  projectStatus: string;
  businessRequirements: string | null;
  functionalRequirements: string | null;
  nonFunctionalRequirements: string | null;
  userStories: string | null;
  acceptanceCriteria: string | null;
  risks: string | null;
  assumptions: string | null;
  recommendations: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnalysisRequest {
  projectId: number;
  documentId?: number | null;
  aiModel?: string | null;
}
