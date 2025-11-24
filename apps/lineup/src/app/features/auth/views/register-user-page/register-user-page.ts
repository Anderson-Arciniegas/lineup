import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

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
export class RegisterUserPage implements OnInit {
  registerUserForm!: FormGroup;
  attempt = false;
  private readonly _fb = inject(FormBuilder);
  private _users = inject(UserGraphqlService);

  ngOnInit(): void {
    this.registerUserForm = this._createForm();
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
    this._users.createUser(userData).subscribe({
      next: (user) => {
        console.log(user);
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.attempt = false;
      },
    });
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
