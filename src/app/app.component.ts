import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FileUploadComponent } from "./components/file-upload/file-upload.component";
import { LoginComponent } from "./components/login/login.component";

const MODULES = [
  CommonModule
]

const COMPONENTS = [
  FileUploadComponent, LoginComponent
]

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [...MODULES, RouterOutlet, ...COMPONENTS],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: []
})
export class AppComponent {

  constructor() { }

}

