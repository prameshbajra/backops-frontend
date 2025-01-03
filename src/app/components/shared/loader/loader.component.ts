import { Component, input } from '@angular/core';

@Component({
    selector: 'app-loader',
    imports: [],
    templateUrl: './loader.component.html',
    styleUrl: './loader.component.css'
})
export class LoaderComponent {

  loaderText = input('waaait for it...');

}
