import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AnalysisService } from '../../../core/services/analysis.service';
import { DocumentService } from '../../../core/services/document.service';
import { ProjectService } from '../../../core/services/project.service';
import { WorkspaceContextService } from '../../../core/services/workspace-context.service';
import { AnalysisResponse } from '../../../shared/models/analysis.models';
import { DocumentResponse } from '../../../shared/models/document.models';
import { ProjectResponse } from '../../../shared/models/project.models';

@Component({
  selector: 'app-business-analyst-agent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './business-analyst-agent.html',
  styleUrl: './business-analyst-agent.scss'
})
export class BusinessAnalystAgent implements OnInit, OnDestroy {
  // Context
  availableProjects: ProjectResponse[] = [];
  activeProject: ProjectResponse | null = null;
  private sub = new Subscription();

  // State
  isLoadingDocuments = false;
  isGenerating = false;
  isLoadingProjects = true;

  // Data
  documents: DocumentResponse[] = [];
  latestAnalysis: AnalysisResponse | null = null;

  // Form
  selectedDocumentId: number | null = null;
  selectedModel: string = '';

  // Errors
  generateError = '';

  readonly sections = [
    { key: 'businessRequirements',      label: 'Business Requirements',        icon: '🏢' },
    { key: 'functionalRequirements',    label: 'Functional Requirements',      icon: '⚙️' },
    { key: 'nonFunctionalRequirements', label: 'Non-Functional Requirements',  icon: '🔒' },
    { key: 'userStories',               label: 'User Stories',                 icon: '👤' },
    { key: 'acceptanceCriteria',        label: 'Acceptance Criteria',          icon: '✅' },
    { key: 'risks',                     label: 'Risks',                        icon: '⚠️' },
    { key: 'assumptions',               label: 'Assumptions',                  icon: '💡' },
    { key: 'recommendations',           label: 'Recommendations',              icon: '🚀' },
  ];

  constructor(
    private analysisService: AnalysisService,
    private documentService: DocumentService,
    private projectService: ProjectService,
    private workspaceContext: WorkspaceContextService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // If route has :id param, use it directly (nested project route)
    const routeProjectId = this.route.snapshot.paramMap.get('id');
    if (routeProjectId) {
      const id = Number(routeProjectId);
      this.isLoadingProjects = false;
      this.projectService.getProject(id).subscribe({
        next: (project) => {
          this.activeProject = project;
          this.workspaceContext.setProject(project);
          this.loadDocuments(id);
          this.loadLatestAnalysis(id);
          this.cdr.detectChanges();
        }
      });
      return;
    }

    this.loadProjects();

    this.sub.add(
      this.workspaceContext.project$.subscribe((project: ProjectResponse | null) => {
        this.activeProject = project;
        if (project) {
          this.loadDocuments(project.id);
          this.loadLatestAnalysis(project.id);
        } else {
          this.documents = [];
          this.latestAnalysis = null;
        }
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects: ProjectResponse[]) => {
        this.availableProjects = projects;
        this.isLoadingProjects = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingProjects = false;
        this.cdr.detectChanges();
      }
    });
  }

  onProjectChange(projectId: string): void {
    const id = Number(projectId);
    if (!id) {
      this.workspaceContext.setProject(null);
      return;
    }
    const project = this.availableProjects.find(p => p.id === id);
    if (project) {
      this.workspaceContext.setProject(project);
    }
  }

  loadDocuments(projectId: number): void {
    this.isLoadingDocuments = true;
    this.documentService.getProjectDocuments(projectId).subscribe({
      next: (docs: DocumentResponse[]) => {
        this.documents = docs;
        this.isLoadingDocuments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingDocuments = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadLatestAnalysis(projectId: number): void {
    this.analysisService.getLatestAnalysis(projectId).subscribe({
      next: (a: AnalysisResponse) => {
        this.latestAnalysis = a;
        this.workspaceContext.setAnalysis(a);
        this.cdr.detectChanges();
      },
      error: () => {
        this.latestAnalysis = null;
        this.workspaceContext.setAnalysis(null);
        this.cdr.detectChanges();
      }
    });
  }

  generateAnalysis(): void {
    if (!this.activeProject) return;

    this.generateError = '';
    this.isGenerating = true;

    const request = {
      projectId: this.activeProject.id,
      documentId: this.selectedDocumentId || null,
      aiModel: this.selectedModel || null
    };

    this.analysisService.createAnalysis(request)
      .pipe(finalize(() => {
        this.isGenerating = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (result: AnalysisResponse) => {
          this.latestAnalysis = result;
          this.workspaceContext.setAnalysis(result);
          this.cdr.detectChanges();
        },
        error: () => {
          this.generateError = 'Analysis failed. Please try again.';
          this.cdr.detectChanges();
        }
      });
  }

  getSectionValue(analysis: AnalysisResponse, key: string): string | null {
    return (analysis as any)[key] ?? null;
  }

  hasResults(analysis: AnalysisResponse | null): boolean {
    if (!analysis) return false;
    return !!(
      analysis.businessRequirements ||
      analysis.functionalRequirements ||
      analysis.userStories
    );
  }
}
