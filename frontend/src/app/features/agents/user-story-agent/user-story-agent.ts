import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { WorkspaceContextService } from '../../../core/services/workspace-context.service';
import { ProjectService } from '../../../core/services/project.service';
import { AnalysisService } from '../../../core/services/analysis.service';
import { AnalysisResponse } from '../../../shared/models/analysis.models';
import { ProjectResponse } from '../../../shared/models/project.models';
import { HistoryService } from '../../../core/services/history.service';
import { ActivityAction, ActivityStatus } from '../../../shared/models/history.models';

export interface StoryItem {
  id: string;
  text: string;
  role?: string;
  action?: string;
  benefit?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  epicIndex: number;
}

export interface EpicItem {
  title: string;
  description: string;
  storyCount: number;
  color: string;
}

export interface AcceptanceCriteriaItem {
  text: string;
  storyRef?: string;
}

type ActiveTab = 'backlog' | 'epics' | 'stories' | 'acceptance';

@Component({
  selector: 'app-user-story-agent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-story-agent.html',
  styleUrl: './user-story-agent.scss'
})
export class UserStoryAgent implements OnInit, OnDestroy {
  private sub = new Subscription();

  // Context
  activeProject: ProjectResponse | null = null;
  latestAnalysis: AnalysisResponse | null = null;
  isLoading = true;

  // Data
  userStories: StoryItem[] = [];
  acceptanceCriteria: AcceptanceCriteriaItem[] = [];
  epics: EpicItem[] = [];

  // UI State
  activeTab: ActiveTab = 'backlog';
  selectedEpicIndex: number | null = null;
  exportSuccess = false;

  // Tab definitions
  tabs: { key: ActiveTab; label: string; icon: string }[] = [
    { key: 'backlog',    label: 'Backlog',              icon: '📋' },
    { key: 'epics',     label: 'Epics',                icon: '🗂️' },
    { key: 'stories',   label: 'User Stories',         icon: '📝' },
    { key: 'acceptance', label: 'Acceptance Criteria',  icon: '✅' },
  ];

  private epicColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#06b6d4',
    '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
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

    const cachedAnalysis = this.workspaceContext.getAnalysis();
    const cachedProject  = this.workspaceContext.getProject();
    const persistedId    = this.workspaceContext.getProjectId();

    if (cachedAnalysis && cachedProject) {
      this.latestAnalysis = cachedAnalysis;
      this.activeProject  = cachedProject;
      this.parseAnalysis(cachedAnalysis);
      this.isLoading = false;
    } else if (cachedProject) {
      this.activeProject = cachedProject;
      this.loadAnalysis(cachedProject.id);
    } else if (persistedId) {
      this.hydrateFromId(persistedId);
    } else {
      this.isLoading = false;
    }

    this.sub.add(
      this.workspaceContext.project$.subscribe((project: ProjectResponse | null) => {
        if (project?.id === this.activeProject?.id) return;
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

    this.sub.add(
      this.workspaceContext.analysis$.subscribe((analysis: AnalysisResponse | null) => {
        if (analysis?.id === this.latestAnalysis?.id) return;
        this.latestAnalysis = analysis;
        if (analysis) {
          this.parseAnalysis(analysis);
          this.isLoading = false;
        }
        this.cdr.detectChanges();
      })
    );
  }

  private hydrateFromId(projectId: number): void {
    this.isLoading = true;
    this.sub.add(
      forkJoin({
        project:  this.projectService.getProject(projectId),
        analysis: this.analysisService.getLatestAnalysis(projectId)
      }).subscribe({
        next: ({ project, analysis }) => {
          this.workspaceContext.setProject(project);
          this.workspaceContext.setAnalysis(analysis);
          this.activeProject  = project;
          this.latestAnalysis = analysis;
          this.parseAnalysis(analysis);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.workspaceContext.setProject(null);
          this.clearData();
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
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
    const rawStories = this.parseLines(analysis.userStories);
    const rawAC      = this.parseLines(analysis.acceptanceCriteria);

    // Build epics by grouping stories into logical buckets
    this.epics = this.buildEpics(rawStories);

    // Map raw lines to structured StoryItem objects
    this.userStories = rawStories.map((text, i) => ({
      id: `US-${String(i + 1).padStart(3, '0')}`,
      text,
      priority: this.inferPriority(text),
      epicIndex: this.inferEpicIndex(text, this.epics),
    }));

    // Map acceptance criteria
    this.acceptanceCriteria = rawAC.map((text, i) => ({
      text,
      storyRef: this.userStories[i] ? this.userStories[i].id : undefined,
    }));
  }

  private parseLines(raw: string | null): string[] {
    if (!raw) return [];
    return raw
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5);
  }

  private buildEpics(stories: string[]): EpicItem[] {
    const epicKeywords: { title: string; description: string; keywords: string[] }[] = [
      { title: 'User Management',    description: 'Authentication, profiles, permissions', keywords: ['login', 'register', 'user', 'profile', 'password', 'account', 'auth'] },
      { title: 'Core Functionality', description: 'Primary features and business workflows', keywords: ['manage', 'create', 'view', 'submit', 'update', 'delete', 'edit'] },
      { title: 'Reporting & Data',   description: 'Analytics, exports, and data views',     keywords: ['report', 'export', 'analytic', 'dashboard', 'chart', 'data', 'statistic'] },
      { title: 'Notifications',      description: 'Alerts, emails, and messaging',          keywords: ['notification', 'email', 'alert', 'remind', 'message', 'notify'] },
      { title: 'Integration',        description: 'External systems and APIs',              keywords: ['integrat', 'api', 'sync', 'connect', 'third-party', 'import'] },
      { title: 'Settings & Config',  description: 'Configuration and preferences',          keywords: ['setting', 'config', 'preference', 'option', 'admin'] },
    ];

    const epicMap = new Map<string, { count: number; desc: string }>();
    stories.forEach(story => {
      const lower = story.toLowerCase();
      let matched = false;
      for (const ep of epicKeywords) {
        if (ep.keywords.some(kw => lower.includes(kw))) {
          const existing = epicMap.get(ep.title);
          epicMap.set(ep.title, { count: (existing?.count || 0) + 1, desc: ep.description });
          matched = true;
          break;
        }
      }
      if (!matched) {
        const existing = epicMap.get('General Features');
        epicMap.set('General Features', { count: (existing?.count || 0) + 1, desc: 'Other features and enhancements' });
      }
    });

    return Array.from(epicMap.entries()).map(([title, val], i) => ({
      title,
      description: val.desc,
      storyCount: val.count,
      color: this.epicColors[i % this.epicColors.length],
    }));
  }

  private inferPriority(text: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    const lower = text.toLowerCase();
    if (lower.includes('must') || lower.includes('critical') || lower.includes('essential') || lower.includes('login') || lower.includes('auth')) return 'HIGH';
    if (lower.includes('should') || lower.includes('important')) return 'MEDIUM';
    return 'LOW';
  }

  private inferEpicIndex(text: string, epics: EpicItem[]): number {
    const lower = text.toLowerCase();
    const epicKeywords: { [title: string]: string[] } = {
      'User Management':    ['login', 'register', 'user', 'profile', 'password', 'account', 'auth'],
      'Core Functionality': ['manage', 'create', 'view', 'submit', 'update', 'delete', 'edit'],
      'Reporting & Data':   ['report', 'export', 'analytic', 'dashboard', 'chart', 'data', 'statistic'],
      'Notifications':      ['notification', 'email', 'alert', 'remind', 'message', 'notify'],
      'Integration':        ['integrat', 'api', 'sync', 'connect', 'third-party', 'import'],
      'Settings & Config':  ['setting', 'config', 'preference', 'option', 'admin'],
    };
    for (let i = 0; i < epics.length; i++) {
      const kws = epicKeywords[epics[i].title];
      if (kws && kws.some(kw => lower.includes(kw))) return i;
    }
    return epics.length - 1;
  }

  // ── Getters ──────────────────────────────────────────────────────────────────
  get hasProject(): boolean { return !!this.activeProject; }
  get hasAnalysis(): boolean { return !!this.latestAnalysis; }

  get totalStories(): number { return this.userStories.length; }
  get totalEpics(): number   { return this.epics.length; }
  get highPriorityCount(): number { return this.userStories.filter(s => s.priority === 'HIGH').length; }

  get filteredStories(): StoryItem[] {
    if (this.selectedEpicIndex === null) return this.userStories;
    return this.userStories.filter(s => s.epicIndex === this.selectedEpicIndex);
  }

  getTabCount(key: ActiveTab): number {
    switch (key) {
      case 'backlog':    return this.totalStories;
      case 'epics':      return this.totalEpics;
      case 'stories':    return this.filteredStories.length;
      case 'acceptance': return this.acceptanceCriteria.length;
    }
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getEpicColor(index: number): string {
    return this.epicColors[index % this.epicColors.length];
  }

  // ── Actions ──────────────────────────────────────────────────────────────────
  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
    if (tab !== 'stories') this.selectedEpicIndex = null;
  }

  filterByEpic(index: number): void {
    this.selectedEpicIndex = this.selectedEpicIndex === index ? null : index;
    this.activeTab = 'stories';
  }

  exportAsText(): void {
    if (!this.latestAnalysis || !this.activeProject) return;

    let content = `USER STORY BACKLOG\n`;
    content += `Project: ${this.activeProject.name}\n`;
    content += `Generated: ${new Date().toLocaleString()}\n`;
    content += `${'='.repeat(60)}\n\n`;

    content += `EPICS (${this.epics.length})\n${'─'.repeat(40)}\n`;
    this.epics.forEach((ep, i) => {
      content += `Epic ${i + 1}: ${ep.title} — ${ep.description} (${ep.storyCount} stories)\n`;
    });
    content += '\n';

    content += `USER STORIES (${this.userStories.length})\n${'─'.repeat(40)}\n`;
    this.userStories.forEach(s => {
      content += `[${s.id}] [${s.priority}] ${s.text}\n`;
    });
    content += '\n';

    content += `ACCEPTANCE CRITERIA (${this.acceptanceCriteria.length})\n${'─'.repeat(40)}\n`;
    this.acceptanceCriteria.forEach((ac, i) => {
      const ref = ac.storyRef ? ` (${ac.storyRef})` : '';
      content += `${i + 1}.${ref} ${ac.text}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-stories-${this.activeProject.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    this.historyService.logActivity(this.activeProject.id, ActivityAction.USER_STORIES_GENERATED, ActivityStatus.SUCCESS, 'Exported User Stories').subscribe();

    this.exportSuccess = true;
    setTimeout(() => { this.exportSuccess = false; this.cdr.detectChanges(); }, 3000);
  }

  clearData(): void {
    this.userStories = [];
    this.acceptanceCriteria = [];
    this.epics = [];
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
