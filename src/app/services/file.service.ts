import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { FileItem } from '../models/FileItem';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  http: HttpClient = inject(HttpClient);
  shouldUpdateObjectList: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private signedUrlCache = new Map<string, { url: string; expiresAt: number }>();
  private readonly FULL_TTL_MS = 10 * 60 * 1000;
  private readonly THUMB_TTL_MS = 30 * 60 * 1000;

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

  completeMultipartUpload(uploadId: string, fileName: string, fileSize: number, parts: any[], imageMetadata?: any): Observable<any> {
    const url = `${environment.AUTH_API_URL}complete`;
    const payload = { uploadId, fileName, fileSize, parts, ...(imageMetadata && { imageMetadata }) };
    return this.http.post<any>(url, payload);
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

  // Cached variant that reuses signed URLs within a TTL to enable browser-level image caching.
  downloadFilesCached(getThumbnail: boolean = false, fileNames: string[]): Observable<{ signedUrls: { [key: string]: string } }> {
    const now = Date.now();
    const ttl = getThumbnail ? this.THUMB_TTL_MS : this.FULL_TTL_MS;
    const prefix = getThumbnail ? 'thumb' : 'full';

    const result: { signedUrls: { [key: string]: string } } = { signedUrls: {} };
    const missing: string[] = [];

    for (const name of fileNames) {
      const key = `${prefix}:${name}`;
      const entry = this.signedUrlCache.get(key);
      if (entry && entry.expiresAt > now) {
        result.signedUrls[name] = entry.url;
      } else {
        missing.push(name);
      }
    }

    if (missing.length === 0) {
      return of(result);
    }

    return this.downloadFiles(getThumbnail, missing).pipe(
      map((resp) => {
        // Store new URLs in cache with TTL
        const signedUrls = resp.signedUrls || {};
        const expiresAt = Date.now() + ttl;
        for (const [name, url] of Object.entries(signedUrls)) {
          const key = `${prefix}:${name}`;
          this.signedUrlCache.set(key, { url, expiresAt });
          result.signedUrls[name] = url;
        }
        return result;
      })
    );
  }

  // Invalidate a cached entry (e.g., when an image URL expires and 403s).
  invalidateCachedUrl(getThumbnail: boolean, fileName: string) {
    const key = `${getThumbnail ? 'thumb' : 'full'}:${fileName}`;
    this.signedUrlCache.delete(key);
  }
}
