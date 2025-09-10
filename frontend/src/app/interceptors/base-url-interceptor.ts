import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Token } from '../services/token/token';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, tap, throwError } from 'rxjs';
import { Auth } from '../services/auth/auth';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export function baseUrlInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const token = inject(Token);
  const authService = inject(Auth);
  const router = inject(Router);

  // Bỏ qua auth cho các endpoint public
  if (isPublicEndpoint(req.url)) {
    req = req.clone({
      withCredentials: true
    })
    return next(req);
  }

  let apiReq = req;
  let url = req.url;
  if (!req.url.startsWith('http')) {
    url = `${environment.apiBaseUrl}/${req.url}`;
  }

  // Thêm Authorization header nếu có token
  const accessToken = token.getAccessToken();
  if (accessToken) {
    apiReq = addTokenToRequest(apiReq, accessToken);
  }

  return next(apiReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403) && req.url.includes('auth/refresh-token')) {
        // Nếu lỗi 401 hoặc 403 và đang gọi refresh token, không làm gì cả
        authService.logout().subscribe({
          next: () => {
            console.log('session is expired, redirecting to login');
          },
          error: (err) => {
            console.error('Logout failed:', err);
          }
        });
      }
      // Bắt 401 Unauthorized
      else if ((error.status === 401 || error.status === 403) && !req.url.includes('auth/refresh-token') ) {
        return handle401ErrorStatus(apiReq, next, authService, router);
      }

      return throwError(() => error);
    })
  );
}

function handle401ErrorStatus(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: Auth,
  router: Router
): Observable<HttpEvent<any>> {
 if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((tokens) => {
        isRefreshing = false;
        refreshTokenSubject.next(tokens.accessToken);
        
        // Retry original request với token mới
        const newRequest = addTokenToRequest(request, tokens.accessToken);
        return next(newRequest);
      }),
      catchError(error => {
        isRefreshing = false;
        refreshTokenSubject.next(null);
        
        // Kiểm tra xem có đang ở trang login không để tránh redirect liên tục
        const currentUrl = router.url;
        if (!currentUrl.includes('/auth/login')) {
          console.error('Token refresh failed:', error);
          authService.logout();
          // Sử dụng router.navigate thay vì window.location.href
          router.navigate(['/auth/login']);
          console.log('session is expired, redirecting to login');
        }

        return throwError(() => error);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  } else {
    // Nếu đang refresh, chờ token mới
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        const newRequest = addTokenToRequest(request, token!);
        return next(newRequest);
      })
    );
  }

}

// Kiểm tra endpoint public (không cần auth)
function isPublicEndpoint(url: string): boolean {
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/refresh-token',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/logout',
  ];
  
  // Cũng kiểm tra các route frontend
  const publicRoutes = [
    '/auth/login',
    '/auth/signup', 
    '/forgot-password',
    '/reset-password'
  ];
  
  return publicEndpoints.some(endpoint => url.includes(endpoint)) ||
         publicRoutes.some(route => url.includes(route));
}

function addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true, // Đảm bảo cookie được gửi đi
  });
}
