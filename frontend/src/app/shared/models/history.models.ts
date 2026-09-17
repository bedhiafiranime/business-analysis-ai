export enum ActivityAction {
  PROJECT_CREATED = 'PROJECT_CREATED',
  PROJECT_UPDATED = 'PROJECT_UPDATED',
  PROJECT_DELETED = 'PROJECT_DELETED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  ANALYSIS_STARTED = 'ANALYSIS_STARTED',
  ANALYSIS_COMPLETED = 'ANALYSIS_COMPLETED',
  ANALYSIS_FAILED = 'ANALYSIS_FAILED',
  REQUIREMENTS_GENERATED = 'REQUIREMENTS_GENERATED',
  USER_STORIES_GENERATED = 'USER_STORIES_GENERATED',
  DOCUMENTATION_GENERATED = 'DOCUMENTATION_GENERATED',
  AI_CHAT_INTERACTION = 'AI_CHAT_INTERACTION'
}

export enum ActivityStatus {
  SUCCESS = 'SUCCESS',
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED'
}

export interface ProjectActivityResponse {
  id: number;
  projectId: number;
  projectName: string;
  userName: string;
  action: ActivityAction;
  status: ActivityStatus;
  details: string;
  timestamp: string;
}

export interface Page<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
