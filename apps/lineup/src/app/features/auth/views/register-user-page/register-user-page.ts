import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from "@lineup/ui";
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-register-user-page',
  imports: [CommonModule, Button, InputTextModule, FloatLabelModule, PasswordModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './register-user-page.html',
  styleUrl: './register-user-page.scss',
})
export class RegisterUserPage implements OnInit {
  registerUserForm: FormGroup;
  private readonly _fb = inject(FormBuilder);
  
  ngOnInit(): void {
    this.registerUserForm = this._createForm();
  }
  
  private _createForm(): FormGroup {
    return this._fb.group({
      username: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      email: ['',  [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
}
