import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { PanelMenuModule } from 'primeng/panelmenu';

const MIN_THUMB_SIZE = 32;

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
export class Sidebar implements AfterViewInit, OnDestroy {
  @Input() items: MenuItem[];
  /** Si es `true`, el menú muestra solo iconos (sin etiquetas) a todos los anchos. */
  @Input() iconOnly = false;
  /** Panel estrecho encima del contenido: siempre muestra etiquetas y alineación tipo escritorio. */
  @Input() overlayMode = false;

  private readonly scrollContainer =
    viewChild.required<ElementRef<HTMLElement>>('scrollContainer');

  protected readonly hasScrollbar = signal(false);
  protected readonly thumbHeight = signal(0);
  protected readonly thumbTop = signal(0);

  private resizeObserver?: ResizeObserver;
  private observedContent?: Element;

  ngAfterViewInit(): void {
    const element = this.scrollContainer().nativeElement;
    this.resizeObserver = new ResizeObserver(() => this.sync());
    this.resizeObserver.observe(element);
    this.sync();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  protected onScroll(): void {
    this.sync();
  }

  private sync(): void {
    const element = this.scrollContainer().nativeElement;
    const content = element.firstElementChild;
    if (content && content !== this.observedContent) {
      if (this.observedContent) {
        this.resizeObserver?.unobserve(this.observedContent);
      }
      this.resizeObserver?.observe(content);
      this.observedContent = content;
    }

    const viewport = element.clientHeight;
    const scrollHeight = element.scrollHeight;
    const scrollable = scrollHeight - viewport;

    if (scrollable <= 1) {
      this.hasScrollbar.set(false);
      return;
    }

    const thumb = Math.max(MIN_THUMB_SIZE, (viewport * viewport) / scrollHeight);
    const maxTop = viewport - thumb;
    this.thumbHeight.set(thumb);
    this.thumbTop.set((element.scrollTop / scrollable) * maxTop);
    this.hasScrollbar.set(true);
  }
}
