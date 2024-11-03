import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { delay, Subscription } from 'rxjs';
import { FileItem } from '../../models/FileItem';
import { FileSizePipe } from '../../pipes/filesize.pipe';
import { DbService } from '../../services/db.service';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-objects',
  standalone: true,
  imports: [
    CommonModule,
    FileSizePipe
  ],
  templateUrl: 'objects.component.html',
  styleUrl: './objects.component.css',
})
export class ObjectsComponent {

  files: FileItem[] = [];

  shouldUpdateObjectListSubscription!: Subscription;

  constructor(
    private fileUploadService: FileService,
    private dbService: DbService
  ) {
  }

  ngOnInit() {
    this.shouldUpdateObjectListSubscription = this.fileUploadService.getShouldUpdateObjectList().subscribe({
      next: (value) => {
        if (value) {
          this.load();
        }
      }
    });
  }

  deleteFile(file: FileItem) {
    this.fileUploadService.deleteFiles([file.fileName]).subscribe({
      next: () => {
        this.load();
      }
    });
  }

  downloadFile(file: FileItem) {
    this.fileUploadService.downloadFiles(false, [file.fileName]).subscribe({
      next: (data) => {
        window.open(data.signedUrls[file.fileName], "_blank");
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
            console.log(this.files);
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
