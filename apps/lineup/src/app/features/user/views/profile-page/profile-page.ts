import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-profile-page',
  imports: [
    CommonModule,
    FloatLabelModule,
    InputTextModule,
    TranslateModule,
    Button,
    InputMaskModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {
  private readonly _fb = inject(FormBuilder);

  readonly profileForm = this._fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required]],
    phone: [''],
    state: ['', [Validators.required]],
    city: ['', [Validators.required]],
    address: [''],
  });
}
