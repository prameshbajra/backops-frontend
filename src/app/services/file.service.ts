import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FileItem } from '../models/FileItem';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

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

  completeMultipartUpload(uploadId: string, key: string, parts: any[]): Observable<any> {
    const url = `${environment.AUTH_API_URL}complete`;
    return this.http.post<any>(url, { uploadId, key, parts });
  }

  listAllFiles(): Observable<FileItem[]> {
    const url = `${environment.AUTH_API_URL}list-objects`;
    return this.http.get<FileItem[]>(url);
  }

  deleteFiles(fileNames: string[]) {
    const url = `${environment.AUTH_API_URL}delete-objects`;
    return this.http.delete(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: { fileNames }
    });
  }

  downloadFile(fileName: string): Observable<{ signedUrl: string }> {
    const url = `${environment.AUTH_API_URL}download`;
    return this.http.post<{ signedUrl: string }>(url, { fileName });
  }
}

