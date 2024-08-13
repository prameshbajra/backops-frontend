import { HttpHandlerFn, HttpRequest } from "@angular/common/http";

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const accessToken = localStorage.getItem('accessToken') || '';
  const excludedUrls = ['/login', 's3-accelerate.amazonaws.com'];

  const isExcludedUrl = excludedUrls.some(url => req.url.includes(url));

  const reqWithHeader = isExcludedUrl
    ? req
    : req.clone({
      headers: req.headers.set('Authorization', accessToken),
    });

  return next(reqWithHeader);
}
