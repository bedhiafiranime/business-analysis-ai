import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JwtStorageService } from '../services/jwt-storage.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const jwtService = inject(JwtStorageService);
  const token = jwtService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
