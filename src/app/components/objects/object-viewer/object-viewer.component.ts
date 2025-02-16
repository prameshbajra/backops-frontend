import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from '../../../services/file.service';
import { FileItem, GetObjectResponse } from '../../../models/FileItem';
import { DbService } from '../../../services/db.service';

@Component({
  selector: 'app-object-viewer',
  imports: [],
  templateUrl: './object-viewer.component.html',
  styleUrl: './object-viewer.component.css'
})
export class ObjectViewerComponent {

  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  dbService: DbService = inject(DbService);
  fileService: FileService = inject(FileService);

  currentObjectInView!: FileItem;

  ngOnInit() {
    const PK = this.activatedRoute.snapshot.queryParamMap.get('PK');
    const SK = this.activatedRoute.snapshot.queryParamMap.get('SK');

    if (PK && SK) {
      this.dbService.getObject(PK, SK).subscribe({
        next: (response: GetObjectResponse) => {
          this.currentObjectInView = response.item;
          this.fileService.downloadFiles(true, [this.currentObjectInView.fileName]).subscribe({
            next: (response: { signedUrls: { [key: string]: string; }; }) => {
              this.currentObjectInView.fileUrl = response.signedUrls[this.currentObjectInView.fileName];
            }
          })
        },
        error: (error) => {
          console.error(error);
        }
      });
    } else {
      this.router.navigate(['/']);
      alert('PK or SK is not working as expected');
    }

  }
}
