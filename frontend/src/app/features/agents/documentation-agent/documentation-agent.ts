import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WorkspaceContextService } from '../../../core/services/workspace-context.service';
import { AnalysisService } from '../../../core/services/analysis.service';
import { ProjectService } from '../../../core/services/project.service';
import { DocumentService } from '../../../core/services/document.service';
import { Subscription, forkJoin, of, switchMap } from 'rxjs';
import { AnalysisResponse } from '../../../shared/models/analysis.models';
import { ProjectResponse } from '../../../shared/models/project.models';
import { DocumentResponse } from '../../../shared/models/document.models';
import { HistoryService } from '../../../core/services/history.service';
import { ActivityAction, ActivityStatus } from '../../../shared/models/history.models';

@Component({
  selector: 'app-documentation-agent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './documentation-agent.html',
  styleUrl: './documentation-agent.scss'
})
export class DocumentationAgent implements OnInit, OnDestroy {
  activeProject: ProjectResponse | null = null;
  activeAnalysis: AnalysisResponse | null = null;
  documents: DocumentResponse[] = [];
  
  isLoading = false;
  hasProject = false;
  hasAnalysis = false;
  exportSuccessSrs = false;
  exportSuccessBrd = false;

  activeTab: 'srs' | 'brd' | 'uml' = 'srs';

  private sub = new Subscription();

  constructor(
    private workspace: WorkspaceContextService,
    private analysisService: AnalysisService,
    private projectService: ProjectService,
    private documentService: DocumentService,
    private historyService: HistoryService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // If route has :id param, use it directly (nested project route)
    const routeProjectId = this.route.snapshot.paramMap.get('id');
    if (routeProjectId) {
      this.hydrateFromId(Number(routeProjectId));
      return;
    }

    const cachedAnalysis = this.workspace.getAnalysis();
    const cachedProject = this.workspace.getProject();
    const persistedId = this.workspace.getProjectId(); 

    if (cachedAnalysis && cachedProject) {
      this.activeProject = cachedProject;
      this.activeAnalysis = cachedAnalysis;
      this.hasProject = true;
      this.hasAnalysis = true;
      this.fetchDocuments(cachedProject.id);
      this.isLoading = false;
    } else if (cachedProject) {
      this.activeProject = cachedProject;
      this.hasProject = true;
      this.fetchLatestAnalysis(cachedProject.id);
      this.fetchDocuments(cachedProject.id);
    } else if (persistedId) {
      this.hydrateFromId(persistedId);
    } else {
      this.isLoading = false;
    }

    this.sub.add(
      this.workspace.project$.subscribe(project => {
        if (project?.id === this.activeProject?.id) return;
        this.activeProject = project;
        this.hasProject = !!project;

        if (project) {
          this.fetchLatestAnalysis(project.id);
          this.fetchDocuments(project.id);
        } else {
          this.clearData();
          this.hasAnalysis = false;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );

    this.sub.add(
      this.workspace.analysis$.subscribe(analysis => {
        if (analysis) {
          this.hasAnalysis = true;
          this.activeAnalysis = analysis;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  private hydrateFromId(persistedId: number): void {
    this.isLoading = true;
    this.sub.add(
      forkJoin({
        project: this.projectService.getProject(persistedId),
        analysis: this.analysisService.getLatestAnalysis(persistedId),
        documents: this.documentService.getProjectDocuments(persistedId)
      }).subscribe({
        next: (result) => {
          this.workspace.setProject(result.project);
          this.workspace.setAnalysis(result.analysis);
          this.activeProject = result.project;
          this.hasProject = true;
          this.hasAnalysis = !!result.analysis;
          this.activeAnalysis = result.analysis;
          this.documents = result.documents || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.workspace.setProject(null);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  private fetchLatestAnalysis(projectId: number): void {
    this.isLoading = true;
    this.analysisService.getLatestAnalysis(projectId).subscribe({
      next: (analysis) => {
        this.workspace.setAnalysis(analysis);
        this.hasAnalysis = true;
        this.activeAnalysis = analysis;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private fetchDocuments(projectId: number): void {
    this.documentService.getProjectDocuments(projectId).subscribe({
      next: (docs) => {
        this.documents = docs;
        this.cdr.detectChanges();
      },
      error: () => {
        this.documents = [];
        this.cdr.detectChanges();
      }
    });
  }

  setTab(tab: 'srs' | 'brd' | 'uml'): void {
    this.activeTab = tab;
  }

  exportSrsDocument(): void {
    if (!this.activeProject || !this.activeAnalysis) return;

    let md = `# Software Requirements Specification (SRS)\n`;
    md += `## Project: ${this.activeProject.name}\n`;
    md += `**Date Generated:** ${new Date().toLocaleDateString()}\n\n`;

    md += `### 1. Executive Summary\n${this.activeProject.businessIdea || 'No business idea provided.'}\n\n`;

    md += `### 2. Business Requirements\n${this.activeAnalysis.businessRequirements || 'N/A'}\n\n`;
    md += `### 3. Functional Requirements\n${this.activeAnalysis.functionalRequirements || 'N/A'}\n\n`;
    md += `### 4. Non-Functional Requirements\n${this.activeAnalysis.nonFunctionalRequirements || 'N/A'}\n\n`;
    md += `### 5. User Stories\n${this.activeAnalysis.userStories || 'N/A'}\n\n`;
    md += `### 6. Acceptance Criteria\n${this.activeAnalysis.acceptanceCriteria || 'N/A'}\n\n`;
    md += `### 7. Risks & Mitigation\n${this.activeAnalysis.risks || 'N/A'}\n\n`;
    md += `### 8. Assumptions\n${this.activeAnalysis.assumptions || 'N/A'}\n\n`;
    md += `### 9. Strategic Recommendations\n${this.activeAnalysis.recommendations || 'N/A'}\n\n`;

    if (this.documents.length > 0) {
      md += `### 10. Reference Documents\n`;
      this.documents.forEach((d, idx) => {
        md += `${idx + 1}. ${d.originalFileName} (Uploaded: ${new Date(d.uploadDate).toLocaleDateString()})\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SRS_${this.activeProject.name.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);

    this.historyService.logActivity(this.activeProject.id, ActivityAction.DOCUMENTATION_GENERATED, ActivityStatus.SUCCESS, 'Exported SRS Document').subscribe();

    this.exportSuccessSrs = true;
    setTimeout(() => { this.exportSuccessSrs = false; }, 3000);
  }

  exportBrdDocument(): void {
    if (!this.activeProject || !this.activeAnalysis) return;

    let md = `# Business Requirements Document (BRD)\n`;
    md += `## Project: ${this.activeProject.name}\n`;
    md += `**Date Generated:** ${new Date().toLocaleDateString()}\n\n`;

    md += `### 1. Executive Summary\n${this.activeProject.businessIdea || 'No business idea provided.'}\n\n`;
    md += `### 2. Business Objectives\n${this.activeAnalysis.businessRequirements || 'N/A'}\n\n`;
    md += `### 3. Key Assumptions\n${this.activeAnalysis.assumptions || 'N/A'}\n\n`;
    md += `### 4. Risks and Constraints\n${this.activeAnalysis.risks || 'N/A'}\n\n`;
    md += `### 5. Recommendations\n${this.activeAnalysis.recommendations || 'N/A'}\n\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BRD_${this.activeProject.name.replace(/\s+/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
    
    this.historyService.logActivity(this.activeProject.id, ActivityAction.DOCUMENTATION_GENERATED, ActivityStatus.SUCCESS, 'Exported BRD Document').subscribe();

    this.exportSuccessBrd = true;
    setTimeout(() => { this.exportSuccessBrd = false; }, 3000);
  }

  clearData(): void {
    this.activeAnalysis = null;
    this.documents = [];
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
