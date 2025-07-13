import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'lib-business-data',
  imports: [CommonModule, TagModule, RippleModule, CardModule, DividerModule],
  templateUrl: './business-data.html',
  styleUrl: './business-data.scss',
})
export class BusinessData {}
