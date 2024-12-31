import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GetObjectListResponse } from '../models/FileItem';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private http: HttpClient) { }

  getObjectList(nextToken: string | null, timestampPrefix: string | null): Observable<GetObjectListResponse> {
    const url = `${environment.AUTH_API_URL}objects`;
    return this.http.post<GetObjectListResponse>(url, { nextToken, timestampPrefix });
  }
}
