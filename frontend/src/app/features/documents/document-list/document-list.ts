import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { DocumentService } from '../../../core/services/document.service';
import { DocumentResponse } from '../../../shared/models/document.models';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-list.html',
  styleUrl: './document-list.scss'
})
export class DocumentList implements OnInit {
  projectId!: number;
  documents: DocumentResponse[] = [];
  isLoading = true;
  isUploading = false;
  uploadError = '';
  deleteError = '';
  isDragOver = false;
  uploadSuccess = false;

  constructor(
    private documentService: DocumentService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.documentService.getProjectDocuments(this.projectId).subscribe({
      next: (data) => {
        this.documents = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile(input.files[0]);
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.uploadFile(files[0]);
    }
  }

  uploadFile(file: File): void {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      this.uploadError = 'Only PDF and DOCX files are allowed.';
      return;
    }

    this.uploadError = '';
    this.isUploading = true;
    this.uploadSuccess = false;

    this.documentService.uploadDocument(this.projectId, file)
      .pipe(finalize(() => {
        this.isUploading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.uploadSuccess = true;
          this.loadDocuments();
          setTimeout(() => { this.uploadSuccess = false; this.cdr.detectChanges(); }, 3000);
        },
        error: () => {
          this.uploadError = 'Upload failed. Please try again.';
        }
      });
  }

  deleteDocument(docId: number): void {
    this.deleteError = '';
    this.documentService.deleteDocument(docId)
      .subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== docId);
          this.cdr.detectChanges();
        },
        error: () => {
          this.deleteError = 'Failed to delete the document.';
          this.cdr.detectChanges();
        }
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getFileIcon(fileType: string): string {
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word') || fileType?.includes('docx')) return '📝';
    return '📎';
  }
}
