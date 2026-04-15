import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard-admin-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './dashboard-admin-page.html',
  styleUrl: './dashboard-admin-page.scss',
})
export class DashboardAdminPage {}
