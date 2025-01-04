import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, delay, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { FileItem } from '../models/FileItem';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  http: HttpClient = inject(HttpClient);
  shouldUpdateObjectList: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  getShouldUpdateObjectList(): Observable<boolean> {
    return this.shouldUpdateObjectList.asObservable();
  }

  setShouldUpdateObjectList(value: boolean) {
    this.shouldUpdateObjectList.next(value);
  }

  uploadPart(fileChunk: Blob, presignedUrl: string, partNo: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream',
    });
    return this.http.put(presignedUrl, fileChunk, { headers, observe: 'response' });
  }

  async uploadFile(file: File, presignedUrls: string[]) {
    const partSize = 5 * 1024 * 1024; // 5 MB
    const uploadsArray = [];

    for (let i = 0; i < presignedUrls.length; i++) {
      const start = i * partSize;
      const end = Math.min(start + partSize, file.size);
      const blob = file.slice(start, end);

      uploadsArray.push(this.uploadPart(blob, presignedUrls[i], i + 1).toPromise());
    }

    const uploadResponses = await Promise.all(uploadsArray);
    return uploadResponses;
  }

  getPresignedUrls(fileName: string, fileSize: number): Observable<any> {
    const url = `${environment.AUTH_API_URL}upload`;
    return this.http.post<any>(url, { fileName, fileSize });
  }

  completeMultipartUpload(uploadId: string, key: string, parts: any[], fileName: string, fileSize: number): Observable<any> {
    const url = `${environment.AUTH_API_URL}complete`;
    return this.http.post<any>(url, { uploadId, key, parts, fileName, fileSize });
  }

  deleteFiles(files: FileItem[]) {
    const url = `${environment.AUTH_API_URL}delete-objects`;
    return this.http.delete(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: { files }
    });
  }

  downloadFiles(getThumbnail: boolean = false, fileNames: string[]): Observable<{ signedUrls: { [key: string]: string; }; }> {
    const url = `${environment.AUTH_API_URL}download`;
    return this.http.post<{ signedUrls: { [key: string]: string; }; }>(url, { getThumbnail, fileNames });
  }
}

