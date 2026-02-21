import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthStore, BusinessService } from '@lineup/core';
import { Nav, Sidebar } from '@lineup/ui';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-control-panel-layout',
  imports: [CommonModule, RouterModule, Nav, Sidebar],
  templateUrl: './control-panel-layout.html',
  styleUrl: './control-panel-layout.scss',
})
export class ControlPanelLayout implements OnInit {
  private _business = inject(BusinessService);
  private _authStore = inject(AuthStore);
  private _auth = inject(AuthService);

  // Acceder directamente a los signals
  business = this._authStore.business;

  // Computed signal para items del menú
  items = computed(() => {
    const business = this.business();
    if (!business) return [];

    return [
      {
        label: 'general.dashboard',
        icon: 'pi pi-objects-column',
        url: '/dashboard',
      },
      {
        label: 'general.profile',
        icon: 'pi pi-shop',
        url: `/${business.path}`,
      },
      {
        label: 'general.editBusiness',
        icon: 'pi pi-pencil',
        url: '/dashboard/edit',
      },
      {
        label: 'general.catalogs',
        icon: 'pi pi-book',
        url: '/dashboard/catalogs',
      },
      {
        label: 'general.socialMedias',
        icon: 'pi pi-instagram',
        url: '/dashboard/social-medias',
      },
      {
        label: 'general.locations',
        icon: 'pi pi-map-marker',
        url: '/dashboard/locations',
      },
      {
        label: 'general.followers',
        icon: 'pi pi-heart',
        url: '/dashboard/followers',
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
  });

  ngOnInit(): void {
    // Los signals se actualizan automáticamente, no necesitas suscripciones
    const business = this.business();
    if (business) {
      console.log(business);
    }
  }

  signOut() {
    this._business.logOut().subscribe((status) => {
      if (status) {
        this._auth.removeUser(true);
      }
    });
  }
}
