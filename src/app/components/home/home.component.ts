
import { Component } from '@angular/core';
import { ObjectsComponent } from '../objects/objects.component';
import { TopMenuComponent } from '../top-menu/top-menu.component';

@Component({
    selector: 'app-home',
    imports: [
    ObjectsComponent,
    TopMenuComponent
],
    templateUrl: 'home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent { }
