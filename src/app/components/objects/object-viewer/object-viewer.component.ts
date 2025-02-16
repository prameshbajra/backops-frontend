import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../../../services/file.service';
import { FileItem, GetObjectResponse } from '../../../models/FileItem';
import { DbService } from '../../../services/db.service';
import { DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'app-object-viewer',
  imports: [],
  templateUrl: './object-viewer.component.html',
  styleUrl: './object-viewer.component.css'
})
export class ObjectViewerComponent {

  dbService: DbService = inject(DbService);
  fileService: FileService = inject(FileService);
  currentObjectInView: FileItem = inject(DIALOG_DATA);

  ngOnInit() {
    const { fileName } = this.currentObjectInView;
    this.fileService.downloadFiles(true, [fileName]).subscribe({
      next: (response: { signedUrls: { [key: string]: string; }; }) => {
        this.currentObjectInView.fileUrl = response.signedUrls[this.currentObjectInView.fileName];
      }
    });
  }
}
