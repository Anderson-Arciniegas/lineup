import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { generateRandomProducts, Product, ProductSchema } from '@lineup/core'; // Ajusta @your-org según tu scope
import { FastAverageColor } from 'fast-average-color';
import { Carousel } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { CatalogCarouselItem } from '../catalog-carousel-item/catalog-carousel-item';

@Component({
  selector: 'lib-catalog-carousel',
  imports: [CommonModule, Carousel, ImageModule, CatalogCarouselItem],
  templateUrl: './catalog-carousel.html',
  styleUrl: './catalog-carousel.scss',
})
export class CatalogCarousel implements OnInit, AfterViewInit {
  @Input() products: ProductSchema[] = [];
  @Input() predefinedColor: boolean;
  @Input() useLightText?: boolean;
  @Output() setColor = new EventEmitter<string>();
  responsiveOptions: any[] | undefined;

  productsExamples: Product[] = [];
  bgColor: string | undefined;
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

  private _cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 1,
        numScroll: 1,
      },
      {
        breakpoint: '1199px',
        numVisible: 1,
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

    this.productsExamples = generateRandomProducts(10);
    this.productsExamples.forEach((product, index) => {
      product.image = this.images[index % this.images.length];
    });
  }

  ngAfterViewInit(): void {
    this.onPage({ page: 0 });
  }

  onPage($event: any) {
    console.log(this.predefinedColor);
    if (!this.predefinedColor) {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // ← ESTO ES CRÍTICO
      img.src =
        this.products[$event.page].productFiles[0].file?.url +
          '?t=' +
          Date.now() || '';

      img.onload = async () => {
        const fac = new FastAverageColor();

        fac.getColorAsync(img).then((color) => {
          const rgba = color.rgba.replace(/[\d.]+\)$/g, '0.5)');
          this.bgColor = rgba;
          console.log(this.bgColor);
          this.setColor.emit(this.bgColor);
          this._cdr.detectChanges();
        });
      };
    }
  }
}
