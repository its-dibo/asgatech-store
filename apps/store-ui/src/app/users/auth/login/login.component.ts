import {
  Component,
  Inject,
  PLATFORM_ID,
  inject,
  isDevMode,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AlertComponent, Alert } from '#app/shared/alert/alert.component';
import { FormComponent } from '#app/shared/form/form.component';
import { FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';

export interface DialogData {
  title?: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    AlertComponent,
    FormComponent,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export default class LoginComponent {
  fields?: FormlyFieldConfig[];
  loading = true;
  alert?: Alert;
  platform = inject(PLATFORM_ID);

  constructor(
    private auth: AuthService,
    public dialogRef: MatDialogRef<LoginComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data?: DialogData,
  ) {}

  ngOnInit(): void {
    // if already logged in
    if (this.auth.isAuthenticated()) {
      this.alert = {
        status: 'error',
        message: 'you are already loggedIn. <a href="/">Go to home page</a>',
      };
    } else {
      this.fields = [
        {
          key: 'email',
          type: 'email',
          props: {
            required: true,
          },
        },
        {
          key: 'password',
          props: {
            required: true,
            maxLength: 50,
            minLength: 4,
          },
        },
      ];
    }

    this.loading = false;
  }

  onSubmit(ev: { data: { [key: string]: any }; form: FormGroup }): void {
    this.loading = true;
    this.auth
      .login(ev.data.email, ev.data.password)
      .subscribe({
        next: (user) => {
          this.dialogRef.close();
        },
        error: (err) => {
          this.alert = {
            status: 'error',
            message: err.error?.message || err.message || err.error || err,
          };
          if (isDevMode()) console.error(err);
        },
      })
      .add(() => {
        this.loading = false;
      });
  }

  register() {}
}
