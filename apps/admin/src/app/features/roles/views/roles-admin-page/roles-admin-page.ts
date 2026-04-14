import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import type { RoleSchema } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { RolesAdminService } from '../../../../core/services/roles-admin.service';

@Component({
  selector: 'app-roles-admin-page',
  imports: [CommonModule, TranslateModule],
  templateUrl: './roles-admin-page.html',
  styleUrl: './roles-admin-page.scss',
})
export class RolesAdminPage implements OnInit {
  private readonly rolesAdmin = inject(RolesAdminService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly roles = signal<RoleSchema[]>([]);

  ngOnInit(): void {
    this.rolesAdmin.getAllRoles().subscribe({
      next: (list) => {
        this.roles.set(list ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('admin.feature.loadError');
        this.loading.set(false);
      },
    });
  }
}
