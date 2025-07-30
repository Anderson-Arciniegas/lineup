import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from "@lineup/ui";
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-register-business-page',
  imports: [CommonModule, Button, InputTextModule, FloatLabelModule, PasswordModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './register-business-page.html',
  styleUrl: './register-business-page.scss',
})
export class RegisterBusinessPage implements OnInit {
  registerBusinessForm: FormGroup;
  businessDataForm: FormGroup;
  private readonly _fb = inject(FormBuilder);
  
  ngOnInit(): void {
    this.registerBusinessForm = this._createForm();
    this.businessDataForm = this._createBusinessDataForm();
  }
  
  private _createForm(): FormGroup {
    return this._fb.group({
      username: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      email: ['',  [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern(/^(?=.{8,}$)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*\W).*$/)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }
  
  private _createBusinessDataForm(): FormGroup {
    return this._fb.group({
      businessName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      businessPhone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      businessAddress: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      businessInstagram: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]]
    });
  }
}
