import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    'Authorization': 'eyJraWQiOiJxQ1wvMXp5a3RcL0x5eFZySDdoNzlZYU16RXhLUjlwTkJudExLc2ZPRVcwd1U9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIxMTgzYmQwYS1kMGQxLTcwODUtZDIzOS1hYzM1MjU3ZjllNjkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoLTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGgtMV9id1E1eFpINHgiLCJjb2duaXRvOnVzZXJuYW1lIjoicGUubWVzc2giLCJvcmlnaW5fanRpIjoiNTY3YmYzZWEtYzFkYy00NDI0LWFmNDItMWU4ZWM0ZDZiOWQ3IiwiYXVkIjoiNGU1OTV1dTMxa2R2aGM0a3Noc2MzMWltaTQiLCJldmVudF9pZCI6ImExMWRlOTQwLWU5Y2MtNGNlZi05NWFhLTliYTU2ZTlkYjkyZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzIwODQ1MDk1LCJleHAiOjE3MjA5MzE0OTUsImlhdCI6MTcyMDg0NTA5NSwianRpIjoiNzc1MzVmZDctYjA2Zi00OTNiLThmMTMtZjg2ZDljMjQ5MDA1IiwiZW1haWwiOiJwZS5tZXNzaEBnbWFpbC5jb20ifQ.qsNYjw7SLqcsfGKqM6bKzenr6QLyTdwrpjlRZxFyPcDIcCEkZj-AjEIzgLiwwXhYpIDLAk7wXfUab9PET0vIkDsu4-ZT9Leh52FVkZF-u-jkHj_-BTuHEGjGaPHsacDJjzDboF1HKdeY_fTs3DxXhVSgrgk4k_lRisG1Wh-tbI7K-VnarDU9y0R5KIfYYRgzx0sBnJHpvCuMC3joaGkkmzuAgFDQJ_JijAsTrrfF_FiRhospduUSWzlqo4fqyRW1O3LzU-TOTbRvyuWnhW2Q11OOEaKuhSZBm8Z7LaAWx8YWfaiY0C6FUMeFJl16RyNPQ0pAnJ-pmHk5f6iiGYFZng'
  });

  uploadPart(fileChunk: Blob, presignedUrl: string, partNo: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream'
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
    return this.http.post<any>(url, { fileName, fileSize }, { headers: this.headers });
  }

  completeMultipartUpload(uploadId: string, key: string, parts: any[]): Observable<any> {
    const url = 'https://wu46gjskr0.execute-api.ap-south-1.amazonaws.com/Prod/complete';
    return this.http.post<any>(url, { uploadId, key, parts }, { headers: this.headers });
  }
}
