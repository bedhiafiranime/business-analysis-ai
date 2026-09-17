import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { AnalysisService } from '../../../core/services/analysis.service';
import { WorkspaceContextService } from '../../../core/services/workspace-context.service';
import { ProjectResponse } from '../../../shared/models/project.models';
import { AnalysisResponse } from '../../../shared/models/analysis.models';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

interface ProjectAnalysisCombined {
  project: ProjectResponse;
  analysis: AnalysisResponse | null;
}

@Component({
  selector: 'app-global-analysis-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './global-analysis-list.html',
  styleUrl: './global-analysis-list.scss'
})
export class GlobalAnalysisList implements OnInit, OnDestroy {
  combinedData: ProjectAnalysisCombined[] = [];
  isLoading = true;
  error = '';
  private sub = new Subscription();

  constructor(
    private projectService: ProjectService,
    private analysisService: AnalysisService,
    private workspace: WorkspaceContextService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.error = '';
    this.sub.add(
      this.projectService.getProjects().pipe(
        switchMap(projects => {
          if (!projects || projects.length === 0) {
            return of([]);
          }
          // Fetch latest analysis for each project, always resolving (never erroring)
          const requests = projects.map(project =>
            this.analysisService.getLatestAnalysis(project.id).pipe(
              map(analysis => ({ project, analysis } as ProjectAnalysisCombined)),
              catchError(() => of({ project, analysis: null } as ProjectAnalysisCombined))
            )
          );
          return forkJoin(requests);
        }),
        finalize(() => {
          // Guaranteed cleanup — runs on complete AND on error
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: (data) => {
          this.combinedData = data.sort((a, b) =>
            new Date(b.project.createdAt).getTime() - new Date(a.project.createdAt).getTime()
          );
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[GlobalAnalysisList] Failed to load analyses:', err);
          this.error = 'Failed to load analyses. Please refresh the page.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  openAnalysis(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'analyses']);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
