import { Component, inject } from '@angular/core';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FilterComponent } from '../filter/filter.component';

@Component({
    selector: 'app-object-fab',
    imports: [
        MatIconModule,
        MatButtonModule,
        MatBottomSheetModule
    ],
    templateUrl: './object-fab.component.html',
    styleUrl: './object-fab.component.css'
})
export class ObjectFabComponent {

  private _bottomSheet = inject(MatBottomSheet);

  openBottomSheet(): void {
    this._bottomSheet.open(FilterComponent);
  }

}
