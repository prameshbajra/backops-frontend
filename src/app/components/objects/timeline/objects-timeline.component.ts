import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

interface MonthMarker {
  monthKey: string;
  label: string;
  elementId: string;
  year: string;
}

@Component({
  selector: 'app-objects-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './objects-timeline.component.html',
  styleUrl: './objects-timeline.component.css'
})
export class ObjectsTimelineComponent {
  @Input({ required: true }) monthMarkers: MonthMarker[] = [];
  @Input() currentMonthKey: string | null = null;
  @Input() isVisible = false;

  @Output() selectMonth = new EventEmitter<string>();

  isFirstMarkerOfYear(index: number): boolean {
    if (index === 0) {
      return true;
    }

    const current = this.monthMarkers[index];
    const previous = this.monthMarkers[index - 1];
    return current.year !== previous.year;
  }

  onSelectMonth(elementId: string): void {
    this.selectMonth.emit(elementId);
  }
}
