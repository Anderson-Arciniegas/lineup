import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
import { ProductSchema } from '@lineup/core';
import { FastAverageColor } from 'fast-average-color';
import { Carousel } from 'primeng/carousel';
import { ImageModule } from 'primeng/image';
import { CatalogCarouselItem } from '../catalog-carousel-item/catalog-carousel-item';

/**
 * Carrusel de productos de un catálogo: color de fondo dinámico por color medio de la imagen activa (`FastAverageColor`).
 */
@Component({
  selector: 'lib-catalog-carousel',
  imports: [CommonModule, Carousel, ImageModule, CatalogCarouselItem],
  templateUrl: './catalog-carousel.html',
  styleUrl: './catalog-carousel.scss',
})
export class CatalogCarousel implements AfterViewInit {
  @Input() products: ProductSchema[] = [];
  @Input() predefinedColor: boolean;
  @Input() useLightText?: boolean;
  @Output() setColor = new EventEmitter<string>();
  responsiveOptions = [
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
  bgColor: string | undefined;

  private _cdr = inject(ChangeDetectorRef);

  /** Dispara cálculo de color para la primera página visible. */
  ngAfterViewInit(): void {
    this.onPage({ page: 0 });
  }

  /** Al cambiar de slide, muestrea la imagen del producto y emite color de fondo semitransparente. */
  onPage($event: any) {
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
          this.setColor.emit(this.bgColor);
          this._cdr.detectChanges();
        });
      };
    }
  }
}
