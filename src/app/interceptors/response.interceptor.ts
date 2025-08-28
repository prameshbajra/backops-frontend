import { HttpEvent, HttpHandlerFn, HttpRequest, HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import { Router } from "@angular/router";
import { inject } from '@angular/core';
import { AuthService } from "../services/auth.service";

export function responseInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(error);
      if (error.status === 401 || error.status === 403) {
        // Token expired or unauthorized: clear client auth state and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('idToken');
        authService.currentUser.set(null);
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
}
