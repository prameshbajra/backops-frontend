import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../../../services/file.service';
import { FileItem } from '../../../models/FileItem';

@Component({
  selector: 'app-object-viewer',
  imports: [],
  templateUrl: './object-viewer.component.html',
  styleUrl: './object-viewer.component.css'
})
export class ObjectViewerComponent {

  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  fileUploadService: FileService = inject(FileService);

  ngOnInit() {
    const PK = this.activatedRoute.snapshot.queryParamMap.get('PK');
    const SK = this.activatedRoute.snapshot.queryParamMap.get('SK');

    console.log({ PK, SK });

  }
}
