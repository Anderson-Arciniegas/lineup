import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
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
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  attempt = false;
  private readonly _fb = inject(FormBuilder);
  private readonly _authService = inject(AuthService);

  ngOnInit(): void {
    this.loginForm = this._createForm();
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.attempt) {
      return;
    }
    this.attempt = true;
    this._authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log(response);
        this.attempt = false;
      },
      error: (error) => {
        console.error(error);
        this.attempt = false;
      },
    });
  }

  private _createForm(): FormGroup {
    return this._fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }
}
