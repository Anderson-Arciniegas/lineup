import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-user-settings-page',
  imports: [CommonModule, TranslateModule, Button],
  templateUrl: './user-settings-page.html',
  styleUrl: './user-settings-page.scss',
})
export class UserSettingsPage {}
