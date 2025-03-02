import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Face, FaceRecord, FileItem, GetObjectResponse } from '../../../models/FileItem';
import { DbService } from '../../../services/db.service';
import { FileService } from '../../../services/file.service';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-object-viewer',
  templateUrl: './object-viewer.component.html',
  styleUrl: './object-viewer.component.css',
  imports: [
    MatDialogModule
  ]
})
export class ObjectViewerComponent {

  @ViewChild('image') imageRef!: ElementRef<HTMLImageElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  dbService: DbService = inject(DbService);
  fileService: FileService = inject(FileService);
  currentObjectInView: FileItem = inject(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ObjectViewerComponent>);

  faceBoxes: Array<{ faceId: string; left: number; top: number; width: number; height: number }> = [];

  ngOnInit() {
    const { fileName, PK, SK } = this.currentObjectInView;

    this.fileService.downloadFiles(true, [fileName]).subscribe({
      next: (response: { signedUrls: { [key: string]: string; }; }) => {
        this.currentObjectInView.fileUrl = response.signedUrls[fileName];
      }
    });

    this.dbService.getObject(PK, SK).subscribe({
      next: (response: GetObjectResponse) => {
        this.currentObjectInView.details = response.item.details;
        this.drawBoundingBoxes();
      }
    });
  }

  drawBoundingBoxes() {
    if (!this.imageRef || !this.canvasRef) return;

    const img = this.imageRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const facesDetails = this.currentObjectInView.details?.FaceRecords?.map((_: FaceRecord) => _.Face) || [];
    facesDetails.forEach((faceDetail: Face) => {
      const { FaceId, ImageId, Confidence, BoundingBox } = faceDetail;
      const { Top, Left, Width, Height } = BoundingBox;

      const top = Top * img.height;
      const left = Left * img.width;
      const width = Width * img.width;
      const height = Height * img.height;

      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(left, top, width, height);

      this.faceBoxes.push({ faceId: FaceId, left, top, width, height });
    });
  }

  onCanvasClick(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (const box of this.faceBoxes) {
      const inBoxX = x >= box.left && x <= (box.left + box.width);
      const inBoxY = y >= box.top && y <= (box.top + box.height);

      if (inBoxX && inBoxY) {
        console.log('Clicked on face', box.faceId);
      }
    }
  }

  onBackPress() {
    this.dialogRef.close();
  }

}
