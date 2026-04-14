import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from '@lineup/ui';
import { TranslateModule } from '@ngx-translate/core';

/** Barra superior del admin: marca, toggle del sidebar, sin notificaciones. */
@Component({
  selector: 'app-top-nav-admin',
  imports: [CommonModule, RouterLink, Button, TranslateModule],
  templateUrl: './top-nav-admin.html',
  styleUrl: './top-nav-admin.scss',
})
export class TopNavAdmin {
  @Input() showSidebarToggle = false;
  @Input() sidebarOpen = false;
  @Output() sidebarToggle = new EventEmitter<void>();

  emitSidebarToggle(): void {
    this.sidebarToggle.emit();
  }
}
