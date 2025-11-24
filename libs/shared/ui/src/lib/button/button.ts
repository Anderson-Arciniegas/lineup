import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'lib-button',
  imports: [CommonModule, ButtonModule, RouterModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() label: string;
  @Input() icon: string;
  @Input() loading = false;
  @Input() disabled = false;
  @Input() link: string;
  @Input() href: string;
  @Input() linkType = false;
  @Input() color:
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast';
  @Input() type: 'raised' | 'rounded';
  @Input() variant: 'text' | 'outlined';
  @Input() badge: string;
  @Input() buttonType: 'submit' | 'button' | 'reset';
  @Input() size: 'small' | 'large';
  @Input() fontSize = 'text-base';
  @Input() width = 'w-auto';
  @Input() target: '_self' | '_blank' | null = null;
  @Output() action = new EventEmitter<any>(); //eslint-disable-line
}
