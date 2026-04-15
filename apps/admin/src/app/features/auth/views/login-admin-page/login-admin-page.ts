import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { finalize } from 'rxjs';
import { ADMIN_ROUTE_SEGMENTS } from '../../../../core/admin-routes';
import { AuthAdminService } from '../../../../core/services/auth-admin.service';

/**
 * Login del admin: mutación `login`, hidrata sesión (`me` si hay usuario) vía `AuthAdminService`,
 * luego navega al dashboard si `status` es correcto (flujo alineado con lineup).
 */
@Component({
  selector: 'app-login-admin-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    Button,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
  ],
  templateUrl: './login-admin-page.html',
  styleUrl: './login-admin-page.scss',
})
export class LoginAdminPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authAdmin = inject(AuthAdminService);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  attempt = false;

  onSubmit(): void {
    if (this.loginForm.invalid || this.attempt) {
      return;
    }
    this.attempt = true;
    const { email, password } = this.loginForm.value;
    this.authAdmin
      .login(email, password)
      .pipe(finalize(() => (this.attempt = false)))
      .subscribe({
        next: (res) => {
          if (res.status) {
            void this.router.navigate(['/', ADMIN_ROUTE_SEGMENTS.dashboard]);
          }
        },
      });
  }
}
