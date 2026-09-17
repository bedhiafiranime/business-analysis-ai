import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectActivityResponse, Page, ActivityAction, ActivityStatus } from '../../shared/models/history.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/history`;

  constructor(private http: HttpClient) {}

  getUserHistory(
    page: number = 0,
    size: number = 20,
    projectId?: number,
    action?: ActivityAction,
    startDate?: string,
    endDate?: string
  ): Observable<Page<ProjectActivityResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (projectId) {
      params = params.set('projectId', projectId.toString());
    }
    if (action) {
      params = params.set('action', action);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<Page<ProjectActivityResponse>>(this.apiUrl, { params });
  }

  logActivity(projectId: number, action: ActivityAction, status: ActivityStatus, details: string): Observable<void> {
    const body = { projectId, action, status, details };
    return this.http.post<void>(`${this.apiUrl}/log`, body);
  }
}
