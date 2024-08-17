import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FileService } from '../../services/file.service';
import { FileItem } from '../../models/FileItem';
import { FileSizePipe } from '../../pipes/filesize.pipe';

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
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.updateFiles();
  }

  deleteFile(file: FileItem) {
    this.fileUploadService.deleteFiles([file.key]).subscribe({
      next: () => {
        this.updateFiles();
      }
    });
  }

  updateFiles() {
    this.fileUploadService.listAllFiles().subscribe((files: FileItem[]) => {
      this.files = files.map(_ => {
        _.key = _.key.replace(`${this.authService.currentUser()?.id}/`, '');
        return _;
      });
    });
  }
}
