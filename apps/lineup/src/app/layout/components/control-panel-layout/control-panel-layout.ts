import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BusinessService } from '@lineup/core';
import { Nav, Sidebar } from '@lineup/ui';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-control-panel-layout',
  imports: [CommonModule, RouterModule, Nav, Sidebar],
  templateUrl: './control-panel-layout.html',
  styleUrl: './control-panel-layout.scss',
})
export class ControlPanelLayout implements OnInit {
  items: MenuItem[];

  private _business = inject(BusinessService);
  private _auth = inject(AuthService);

  ngOnInit(): void {
    this.items = [
      {
        label: 'general.dashboard',
        icon: 'pi pi-home',
        url: '/dashboard',
      },
      {
        label: 'general.profile',
        icon: 'pi pi-user',
        url: '/dashboard/profile',
      },
      {
        label: 'general.followers',
        icon: 'pi pi-heart',
        url: '/dashboard/followers',
      },
      {
        label: 'general.products',
        icon: 'pi pi-box',
        url: '/dashboard/products',
      },
      {
        label: 'general.statistics',
        icon: 'pi pi-chart-bar',
        url: '/dashboard/statistics',
      },
      {
        label: 'general.settings',
        icon: 'pi pi-cog',
        url: '/dashboard/settings',
      },
      {
        label: 'general.signOut',
        icon: 'pi pi-sign-out',
        command: () => {
          this.signOut();
        },
      },
    ];
  }

  signOut() {
    this._business.logOut().subscribe((status) => {
      if (status) {
        this._auth.removeUser(true);
      }
    });
  }
}
