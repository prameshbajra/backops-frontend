import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

const MODULES = [
  CommonModule
]

@Component({
  selector: 'app-root',
  imports: [...MODULES, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: []
})
export class AppComponent {

  constructor() { }

}

