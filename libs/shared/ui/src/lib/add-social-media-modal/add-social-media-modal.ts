import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { Button } from '../button/button';

@Component({
  selector: 'lib-add-social-media-modal',
  imports: [
    CommonModule,
    DialogModule,
    FormsModule,
    TranslateModule,
    Button,
    ReactiveFormsModule,
  ],
  templateUrl: './add-social-media-modal.html',
  styleUrl: './add-social-media-modal.scss',
})
export class AddSocialMediaModal implements OnInit {
  @Input() socialMedia: any;
  socialMediaForm: FormGroup;

  private readonly _fb = inject(FormBuilder);

  ngOnInit(): void {
    this.socialMediaForm = this._fb.group({
      username: ['', [Validators.required]],
      url: ['', [Validators.required]],
    });
    console.log(this.socialMedia);
  }

  saveSocialMedia() {
    console.log(this.socialMediaForm.value);
  }
}
