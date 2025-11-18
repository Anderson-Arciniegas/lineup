import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Nav, Sidebar } from '@lineup/ui';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-user-layout',
  imports: [CommonModule, RouterModule, Nav, Sidebar],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.scss',
})
export class UserLayout implements OnInit {
  items: MenuItem[];

  ngOnInit(): void {
    this.items = [
      {
        label: 'general.profile',
        icon: 'pi pi-user',
        url: '/user',
      },
      {
        label: 'general.favorites',
        icon: 'pi pi-heart',
        url: '/user/favorites',
      },
      {
        label: 'general.settings',
        icon: 'pi pi-cog',
        url: '/user/settings',
      },
      {
        label: 'general.signOut',
        icon: 'pi pi-sign-out',
        url: '/user/sign-out',
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
