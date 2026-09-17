import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalysisResponse, CreateAnalysisRequest } from '../../shared/models/analysis.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalysisService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createAnalysis(request: CreateAnalysisRequest): Observable<AnalysisResponse> {
    return this.http.post<AnalysisResponse>(`${this.apiUrl}/analyses`, request);
  }

  getProjectAnalyses(projectId: number): Observable<AnalysisResponse[]> {
    return this.http.get<AnalysisResponse[]>(`${this.apiUrl}/projects/${projectId}/analyses`);
  }

  getLatestAnalysis(projectId: number): Observable<AnalysisResponse> {
    return this.http.get<AnalysisResponse>(`${this.apiUrl}/projects/${projectId}/analyses/latest`);
  }

  getCompletedAnalysesCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/analyses/count`);
  }
}
