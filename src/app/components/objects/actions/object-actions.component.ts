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
  @Input() areFilesBeingAssigned = false;

  @Output() deleteSelected = new EventEmitter<void>();
  @Output() downloadSelected = new EventEmitter<void>();
  @Output() addToAlbum = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();

  get slideState(): 'in' | 'out' {
    return this.selectedCount > 0 ? 'in' : 'out';
  }

  onDeleteClick(): void {
    this.deleteSelected.emit();
  }

  onDownloadClick(): void {
    this.downloadSelected.emit();
  }

  onAddToAlbumClick(): void {
    this.addToAlbum.emit();
  }

  onDeselectAllClick(): void {
    this.deselectAll.emit();
  }

  get deleteLabel(): string {
    return this.areFilesBeingDeleted ? 'Deleting...' : 'Delete';
  }

  get dlLabel(): string {
    return this.areFilesBeingDownloaded ? 'Saving...' : 'Download';
  }

  get albumLabel(): string {
    return this.areFilesBeingAssigned ? 'Adding...' : 'Album';
  }

  get actionsDisabled(): boolean {
    return this.areFilesBeingDeleted || this.areFilesBeingDownloaded || this.areFilesBeingAssigned;
  }
}
