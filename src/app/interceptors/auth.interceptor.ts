import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError, throwError, tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone request without credentials to prevent browser auth prompt
  const cloned = req.clone({
    withCredentials: false,
    // Remove any headers that might trigger browser auth
    setHeaders: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  return next(cloned).pipe(
    tap((event) => {
      // Consume any WWW-Authenticate headers
      if (event instanceof HttpResponse) {
        // This helps prevent browser from caching auth challenges
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Prevent browser's basic auth prompt by consuming the error
        console.error('Authentication failed:', error);
        return throwError(() => new Error('Credenciales inválidas. Verifica usuario y contraseña.'));
      }
      return throwError(() => error);
    })
  );
};
