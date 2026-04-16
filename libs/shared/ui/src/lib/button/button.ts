import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

/**
 * Envoltorio sobre PrimeNG Button con soporte de navegación (`routerLink`, `href`),
 * estados de carga/deshabilitado, variantes visuales y emisión de evento `action` en clics.
 */
@Component({
  selector: 'lib-button',
  imports: [CommonModule, ButtonModule, RouterModule, TranslateModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() label: string;
  @Input() ariaLabel: string;
  @Input() icon: string;
  @Input() loading = false;
  @Input() disabled = false;
  @Input() link: string;
  @Input() href: string;
  @Input() linkType = false;
  @Input() color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast' = 'primary';
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
