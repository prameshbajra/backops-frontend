import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { FileItem } from '../../models/FileItem';
import { DbService } from '../../services/db.service';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FileService } from '../../services/file.service';

import moment from 'moment';
import { Utility } from '../../utility';
import { LoaderComponent } from '../shared/loader/loader.component';
import { ObjectFabComponent } from './object-fab/object-fab.component';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';
import { ObjectViewerComponent } from './object-viewer/object-viewer.component';

@Component({
  selector: 'app-objects',
  imports: [
    CommonModule,
    MatIconModule,
    MatDialogModule,
    LoaderComponent,
    ObjectFabComponent
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

  fileUploadService: FileService = inject(FileService);
  dbService: DbService = inject(DbService);
  router: Router = inject(Router);
  dialog: Dialog = inject(Dialog);


  applyFilterObjectListSubscription!: Subscription;
  shouldUpdateObjectListSubscription!: Subscription;

  files: FileItem[] = [];
  groupedFiles: { key: string; files: FileItem[] }[] = [];
  nextPaginationToken: string | null = null;
  areFilesLoading: boolean = false;
  areFilesBeingDeleted: boolean = false;
  areFilesBeingDownloaded: boolean = false;
  timestampFilterData: string | null = null;


  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (scrollPosition >= windowHeight && !this.areFilesLoading) {
      console.log('Scrolled to the bottom of the page!');
      this.load();
    }
  }

  ngOnInit() {
    this.shouldUpdateObjectListSubscription = this.fileUploadService.getShouldUpdateObjectList().subscribe({
      next: (value) => {
        if (value) {
          this.files = [];
          this.groupFiles();
          this.nextPaginationToken = null;
          this.timestampFilterData = null;
          this.load();
        }
      }
    });
    this.applyFilterObjectListSubscription = this.dbService.getApplyFilterObjectList().subscribe({
      next: (value: string | null) => {
        this.files = [];
        this.groupFiles();
        this.nextPaginationToken = null;
        this.timestampFilterData = value;
        this.load();
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
    this.areFilesBeingDeleted = true;
    const selectedFiles = this.files.filter(file => file.isSelected);
    this.fileUploadService.deleteFiles(selectedFiles).subscribe({
      next: () => {
        this.files = this.files.filter(file => !file.isSelected);
        this.groupFiles();
        this.areFilesBeingDeleted = false;
      },
      error: (error) => {
        console.error(error);
        this.areFilesBeingDeleted = false;
      }
    });
  }

  downloadSelectedFiles() {
    this.areFilesBeingDownloaded = true;
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
        this.areFilesBeingDownloaded = false;
      },
      error: (error) => {
        console.error(error);
        this.areFilesBeingDownloaded = false;
      }
    });
  }

  load(): void {
    this.areFilesLoading = true;
    if (this.nextPaginationToken === null && this.files.length > 0) {
      console.log('All data is loaded');
      this.areFilesLoading = false;
      return;
    }

    this.dbService.getObjectList(this.nextPaginationToken, this.timestampFilterData).subscribe({
      next: (data) => {
        this.files = [...this.files, ...data.items];
        this.nextPaginationToken = data.nextToken;
        // Fetch signed URLs for new files
        const fileNames = data.items.map((file) => Utility.checkFilenameReplaceExtension(file.fileName));
        if (fileNames.length > 0) {
          this.fileUploadService.downloadFiles(true, fileNames).subscribe({
            next: (response) => {
              const signedUrls = response.signedUrls;
              this.files.forEach((file) => {
                const fileName = Utility.checkFilenameReplaceExtension(file.fileName);
                if (signedUrls[fileName]) {
                  file.fileUrl = signedUrls[fileName];
                }
                file.isSelected = false;
              });
              this.groupFiles();
              this.areFilesLoading = false;
            },
            error: (error) => {
              console.error('Error fetching signed URLs:', error);
              this.areFilesLoading = false;
            }
          });
        } else {
          this.groupFiles();
          this.areFilesLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading files:', error);
        this.areFilesLoading = false;
      }
    });
  }

  selectObject(file: FileItem): void {
    this.dialog.open(ObjectViewerComponent, {
      minWidth: '100vw',
      minHeight: '100vh',
      data: file,
    });
  }

  toggleSelection(file: FileItem) {
    file.isSelected = !file.isSelected;
  }

  ngOnDestroy() {
    this.shouldUpdateObjectListSubscription?.unsubscribe();
    this.applyFilterObjectListSubscription?.unsubscribe();
  }
}
function openDialog(enterAnimationDuration: any, string: any, exitAnimationDuration: any, string1: any) {
  throw new Error('Function not implemented.');
}

