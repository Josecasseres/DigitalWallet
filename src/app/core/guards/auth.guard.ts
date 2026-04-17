import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AccountService } from '../services/account.service';

export const authGuard: CanActivateFn = () => {
  const account = inject(AccountService);
  const router = inject(Router);
  return account.activeUser$.pipe(
    take(1),
    map((user) => (user ? true : router.createUrlTree(['/sign-in'])))
  );
};
