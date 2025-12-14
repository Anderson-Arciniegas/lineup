import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CreateUserInput,
  PasswordValidation,
  RolesCodesEnum,
  UserGraphqlService,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'apps/lineup/src/app/core/services/auth.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register-user-page',
  imports: [
    CommonModule,
    Button,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-user-page.html',
  styleUrl: './register-user-page.scss',
})
export class RegisterUserPage implements OnInit, OnDestroy {
  registerUserForm!: FormGroup;
  attempt = false;
  private readonly _fb = inject(FormBuilder);
  private _users = inject(UserGraphqlService);
  private readonly _authService = inject(AuthService);

  private _subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.registerUserForm = this._createForm();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  onSubmit(): void {
    if (this.registerUserForm.invalid || this.attempt) {
      return;
    }
    this.attempt = true;
    const { firstName, lastName, email, password } =
      this.registerUserForm.value;

    const userData: CreateUserInput = {
      firstName,
      lastName,
      email,
      password,
      role: RolesCodesEnum.USER,
    };
    this._subscription.add(
      this._users.createUser(userData).subscribe({
        next: (user) => {
          console.log(user);
          this.attempt = false;
          if (user) {
            this._authService.handleSuccessLogin(user);
          }
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          this.attempt = false;
        },
      }),
    );
  }

  private _createForm(): FormGroup {
    const formOptions: AbstractControlOptions = {
      validators: [PasswordValidation.MatchPassword],
    };
    return this._fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            Validators.pattern(
              /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/,
            ),
          ],
        ],
        confirmPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            Validators.pattern(
              /^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/,
            ),
          ],
        ],
      },
      formOptions,
    );
  }
}
