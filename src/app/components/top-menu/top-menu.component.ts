import { Component } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.css'
})
export class TopMenuComponent {

}
