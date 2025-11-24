import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {}
