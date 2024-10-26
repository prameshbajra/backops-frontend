import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FileItem } from '../../models/FileItem';
import { FileSizePipe } from '../../pipes/filesize.pipe';
import { AuthService } from '../../services/auth.service';
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

  constructor(
    private fileUploadService: FileService,
    private authService: AuthService,
    private dbService: DbService
  ) { }

  ngOnInit() {
    this.load();
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
    this.dbService.getObjectList('2024-10').subscribe({
      next: (data) => {
        this.files = data.items;
        const fileNames = this.files.map((file) => file.fileName);
        if (fileNames.length === 0) return;
        this.fileUploadService.downloadFiles(true, fileNames).subscribe({
          next: (data) => {
            const signedUrls = data.signedUrls;
            this.files.forEach((file) => {
              file.fileUrl = signedUrls[file.fileName];
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

}
