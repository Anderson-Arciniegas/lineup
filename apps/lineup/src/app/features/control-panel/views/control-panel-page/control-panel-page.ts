import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  AuthStore,
  BusinessSchema,
  BusinessPrivateService,
  CatalogPrivateService,
} from '@lineup/core';
import { ProductCard } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';
import { Card } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-control-panel-page',
  imports: [CommonModule, TranslateModule, ProgressSpinner, Card, ProductCard],
  templateUrl: './control-panel-page.html',
  styleUrl: './control-panel-page.scss',
})
export class ControlPanelPage implements OnInit {
  business: BusinessSchema;
  attempt = false;
  path: string;
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _businessService = inject(BusinessPrivateService);
  private readonly _authStore = inject(AuthStore);

  ngOnInit(): void {
    this.path = this._authStore.business().path;

    this.getBusiness();
  }

  getBusiness(): void {
    if (this.attempt) return;
    this.attempt = true;
    this._businessService.getBusinessByPath(this.path).subscribe({
      next: (business) => {
        console.log(business);
        this.business = business;
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        console.log('complete');
        this.attempt = false;
      },
    });
  }
}
