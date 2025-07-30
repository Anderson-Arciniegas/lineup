import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from "@lineup/ui";
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, Button, InputTextModule, FloatLabelModule, PasswordModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  
  private readonly _fb = inject(FormBuilder);

  ngOnInit(): void {
    this.loginForm = this._createForm();
  }
  
  private _createForm(): FormGroup {
    return this._fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  } 
}
