import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

/**
 * Menú lateral con ítems en `RouterLink`.
 * El layout interno permanece expandido; el dock recorta el panel al animar el ancho.
 */
@Component({
  selector: 'lib-sidebar',
  imports: [
    CommonModule,
    PanelMenuModule,
    TranslateModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() items: MenuItem[];
  /** Si es `true`, el menú muestra solo iconos (sin etiquetas) a todos los anchos. */
  @Input() iconOnly = false;
  /** Panel estrecho encima del contenido: siempre muestra etiquetas y alineación tipo escritorio. */
  @Input() overlayMode = false;
}
