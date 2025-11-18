import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { Button } from '../button/button';

@Component({
  selector: 'lib-business-data',
  imports: [CommonModule, TagModule, Button],
  templateUrl: './business-data.html',
  styleUrl: './business-data.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class BusinessData {
  @Input() editMode: boolean;
  editUrl = '/business-1/edit';
}
