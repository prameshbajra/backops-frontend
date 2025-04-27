import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FaceData } from '../../../models/FaceData';
import { FileItem } from '../../../models/FileItem';
import { DbService } from '../../../services/db.service';
import { FileService } from '../../../services/file.service';

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
    const { fileName, imageId } = this.currentObjectInView;

    this.fileService.downloadFiles(true, [fileName]).subscribe({
      next: (response: { signedUrls: { [key: string]: string; }; }) => {
        this.currentObjectInView.fileUrl = response.signedUrls[fileName];
      },
      error: (error) => {
        console.error('Error downloading file:', error);
      }
    });

    if (imageId) {
      this.dbService.getFacesData(`IMAGE#${imageId}`).subscribe({
        next: (response: FaceData[]) => {
          console.log('Face data:', response);
          this.drawBoundingBoxes(response);
        },
        error: (error) => {
          console.error('Error fetching object details:', error);
        }
      });
    } else {
      console.log('No imageId in object data. Maybe image does not have a face.');
    }
  }

  drawBoundingBoxes(faceData: FaceData[]) {
    if (!this.imageRef || !this.canvasRef) return;

    const img = this.imageRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faceData.forEach((faceDetail: FaceData) => {
      const { PK, SK, confidence, boundingBox } = faceDetail;
      const { Top, Left, Width, Height } = boundingBox;

      const top = Top * img.height;
      const left = Left * img.width;
      const width = Width * img.width;
      const height = Height * img.height;

      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(left, top, width, height);

      this.faceBoxes.push({ faceId: SK, left, top, width, height });
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
