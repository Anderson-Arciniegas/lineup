import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  BusinessData,
  CatalogCard,
  CreateCatalogCard,
  ProductBreadcrumb,
} from '@lineup/ui';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-edit-business-page',
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
  templateUrl: './edit-business-page.html',
  styleUrl: './edit-business-page.scss',
})
export class EditBusinessPage {
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
  business: any;
}
