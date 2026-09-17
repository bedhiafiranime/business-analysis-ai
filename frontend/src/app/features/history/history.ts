import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HistoryService } from '../../core/services/history.service';
import { ProjectActivityResponse, ActivityAction, ActivityStatus, Page } from '../../shared/models/history.models';
import { ProjectService } from '../../core/services/project.service';
import { ProjectResponse } from '../../shared/models/project.models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.html',
  styleUrls: ['./history.scss']
})
export class History implements OnInit, OnDestroy {
  activities: ProjectActivityResponse[] = [];
  projects: ProjectResponse[] = [];
  
  loading: boolean = true;
  error: string | null = null;
  
  // Filters
  selectedProjectId: number | undefined = undefined;
  selectedAction: ActivityAction | undefined = undefined;
  startDate: string | undefined = undefined;
  endDate: string | undefined = undefined;
  
  // Pagination
  currentPage: number = 0;
  pageSize: number = 20;
  totalPages: number = 0;
  totalElements: number = 0;
  
  // Enum references for template
  activityActions = Object.values(ActivityAction);
  
  private destroy$ = new Subject<void>();
  private filterChange$ = new Subject<void>();

  constructor(
    private historyService: HistoryService,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filterChange$.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadHistory();
    });
  }

  ngOnInit(): void {
    // Pre-filter by project if navigated from a project workspace
    const routeProjectId = this.route.snapshot.paramMap.get('id');
    if (routeProjectId) {
      this.selectedProjectId = Number(routeProjectId);
    }
    this.loadProjects();
    this.loadHistory();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects: ProjectResponse[]) => {
        this.projects = projects;
      },
      error: (err: any) => {
        console.error('Error loading projects for filter', err);
      }
    });
  }

  loadHistory(): void {
    this.loading = true;
    this.error = null;
    
    // API expects ISO strings or specific date format, handle empty strings from date picker
    const start = this.startDate ? new Date(this.startDate).toISOString() : undefined;
    const end = this.endDate ? new Date(this.endDate).toISOString() : undefined;

    this.historyService.getUserHistory(
      this.currentPage,
      this.pageSize,
      this.selectedProjectId,
      this.selectedAction,
      start,
      end
    ).subscribe({
      next: (page: Page<ProjectActivityResponse>) => {
        this.activities = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load history', err);
        this.error = 'Failed to load activity history. Please try again later.';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.filterChange$.next();
  }

  clearFilters(): void {
    this.selectedProjectId = undefined;
    this.selectedAction = undefined;
    this.startDate = undefined;
    this.endDate = undefined;
    this.filterChange$.next();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadHistory();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadHistory();
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SUCCESS': return 'badge-success';
      case 'IN_PROGRESS': return 'badge-warning';
      case 'FAILED': return 'badge-error';
      default: return 'badge-default';
    }
  }
  
  getActionLabel(action: string): string {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  }

  navigateToProject(projectId: number): void {
    if (projectId) {
      this.router.navigate(['/projects', projectId]);
    }
  }

  getRelativeTime(timestamp: string): string {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  }
}
