import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-face-name-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Set Face Name</h2>
    <div mat-dialog-content>
      <form [formGroup]="form" (ngSubmit)="save()" class="mt-2">
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Face name</mat-label>
          <input matInput formControlName="name" maxlength="64" autocomplete="off" />
          <mat-hint align="end">{{ form.controls.name.value?.length || 0 }}/64</mat-hint>
          <mat-error *ngIf="form.controls.name.hasError('required')">Name is required</mat-error>
          <mat-error *ngIf="form.controls.name.hasError('pattern')">Invalid characters</mat-error>
        </mat-form-field>
      </form>
    </div>
    <div mat-dialog-actions class="flex justify-end gap-2">
      <button mat-stroked-button (click)="close()">Cancel</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Save</button>
    </div>
  `,
})
export class FaceNameDialogComponent {
  readonly dialogRef = inject(MatDialogRef<FaceNameDialogComponent, string | undefined>);
  readonly data: { currentName: string } = inject(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: [this.data?.currentName || '', [Validators.required, Validators.pattern(/^[\w\p{L} .'-]{1,64}$/u)]],
  });

  close() {
    this.dialogRef.close();
  }

  save() {
    if (this.form.valid) {
      const name = this.form.controls.name.value?.trim();
      if (!name) return;
      this.dialogRef.close(name);
    }
  }
}

