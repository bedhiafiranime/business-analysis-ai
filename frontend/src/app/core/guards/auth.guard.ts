import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtStorageService } from '../services/jwt-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const jwtService = inject(JwtStorageService);
  const router = inject(Router);

  if (jwtService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
