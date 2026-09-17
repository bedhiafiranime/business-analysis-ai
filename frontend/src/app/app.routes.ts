import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Shell } from './layout/shell';
import { Dashboard } from './features/dashboard/dashboard';
import { ProjectList } from './features/projects/project-list/project-list';
import { ProjectDetail } from './features/projects/project-detail/project-detail';
import { AnalysisDetail } from './features/analyses/analysis-detail/analysis-detail';
import { DocumentList } from './features/documents/document-list/document-list';
import { authGuard } from './core/guards/auth.guard';

// New Agent Components
import { BusinessAnalystAgent } from './features/agents/business-analyst-agent/business-analyst-agent';
import { RequirementsAgent } from './features/agents/requirements-agent/requirements-agent';
import { UserStoryAgent } from './features/agents/user-story-agent/user-story-agent';
import { DocumentationAgent } from './features/agents/documentation-agent/documentation-agent';
import { AiChatAgent } from './features/agents/ai-chat-agent/ai-chat-agent';
import { History } from './features/history/history';
import { Settings } from './features/settings/settings';
import { GlobalDocumentList } from './features/documents/global-document-list/global-document-list';
import { GlobalAnalysisList } from './features/analyses/global-analysis-list/global-analysis-list';

export const routes: Routes = [
  // Public auth routes (no sidebar)
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // Protected routes wrapped in the Shell layout (sidebar included)
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '',         redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'projects', component: ProjectList },
      { path: 'projects/:id', component: ProjectDetail },
      { path: 'projects/:id/analyses', component: AnalysisDetail },
      { path: 'projects/:id/documents', component: DocumentList },
      
      // Global Data Routes
      { path: 'documents', component: GlobalDocumentList },
      { path: 'analyses', component: GlobalAnalysisList },
      
      // Global Agent Routes
      { path: 'agents/business-analyst', component: BusinessAnalystAgent },
      { path: 'agents/requirements', component: RequirementsAgent },
      { path: 'agents/user-story', component: UserStoryAgent },
      { path: 'agents/documentation', component: DocumentationAgent },
      { path: 'agents/chat', component: AiChatAgent },
      
      // Global History Route
      { path: 'history', component: History },
      
      // Agent Routes nested under Project
      { path: 'projects/:id/agents/business-analyst', component: BusinessAnalystAgent },
      { path: 'projects/:id/agents/requirements', component: RequirementsAgent },
      { path: 'projects/:id/agents/user-stories', component: UserStoryAgent },
      { path: 'projects/:id/agents/documentation', component: DocumentationAgent },
      { path: 'projects/:id/agents/chat', component: AiChatAgent },
      
      // History Route nested under Project
      { path: 'projects/:id/history', component: History },
      
      // Global Settings Route
      { path: 'settings', component: Settings },
    ]
  },

  { path: '**', redirectTo: '/login' }
];
