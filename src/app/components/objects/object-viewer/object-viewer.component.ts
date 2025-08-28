import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, inject, HostListener } from '@angular/core';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FaceData } from '../../../models/FaceData';
import { FileItem } from '../../../models/FileItem';
import { DbService } from '../../../services/db.service';
import { FileService } from '../../../services/file.service';
import { Subscription, fromEvent, debounceTime } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { FaceNameDialogComponent } from './face-name-dialog/face-name-dialog.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-object-viewer',
  templateUrl: './object-viewer.component.html',
  styleUrl: './object-viewer.component.css',
  imports: [
    CommonModule,
    MatChipsModule,
    MatDialogModule,
    FormsModule,
    LoaderComponent,
    MatIconModule
  ]
})
export class ObjectViewerComponent {

  @ViewChild('image') imageRef!: ElementRef<HTMLImageElement>;
  @ViewChild('viewport') viewportRef!: ElementRef<HTMLDivElement>;
  @ViewChild('content') contentRef!: ElementRef<HTMLDivElement>;

  dbService: DbService = inject(DbService);
  fileService: FileService = inject(FileService);
  dialogData: any = inject(MAT_DIALOG_DATA);
  currentObjectInView!: FileItem;
  files: FileItem[] = [];
  currentIndex = 0;
  readonly dialogRef = inject(MatDialogRef<ObjectViewerComponent>);
  readonly dialog = inject(MatDialog);

  faceData: FaceData[] = [];
  resizeSub!: Subscription;
  resizeObserver?: ResizeObserver;
  private facesRequestKey?: string;

  // Loading state
  isLoading = true;

  // Zoom / pan state
  zoom = 1;
  minZoom = 0.1;
  maxZoom = 5;
  translateX = 0;
  translateY = 0;
  isPanning = false;
  lastPanX = 0;
  lastPanY = 0;

  // Selection state
  selectedFaceId: string | null = null;
  private isAutoFit = true;

  ngOnInit() {
    const data = this.dialogData;
    if (data && Array.isArray(data.files) && typeof data.index === 'number') {
      this.files = data.files as FileItem[];
      this.currentIndex = data.index as number;
    } else if (data) {
      this.files = [data as FileItem];
      this.currentIndex = 0;
    }
    this.currentObjectInView = this.files[this.currentIndex];
  }

  ngAfterViewInit() {
    this.loadCurrent();
    this.resizeSub = fromEvent(window, 'resize')
      .pipe(debounceTime(200))
      .subscribe(() => this.onViewportResize());

    // Observe image size changes to keep overlays aligned
    this.resizeObserver = new ResizeObserver(() => this.triggerReflow());
    if (this.imageRef?.nativeElement) {
      this.resizeObserver.observe(this.imageRef.nativeElement);
    }
  }

  onImageLoad(): void {
    this.isLoading = false;
    if (this.isAutoFit) {
      this.fitToScreen();
    } else {
      this.centerImage();
    }
    this.triggerReflow();
  }

  triggerReflow() {
    this.faceData = [...this.faceData];
  }

  private onViewportResize() {
    // When auto-fit is active, recompute fit on resize
    if (this.isAutoFit) {
      this.fitToScreen();
    }
    this.triggerReflow();
  }

  getFacesData() {
    const { imageId } = this.currentObjectInView;
    if (imageId) {
      const key = `IMAGE#${imageId}`;
      this.facesRequestKey = key;
      this.dbService.getFacesData(key).subscribe({
        next: (response: FaceData[]) => {
          // Ignore late responses for previous images
          if (this.facesRequestKey !== key) return;
          this.faceData = response || [];
        },
        error: (error) => {
          if (this.facesRequestKey !== key) return;
          console.error('Error fetching object details:', error);
          this.faceData = [];
        }
      });
    } else {
      this.facesRequestKey = undefined;
      this.faceData = [];
    }
  }

  loadCurrent() {
    // Always fetch and show the HD image for the selected item
    this.isLoading = true;
    this.selectedFaceId = null;
    this.faceData = [];
    this.isAutoFit = true;
    const { fileName } = this.currentObjectInView;
    this.fileService.downloadFilesCached(false, [fileName]).subscribe({
      next: (response) => {
        this.currentObjectInView.fileUrl = response.signedUrls[fileName];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error downloading file:', error);
        this.isLoading = false;
      }
    });
    this.getFacesData();
  }

  get canPrev() { return this.files.length > 1 && this.currentIndex > 0; }
  get canNext() { return this.files.length > 1 && this.currentIndex < this.files.length - 1; }

  prev() {
    if (!this.canPrev) return;
    this.currentIndex -= 1;
    this.currentObjectInView = this.files[this.currentIndex];
    this.loadCurrent();
  }

  next() {
    if (!this.canNext) return;
    this.currentIndex += 1;
    this.currentObjectInView = this.files[this.currentIndex];
    this.loadCurrent();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') { this.prev(); }
    if (event.key === 'ArrowRight') { this.next(); }
  }

  editFaceName(face: FaceData, event?: MouseEvent): void {
    event?.stopPropagation();
    const dialogRef = this.dialog.open(FaceNameDialogComponent, {
      data: { currentName: face.faceName || '' },
      width: '420px',
      maxWidth: '92vw'
    });
    dialogRef.afterClosed().subscribe((faceName: string | undefined) => {
      if (!faceName) return;
      const imageId = face.PK;
      const faceId = face.SK;
      this.dbService.updateFaceData({ imageId, faceId, faceName }).subscribe({
        next: () => {
          face.faceName = faceName;
          this.triggerReflow();
        },
        error: (error) => {
          console.error('Error updating face data:', error);
        }
      });
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

  // Keep tooltips readable regardless of zoom by counter-scaling
  get tooltipStyle() {
    const scale = this.zoom ? 1 / this.zoom : 1;
    return {
      transform: `translate(-50%, -150%) scale(${scale})`,
      transformOrigin: 'center bottom'
    } as { [key: string]: string };
  }

  onBackPress() {
    this.dialogRef.close();
  }

  onImageError() {
    // Likely an expired pre-signed URL; invalidate cache and refetch
    const { fileName } = this.currentObjectInView;
    if (!fileName) return;
    this.fileService.invalidateCachedUrl(false, fileName);
    this.isLoading = true;
    this.fileService.downloadFilesCached(false, [fileName]).subscribe({
      next: (response) => {
        this.currentObjectInView.fileUrl = response.signedUrls[fileName];
      },
      error: (error) => {
        console.error('Error refreshing image URL:', error);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    if (this.resizeSub) {
      this.resizeSub.unsubscribe();
    }
    this.resizeObserver?.disconnect();
  }

  // Computed style for transform content
  get contentTransform() {
    return {
      transform: `translate(${this.translateX}px, ${this.translateY}px) scale(${this.zoom})`,
      transformOrigin: '0 0'
    } as { [key: string]: string };
  }

  // Zoom with wheel
  onWheel(event: WheelEvent) {
    event.preventDefault();
    this.isAutoFit = false;
    const viewport = this.viewportRef?.nativeElement;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;

    const oldZoom = this.zoom;
    const delta = -event.deltaY; // natural: wheel up to zoom in
    const zoomFactor = Math.exp(delta * 0.0015);
    let newZoom = oldZoom * zoomFactor;
    newZoom = Math.min(this.maxZoom, Math.max(this.minZoom, newZoom));
    const scale = newZoom / oldZoom;

    // Adjust translate so the point under cursor stays fixed
    this.translateX = cursorX - scale * (cursorX - this.translateX);
    this.translateY = cursorY - scale * (cursorY - this.translateY);
    this.zoom = newZoom;
  }

  onPointerDown(event: PointerEvent) {
    this.isPanning = true;
    this.isAutoFit = false;
    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isPanning) return;
    const dx = event.clientX - this.lastPanX;
    const dy = event.clientY - this.lastPanY;
    this.translateX += dx;
    this.translateY += dy;
    this.lastPanX = event.clientX;
    this.lastPanY = event.clientY;
  }

  onPointerUp(event: PointerEvent) {
    this.isPanning = false;
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  }

  // Fit entire image into the viewport
  fitToScreen() {
    const img = this.imageRef?.nativeElement;
    const viewport = this.viewportRef?.nativeElement;
    if (!img || !viewport) return;

    const viewportRect = viewport.getBoundingClientRect();
    const imgW = img.clientWidth;
    const imgH = img.clientHeight;
    if (!imgW || !imgH || !viewportRect.width || !viewportRect.height) return;

    const fitZoom = Math.min(viewportRect.width / imgW, viewportRect.height / imgH);
    this.zoom = Math.min(this.maxZoom, Math.max(fitZoom, this.minZoom));
    this.centerImage();
    this.isAutoFit = true;
  }

  // Center view on a specific face
  focusFace(face: FaceData) {
    const img = this.imageRef?.nativeElement;
    const viewport = this.viewportRef?.nativeElement;
    if (!img || !viewport) return;

    const { Top, Left, Width, Height } = face.boundingBox;
    const boxLeft = Left * img.clientWidth;
    const boxTop = Top * img.clientHeight;
    const boxWidth = Width * img.clientWidth;
    const boxHeight = Height * img.clientHeight;
    const centerX = boxLeft + boxWidth / 2;
    const centerY = boxTop + boxHeight / 2;

    // Zoom slightly in when focusing (a bit less aggressive)
    const targetZoom = Math.min(Math.max(this.zoom, 1.25), this.maxZoom);
    const scale = targetZoom / this.zoom;
    // Adjust translate to center the face
    const viewportRect = viewport.getBoundingClientRect();
    const viewportCenterX = viewportRect.width / 2;
    const viewportCenterY = viewportRect.height / 2;

    // First apply scaling around (0,0)
    this.translateX = this.translateX * scale;
    this.translateY = this.translateY * scale;
    // Then move so that scaled content center of face is at viewport center
    this.translateX = viewportCenterX - targetZoom * centerX;
    this.translateY = viewportCenterY - targetZoom * centerY;
    this.zoom = targetZoom;
    this.selectedFaceId = face.SK;
  }

  private centerImage() {
    const img = this.imageRef?.nativeElement;
    const viewport = this.viewportRef?.nativeElement;
    if (!img || !viewport) return;
    const viewportRect = viewport.getBoundingClientRect();
    const imgW = img.clientWidth;
    const imgH = img.clientHeight;
    this.translateX = (viewportRect.width - this.zoom * imgW) / 2;
    this.translateY = (viewportRect.height - this.zoom * imgH) / 2;
  }

  onFaceSelectionChange(event: MatChipSelectionChange, face: FaceData) {
    if (event.selected) {
      this.selectedFaceId = face.SK;
      this.focusFace(face);
    } else {
      this.selectedFaceId = null;
      this.isAutoFit = true;
      this.fitToScreen();
    }
  }

  trackByFace(face: FaceData) {
    return `${face.PK}:${face.SK}`;
  }

}
