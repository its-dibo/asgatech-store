import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialog } from '@angular/material/dialog';
import LoginComponent from '../login/login.component';

export let authGuard: CanActivateFn = () => {
  // let authService: AuthService = inject(AuthService);

  if (typeof localStorage === 'undefined') return false;

  // todo: use authService.isAuthenticated()
  // the behavior subject value is reset when navigating to the new route i.e. /
  if (localStorage?.getItem('user')) {
    return true;
  } else {
    let dialog = inject(MatDialog);
    dialog.open(LoginComponent);

    // let router: Router = inject(Router);
    // router.navigate(['/']);
    return false;
  }
};
