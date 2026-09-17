import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceContextService } from '../../../core/services/workspace-context.service';
import { ProjectService } from '../../../core/services/project.service';
import { AnalysisService } from '../../../core/services/analysis.service';
import { HistoryService } from '../../../core/services/history.service';
import { ActivityAction, ActivityStatus } from '../../../shared/models/history.models';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProjectResponse } from '../../../shared/models/project.models';
import { AnalysisResponse } from '../../../shared/models/analysis.models';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-ai-chat-agent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat-agent.html',
  styleUrl: './ai-chat-agent.scss'
})
export class AiChatAgent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  activeProject: ProjectResponse | null = null;
  activeAnalysis: AnalysisResponse | null = null;
  
  isLoading = false;
  hasProject = false;
  hasAnalysis = false;

  messages: ChatMessage[] = [];
  userInput = '';
  isTyping = false;

  private sub = new Subscription();

  constructor(
    private workspace: WorkspaceContextService,
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

    const cachedAnalysis = this.workspace.getAnalysis();
    const cachedProject = this.workspace.getProject();
    const persistedId = this.workspace.getProjectId();

    if (cachedAnalysis && cachedProject) {
      this.activeProject = cachedProject;
      this.activeAnalysis = cachedAnalysis;
      this.hasProject = true;
      this.hasAnalysis = true;
      this.addGreeting();
    } else if (cachedProject) {
      this.activeProject = cachedProject;
      this.hasProject = true;
      this.fetchLatestAnalysis(cachedProject.id);
    } else if (persistedId) {
      this.hydrateFromId(persistedId);
    }

    this.sub.add(
      this.workspace.project$.subscribe(project => {
        if (project?.id === this.activeProject?.id) return;
        this.activeProject = project;
        this.hasProject = !!project;
        
        if (project) {
          this.fetchLatestAnalysis(project.id);
        } else {
          this.activeAnalysis = null;
          this.hasAnalysis = false;
          this.messages = [];
        }
      })
    );

    this.sub.add(
      this.workspace.analysis$.subscribe(analysis => {
        if (analysis?.id === this.activeAnalysis?.id) return;
        if (analysis) {
          this.hasAnalysis = true;
          this.activeAnalysis = analysis;
          if (this.messages.length === 0) {
            this.addGreeting();
          }
        }
      })
    );
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private hydrateFromId(persistedId: number): void {
    this.isLoading = true;
    this.sub.add(
      forkJoin({
        project: this.projectService.getProject(persistedId),
        analysis: this.analysisService.getLatestAnalysis(persistedId).pipe(
          catchError(() => of(null))
        )
      }).subscribe({
        next: (result) => {
          this.workspace.setProject(result.project);
          this.workspace.setAnalysis(result.analysis);
          this.activeProject = result.project;
          this.activeAnalysis = result.analysis;
          this.hasProject = true;
          this.hasAnalysis = !!result.analysis;
          this.isLoading = false;
          if (this.hasAnalysis) this.addGreeting();
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
        if (this.messages.length === 0) this.addGreeting();
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private addGreeting() {
    if (!this.activeProject) return;
    this.messages = [{
      role: 'assistant',
      content: `Hello! I'm your AI Chat Agent. I have fully analyzed the context for **${this.activeProject.name}**. You can ask me questions about the business requirements, functional requirements, user stories, risks, or acceptance criteria.`,
      timestamp: new Date()
    }];
  }

  sendMessage() {
    if (!this.userInput.trim() || !this.activeAnalysis || this.isTyping) return;

    const userText = this.userInput.trim();
    this.messages.push({ role: 'user', content: userText, timestamp: new Date() });
    this.userInput = '';
    this.isTyping = true;

    // Simulate backend AI processing using frontend context
    setTimeout(() => {
      try {
        const response = this.generateResponse(userText.toLowerCase());
        this.messages.push({ role: 'assistant', content: response, timestamp: new Date() });
    
        if (this.activeProject && this.activeProject.id) {
          this.historyService.logActivity(this.activeProject.id, ActivityAction.AI_CHAT_INTERACTION, ActivityStatus.SUCCESS, 'Interacted with AI Chat').subscribe();
        }
      } catch (error) {
        console.error('Chat generation error:', error);
        this.messages.push({ role: 'assistant', content: 'An error occurred while generating the response.', timestamp: new Date() });
      } finally {
        this.isTyping = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
      }
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  }

  private generateResponse(query: string): string {
    const analysis = this.activeAnalysis;
    const project = this.activeProject;

    if (!analysis || !project) {
      return "I'm sorry, but I do not have a project or analysis loaded in context to answer that.";
    }

    if (query.includes('user stor')) {
      return `Here are the generated user stories for this project:\n\n${analysis.userStories || 'No user stories available.'}`;
    }
    if (query.includes('acceptance criteria')) {
      return `Here are the acceptance criteria derived from our user stories:\n\n${analysis.acceptanceCriteria || 'No acceptance criteria available.'}`;
    }
    if (query.includes('functional') || query.includes('frs')) {
      return `The functional requirements are defined as follows:\n\n${analysis.functionalRequirements || 'No functional requirements available.'}`;
    }
    if (query.includes('non-functional') || query.includes('nfr')) {
      return `Here are the non-functional requirements (Performance, Security, etc.):\n\n${analysis.nonFunctionalRequirements || 'No non-functional requirements available.'}`;
    }
    if (query.includes('business') || query.includes('brd') || query.includes('objective')) {
      return `Business Objectives:\n\n${analysis.businessRequirements || 'Not defined.'}\n\nCore Idea: ${project.businessIdea || 'Not defined.'}`;
    }
    if (query.includes('risk') || query.includes('mitigation')) {
      return `I identified the following risks for this project:\n\n${analysis.risks || 'No risks identified.'}`;
    }
    if (query.includes('assumption')) {
      return `The following assumptions were made during analysis:\n\n${analysis.assumptions || 'No assumptions available.'}`;
    }
    if (query.includes('recommendation')) {
      return `Strategic Recommendations:\n\n${analysis.recommendations || 'No recommendations available.'}`;
    }
    if (query.includes('summar') || query.includes('about')) {
      return `**${project.name || 'Unknown Project'}**\n\n${project.businessIdea || ''}\n\nStatus: ${project.status || 'Draft'}\nCreated: ${project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}`;
    }

    return `I am analyzing your query against the workspace context. Based on the documentation for **${project.name || 'this project'}**, this specific detail might need further elaboration. Would you like me to pull up the User Stories or the Functional Requirements instead?`;
  }

  private scrollToBottom(): void {
    try {
      this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
