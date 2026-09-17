import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AnalysisService } from '../../../core/services/analysis.service';
import { DocumentService } from '../../../core/services/document.service';
import { AnalysisResponse } from '../../../shared/models/analysis.models';
import { DocumentResponse } from '../../../shared/models/document.models';

@Component({
  selector: 'app-analysis-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './analysis-detail.html',
  styleUrl: './analysis-detail.scss'
})
export class AnalysisDetail implements OnInit {
  projectId!: number;

  // State
  isLoadingDocuments = true;
  isGenerating = false;
  isLoadingHistory = true;

  // Data
  documents: DocumentResponse[] = [];
  analyses: AnalysisResponse[] = [];
  latestAnalysis: AnalysisResponse | null = null;

  // Form
  selectedDocumentId: number | null = null;
  selectedModel: string = '';

  // Errors
  generateError = '';
  historyError = '';

  // UI
  activeTab: 'results' | 'history' = 'results';

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
    private route: ActivatedRoute,
    private analysisService: AnalysisService,
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDocuments();
    this.loadLatestAnalysis();
    this.loadHistory();
  }

  loadDocuments(): void {
    this.documentService.getProjectDocuments(this.projectId).subscribe({
      next: (docs) => {
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

  loadLatestAnalysis(): void {
    this.analysisService.getLatestAnalysis(this.projectId).subscribe({
      next: (a) => {
        this.latestAnalysis = a;
        this.cdr.detectChanges();
      },
      error: () => {
        // No previous analysis — that's fine
        this.latestAnalysis = null;
        this.cdr.detectChanges();
      }
    });
  }

  loadHistory(): void {
    this.isLoadingHistory = true;
    this.analysisService.getProjectAnalyses(this.projectId).subscribe({
      next: (list) => {
        this.analyses = [...list];
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.historyError = 'Could not load analysis history.';
        this.isLoadingHistory = false;
        this.cdr.detectChanges();
      }
    });
  }

  generateAnalysis(): void {
    this.generateError = '';
    this.isGenerating = true;

    const request = {
      projectId: this.projectId,
      documentId: this.selectedDocumentId || null,
      aiModel: this.selectedModel || null
    };

    this.analysisService.createAnalysis(request)
      .pipe(finalize(() => {
        this.isGenerating = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (result) => {
          this.latestAnalysis = result;
          this.analyses = [result, ...this.analyses];
          this.activeTab = 'results';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.generateError = 'Analysis failed. Please try again.';
          this.cdr.detectChanges();
        }
      });
  }

  selectAnalysis(a: AnalysisResponse): void {
    this.latestAnalysis = a;
    this.activeTab = 'results';
    this.cdr.detectChanges();
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
