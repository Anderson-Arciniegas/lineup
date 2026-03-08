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
  BusinessService,
  CreateBusinessInput,
  PasswordValidation,
  RolesCodesEnum,
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
  selector: 'app-register-business-page',
  imports: [
    CommonModule,
    Button,
    InputTextModule,
    FloatLabelModule,
    PasswordModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register-business-page.html',
  styleUrl: './register-business-page.scss',
})
export class RegisterBusinessPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef<HTMLDivElement>;
  registerBusinessForm: FormGroup;
  attempt = false;
  attemptGoogle = false;
  private readonly _fb = inject(FormBuilder);
  private readonly _business = inject(BusinessService);
  private readonly _authService = inject(AuthService);
  private readonly _googleAuth = inject(GoogleAuthService);

  private _subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.registerBusinessForm = this._createForm();
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
      this._business
        .registerWithGoogle({ token, role: RolesCodesEnum.BUSINESS })
        .subscribe({
          next: (response) => {
            this.attemptGoogle = false;
            if (response.business) {
              this._authService.handleSuccessLogin(
                undefined,
                response.business,
              );
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
    if (this.registerBusinessForm.invalid || this.attempt) {
      return;
    }
    this.attempt = true;
    const { name, email, password } = this.registerBusinessForm.value;

    const businessData: CreateBusinessInput = {
      name,
      email,
      password,
      role: RolesCodesEnum.BUSINESS,
    };
    this._subscription.add(
      this._business.createBusiness(businessData).subscribe({
        next: (business) => {
          console.log(business);
          this.attempt = false;
          if (business) {
            this._authService.handleSuccessLogin(null, business);
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
        name: ['', [Validators.required]],
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
