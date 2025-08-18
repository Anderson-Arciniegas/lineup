import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button, CatalogCarousel, ProductBreadcrumb, ProductCard } from "@lineup/ui";
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";

@Component({
  selector: 'app-catalog-page',
  imports: [CommonModule, ProductBreadcrumb, ProductCard, Button, IconField, InputIcon, CatalogCarousel],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export class CatalogPage {
  business = { name: 'Tu Punto vShop', image: 'assets/images/vShop.jpg' };
  bgColor: string | undefined;

  setColor($event: string) {
    console.log('Color emitido:', $event);

    const color1 = $event;
    const color2 = 'rgba(255, 255, 255, 0.5)'; // Color de fondo

    this.bgColor = `linear-gradient(to bottom, ${color1}, ${color2})`;
  }
}
