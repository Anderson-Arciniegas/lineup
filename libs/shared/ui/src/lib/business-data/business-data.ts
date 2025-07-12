import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'lib-business-data',
  imports: [CommonModule, TagModule],
  templateUrl: './business-data.html',
  styleUrl: './business-data.scss',
})
export class BusinessData {}
