import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FileService } from '../../services/file.service';
import { FileItem } from '../../models/FileItem';
import { FileSizePipe } from '../../pipes/filesize.pipe';
import { DbService } from '../../services/db.service';

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
    this.fileUploadService.downloadFile(file.fileName).subscribe({
      next: (data: { signedUrl: string }) => {
        window.open(data.signedUrl, "_blank");
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  load() {
    this.dbService.getObjectList('2024-09').subscribe({
      next: (data) => {
        this.files = data.items;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

}
