import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Nav, Sidebar } from '@lineup/ui';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-control-panel-layout',
  imports: [CommonModule, RouterModule, Nav, Sidebar],
  templateUrl: './control-panel-layout.html',
  styleUrl: './control-panel-layout.scss',
})
export class ControlPanelLayout implements OnInit {
  items: MenuItem[];

  ngOnInit(): void {
    this.items = [
      {
        label: 'general.dashboard',
        icon: 'pi pi-home',
        url: '/control-panel',
      },
      {
        label: 'general.profile',
        icon: 'pi pi-user',
        url: '/control-panel/profile',
      },
      {
        label: 'general.followers',
        icon: 'pi pi-user',
        url: '/control-panel/followers',
      },
      {
        label: 'general.products',
        icon: 'pi pi-user',
        url: '/control-panel/products',
      },
      {
        label: 'general.statistics',
        icon: 'pi pi-heart',
        url: '/control-panel/statistics',
      },
      {
        label: 'general.settings',
        icon: 'pi pi-cog',
        url: '/profile/settings',
      },
      {
        label: 'general.signOut',
        icon: 'pi pi-sign-out',
        url: '/profile/sign-out',
        command: () => {
          this.signOut();
        },
      },
    ];
  }

  signOut() {
    console.log('Sign out logic here');
  }
}
