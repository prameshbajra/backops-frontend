import { Component, OnInit } from '@angular/core';
import { from, mergeMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../services/auth.service';
import { FileService } from '../../services/file.service';
import { LogoutComponent } from "../logout/logout.component";

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [LogoutComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
  providers: [FileService]
})
export class FileUploadComponent implements OnInit {

  constructor(private fileUploadService: FileService, private authService: AuthService) { }

  ngOnInit() {
  }

  async onFileSelected(event: any) {
    const files: File[] = event.target.files;
    const concurrentUploads = environment.CONCURRENT_UPLOADS;

    from(files).pipe(mergeMap(file => this.uploadSingleFile(file), concurrentUploads)).subscribe({
      next: (result) => {
        console.log('File uploaded successfully', result);
      },
      error: (error) => {
        console.error('Error during file upload', error);
      },
      complete: () => {
        console.log('All files uploaded');
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
          const key = file.name;

          this.fileUploadService.completeMultipartUpload(uploadId, key, parts).subscribe((response) => {
            console.log('Upload complete:', response);
            resolve();
          }, (error) => {
            console.error('Upload failed:', error);
            reject(error);
          });
        } catch (error) {
          console.error('Error uploading file:', error);
          reject(error);
        }
      });
    });
  }

}
