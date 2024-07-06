import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    'Authorization': 'eyJraWQiOiJxQ1wvMXp5a3RcL0x5eFZySDdoNzlZYU16RXhLUjlwTkJudExLc2ZPRVcwd1U9IiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiIxMTgzYmQwYS1kMGQxLTcwODUtZDIzOS1hYzM1MjU3ZjllNjkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoLTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGgtMV9id1E1eFpINHgiLCJjb2duaXRvOnVzZXJuYW1lIjoicGUubWVzc2giLCJvcmlnaW5fanRpIjoiODY3Zjc4MmMtOWIyYi00NGUwLTg1NDgtZjgwYWIzYjQwNTJhIiwiYXVkIjoiNGU1OTV1dTMxa2R2aGM0a3Noc2MzMWltaTQiLCJldmVudF9pZCI6IjIzYzA4MzcyLTg5YmMtNGYxYS05NjJiLWMzODQ1MThiYWZhNyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzIwMjUwMTQwLCJleHAiOjE3MjAzMzY1NDAsImlhdCI6MTcyMDI1MDE0MCwianRpIjoiYmQ5YWJiNWEtNjBmNS00ZjZkLTg4ZmYtNjRhOTc0NzQ2NGFjIiwiZW1haWwiOiJwZS5tZXNzaEBnbWFpbC5jb20ifQ.FwSgWkpzJftPLpgxoUroEwA5pDAatN7LESrFPQmBON0q0Nk4nRwFTJWlBbtmKDwLxrxTY_9GRzyNpNjphg9Zwx5iO1mauXnQAfLWAtRhnD4W509QnYMu9E8Nnjls6KJTjaO24hY1BJqOWdx46LHvQz3MKzYyfF7sNxaraUIKrgllo69061lSwdCMJn07dKpcuP7cssTL4EHLQwTU26eeSo28oQTMIvPNLjo1wQ0thPRxHNmg4EmjT_s2gv1bBz61oLdtfyUlETI0CgphaWS6ArhQcVlfGaDx_LLFzeDtun68qOV60BZhUYFVaqgRra5OeiAI3eZCiXVeFCzBvbfSrw'
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
