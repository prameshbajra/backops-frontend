import { HttpEvent, HttpEventType, HttpHandlerFn, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Observable, tap, catchError } from "rxjs";
import { Router } from "@angular/router";
import { inject } from '@angular/core';
import { AuthService } from "../services/auth.service";

export function responseInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    tap(event => {
      if (event.type === HttpEventType.Response) {
        if (event.status !== 200) {
          alert('Sorry, an error occurred. Please try logging in again.');
          router.navigate(['/login']);
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('API failed. Loggin out and clearing all client data. User will need to login again.', error);
      // localStorage.removeItem('accessToken');
      // localStorage.removeItem('refreshToken');
      // localStorage.removeItem('idToken');
      // authService.currentUser.set(null);
      router.navigate(['/login']);
      throw error;
    })
  );
}
