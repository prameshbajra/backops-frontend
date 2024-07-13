import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { SignInResponse } from '../models/SignInResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) { }

  login(username: string, password: string): Observable<SignInResponse> {
    return this.httpClient.post<SignInResponse>(`${environment.UNAUTH_API_URL}sign-in`, { username, password });
  }
}
