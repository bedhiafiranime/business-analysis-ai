import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WorkflowStep {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-project-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container glass-panel">
      <div class="progress-track">
        <div class="progress-fill" [style.width.%]="progressPercentage"></div>
      </div>
      
      <div class="steps-wrapper">
        <div *ngFor="let step of steps; let i = index" 
             class="step"
             [ngClass]="{
               'completed': i < currentStepIndex,
               'active': i === currentStepIndex,
               'disabled': i > currentStepIndex
             }">
          <div class="step-icon">
            <span>{{ step.icon }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      padding: 1.5rem;
      border-radius: 16px;
      margin-bottom: 2rem;
      position: relative;
    }

    .progress-track {
      position: absolute;
      top: 2.75rem;
      left: 8%;
      right: 8%;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      z-index: 0;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;
      transition: width 0.5s ease-in-out;
    }

    .steps-wrapper {
      display: flex;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
      text-align: center;
      transition: all 0.3s ease;

      .step-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-surface);
        border: 2px solid rgba(255, 255, 255, 0.1);
        font-size: 1.2rem;
        transition: all 0.3s ease;
      }

      .step-label {
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-muted);
        transition: all 0.3s ease;
      }

      &.completed {
        .step-icon {
          background: rgba(52, 211, 153, 0.2);
          border-color: #34d399;
          color: #34d399;
        }
        .step-label {
          color: #34d399;
        }
      }

      &.active {
        .step-icon {
          background: var(--primary-color);
          border-color: var(--primary-color);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
          color: white;
          transform: scale(1.1);
        }
        .step-label {
          color: var(--text-main);
          font-weight: 600;
        }
      }

      &.disabled {
        opacity: 0.5;
        .step-icon {
          background: rgba(255, 255, 255, 0.05);
        }
      }
    }
  `]
})
export class ProjectProgressComponent {
  @Input() currentStepId: string = 'created';

  steps: WorkflowStep[] = [
    { id: 'created', label: 'Create Project', icon: '📁' },
    { id: 'documents', label: 'Upload Documents', icon: '📄' },
    { id: 'analysis', label: 'Business Analysis', icon: '🧠' },
    { id: 'requirements', label: 'Requirements', icon: '📝' },
    { id: 'stories', label: 'User Stories', icon: '📋' },
    { id: 'documentation', label: 'Documentation', icon: '📑' },
    { id: 'completed', label: 'Completed', icon: '✅' }
  ];

  get currentStepIndex(): number {
    const index = this.steps.findIndex(s => s.id === this.currentStepId);
    return index >= 0 ? index : 0;
  }

  get progressPercentage(): number {
    const totalSegments = this.steps.length - 1;
    return (this.currentStepIndex / totalSegments) * 100;
  }
}
