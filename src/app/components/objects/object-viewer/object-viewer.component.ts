import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FaceData } from '../../../models/FaceData';
import { FileItem } from '../../../models/FileItem';
import { DbService } from '../../../services/db.service';
import { FileService } from '../../../services/file.service';
import { Subscription, fromEvent, debounceTime } from 'rxjs';

@Component({
  selector: 'app-object-viewer',
  templateUrl: './object-viewer.component.html',
  styleUrl: './object-viewer.component.css',
  imports: [
    CommonModule,
    MatChipsModule,
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
    this.resizeSub = fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => this.triggerReflow());
  }

  onImageLoad(): void {
    this.triggerReflow();
  }

  triggerReflow() {
    this.faceData = [...this.faceData];
  }

  getFacesData() {
    const { imageId } = this.currentObjectInView;
    if (imageId) {
      this.dbService.getFacesData(`IMAGE#${imageId}`).subscribe({
        next: (response: FaceData[]) => {
          this.faceData = response;
        },
        error: (error) => {
          console.error('Error fetching object details:', error);
        }
      });
    }
  }

  onFaceClick(face: FaceData): void {
    const faceName = prompt('Enter face name:');
    if (!faceName) {
      alert('Face name is required!');
      return;
    }
    console.log('Face clicked:', 'Face Name:', faceName);
    const imageId = face.PK;
    const faceId = face.SK;
    this.dbService.updateFaceData({ imageId, faceId, faceName }).subscribe({
      next: (response) => {
        console.log('Face data updated successfully:', response);
      },
      error: (error) => {
        console.error('Error updating face data:', error);
      }
    });
  }

  getBoxStyle(face: FaceData): { [key: string]: string } {
    const img = this.imageRef?.nativeElement;
    if (!img) return {};

    const { Top, Left, Width, Height } = face.boundingBox;

    return {
      top: `${Top * img.clientHeight}px`,
      left: `${Left * img.clientWidth}px`,
      width: `${Width * img.clientWidth}px`,
      height: `${Height * img.clientHeight}px`,
      position: 'absolute',
      cursor: 'pointer',
    };
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
