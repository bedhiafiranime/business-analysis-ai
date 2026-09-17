import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { AnalysisService } from '../../core/services/analysis.service';
import { ProjectResponse } from '../../shared/models/project.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  projects: ProjectResponse[] = [];
  recentProjects: ProjectResponse[] = [];
  completedAnalyses = 0;
  isLoading = true;

  constructor(
    private projectService: ProjectService,
    private analysisService: AnalysisService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    forkJoin({
      projects: this.projectService.getProjects(),
      completedAnalyses: this.analysisService.getCompletedAnalysesCount()
    }).subscribe({
      next: ({ projects, completedAnalyses }) => {
        this.projects = [...projects];
        const sorted = [...projects].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.recentProjects = sorted.slice(0, 3);
        this.completedAnalyses = completedAnalyses;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
