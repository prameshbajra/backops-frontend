import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { SignInResponse } from '../models/SignInResponse';
import { Observable } from 'rxjs';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser = signal<User | undefined | null>(undefined);

  constructor(private httpClient: HttpClient) { }

  login(username: string, password: string): Observable<SignInResponse> {
    return this.httpClient.post<SignInResponse>(`${environment.UNAUTH_API_URL}sign-in`, { username, password });
  }
}
