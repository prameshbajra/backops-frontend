import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { SignInResponse } from '../models/SignInResponse';
import { CognitoUserData, User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  currentUser = signal<User | undefined | null>(undefined);

  constructor(private httpClient: HttpClient) { }

  login(username: string, password: string): Observable<SignInResponse> {
    return this.httpClient.post<SignInResponse>(`${environment.UNAUTH_API_URL}sign-in`, { username, password });
  }

  getCurrentUser(): Observable<CognitoUserData> {
    return this.httpClient.get<CognitoUserData>(`${environment.AUTH_API_URL}user`);
  }

  logout() {
    return this.httpClient.get(`${environment.AUTH_API_URL}sign-out`).pipe(
      tap(() => {
        localStorage.removeItem('idToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.currentUser.set(null);
      }),
      catchError(err => {
        console.error('Logout failed', err);
        return of(null);
      })
    );
  }



}
