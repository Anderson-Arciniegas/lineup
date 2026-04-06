import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Nav, Sidebar } from '@lineup/ui';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-layout',
  imports: [CommonModule, RouterModule, Nav, Sidebar],
  templateUrl: './user-layout.html',
  styleUrl: './user-layout.scss',
})
export class UserLayout implements OnInit {
  items: MenuItem[];

  private _auth = inject(AuthService);

  ngOnInit(): void {
    this.items = [
      {
        label: 'general.dashboard',
        icon: 'pi pi-objects-column',
        url: '/profile',
      },
      {
        label: 'general.profile',
        icon: 'pi pi-user',
        url: '/profile/edit',
      },
      {
        label: 'general.wishlist',
        icon: 'pi pi-heart',
        url: '/profile/wishlist',
      },
      {
        label: 'general.favorites',
        icon: 'pi pi-shop',
        url: '/profile/favorites',
      },
      {
        label: 'general.ratings',
        icon: 'pi pi-star',
        url: '/profile/my-ratings',
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
    this._auth.signOut();
  }
}
