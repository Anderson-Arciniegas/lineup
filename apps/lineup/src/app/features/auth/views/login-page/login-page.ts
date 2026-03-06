import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BusinessService, UserService } from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    Button,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm: FormGroup;
  attempt = false;
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);
  private _users = inject(UserService);
  private _business = inject(BusinessService);

  private _subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.loginForm = this._createForm();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.attempt) {
      return;
    }
    this.attempt = true;
    this._subscription.add(
      this._users
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (user) => {
            console.log(user);
            if (user) {
              this._authService.handleSuccessLogin(user);
            }
            this.attempt = false;
          },
          error: (error) => {
            console.log(error);
            this.loginBusiness();
          },
        }),
    );
  }

  loginBusiness(): void {
    this._subscription.add(
      this._business
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .subscribe({
          next: (business) => {
            console.log(business);
            this.attempt = false;
            if (business) {
              this._authService.handleSuccessLogin(null, business);
            }
          },
          error: (error) => {
            console.log(error);
            this.attempt = false;
          },
        }),
    );
  }

  private _createForm(): FormGroup {
    return this._fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }
}
