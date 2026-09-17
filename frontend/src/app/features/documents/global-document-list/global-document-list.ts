import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { DocumentService } from '../../../core/services/document.service';
import { ProjectResponse } from '../../../shared/models/project.models';
import { DocumentResponse } from '../../../shared/models/document.models';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

export interface DocumentWithProject {
  document: DocumentResponse;
  projectName: string;
}

@Component({
  selector: 'app-global-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './global-document-list.html',
  styleUrl: './global-document-list.scss'
})
export class GlobalDocumentList implements OnInit, OnDestroy {
  documents: DocumentWithProject[] = [];
  isLoading = true;
  error = '';
  deleteError = '';
  deletingId: number | null = null;

  private sub = new Subscription();

  constructor(
    private projectService: ProjectService,
    private documentService: DocumentService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    this.error = '';
    this.deleteError = '';

    this.sub.add(
      this.projectService.getProjects().pipe(
        switchMap(projects => {
          if (!projects || projects.length === 0) {
            return of([] as DocumentWithProject[]);
          }
          const requests = projects.map(project =>
            this.documentService.getProjectDocuments(project.id).pipe(
              catchError(() => of([] as DocumentResponse[])),
              // map each doc to include its project name
              catchError(() => of([] as DocumentResponse[]))
            ).pipe(
              // Use a local map to attach project name
              switchMap(docs =>
                of(docs.map(doc => ({ document: doc, projectName: project.name } as DocumentWithProject)))
              )
            )
          );
          return forkJoin(requests);
        }),
        catchError(() => {
          this.error = 'Failed to load documents. Please refresh the page.';
          this.isLoading = false;
          this.cdr.detectChanges();
          return of([] as DocumentWithProject[][]);
        })
      ).subscribe({
        next: (results) => {
          // Flatten the array of arrays
          if (Array.isArray(results) && results.length > 0) {
            const flat = (results as any[]).flat();
            this.documents = flat.sort((a: DocumentWithProject, b: DocumentWithProject) =>
              new Date(b.document.uploadDate).getTime() - new Date(a.document.uploadDate).getTime()
            );
          } else {
            this.documents = [];
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[GlobalDocumentList] Error:', err);
          this.error = 'Failed to load documents. Please refresh the page.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  viewDocument(item: DocumentWithProject): void {
    this.router.navigate(['/projects', item.document.projectId, 'documents']);
  }

  downloadDocument(item: DocumentWithProject): void {
    // Create a download link using the file name
    const link = document.createElement('a');
    link.href = `/api/documents/${item.document.id}/download`;
    link.download = item.document.originalFileName;
    link.click();
  }

  deleteDocument(item: DocumentWithProject): void {
    if (!confirm(`Delete "${item.document.originalFileName}"?`)) return;
    this.deletingId = item.document.id;
    this.deleteError = '';
    this.documentService.deleteDocument(item.document.id).subscribe({
      next: () => {
        this.documents = this.documents.filter(d => d.document.id !== item.document.id);
        this.deletingId = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.deleteError = 'Failed to delete document. Please try again.';
        this.deletingId = null;
        this.cdr.detectChanges();
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getFileIcon(fileType: string): string {
    if (!fileType) return '📎';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('docx') || fileType.includes('officedocument')) return '📝';
    if (fileType.includes('text')) return '📃';
    if (fileType.includes('image')) return '🖼️';
    return '📎';
  }

  getFileTypeLabel(fileType: string): string {
    if (!fileType) return 'File';
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('docx') || fileType.includes('officedocument')) return 'DOCX';
    if (fileType.includes('text/plain')) return 'TXT';
    if (fileType.includes('image/png')) return 'PNG';
    if (fileType.includes('image/jpeg')) return 'JPG';
    return fileType.split('/').pop()?.toUpperCase() || 'File';
  }

  getPdfCount(): number {
    return this.documents.filter(d => d.document.fileType?.includes('pdf')).length;
  }

  getDocxCount(): number {
    return this.documents.filter(d =>
      d.document.fileType?.includes('word') ||
      d.document.fileType?.includes('docx') ||
      d.document.fileType?.includes('officedocument')
    ).length;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
