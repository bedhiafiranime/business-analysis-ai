import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentResponse } from '../../shared/models/document.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProjectDocuments(projectId: number): Observable<DocumentResponse[]> {
    return this.http.get<DocumentResponse[]>(`${this.apiUrl}/projects/${projectId}/documents`);
  }

  uploadDocument(projectId: number, file: File): Observable<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<DocumentResponse>(`${this.apiUrl}/projects/${projectId}/documents`, formData);
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/documents/${documentId}`);
  }
}
