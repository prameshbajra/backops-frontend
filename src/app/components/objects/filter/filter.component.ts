
import { Component, inject } from '@angular/core';
import { DbService } from '../../../services/db.service';
import { Utility } from '../../../utility';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-filter',
  imports: [
    CommonModule
  ],
    templateUrl: './filter.component.html',
    styleUrl: './filter.component.css'
})
export class FilterComponent {
  dbService: DbService = inject(DbService);

  months: string[] = Utility.getMonths();
  years: number[] = Utility.getYears();

  selectedMonthIndex!: number;
  selectedYear!: number;

  bottomSheetRef =
    inject<MatBottomSheetRef<FilterComponent>>(MatBottomSheetRef);

  ngOnInit(): void {
    const timestampPrefix = this.dbService.getTimeStampPrefix();
    if (timestampPrefix) {
      const [year, month] = timestampPrefix.split('-');
      this.selectedYear = parseInt(year);
      this.selectedMonthIndex = parseInt(month) - 1;
    }
  }

  selectMonth(index: number): void {
    this.selectedMonthIndex = index;
  }

  selectYear(year: number): void {
    this.selectedYear = year;
  }

  onClear(): void {
    this.dbService.setApplyFilterObjectList(null);
    this.bottomSheetRef.dismiss();
  }

  onApply(): void {
    const formattedMonth = (this.selectedMonthIndex + 1).toString().padStart(2, '0');
    const timestampPrefix = `${this.selectedYear}-${formattedMonth}`;
    this.dbService.setApplyFilterObjectList(timestampPrefix);
    this.bottomSheetRef.dismiss();
  }

}
