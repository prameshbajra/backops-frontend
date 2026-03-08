import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Album, AlbumService } from '../../../services/album.service';

const trimmedRequiredValidator: ValidatorFn = (control) => {
  const value = (control.value as string | null) ?? '';
  return value.trim().length > 0 ? null : { required: true };
};

export interface AddToAlbumDialogData {
  selectedCount: number;
}

export type AddToAlbumDialogResult =
  | { type: 'existing'; albumId: string; albumName: string }
  | { type: 'new'; albumName: string };

@Component({
  selector: 'app-add-to-album-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-to-album-dialog.component.html',
  styleUrl: './add-to-album-dialog.component.css'
})
export class AddToAlbumDialogComponent implements OnInit {

  readonly form = this.fb.group({
    newAlbumName: ['', [trimmedRequiredValidator, Validators.maxLength(120)]]
  });

  albums: Album[] = [];
  isLoadingAlbums = false;
  loadError: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly albumService: AlbumService,
    private readonly dialogRef: MatDialogRef<AddToAlbumDialogComponent, AddToAlbumDialogResult>,
    @Inject(MAT_DIALOG_DATA) public readonly data: AddToAlbumDialogData
  ) {}

  ngOnInit(): void {
    this.fetchAlbums();
  }

  onAlbumClick(album: Album): void {
    this.dialogRef.close({ type: 'existing', albumId: album.albumId, albumName: album.albumName });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get hasAlbums(): boolean {
    return this.albums.length > 0;
  }

  onCreateAlbum(): void {
    const control = this.form.get('newAlbumName');
    if (!control) {
      return;
    }

    if (this.form.invalid) {
      control.markAsTouched();
      return;
    }

    const albumName = (control.value as string).trim();
    this.dialogRef.close({ type: 'new', albumName });
  }

  private fetchAlbums(): void {
    this.isLoadingAlbums = true;
    this.loadError = null;

    this.albumService.getAlbums().pipe(
      catchError((error) => {
        console.error('Failed to load albums', error);
        this.loadError = 'Unable to load your albums right now. You can still create a new one.';
        return of([] as Album[]);
      }),
      finalize(() => {
        this.isLoadingAlbums = false;
      })
    ).subscribe((albums) => {
      this.albums = albums ?? [];
    });
  }
}
