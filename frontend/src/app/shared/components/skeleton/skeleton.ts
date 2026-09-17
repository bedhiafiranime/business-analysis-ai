import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [ngClass]="type">
      <div class="skeleton-pulse"></div>
    </div>
  `,
  styleUrl: './skeleton.scss'
})
export class SkeletonComponent {
  @Input() type: 'card' | 'text' | 'title' | 'avatar' = 'text';
}
