import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessSchema,
  BusinessService,
  CatalogService,
  ProductSchema,
  ProductService,
  UserService,
  UtilsService,
  VisitTypeEnum,
} from '@lineup/core';
import { ProductBreadcrumb, ProductCard, ProductInfo } from '@lineup/ui';
import { TranslateService } from '@ngx-translate/core';
import { Carousel } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-page',
  imports: [
    CommonModule,
    SkeletonModule,
    ProductBreadcrumb,
    ProductInfo,
    ProductCard,
    Carousel,
    ImageModule,
    ProgressSpinner,
  ],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
})
export class ProductPage implements OnInit {
  business: BusinessSchema;
  path: string;
  id: number;
  product: ProductSchema;
  images: string[] = [
    'assets/images/products/headphones-min.webp',
    'assets/images/products/makeup.webp',
    'assets/images/products/shoes-min.webp',
    'assets/images/products/phone-min.webp',
    'assets/images/products/skincare-min.webp',
    'assets/images/products/tomato-min.webp',
    'assets/images/products/camera.webp',
    'assets/images/products/cooler.webp',
    'assets/images/products/laptop.webp',
  ];
  attempt = false;
  responsiveOptions: any[] | undefined;
  myBusiness = false;
  private readonly _businessService = inject(BusinessService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _translate = inject(TranslateService);
  private readonly _authStore = inject(AuthStore);
  private readonly _utils = inject(UtilsService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _catalogService = inject(CatalogService);
  private readonly _productService = inject(ProductService);
  private readonly _userService = inject(UserService);

  private readonly _subscription = new Subscription();

  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 3,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 2,
        numScroll: 1,
      },
      {
        breakpoint: '767px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1,
      },
    ];

    // this.product = generateRandomProducts(1)[0];
    console.log(this.product);

    this.path = this._activatedRoute.snapshot.params['business'];
    this.id = Number(this._activatedRoute.snapshot.params['idProduct']);
    console.log(this.id);
    console.log(this.path);
    console.log('business', this._authStore.business());

    this.getBusiness();

    this.getProduct();
  }

  private getProduct(): void {
    if (this.attempt) return;
    this.attempt = true;
    this._subscription.add(
      this._productService.findOneProduct(this.id).subscribe({
        next: (product) => {
          console.log(product);
          this.product = product;
          if (product.productFiles) {
            this.images = product.productFiles.map(
              (file) => file.file?.url || '',
            );
          }
          if (!this.myBusiness) {
            this.visitProduct();
          }
          this.attempt = false;
        },
        error: (error) => {
          console.error(error);
          this.attempt = false;
        },
        complete: () => {
          console.log('complete');
          this.attempt = false;
        },
      }),
    );
  }

  private getBusiness(): void {
    this._subscription.add(
      this._businessService.getBusinessByPath(this.path).subscribe({
        next: (business) => {
          console.log(business);
          this.business = business;
          this.myBusiness =
            Number(this._authStore.business()?.id) === Number(this.business.id);
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

  onPage($event) {
    console.log('Page changed to: ', $event.page);
  }

  private visitProduct(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.product.id,
          type: VisitTypeEnum.PRODUCT,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
          },
        }),
    );
  }
}
