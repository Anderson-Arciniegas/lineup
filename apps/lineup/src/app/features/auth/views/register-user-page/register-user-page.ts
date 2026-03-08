import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  UserService,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { GoogleAuthService } from '../../../../core/services/google-auth.service';

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
export class RegisterUserPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;
  registerUserForm!: FormGroup;
  attempt = false;
  attemptGoogle = false;
  private readonly _fb = inject(FormBuilder);
  private readonly _users = inject(UserService);
  private readonly _authService = inject(AuthService);
  private readonly _googleAuth = inject(GoogleAuthService);

  private _subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.registerUserForm = this._createForm();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const el = this.googleBtnRef?.nativeElement;
      if (el) {
        this._googleAuth.renderButton(el, {
          text: 'signup_with',
        });
      }
    }, 100);
    this._subscription.add(
      this._googleAuth.credential$.subscribe((token) =>
        this._handleGoogleToken(token),
      ),
    );
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

  private _handleGoogleToken(token: string): void {
    this.attemptGoogle = true;
    this._subscription.add(
      this._users
        .registerWithGoogle({ token, role: RolesCodesEnum.USER })
        .subscribe({
          next: (response) => {
            this.attemptGoogle = false;
            if (response.user) {
              this._authService.handleSuccessLogin(response.user);
            }
          },
          error: (err) => {
            console.error(err);
            this.attemptGoogle = false;
          },
        }),
    );
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
