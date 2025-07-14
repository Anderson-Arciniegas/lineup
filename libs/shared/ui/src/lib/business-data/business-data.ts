import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'lib-business-data',
  imports: [CommonModule, TagModule, RippleModule, CardModule, DividerModule],
  templateUrl: './business-data.html',
  styleUrl: './business-data.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BusinessData {}
