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
  
}
