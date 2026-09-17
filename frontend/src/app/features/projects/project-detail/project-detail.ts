import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ProjectService } from '../../../core/services/project.service';
import { WorkspaceContextService } from '../../../core/services/workspace-context.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProjectResponse } from '../../../shared/models/project.models';

import { ProjectProgressComponent } from '../../../shared/components/project-progress/project-progress.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog';
import { SkeletonComponent } from '../../../shared/components/skeleton/skeleton';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    ProjectProgressComponent, 
    ConfirmationDialogComponent,
    SkeletonComponent
  ],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.scss'
})
export class ProjectDetail implements OnInit {
  project: ProjectResponse | null = null;
  projectId!: number;
  isLoading = true;
  errorMsg = '';
  
  // Modals
  showEditModal = false;
  showDeleteModal = false;
  
  // Edit Form
  editProjectData = {
    name: '',
    businessIdea: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private workspaceContext: WorkspaceContextService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.projectService.getProject(this.projectId).subscribe({
      next: (data) => {
        this.project = data;
        this.editProjectData = { name: data.name, businessIdea: data.businessIdea || '' };
        this.workspaceContext.setProject(data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Could not load project details.';
        this.toastService.error(this.errorMsg);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // To map backend status to workflow steps
  get currentProgressStep(): string {
    if (!this.project) return 'created';
    // For now we map some statuses. Later these will be precisely updated by modules.
    if (this.project.status === 'COMPLETED') return 'completed';
    if (this.project.status === 'ANALYZING') return 'analysis';
    return 'created'; // default
  }

  openEditModal() {
    if (this.project) {
      this.editProjectData = { name: this.project.name, businessIdea: this.project.businessIdea || '' };
      this.showEditModal = true;
    }
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  saveEdit() {
    if (!this.editProjectData.name.trim()) return;
    this.projectService.updateProjectDetails(this.projectId, this.editProjectData).subscribe({
      next: (updated: ProjectResponse) => {
        this.project = updated;
        this.workspaceContext.setProject(updated);
        this.showEditModal = false;
        this.toastService.success('Project details updated successfully');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.toastService.error('Failed to update project');
      }
    });
  }

  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    this.projectService.deleteProject(this.projectId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.workspaceContext.setProject(null);
        this.toastService.success('Project deleted successfully');
        this.router.navigate(['/projects']);
      },
      error: (err: any) => {
        this.toastService.error(err.error?.message || 'An error occurred while deleting the project');
        this.showDeleteModal = false;
      }
    });
  }
}
