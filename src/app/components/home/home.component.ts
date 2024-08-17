import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { LogoutComponent } from '../logout/logout.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    LogoutComponent,
    FileUploadComponent
  ],
  templateUrl: 'home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent { }
