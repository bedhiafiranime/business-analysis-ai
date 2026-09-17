import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss'
})
export class EmptyStateComponent {
  @Input() title: string = 'No Data Found';
  @Input() message: string = 'There is currently nothing to display here.';
  @Input() icon: 'folder' | 'document' | 'search' | 'activity' = 'search';
  @Input() actionLabel?: string;
  @Output() action = new EventEmitter<void>();

  onAction() {
    this.action.emit();
  }
}
