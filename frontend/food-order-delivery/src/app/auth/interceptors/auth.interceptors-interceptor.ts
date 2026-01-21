import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const authService = inject(AuthService);
  const user = authService.getUser();

  let authReq = req;

  if (user && user.token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
  }
     return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        localStorage.clear();
        location.href = '/login';
      }
      return throwError(() => err);
    })
  );
};