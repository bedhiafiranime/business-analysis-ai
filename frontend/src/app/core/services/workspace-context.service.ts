import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProjectResponse } from '../../shared/models/project.models';
import { AnalysisResponse } from '../../shared/models/analysis.models';

const STORAGE_KEY = 'workspace_active_project_id';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceContextService {
  // Restore the last-used projectId from localStorage on service construction
  // so that a page refresh or direct URL navigation still knows which project was active.
  private restoredProjectId: number | null = this.readPersistedId();

  private projectSubject   = new BehaviorSubject<ProjectResponse | null>(null);
  private analysisSubject  = new BehaviorSubject<AnalysisResponse | null>(null);
  private projectIdSubject = new BehaviorSubject<number | null>(this.restoredProjectId);

  project$   = this.projectSubject.asObservable();
  analysis$  = this.analysisSubject.asObservable();
  projectId$ = this.projectIdSubject.asObservable();

  // ── Setters ──────────────────────────────────────────────────────────────

  setProject(project: ProjectResponse | null): void {
    this.projectSubject.next(project);
    this.projectIdSubject.next(project ? project.id : null);
    this.persistId(project ? project.id : null);
  }

  setProjectId(id: number | null): void {
    this.projectIdSubject.next(id);
    this.persistId(id);
    if (!id) {
      this.projectSubject.next(null);
      this.analysisSubject.next(null);
    }
  }

  setAnalysis(analysis: AnalysisResponse | null): void {
    this.analysisSubject.next(analysis);
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  getProjectId(): number | null {
    return this.projectIdSubject.getValue();
  }

  getProject(): ProjectResponse | null {
    return this.projectSubject.getValue();
  }

  getAnalysis(): AnalysisResponse | null {
    return this.analysisSubject.getValue();
  }

  /**
   * Returns the projectId that was last persisted to localStorage.
   * Useful for components that need to hydrate themselves on fresh load
   * before the full ProjectResponse has been fetched.
   */
  getPersistedProjectId(): number | null {
    return this.readPersistedId();
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private persistId(id: number | null): void {
    try {
      if (id !== null) {
        localStorage.setItem(STORAGE_KEY, String(id));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // localStorage may be unavailable in some environments; fail silently
    }
  }

  private readPersistedId(): number | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? n : null;
    } catch {
      return null;
    }
  }
}
