import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessSchema,
  BusinessService,
  CatalogSchema,
  CatalogService,
  UserService,
  UtilsService,
  VisitTypeEnum,
} from '@lineup/core';
import {
  BusinessData,
  CatalogCard,
  CreateCatalogCard,
  ProductBreadcrumb,
} from '@lineup/ui';
import { TranslateService } from '@ngx-translate/core';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-business-page',
  imports: [
    CommonModule,
    BusinessData,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SkeletonModule,
    CatalogCard,
    ProductBreadcrumb,
    CreateCatalogCard,
  ],
  templateUrl: './business-page.html',
  styleUrl: './business-page.scss',
})
export class BusinessPage implements OnInit {
  public readonly categories = [
    { id: 1, name: 'All' },
    { id: 2, name: 'Camisas' },
    { id: 3, name: 'Pantalones' },
    { id: 4, name: 'Chaquetas' },
    { id: 5, name: 'Zapatos' },
    { id: 6, name: 'Accesorios' },
    { id: 7, name: 'Ropa Interior' },
  ];
  value: '';
  business: BusinessSchema;
  myBusiness = false;
  path: string;
  catalogs: CatalogSchema[] = [];

  private readonly _businessService = inject(BusinessService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _utils = inject(UtilsService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _catalogService = inject(CatalogService);
  private readonly _userService = inject(UserService);

  private readonly _subscription = new Subscription();

  ngOnInit(): void {
    this.path = this._activatedRoute.snapshot.params['business'];
    console.log(this.path);
    console.log('business', this._authStore.business());

    this.getBusiness();
    this.getCatalogs();
  }

  private getBusiness(): void {
    this._subscription.add(
      this._businessService.getBusinessByPath(this.path).subscribe({
        next: (business) => {
          console.log(business);
          this.business = business;
          this.myBusiness =
            Number(this._authStore.business()?.id) === Number(this.business.id);
          if (!this.myBusiness) {
            this.visitBusiness();
          }
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          console.log('complete');
        },
      }),
    );
  }

  private visitBusiness(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.business.id,
          type: VisitTypeEnum.BUSINESS,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
          },
        }),
    );
  }

  private getCatalogs(): void {
    this._subscription.add(
      this._catalogService.findAllMyCatalogs({ page: 1, limit: 10 }).subscribe({
        next: (response) => {
          console.log(response);
          this.catalogs = response.items;
          console.log(this.catalogs);
        },
        error: (error) => {
          console.error(error);
        },
        complete: () => {
          console.log('complete');
        },
      }),
    );
  }
}
