import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-objects-actions',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './object-actions.component.html',
  styleUrl: './object-actions.component.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0)' })),
      state('out', style({ transform: 'translateY(100%)' })),
      transition('out => in', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-in-out')
      ]),
      transition('in => out', [
        animate('300ms ease-in-out', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class ObjectsActionsComponent {
  @Input() selectedCount = 0;
  @Input() areFilesBeingDeleted = false;
  @Input() areFilesBeingDownloaded = false;

  @Output() deleteSelected = new EventEmitter<void>();
  @Output() downloadSelected = new EventEmitter<void>();

  get slideState(): 'in' | 'out' {
    return this.selectedCount > 0 ? 'in' : 'out';
  }

  onDeleteClick(): void {
    this.deleteSelected.emit();
  }

  onDownloadClick(): void {
    this.downloadSelected.emit();
  }

  get actionLabel(): string {
    if (this.areFilesBeingDeleted) {
      return 'Deleting...';
    }

    return this.selectedCount > 1 ? 'Delete all' : 'Delete';
  }

  get downloadLabel(): string {
    return this.areFilesBeingDownloaded ? 'Downloading...' : `Download (${this.selectedCount})`;
  }

  get actionsDisabled(): boolean {
    return this.areFilesBeingDeleted || this.areFilesBeingDownloaded;
  }
}
