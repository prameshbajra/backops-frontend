import { Component, HostListener, inject } from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { FileUploadComponent } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [MatBottomSheetModule],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.css'
})
export class TopMenuComponent {

  private _bottomSheet = inject(MatBottomSheet);
  private bottomSheetRef: MatBottomSheetRef | undefined;

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (this.bottomSheetRef && target.classList.contains('object-container')) {
      this.bottomSheetRef.dismiss();
    }
  }

  openBottomSheet(): void {
    // Open the bottom sheet with configuration
    this.bottomSheetRef = this._bottomSheet.open(FileUploadComponent, {
      hasBackdrop: true,  // Ensure the backdrop is visible
    });

    // Listen for backdrop clicks to close the bottom sheet
    if (this.bottomSheetRef) {
      this.bottomSheetRef.backdropClick().subscribe(() => {
        console.log('Backdrop clicked, closing bottom sheet.');
        this.bottomSheetRef?.dismiss();
      });
    }
  }

}
