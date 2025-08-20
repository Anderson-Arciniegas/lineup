import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'lib-business-card',
  imports: [
    CommonModule,
    CardModule,
    ProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './business-card.html',
  styleUrl: './business-card.scss',
})
export class BusinessCard implements OnInit {
  @Input() width = 'w-40';
  @Input() height = 'h-50';
  image: string;
  imageLoaded: boolean;
  images = [
    'assets/images/vShop.jpg',
    'assets/images/business/business-1.jpg',
    'assets/images/business/business-2.jpg',
    'assets/images/business/business-3.jpg',
  ]
  
  ngOnInit(): void {
    this.image = this.images[Math.floor(Math.random() * this.images.length)];
  }
}
