import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { Button } from '../button/button';

@Component({
  selector: 'lib-business-data',
  imports: [
    CommonModule,
    TagModule,
    ChipModule,
    Button,
  ],
  templateUrl: './business-data.html',
  styleUrl: './business-data.scss',
})
export class BusinessData {}
