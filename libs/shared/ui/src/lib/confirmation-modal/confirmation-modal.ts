import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from '../button/button';

/**
 * Diálogo de confirmación genérico: mensaje y tono de botón desde `DynamicDialogConfig.data`.
 */
@Component({
  selector: 'lib-confirmation-modal',
  imports: [CommonModule, DialogModule, TranslateModule, Button],
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss',
})
export class ConfirmationModal implements OnInit {
  message: string;
  color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast' = 'primary';
  private readonly ref = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  /** Lee `message` y `color` del `DynamicDialogConfig` al abrir el modal. */
  ngOnInit(): void {
    this.message = this.config.data?.message;
    this.color = this.config.data?.color;
  }

  /** Cierra el diálogo devolviendo `false`. */
  cancel() {
    this.ref.close(false);
  }

  /** Cierra el diálogo devolviendo `true`. */
  confirm() {
    this.ref.close(true);
  }
}
