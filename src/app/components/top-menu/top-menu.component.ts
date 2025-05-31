import { Component } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';


@Component({
    selector: 'app-top-menu',
    imports: [FileUploadComponent],
    templateUrl: './top-menu.component.html',
    styleUrl: './top-menu.component.css'
})
export class TopMenuComponent {

}
