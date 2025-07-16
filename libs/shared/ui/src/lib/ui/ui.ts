import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CategoriesList } from '../categories-list/categories-list';
import { BusinessData } from '../business-data/business-data';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from '../button/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'lib-ui',
  imports: [
    CommonModule,
    CategoriesList,
    BusinessData,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    Button,
    SkeletonModule
  ],
  templateUrl: './ui.html',
  styleUrl: './ui.css',
})
export class Ui {
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
}
