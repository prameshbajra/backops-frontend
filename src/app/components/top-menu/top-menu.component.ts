import { Component, inject } from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
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

  openBottomSheet(): void {
    this._bottomSheet.open(FileUploadComponent);
  }

}
