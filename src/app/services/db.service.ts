import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetObjectListResponse, GetObjectResponse } from '../models/FileItem';
import { FaceData } from '../models/FaceData';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  http: HttpClient = inject(HttpClient);
  timestampPrefixSub: Subject<string | null> = new Subject<string | null>();
  timeStampPrefix: string | null = null;

  getTimeStampPrefix(): string | null {
    return this.timeStampPrefix;
  }

  getApplyFilterObjectList(): Observable<string | null> {
    return this.timestampPrefixSub.asObservable();
  }

  setApplyFilterObjectList(value: string | null) {
    this.timeStampPrefix = value;
    this.timestampPrefixSub.next(value);
  }

  getObject(PK: string, SK: string): Observable<GetObjectResponse> {
    const url = `${environment.AUTH_API_URL}object`;
    return this.http.post<GetObjectResponse>(url, { PK, SK });
  }

  getObjectList(nextToken: string | null, timestampPrefix: string | null): Observable<GetObjectListResponse> {
    const url = `${environment.AUTH_API_URL}objects`;
    return this.http.post<GetObjectListResponse>(url, { nextToken, timestampPrefix });
  }

  getFacesData(PK: string): Observable<FaceData[]> {
    const url = `${environment.AUTH_API_URL}get-faces`;
    return this.http.post<FaceData[]>(url, { PK });
  }

  updateFaceData(faceData: { imageId: string, faceId: string, faceName: string }): Observable<FaceData> {
    const url = `${environment.AUTH_API_URL}update-face`;
    return this.http.post<FaceData>(url, faceData);
  }
}
