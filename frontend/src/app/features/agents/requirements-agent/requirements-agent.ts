import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { WorkspaceContextService } from '../../../core/services/workspace-context.service';
import { ProjectService } from '../../../core/services/project.service';
import { AnalysisService } from '../../../core/services/analysis.service';
import { AnalysisResponse } from '../../../shared/models/analysis.models';
import { ProjectResponse } from '../../../shared/models/project.models';
import { HistoryService } from '../../../core/services/history.service';
import { ActivityAction, ActivityStatus } from '../../../shared/models/history.models';

export interface RequirementItem {
  text: string;
}

@Component({
  selector: 'app-requirements-agent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './requirements-agent.html',
  styleUrl: './requirements-agent.scss'
})
export class RequirementsAgent implements OnInit, OnDestroy {
  private sub = new Subscription();

  // Context
  activeProject: ProjectResponse | null = null;
  latestAnalysis: AnalysisResponse | null = null;
  isLoading = true;

  // Parsed requirements
  functionalRequirements: RequirementItem[] = [];
  nonFunctionalRequirements: RequirementItem[] = [];
  businessRequirements: RequirementItem[] = [];
  risks: RequirementItem[] = [];
  assumptions: string[] = [];
  recommendations: string[] = [];

  // UI state
  activeTab: 'functional' | 'nonFunctional' | 'business' | 'risks' | 'assumptions' | 'recommendations' = 'functional';
  exportSuccess = false;

  // Stats
  get totalRequirements(): number {
    return this.functionalRequirements.length + this.nonFunctionalRequirements.length + this.businessRequirements.length;
  }

  get completionRate(): number {
    if (this.totalRequirements === 0) return 0;
    return Math.round((this.functionalRequirements.length / Math.max(this.totalRequirements, 1)) * 100);
  }

  tabs = [
    { key: 'functional'      as const, label: 'Functional',       icon: '⚙️',  countKey: 'functionalRequirements'    as const },
    { key: 'nonFunctional'   as const, label: 'Non-Functional',   icon: '🔒',  countKey: 'nonFunctionalRequirements' as const },
    { key: 'business'        as const, label: 'Business Rules',   icon: '🏢',  countKey: 'businessRequirements'      as const },
    { key: 'risks'           as const, label: 'Risks',            icon: '⚠️',  countKey: 'risks'                     as const },
    { key: 'assumptions'     as const, label: 'Assumptions',      icon: '💡',  countKey: 'assumptions'               as const },
    { key: 'recommendations' as const, label: 'Recommendations',  icon: '🚀',  countKey: 'recommendations'           as const },
  ];

  constructor(
    private workspaceContext: WorkspaceContextService,
    private projectService: ProjectService,
    private analysisService: AnalysisService,
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

    const cachedAnalysis  = this.workspaceContext.getAnalysis();
    const cachedProject   = this.workspaceContext.getProject();
    const persistedId     = this.workspaceContext.getProjectId(); // reads from localStorage

    // ── Tier 1: analysis already in memory → parse instantly, zero HTTP calls
    if (cachedAnalysis && cachedProject) {
      this.latestAnalysis = cachedAnalysis;
      this.activeProject  = cachedProject;
      this.parseAnalysis(cachedAnalysis);
      this.isLoading = false;

    // ── Tier 2: project in memory but no analysis yet → one fetch
    } else if (cachedProject) {
      this.activeProject = cachedProject;
      this.loadAnalysis(cachedProject.id);

    // ── Tier 3: page refreshed / navigated directly → restore from localStorage id
    } else if (persistedId) {
      this.hydrateFromId(persistedId);

    } else {
      // Truly no context (first visit, no project ever selected)
      this.isLoading = false;
    }

    // React to workspace changes triggered by the BA Agent
    // (e.g. user selects a different project while Requirements Agent is open)
    this.sub.add(
      this.workspaceContext.project$.subscribe((project: ProjectResponse | null) => {
        if (project?.id === this.activeProject?.id) return; // skip replay
        this.activeProject = project;
        if (project) {
          this.loadAnalysis(project.id);
        } else {
          this.clearData();
          this.isLoading = false;
        }
        this.cdr.detectChanges();
      })
    );

    // Reflect a new analysis pushed by the BA Agent after regeneration
    this.sub.add(
      this.workspaceContext.analysis$.subscribe((analysis: AnalysisResponse | null) => {
        if (analysis?.id === this.latestAnalysis?.id) return; // no change
        this.latestAnalysis = analysis;
        if (analysis) {
          this.parseAnalysis(analysis);
          this.isLoading = false;
        }
        this.cdr.detectChanges();
      })
    );
  }

  /**
   * Hydrates the full workspace from a persisted projectId.
   * Used on page refresh or direct URL navigation when in-memory context is empty.
   * Fetches project details and latest analysis in parallel using existing services.
   */
  private hydrateFromId(projectId: number): void {
    this.isLoading = true;
    this.sub.add(
      forkJoin({
        project:  this.projectService.getProject(projectId),
        analysis: this.analysisService.getLatestAnalysis(projectId)
      }).subscribe({
        next: ({ project, analysis }) => {
          // Populate in-memory context so other agents benefit too
          this.workspaceContext.setProject(project);
          this.workspaceContext.setAnalysis(analysis);
          this.activeProject  = project;
          this.latestAnalysis = analysis;
          this.parseAnalysis(analysis);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          // Project or analysis no longer exists — clear the stale persisted id
          this.workspaceContext.setProject(null);
          this.clearData();
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  loadAnalysis(projectId: number): void {
    this.isLoading = true;
    this.analysisService.getLatestAnalysis(projectId).subscribe({
      next: (a: AnalysisResponse) => {
        this.latestAnalysis = a;
        this.workspaceContext.setAnalysis(a);
        this.parseAnalysis(a);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.latestAnalysis = null;
        this.clearData();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  parseAnalysis(analysis: AnalysisResponse): void {
    this.functionalRequirements    = this.parseRequirements(analysis.functionalRequirements);
    this.nonFunctionalRequirements = this.parseRequirements(analysis.nonFunctionalRequirements);
    this.businessRequirements      = this.parseRequirements(analysis.businessRequirements);
    this.risks                     = this.parseRequirements(analysis.risks);
    this.assumptions               = this.parseLines(analysis.assumptions);
    this.recommendations           = this.parseLines(analysis.recommendations);
  }

  /**
   * Parses a raw AI text string into structured requirement items without modifying content.
   */
  parseRequirements(raw: string | null): RequirementItem[] {
    if (!raw) return [];
    const lines = raw
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5);

    return lines.map((text) => ({ text }));
  }

  parseLines(raw: string | null): string[] {
    if (!raw) return [];
    return raw
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5);
  }

  setTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  getTabCount(tab: typeof this.tabs[number]): number {
    const val = this[tab.countKey];
    return Array.isArray(val) ? val.length : 0;
  }

  clearData(): void {
    this.functionalRequirements = [];
    this.nonFunctionalRequirements = [];
    this.businessRequirements = [];
    this.risks = [];
    this.assumptions = [];
    this.recommendations = [];
  }

  exportAsText(): void {
    if (!this.latestAnalysis || !this.activeProject) return;

    const sections = [
      { title: 'FUNCTIONAL REQUIREMENTS', items: this.functionalRequirements },
      { title: 'NON-FUNCTIONAL REQUIREMENTS', items: this.nonFunctionalRequirements },
      { title: 'BUSINESS REQUIREMENTS', items: this.businessRequirements },
    ];

    let content = `REQUIREMENTS SPECIFICATION\n`;
    content += `Project: ${this.activeProject.name}\n`;
    content += `Generated: ${new Date(this.latestAnalysis.createdAt).toLocaleString()}\n`;
    content += `${'='.repeat(60)}\n\n`;

    for (const section of sections) {
      content += `${section.title}\n${'─'.repeat(40)}\n`;
      section.items.forEach(item => {
        content += `${item.text}\n`;
      });
      content += '\n';
    }

    content += `RISKS\n${'─'.repeat(40)}\n`;
    this.risks.forEach(r => { content += `${r.text}\n`; });
    content += '\n';

    content += `ASSUMPTIONS\n${'─'.repeat(40)}\n`;
    this.assumptions.forEach((a, i) => { content += `${i + 1}. ${a}\n`; });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `requirements-${this.activeProject.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    this.historyService.logActivity(this.activeProject.id, ActivityAction.REQUIREMENTS_GENERATED, ActivityStatus.SUCCESS, 'Exported Requirements Specification').subscribe();

    this.exportSuccess = true;
    setTimeout(() => { this.exportSuccess = false; this.cdr.detectChanges(); }, 3000);
  }
}
