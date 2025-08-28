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
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="min-w-[340px] select-none">
      <div class="rounded-2xl p-[1px] bg-gradient-to-tr from-indigo-500/30 via-sky-500/30 to-purple-500/30 dark:from-indigo-500/25 dark:via-sky-500/25 dark:to-purple-500/25">
        <div class="rounded-[14px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl p-5">
          <div class="mb-4">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">Name this face</h3>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Keep it short and recognizable.</p>
          </div>

          <label for="face-name" class="sr-only">Face name</label>
          <input
            id="face-name"
            cdkFocusInitial
            formControlName="name"
            maxlength="64"
            autocomplete="off"
            placeholder="e.g., John Doe"
            class="w-full rounded-xl border border-gray-300/70 dark:border-gray-600/60 bg-white/60 dark:bg-gray-800/60 px-4 py-3 text-[15px] text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500/70 transition"
            aria-describedby="face-name-hint face-name-error"
          />

          <div class="mt-1 flex items-center gap-3 text-[11px]">
            <div id="face-name-error" class="text-red-500 min-h-[1rem]">
              <span *ngIf="form.controls.name.hasError('required') && (form.controls.name.dirty || form.controls.name.touched)">Name is required.</span>
              <span *ngIf="!form.controls.name.hasError('required') && form.controls.name.hasError('pattern') && (form.controls.name.dirty || form.controls.name.touched)">Only letters, numbers, spaces, and . ' - allowed.</span>
            </div>
            <div id="face-name-hint" class="ml-auto text-gray-500 dark:text-gray-400">{{ form.controls.name.value?.length || 0 }}/64</div>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <button type="button" (click)="close()" class="inline-flex items-center rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition">Cancel</button>
            <button type="submit" [disabled]="form.invalid" class="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-95 active:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition">Save</button>
          </div>
        </div>
      </div>
    </form>
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
