import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subscription, debounceTime, fromEvent } from 'rxjs';
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

  faceData: FaceData[] = [];
  resizeSub!: Subscription;

  ngAfterViewInit() {
    const { fileName } = this.currentObjectInView;
    this.fileService.downloadFiles(false, [fileName]).subscribe({
      next: (response) => {
        this.currentObjectInView.fileUrl = response.signedUrls[fileName];
      },
      error: (error) => {
        console.error('Error downloading file:', error);
      }
    });

    this.getFacesData();
    // Handle browser resize
    this.resizeSub = fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => this.drawBoundingBoxes());
  }

  onImageLoad() {
    this.drawBoundingBoxes();
  }

  getFacesData() {
    const { imageId } = this.currentObjectInView;
    if (imageId) {
      this.dbService.getFacesData(`IMAGE#${imageId}`).subscribe({
        next: (response: FaceData[]) => {
          this.faceData = response;
          this.drawBoundingBoxes();  // Re-draw after face data loads
        },
        error: (error) => {
          console.error('Error fetching object details:', error);
        }
      });
    }
  }

  drawBoundingBoxes() {
    if (!this.imageRef || !this.canvasRef) return;

    const img = this.imageRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Match canvas size to image dimensions
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.faceData.forEach((faceDetail: FaceData) => {
      const { boundingBox, faceName } = faceDetail;
      const { Top, Left, Width, Height } = boundingBox;

      const top = Top * img.clientHeight;
      const left = Left * img.clientWidth;
      const width = Width * img.clientWidth;
      const height = Height * img.clientHeight;

      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(left, top, width, height);

      if (faceName) {
        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        ctx.fillText(faceName, left, top - 5);
      }
    });
  }

  onCanvasClick(event: MouseEvent) {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const faceBoxes = this.faceData.map(face => ({
      left: face.boundingBox.Left * canvas.width,
      top: face.boundingBox.Top * canvas.height,
      width: face.boundingBox.Width * canvas.width,
      height: face.boundingBox.Height * canvas.height,
      imageId: face.PK,
      faceId: face.SK,
    }));

    for (const box of faceBoxes) {
      if (
        x >= box.left &&
        x <= box.left + box.width &&
        y >= box.top &&
        y <= box.top + box.height
      ) {
        this.onFaceClick(box);
        break;
      }
    }
  }

  onFaceClick(box: { left: number; top: number; width: number; height: number; imageId: string; faceId: string }): void {
    console.log('Face clicked:', box);
    const imageId = box.imageId;
    const faceId = box.faceId;
    const faceName = "Pramesh";
    this.dbService.updateFaceData({ imageId, faceId, faceName }).subscribe({
      next: (response) => {
        console.log('Face data updated successfully:', response);
      },
      error: (error) => {
        console.error('Error updating face data:', error);
      }
    });
  }

  onBackPress() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
  }

}
