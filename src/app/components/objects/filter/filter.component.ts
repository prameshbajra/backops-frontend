import { Component } from '@angular/core';
import { Utility } from '../../../utility';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.css'
})
export class FilterComponent {


  months: string[] = Utility.getMonths();
  years: number[] = Utility.getYears();

  selectedMonthIndex: number | undefined;
  selectedYear: number | undefined;


  selectMonth(index: number): void {
    this.selectedMonthIndex = index;
  }

  selectYear(year: number): void {
    this.selectedYear = year;
  }

  onApply(): void {
    console.log('Apply filter', this.selectedMonthIndex ? this.selectedMonthIndex + 1 : '', this.selectedYear);
  }

}
