import { Component } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [FileUploadComponent],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.css'
})
export class TopMenuComponent {
  constructor() { }

  uploadClick() {

  }

}
