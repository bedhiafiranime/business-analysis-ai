import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ProjectService } from '../../../core/services/project.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProjectResponse, CreateProjectRequest } from '../../../shared/models/project.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmptyStateComponent, SkeletonComponent],
  templateUrl: './project-list.html',
  styleUrl: './project-list.scss'
})
export class ProjectList implements OnInit {
  projects: ProjectResponse[] = [];
  filteredProjects: ProjectResponse[] = [];
  isLoading = true;
  errorMsg = '';

  showCreateForm = false;
  newProject: CreateProjectRequest = { name: '', businessIdea: '' };
  isCreating = false;

  searchQuery = '';
  filterStatus = 'ALL';
  showArchived = false;
  sortBy = 'createdAt';

  constructor(
    private projectService: ProjectService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMsg = '';
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.applyFilters();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Failed to load projects.';
        this.toastService.error('Failed to load projects.');
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    let result = this.projects.filter(p => p.isArchived === this.showArchived);
    
    if (this.filterStatus !== 'ALL') {
      result = result.filter(p => p.status === this.filterStatus);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query) || (p.businessIdea && p.businessIdea.toLowerCase().includes(query)));
    }
    
    result.sort((a, b) => {
      if (this.sortBy === 'name') return a.name.localeCompare(b.name);
      if (this.sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

    // Favorites always on top
    this.filteredProjects = result.sort((a, b) => (a.isFavorite === b.isFavorite) ? 0 : a.isFavorite ? -1 : 1);
  }

  toggleFavorite(project: ProjectResponse, event: Event): void {
    event.stopPropagation();
    this.projectService.favoriteProject(project.id, !project.isFavorite).subscribe({
      next: (updated) => {
        const index = this.projects.findIndex(p => p.id === updated.id);
        if (index !== -1) this.projects[index] = updated;
        this.applyFilters();
        this.toastService.success(`Project ${updated.isFavorite ? 'added to' : 'removed from'} favorites.`);
      }
    });
  }

  toggleArchive(project: ProjectResponse, event: Event): void {
    event.stopPropagation();
    this.projectService.archiveProject(project.id, !project.isArchived).subscribe({
      next: (updated) => {
        const index = this.projects.findIndex(p => p.id === updated.id);
        if (index !== -1) this.projects[index] = updated;
        this.applyFilters();
        this.toastService.success(`Project ${updated.isArchived ? 'archived' : 'restored'}.`);
      }
    });
  }

  duplicateProject(project: ProjectResponse, event: Event): void {
    event.stopPropagation();
    this.projectService.duplicateProject(project.id).subscribe({
      next: () => {
        this.loadProjects();
        this.toastService.success('Project duplicated.');
      }
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    this.newProject = { name: '', businessIdea: '' };
    this.errorMsg = '';
  }

  createProject(): void {
    if (!this.newProject.name) return;
    this.isCreating = true;
    this.errorMsg = '';

    this.projectService.createProject(this.newProject)
      .pipe(
        finalize(() => {
          this.isCreating = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.showCreateForm = false;
          this.newProject = { name: '', businessIdea: '' };
          this.toastService.success('Project created successfully!');
          this.loadProjects();
        },
        error: () => {
          this.errorMsg = 'Failed to create project. Please try again.';
          this.toastService.error('Failed to create project.');
        }
      });
  }
}
