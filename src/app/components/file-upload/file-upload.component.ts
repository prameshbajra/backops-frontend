import { animate, style, transition, trigger } from '@angular/animations';

import { Component, inject, OnInit } from '@angular/core';
import { from, mergeMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FileService } from '../../services/file.service';

@Component({
    selector: 'app-file-upload',
    imports: [],
    templateUrl: './file-upload.component.html',
    styleUrl: './file-upload.component.css',
    animations: [
        trigger('slideButton', [
            transition(':enter', [
                style({ transform: 'translateX(100%)', opacity: 0 }),
                animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
            ])
        ]),
        trigger('slideUpload', [
            transition(':enter', [
                style({ transform: 'translateX(-100%)', opacity: 0 }),
                animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
            ])
        ])
    ]
})
export class FileUploadComponent {

  totalFiles: number = 0;
  completedFiles: number = 0;
  isUploading: boolean = false;

  fileUploadService: FileService = inject(FileService);

  async onFileSelected(event: any) {
    const files: File[] = event.target.files;
    this.totalFiles = files.length;
    this.completedFiles = 0;
    this.isUploading = true;

    const concurrentUploads = environment.CONCURRENT_UPLOADS;

    from(files).pipe(mergeMap(file => this.uploadSingleFile(file), concurrentUploads)).subscribe({
      next: (result) => {
        this.completedFiles++;
        console.log('File uploaded successfully', result);
      },
      error: (error) => {
        alert('Error during file upload. Please try again.');
        console.error('Error during file upload', error);
      },
      complete: () => {
        this.isUploading = false;
        this.fileUploadService.setShouldUpdateObjectList(true);
      }
    });
  }

  uploadSingleFile(file: File): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.fileUploadService.getPresignedUrls(file.name, file.size).subscribe(async (data) => {
        try {
          const presignedUrls = data.presignedUrls;
          const uploadResponses = await this.fileUploadService.uploadFile(file, presignedUrls);
          const parts = uploadResponses.map((response, index) => ({
            ETag: response.headers.get('ETag'),
            PartNumber: index + 1
          }));
          const uploadId = data.uploadId;
          const fileName = data.fileName; // backend changes the file name to be jpg extension ...

          this.fileUploadService.completeMultipartUpload(uploadId, fileName, file.size, parts).subscribe({
            next: (result) => {
              console.log('File uploaded successfully:', result);
              resolve();
            },
            error: (error) => {
              console.error('Error completing multipart upload:', error);
              reject(error);
            }
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          reject(error);
        }
      });
    });
  }

}
