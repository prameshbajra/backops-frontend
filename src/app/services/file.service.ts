import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

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
    const url = 'https://wu46gjskr0.execute-api.ap-south-1.amazonaws.com/Prod/upload';
    return this.http.post<any>(url, { fileName, fileSize });
  }

  completeMultipartUpload(uploadId: string, key: string, parts: any[]): Observable<any> {
    const url = 'https://wu46gjskr0.execute-api.ap-south-1.amazonaws.com/Prod/complete';
    return this.http.post<any>(url, { uploadId, key, parts });
  }

  listAllFiles(): Observable<string[]> {
    const url = 'https://wu46gjskr0.execute-api.ap-south-1.amazonaws.com/Prod/list-objects';
    return this.http.get<string[]>(url);
  }

  deleteFiles(fileNames: string[]) {
    const url = 'https://wu46gjskr0.execute-api.ap-south-1.amazonaws.com/Prod/delete-objects';
    return this.http.delete(url, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: { fileNames }
    });
  }
}

