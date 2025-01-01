import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheetModule, MatBottomSheet } from '@angular/material/bottom-sheet';
import { FilterComponent } from '../filter/filter.component';

@Component({
  selector: 'app-object-fab',
  standalone: true,
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
