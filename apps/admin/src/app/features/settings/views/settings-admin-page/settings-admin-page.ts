import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings-admin-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './settings-admin-page.html',
  styleUrl: './settings-admin-page.scss',
})
export class SettingsAdminPage {}
