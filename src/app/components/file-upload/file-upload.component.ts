import { Component, OnInit } from '@angular/core';
import { FileService } from '../../services/file.service';
import { LogoutComponent } from "../logout/logout.component";
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [LogoutComponent],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
  providers: [FileService]
})
export class FileUploadComponent implements OnInit {

  currentUser: User | null | undefined;

  constructor(private fileUploadService: FileService, private authService: AuthService) { }


  ngOnInit() {
    this.currentUser = this.authService.currentUser();
  }

  async onFileSelected(event: any) {
    const files: File[] = event.target.files;

    for (const file of files) {
      this.fileUploadService.getPresignedUrls(file.name, file.size).subscribe(async (data) => {
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
          alert('File uploaded successfully!' + file.name);
        });
      });
    }
  }
}
