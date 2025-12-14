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
  BusinessService,
  CreateBusinessInput,
  PasswordValidation,
  RolesCodesEnum,
} from '@lineup/core';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'apps/lineup/src/app/core/services/auth.service';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Subscription } from 'rxjs';

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
export class RegisterBusinessPage implements OnInit, OnDestroy {
  registerBusinessForm: FormGroup;
  attempt = false;
  private readonly _fb = inject(FormBuilder);
  private readonly _business = inject(BusinessService);
  private readonly _authService = inject(AuthService);

  private _subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.registerBusinessForm = this._createForm();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
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
