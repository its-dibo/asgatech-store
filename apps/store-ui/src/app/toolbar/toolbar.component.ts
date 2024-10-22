import { Component, PLATFORM_ID, effect, inject } from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import LoginComponent from '#app/users/auth/login/login.component';
import { AuthService } from '#app/users/auth/auth.service';
import { meta } from '#configs/meta';
import { toolbarConfig } from '#configs/toolbar';
import { User } from '#types/dto/user.dto';
import { OrdersService } from '#app/store/orders/orders.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatTooltipModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export default class ToolbarComponent {
  loginStatus?: 'loggedIn' | 'loggedOut';
  user?: User | null;
  platform = inject(PLATFORM_ID);
  url: string;
  meta = meta;
  toolbarConfig = toolbarConfig;

  constructor(
    private router: Router,
    private location: Location,
    private dialog: MatDialog,
    private auth: AuthService,
    public ordersService: OrdersService,
  ) {
    this.router.events.subscribe({
      next: (val) => {
        this.url = this.location.path();
      },
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platform)) {
      this.auth.currentUser$.subscribe({
        next: (user) => {
          this.user = user;
        },
      });
    }
  }

  login() {
    this.dialog.open(LoginComponent);
  }

  logout() {
    this.auth.logout();
  }
}
