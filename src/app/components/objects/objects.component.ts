import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { FileItem } from '../../models/FileItem';
import { FileSizePipe } from '../../pipes/filesize.pipe';
import { DbService } from '../../services/db.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { FileService } from '../../services/file.service';

import moment from 'moment';

@Component({
  selector: 'app-objects',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FileSizePipe
  ],
  templateUrl: 'objects.component.html',
  styleUrl: './objects.component.css',
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateY(0)' })),
      state('out', style({ transform: 'translateY(100%)' })),
      transition('out => in', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-in-out')
      ]),
      transition('in => out', [
        animate('300ms ease-in-out', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class ObjectsComponent {

  files: FileItem[] = [];
  groupedFiles: { key: string; files: FileItem[] }[] = [];
  shouldUpdateObjectListSubscription!: Subscription;

  constructor(
    private fileUploadService: FileService,
    private dbService: DbService
  ) { }

  ngOnInit() {
    this.shouldUpdateObjectListSubscription = this.fileUploadService.getShouldUpdateObjectList().subscribe({
      next: (value) => {
        if (value) {
          this.load();
        }
      }
    });
  }

  get slideState() {
    return this.getSelectedFilesCount() > 0 ? 'in' : 'out';
  }

  groupFiles() {
    const grouped = this.files.reduce((groups: { [key: string]: FileItem[] }, file: FileItem) => {
      const date = moment(file.SK).format('YYYY-MM-DD');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(file);
      return groups;
    }, {});
    this.groupedFiles = Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(key => ({ key, files: grouped[key] }));
  }

  getSelectedFilesCount(): number {
    return this.files.filter(file => file.isSelected).length;
  }

  onObjectAreaClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName.includes('INPUT') || target.tagName.includes('IMG')) {
      return;
    }
    this.files.forEach(file => file.isSelected = false);
  }

  deleteSelectedFiles() {
    const selectedFiles = this.files.filter(file => file.isSelected);
    this.fileUploadService.deleteFiles(selectedFiles).subscribe({
      next: () => {
        this.load();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  downloadSelectedFiles() {
    const selectedFiles = this.files.filter(file => file.isSelected).map(file => file.fileName);
    this.fileUploadService.downloadFiles(false, selectedFiles).subscribe({
      next: (data) => {
        const signedUrls = selectedFiles.map(fileName => data.signedUrls[fileName]);
        signedUrls.forEach((url, index) => {
          setTimeout(() => {
            window.open(url, "_blank");
          }, index * 500);
        });
        this.files.forEach(file => file.isSelected = false);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  load() {
    this.dbService.getObjectList('2024-11').subscribe({
      next: (data) => {
        this.files = data.items;
        const fileNames = this.files.map((file) => file.fileName);
        if (fileNames.length === 0) return;
        this.fileUploadService.downloadFiles(true, fileNames).subscribe({
          next: (data) => {
            const signedUrls = data.signedUrls;
            this.files.forEach((file) => {
              file.fileUrl = signedUrls[file.fileName];
              file.isSelected = false;
            });
            this.groupFiles();
          },
          error: (error) => {
            console.error(error);
          }
        });
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  selectObject(file: FileItem): void {
    this.files.forEach(_ => {
      if (file.fileName === _.fileName) {
        file.isSelected = !file.isSelected;
      } else {
        _.isSelected = false;
      }
    });
  }

  toggleSelection(file: FileItem) {
    file.isSelected = !file.isSelected;
  }

  ngOnDestroy() {
    this.shouldUpdateObjectListSubscription?.unsubscribe();
  }
}
