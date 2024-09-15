import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { FileItem, GetObjectListResponse } from '../models/FileItem';

@Injectable({
  providedIn: 'root'
})
export class DbService {

  constructor(private http: HttpClient) { }

  getObjectList(date: string): Observable<GetObjectListResponse> {
    const url = `${environment.AUTH_API_URL}objects`;
    return this.http.post<GetObjectListResponse>(url, { date });
  }
}
