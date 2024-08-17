import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filesize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {

  transform(sizeInBytes: number): string {
    if (sizeInBytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));

    const size = sizeInBytes / Math.pow(k, i);
    return size.toFixed(2) + ' ' + sizes[i];
  }

}
