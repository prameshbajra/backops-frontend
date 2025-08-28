import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-face-name-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  templateUrl: './face-name-dialog.component.html',
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
