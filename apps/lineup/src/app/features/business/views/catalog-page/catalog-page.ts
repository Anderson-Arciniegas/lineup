import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  viewChild,
  viewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  BusinessPublicService,
  BusinessSchema,
  CatalogPrivateService,
  CatalogPublicService,
  CatalogSchema,
  ProductPublicService,
  ProductSchema,
  UserPublicService,
  VisitTypeEnum,
} from '@lineup/core';
import { environment } from '@lineup/envs';
import {
  Button,
  CatalogCarousel,
  CreateProductCard,
  ProductBreadcrumb,
  ProductCard,
  ProductExpandedItem,
  SearchBar,
  ShareModal,
} from '@lineup/ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MessageService } from 'primeng/api';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { ProgressSpinner } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-catalog-page',
  imports: [
    CommonModule,
    ProductBreadcrumb,
    ProductCard,
    Button,
    IconField,
    InputIcon,
    CatalogCarousel,
    CreateProductCard,
    ProgressSpinner,
    SearchBar,
    InfiniteScrollDirective,
    TranslateModule,
    SelectButtonModule,
    FormsModule,
    ProductExpandedItem,
    PopoverModule,
    ColorPickerModule,
    InputTextModule,
  ],
  templateUrl: 'catalog-page.html',
  styleUrls: ['./catalog-page.scss'],
})
export class CatalogPage implements OnInit {
  business: BusinessSchema;
  catalog: CatalogSchema;
  /** Degradado vertical (misma lógica que business-page). */
  pageBackgroundGradient = '';
  /** Texto claro sobre fondo oscuro en la franja superior del degradado. */
  isDarkBackground = false;

  private static readonly _GRADIENT_TOP_LIGHTEN = 0.25;
  private static readonly _GRADIENT_BOTTOM_LIGHTEN = 0.6;
  private static readonly _LUMINANCE_THRESHOLD = 0.45;

  path: string;
  catalogPath: string;
  products: ProductSchema[] = [];
  primaryProducts: ProductSchema[] = [];
  attempt = false;
  productsAttempt = false;
  primaryProductsAttempt = false;
  page = 1;
  noMoreResults = false;
  myBusiness = false;
  searchQuery = '';
  layoutMode = 'Grid';
  layoutOptions = [
    { index: 0, icon: 'pi pi-th-large', label: 'Grid', value: 'Grid' },
    { index: 1, icon: 'pi pi-list', label: 'List', value: 'List' },
  ];
  pdfExportAttempt = false;
  color = '#ffffff';
  attemptColor = false;
  allProductsMode = true;
  ref: DynamicDialogRef | undefined;
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _businessPublicService = inject(BusinessPublicService);
  private readonly _catalogPublicService = inject(CatalogPublicService);
  private readonly _catalogService = inject(CatalogPrivateService);
  private readonly _productPublicService = inject(ProductPublicService);

  private readonly _authStore = inject(AuthStore);
  private readonly _userService = inject(UserPublicService);
  private readonly _dialogService = inject(DialogService);
  private readonly _translate = inject(TranslateService);
  private readonly _messageService = inject(MessageService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private _subscription: Subscription = new Subscription();

  private readonly _catalogPdfRoot =
    viewChild<ElementRef<HTMLElement>>('catalogPdfRoot');
  private readonly _pdfPages = viewChildren<ElementRef<HTMLElement>>('pdfPage');

  /** Detecta el breakpoint Tailwind activo según el ancho del viewport. */
  private getTailwindBreakpoint(): 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' {
    const w = document.documentElement.clientWidth;
    if (w >= 1536) return 'xxl';
    if (w >= 1280) return 'xl';
    if (w >= 1024) return 'lg';
    if (w >= 768) return 'md';
    if (w >= 640) return 'sm';
    return 'xs';
  }

  /**
   * Devuelve cuántos productos caben en una hoja A4 sin cortarse,
   * según el breakpoint activo y el modo de layout.
   *
   * Grid   – xxl: 5×2=10 | xl: 4×2=8 | lg: 3×3=9 | md/sm: 2×2=4 | xs: 1
   * List   – xxl: 4       | xl: 3      | lg: 2      | md/sm/xs: 1
   */
  private getPdfProductsPerPage(): number {
    const bp = this.getTailwindBreakpoint();
    if (this.layoutMode === 'Grid') {
      // Siempre 2 filas por página; columnas: xxl→5, xl→4, lg→3, md/sm→2, xs→1
      switch (bp) {
        case 'xxl': return 10; // 2 × 5
        case 'xl':  return 8;  // 2 × 4
        case 'lg':  return 6;  // 2 × 3
        case 'md':
        case 'sm':  return 4;  // 2 × 2
        default:    return 2;  // 2 × 1
      }
    } else {
      // List mode: siempre 2 productos por página.
      // xs (<640 px) mantiene 1 porque el viewport no admite 2 items sin recorte.
      if (bp === 'xs') return 1;
      if (bp === 'xxl' || bp === 'xl') return 3;
      return 2;
    }
  }

  /** Productos agrupados en páginas PDF según el breakpoint y modo de layout. */
  get pdfProductPageChunks(): ProductSchema[][] {
    const perPage = this.getPdfProductsPerPage();
    if (this.products.length === 0) return [[]];
    const chunks: ProductSchema[][] = [];
    for (let i = 0; i < this.products.length; i += perPage) {
      chunks.push(this.products.slice(i, i + perPage));
    }
    return chunks;
  }

  /**
   * Altura de la card de producto en modo PDF (Grid).
   * Con solo 2 filas por página, h-100 (400 px) cabe en A4 a todos los breakpoints.
   */
  get pdfCardHeight(): string {
    return 'h-100';
  }

  /**
   * Altura mínima de cada #pdfPage para que cubra exactamente una hoja A4.
   * Proporcional al ancho del viewport según la orientación activa.
   * Grid xxl/xl → landscape (210/297); resto → portrait (297/210).
   */
  get pdfPageMinHeight(): string {
    const bp = this.getTailwindBreakpoint();
    const isLandscape = this.layoutMode === 'Grid' && (bp === 'xxl' || bp === 'xl');
    const w = document.documentElement.clientWidth;
    const ratio = isLandscape ? 210 / 297 : 297 / 210;
    return `${Math.round(w * ratio)}px`;
  }

  ngOnInit(): void {
    this.path = this._activatedRoute.snapshot.params['business'];
    this.catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    this.getBusiness();
    this.getCatalog();
  }

  private getBusiness(): void {
    this._subscription.add(
      this._businessPublicService.findBusinessByPath(this.path).subscribe({
        next: (business) => {
          this.business = business;
          this.myBusiness =
            Number(this._authStore.business()?.id) === Number(this.business.id);
          if (this.catalog) {
            if (this.catalog.hexColor) {
              this.setColor(this.catalog.hexColor);
            } else if (this.business.hexColor) {
              this.setColor(this.business.hexColor);
            }
          }
        },
      }),
    );
  }

  /** Contraste para bloques sobre el degradado (título, carrusel, búsqueda). */
  get brandToneLight(): boolean {
    return !!this.pageBackgroundGradient && this.isDarkBackground;
  }

  get brandToneDark(): boolean {
    return !!this.pageBackgroundGradient && !this.isDarkBackground;
  }

  onLayoutModeChange(event: any): void {
    console.log(event);
    // this.layoutMode = event.value;
    console.log(this.layoutMode);
  }

  onSearchSubmit(query: string): void {
    console.log(query);
    this.searchQuery = query;
    this.products = [];
    this.page = 1;
    this.noMoreResults = false;
    this.getProducts();
  }

  private getCatalog(): void {
    if (this.attempt) return;
    this.attempt = true;
    this._subscription.add(
      this._catalogPublicService
        .findOneCatalogByPath(this.catalogPath)
        .subscribe({
          next: (catalog) => {
            this.catalog = catalog;
            this.attempt = false;
            console.log(this.catalog);
            this.getProducts();
            this.getPrimaryProducts();
            if (!this.myBusiness) {
              this.visitCatalog();
            }

            if (this.catalog.hexColor) {
              this.setColor(this.catalog.hexColor);
            } else if (this.business && this.business.hexColor) {
              this.setColor(this.business.hexColor);
            }
          },
          error: (error) => {
            console.error(error);
            this.attempt = false;
          },
          complete: () => {
            console.log('complete');
            this.attempt = false;
          },
        }),
    );
  }

  private visitCatalog(): void {
    this._subscription.add(
      this._userService
        .recordVisit({
          id: this.catalog.id,
          type: VisitTypeEnum.CATALOG,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
          },
        }),
    );
  }

  getProducts(): void {
    if (!isPlatformBrowser(this._platformId)) return;
    if (this.productsAttempt || this.noMoreResults) return;
    this.productsAttempt = true;
    this._subscription.add(
      this._productPublicService
        .getAllByCatalogPaginated(this.catalog.id, {
          page: this.page,
          limit: 20,
          search: this.searchQuery,
        })
        .subscribe({
          next: (products) => {
            console.log(products);
            this.productsAttempt = false;
            this.products = [
              ...this.products,
              ...products.items,
              ...products.items,
              ...products.items,
            ];
            this.page++;
            if (products.items.length === 0) {
              this.noMoreResults = true;
            }
          },
          error: (error) => {
            console.error(error);
            this.productsAttempt = false;
          },
          complete: () => {
            console.log('complete');
            this.productsAttempt = false;
          },
        }),
    );
  }

  private getPrimaryProducts(): void {
    if (this.primaryProductsAttempt || this.noMoreResults) return;
    this.primaryProductsAttempt = true;
    this._subscription.add(
      this._productPublicService
        .getAllPrimaryProductsByBusiness({
          idBusiness: this.business.id,
          idCatalog: this.catalog.id,
        })
        .subscribe({
          next: (products) => {
            this.primaryProductsAttempt = false;
            console.log(products);
            this.primaryProducts = products;
          },
          error: (error) => {
            console.error(error);
            this.primaryProductsAttempt = false;
          },
        }),
    );
  }

  setColor(raw: string): void {
    this.color = raw;
    const rgb = CatalogPage.parseColorToRgb(raw);
    if (!rgb) {
      return;
    }
    const top = CatalogPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      CatalogPage._GRADIENT_TOP_LIGHTEN,
    );
    const bottom = CatalogPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      CatalogPage._GRADIENT_BOTTOM_LIGHTEN,
    );
    this.pageBackgroundGradient = `linear-gradient(to bottom, rgba(${top.r}, ${top.g}, ${top.b}, 1), rgba(${bottom.r}, ${bottom.g}, ${bottom.b}, 1))`;
    const luminance = CatalogPage.relativeLuminance(top.r, top.g, top.b);
    this.isDarkBackground = luminance < CatalogPage._LUMINANCE_THRESHOLD;
  }

  private static clampByte(n: number): number {
    return Math.max(0, Math.min(255, Math.round(n)));
  }

  private static parseColorToRgb(
    input: string,
  ): { r: number; g: number; b: number } | null {
    const s = input?.trim();
    if (!s) {
      return null;
    }

    const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
    if (hex) {
      let h = hex[1];
      if (h.length === 3) {
        h = h
          .split('')
          .map((c) => c + c)
          .join('');
      }
      const n = parseInt(h, 16);
      return {
        r: (n >> 16) & 255,
        g: (n >> 8) & 255,
        b: n & 255,
      };
    }

    const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(s);
    if (rgb) {
      return {
        r: CatalogPage.clampByte(Number(rgb[1])),
        g: CatalogPage.clampByte(Number(rgb[2])),
        b: CatalogPage.clampByte(Number(rgb[3])),
      };
    }

    return null;
  }

  private static lightenRgb(
    r: number,
    g: number,
    b: number,
    amount: number,
  ): { r: number; g: number; b: number } {
    const t = Math.max(0, Math.min(1, amount));
    return {
      r: CatalogPage.clampByte(r + (255 - r) * t),
      g: CatalogPage.clampByte(g + (255 - g) * t),
      b: CatalogPage.clampByte(b + (255 - b) * t),
    };
  }

  private static relativeLuminance(r: number, g: number, b: number): number {
    const linear = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  onScroll(): void {
    console.log('onScroll');
    if (this.allProductsMode) {
      return;
    }
    this.getProducts();
  }

  async downloadCatalog(): Promise<void> {
    if (!isPlatformBrowser(this._platformId) || !this.catalog) {
      return;
    }
    const host = this._catalogPdfRoot()?.nativeElement;
    if (!host) {
      return;
    }

    const prevScrollX = window.scrollX;
    const prevScrollY = window.scrollY;
    const prevProducts = this.products;

    try {
      this.pdfExportAttempt = true;

      if (!this.allProductsMode) {
        const allProducts = await firstValueFrom(
          this._productPublicService.getAllByCatalog(
            this.catalog.id,
            this.searchQuery || null,
          ),
        );
        this.products = allProducts;
        if (this.products.length > 0) {
          this.allProductsMode = true;
        }
      }

      // Angular necesita un ciclo de detección antes de que #pdfPage exista en el DOM.
      this._cdr.detectChanges();
      await CatalogPage.waitNextPaint();

      // Posicionamos la sección en el inicio para que scrollY=0 sea coherente.
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      host.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'auto',
      });

      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          /* fuentes ya cargadas o API no disponible */
        }
      }
      await CatalogPage.waitNextPaint();

      const pdfPageEls = this._pdfPages();
      if (pdfPageEls.length === 0) {
        return;
      }

      // Esperamos a que todas las imágenes estén cargadas antes de capturar.
      await CatalogPage.waitForImages(host);
      await CatalogPage.waitNextPaint();

      const layoutViewportW = document.documentElement.clientWidth;
      const layoutViewportH = document.documentElement.clientHeight;
      const captureH = Math.ceil(
        Math.max(host.scrollHeight, host.getBoundingClientRect().height),
      );
      const captureScale = 1.5;

      // Medimos la posición de cada #pdfPage ANTES de llamar a html2canvas,
      // relativa a la sección raíz (que tras scrollIntoView está en top≈0).
      const sectionRect = host.getBoundingClientRect();
      const pageSlices = pdfPageEls.map((el) => {
        const r = el.nativeElement.getBoundingClientRect();
        return {
          top: Math.round((r.top - sectionRect.top) * captureScale),
          height: Math.round(r.height * captureScale),
        };
      });

      // Captura única de TODA la sección: evita los problemas de elementos
      // fuera del viewport que tiene la captura elemento-por-elemento.
      const fullCanvas = await html2canvas(host, {
        foreignObjectRendering: true,
        scale: captureScale,
        useCORS: false,
        allowTaint: false,
        logging: false,
        backgroundColor: null,
        scrollX: 0,
        scrollY: 0,
        windowWidth: layoutViewportW,
        windowHeight: Math.max(layoutViewportH, captureH),
        onclone: ((documentClone: Document) => {
          CatalogPage.preparePdfCloneDocument(documentClone, layoutViewportW);
          return CatalogPage.preparePdfCloneForCapture(documentClone);
        }) as (document: Document, element: HTMLElement) => void,
      });

      // Grid xxl/xl → landscape (ancho domina). List y el resto → portrait (alto domina).
      const bp = this.getTailwindBreakpoint();
      const isLandscape =
        this.layoutMode === 'Grid' && (bp === 'xxl' || bp === 'xl');

      const pdf = new jsPDF({
        orientation: isLandscape ? 'l' : 'p',
        unit: 'mm',
        format: 'a4',
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pageSlices.length; i++) {
        const { top, height } = pageSlices[i];

        // Recortamos el canvas completo en el bloque de esta página PDF.
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = fullCanvas.width;
        sliceCanvas.height = height;
        const sliceCtx = sliceCanvas.getContext('2d');
        if (!sliceCtx) {
          continue;
        }
        sliceCtx.drawImage(fullCanvas, 0, -top);

        // Fondo blanco + JPEG (~90 % menos peso que PNG).
        const jpegCanvas = document.createElement('canvas');
        jpegCanvas.width = sliceCanvas.width;
        jpegCanvas.height = sliceCanvas.height;
        const jCtx = jpegCanvas.getContext('2d');
        if (jCtx) {
          jCtx.fillStyle = '#ffffff';
          jCtx.fillRect(0, 0, jpegCanvas.width, jpegCanvas.height);
          jCtx.drawImage(sliceCanvas, 0, 0);
        }
        const outCanvas = jCtx ? jpegCanvas : sliceCanvas;
        const trimmed = CatalogPage.trimCanvasPdfMargins(outCanvas);
        // calidad 0.82: equilibrio texto legible / peso mínimo
        const imgData = trimmed.toDataURL('image/jpeg', 0.82);

        // Siempre llena el ancho completo de la hoja A4 (sin márgenes laterales).
        // Si el contenido supera ligeramente la altura disponible (≤ 8 %) se acepta
        // el recorte mínimo (solo afecta al relleno inferior, no a las cards).
        // Si el desbordamiento es mayor, se escala para que todo quepa en la hoja.
        const imgWidth = pageWidth;
        const imgHeight = (trimmed.height * imgWidth) / trimmed.width;

        if (i > 0) {
          pdf.addPage();
        }

        if (imgHeight <= pageHeight * 1.08) {
          // Ancho completo; desbordamiento menor al 8 % solo afecta relleno inferior.
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
          // Desbordamiento significativo: ajusta a la altura de la hoja y centra.
          const scaledH = pageHeight;
          const scaledW = (trimmed.width * scaledH) / trimmed.height;
          const xOffset = (pageWidth - scaledW) / 2;
          pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledW, scaledH);
        }
      }

      const baseName = CatalogPage.slugifyFilename(
        this.catalog.title || 'catalogo',
      );
      pdf.save(`${baseName}.pdf`);
    } catch (err) {
      console.error(err);
      this._messageService.add({
        severity: 'error',
        summary: this._translate.instant('general.error'),
        detail: this._translate.instant('toast.catalogPdfExportFailed'),
      });
    } finally {
      window.scrollTo(prevScrollX, prevScrollY);
      this.products = prevProducts;
      this.pdfExportAttempt = false;
      this._cdr.detectChanges();
    }
  }

  /** Fondo y ancho del documento clonado para que coincidan con la vista y el degradado del host. */
  private static preparePdfCloneDocument(
    documentClone: Document,
    viewportWidth: number,
  ): void {
    const html = documentClone.documentElement;
    const body = documentClone.body;
    html.style.setProperty('margin', '0', 'important');
    html.style.setProperty('background-color', 'transparent', 'important');
    if (body) {
      body.style.setProperty('margin', '0', 'important');
      body.style.setProperty('background-color', 'transparent', 'important');
      body.style.setProperty('min-width', `${viewportWidth}px`, 'important');
    }
  }

  /** Dos requestAnimationFrame: layout + pintado tras detectChanges(). */
  private static waitNextPaint(): Promise<void> {
    return new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  }

  /**
   * Espera a que todas las <img> del contenedor hayan terminado de cargar
   * (o fallado). Incluye un timeout de seguridad por imagen para no bloquear
   * indefinidamente si un recurso nunca responde.
   */
  private static waitForImages(
    container: HTMLElement,
    timeoutMs = 10_000,
  ): Promise<void> {
    const imgs = Array.from(
      container.querySelectorAll<HTMLImageElement>('img'),
    );
    const pending = imgs.filter((img) => !img.complete);
    if (pending.length === 0) return Promise.resolve();

    const waits = pending.map(
      (img) =>
        new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, timeoutMs);
          const done = () => {
            clearTimeout(timer);
            resolve();
          };
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        }),
    );
    return Promise.all(waits).then(() => undefined);
  }

  /**
   * undefined = aún no intentado; null = intentado y sin fuente; objeto = lista para inyectar.
   */
  private static primeIconsFontCache:
    | { dataUrl: string; format: string }
    | null
    | undefined = undefined;

  private static async getPrimeIconsFontForPdf(): Promise<{
    dataUrl: string;
    format: string;
  } | null> {
    if (CatalogPage.primeIconsFontCache !== undefined) {
      return CatalogPage.primeIconsFontCache;
    }
    const bundle = await CatalogPage.resolvePrimeIconsFontBundle();
    CatalogPage.primeIconsFontCache = bundle;
    return bundle;
  }

  /** data URL con MIME correcto para @font-face (FileReader suele dar octet-stream). */
  private static async binaryBlobToDataUrl(
    blob: Blob,
    mime: string,
  ): Promise<string> {
    const buf = new Uint8Array(await blob.arrayBuffer());
    const chunk = 0x8000;
    let binary = '';
    for (let i = 0; i < buf.length; i += chunk) {
      binary += String.fromCharCode(...buf.subarray(i, i + chunk));
    }
    return `data:${mime};base64,${btoa(binary)}`;
  }

  private static mimeForFontFormat(format: string): string {
    const f = format.toLowerCase();
    if (f === 'woff2') {
      return 'font/woff2';
    }
    if (f === 'woff') {
      return 'font/woff';
    }
    if (f === 'truetype' || f === 'opentype') {
      return 'font/ttf';
    }
    return 'application/octet-stream';
  }

  private static collectPrimeIconsFontCandidates(): {
    url: string;
    format: string;
  }[] {
    const candidates: { url: string; format: string }[] = [];
    const seen = new Set<string>();

    const add = (url: string, format: string) => {
      if (seen.has(url)) {
        return;
      }
      seen.add(url);
      candidates.push({ url, format });
    };

    if (typeof document !== 'undefined') {
      if (typeof performance !== 'undefined') {
        const entries = performance.getEntriesByType(
          'resource',
        ) as PerformanceResourceTiming[];
        for (const e of entries) {
          const u = e.name;
          if (!/primeicons/i.test(u)) {
            continue;
          }
          const lower = u.toLowerCase();
          if (lower.endsWith('.woff2')) {
            add(u, 'woff2');
          } else if (lower.endsWith('.woff')) {
            add(u, 'woff');
          } else if (/\.(ttf|otf)(\?|$)/i.test(u)) {
            add(u, 'truetype');
          }
        }
      }
    }

    return candidates;
  }

  private static extractUrlsFromFontFaceBlock(
    block: string,
    baseHref: string,
  ): { url: string; format: string }[] {
    const found: { url: string; format: string }[] = [];
    const withFormat =
      /url\(\s*["']?([^"')]+)["']?\s*\)\s*format\(\s*["']([^"']+)["']\s*\)/gi;
    let m: RegExpExecArray | null;
    while ((m = withFormat.exec(block)) !== null) {
      try {
        found.push({
          url: new URL(m[1].trim(), baseHref).href,
          format: m[2],
        });
      } catch {
        /* skip */
      }
    }
    if (found.length === 0) {
      const simple = /url\(\s*["']?([^"')]+)["']?\s*\)/gi;
      let sm: RegExpExecArray | null;
      while ((sm = simple.exec(block)) !== null) {
        try {
          const url = new URL(sm[1].trim(), baseHref).href;
          const ext = url.split('.').pop()?.toLowerCase().split('?')[0] ?? '';
          const format =
            ext === 'woff2'
              ? 'woff2'
              : ext === 'woff'
                ? 'woff'
                : ext === 'ttf'
                  ? 'truetype'
                  : 'opentype';
          found.push({ url, format });
        } catch {
          /* skip */
        }
      }
    }
    return found;
  }

  private static async collectPrimeIconsUrlsFromLinkedCss(): Promise<
    { url: string; format: string }[]
  > {
    const out: { url: string; format: string }[] = [];
    if (typeof document === 'undefined') {
      return out;
    }
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    );
    for (const link of links) {
      const href = link.href;
      if (!href) {
        continue;
      }
      try {
        const res = await fetch(href, { credentials: 'same-origin' });
        if (!res.ok) {
          continue;
        }
        const text = await res.text();
        if (!/primeicons/i.test(text)) {
          continue;
        }
        const faceRe = /@font-face\s*\{([^}]*)\}/gi;
        let fm: RegExpExecArray | null;
        while ((fm = faceRe.exec(text)) !== null) {
          if (!/primeicons/i.test(fm[1])) {
            continue;
          }
          out.push(...CatalogPage.extractUrlsFromFontFaceBlock(fm[1], href));
        }
      } catch {
        continue;
      }
    }
    return out;
  }

  private static collectPrimeIconsUrlsFromCssRules(): {
    url: string;
    format: string;
  }[] {
    const out: { url: string; format: string }[] = [];
    if (typeof document === 'undefined') {
      return out;
    }
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList | undefined;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      if (!rules || !sheet.href) {
        continue;
      }
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (!(rule instanceof CSSFontFaceRule)) {
          continue;
        }
        const family = rule.style.getPropertyValue('font-family').toLowerCase();
        if (!family.includes('primeicons')) {
          continue;
        }
        out.push(
          ...CatalogPage.extractUrlsFromFontFaceBlock(
            rule.style.getPropertyValue('src'),
            sheet.href,
          ),
        );
      }
    }
    return out;
  }

  private static async resolvePrimeIconsFontBundle(): Promise<{
    dataUrl: string;
    format: string;
  } | null> {
    const rank = (f: string) =>
      f === 'woff2' ? 0 : f === 'woff' ? 1 : f === 'truetype' ? 2 : 3;

    if (typeof document !== 'undefined') {
      try {
        const staticUrl = new URL(
          'assets/fonts/primeicons.woff2',
          document.baseURI,
        ).href;
        const res = await fetch(staticUrl, {
          credentials: 'same-origin',
          cache: 'force-cache',
        });
        if (res.ok) {
          const blob = await res.blob();
          const dataUrl = await CatalogPage.binaryBlobToDataUrl(
            blob,
            'font/woff2',
          );
          return { dataUrl, format: 'woff2' };
        }
      } catch {
        /* seguir con otras fuentes */
      }
    }

    const merged: { url: string; format: string }[] = [
      ...CatalogPage.collectPrimeIconsFontCandidates(),
      ...(await CatalogPage.collectPrimeIconsUrlsFromLinkedCss()),
      ...CatalogPage.collectPrimeIconsUrlsFromCssRules(),
    ];
    merged.sort((a, b) => rank(a.format) - rank(b.format));

    for (const c of merged) {
      if (c.url.startsWith('data:')) {
        continue;
      }
      try {
        const res = await fetch(c.url, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'force-cache',
        });
        if (!res.ok) {
          continue;
        }
        const blob = await res.blob();
        const mime = CatalogPage.mimeForFontFormat(c.format);
        const dataUrl = await CatalogPage.binaryBlobToDataUrl(blob, mime);
        return { dataUrl, format: c.format };
      } catch {
        continue;
      }
    }
    return null;
  }

  private static injectPrimeIconsFontIntoClone(
    doc: Document,
    bundle: { dataUrl: string; format: string },
  ): void {
    const safeUrl = bundle.dataUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const style = doc.createElement('style');
    style.setAttribute('data-pdf-embed', 'primeicons');
    style.textContent = `
@font-face {
  font-family: 'primeicons';
  font-style: normal;
  font-weight: normal;
  font-display: block;
  src: url("${safeUrl}") format('${bundle.format}');
}
.pi {
  font-family: 'primeicons', sans-serif !important;
  speak: none;
  font-style: normal !important;
  font-weight: normal !important;
  font-variant: normal !important;
  text-transform: none !important;
  line-height: 1 !important;
  display: inline-block !important;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.pi:before {
  font-family: 'primeicons', sans-serif !important;
}
`;
    doc.head.appendChild(style);
  }

  /**
   * Quita columnas/filas desde la derecha y el fondo si son solo margen (transparente
   * o blanco). No recorta fondos de color (p. ej. degradado) para no comer contenido.
   */
  private static trimCanvasPdfMargins(
    source: HTMLCanvasElement,
  ): HTMLCanvasElement {
    const ctx = source.getContext('2d');
    if (!ctx || source.width < 2 || source.height < 2) {
      return source;
    }
    const w0 = source.width;
    const h0 = source.height;
    const data = ctx.getImageData(0, 0, w0, h0).data;
    const pixel = (x: number, y: number) => {
      const i = (y * w0 + x) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]] as const;
    };
    const isMarginPixel = (p: readonly [number, number, number, number]) =>
      p[3] < 20 || (p[0] > 247 && p[1] > 247 && p[2] > 247 && p[3] > 247);

    let cropW = w0;
    let cropH = h0;

    while (cropW > 1) {
      const x = cropW - 1;
      let allMargin = true;
      for (let y = 0; y < cropH; y++) {
        if (!isMarginPixel(pixel(x, y))) {
          allMargin = false;
          break;
        }
      }
      if (!allMargin) {
        break;
      }
      cropW--;
    }

    while (cropH > 1) {
      const y = cropH - 1;
      let allMargin = true;
      for (let x = 0; x < cropW; x++) {
        if (!isMarginPixel(pixel(x, y))) {
          allMargin = false;
          break;
        }
      }
      if (!allMargin) {
        break;
      }
      cropH--;
    }

    if (cropW === w0 && cropH === h0) {
      return source;
    }
    const out = document.createElement('canvas');
    out.width = cropW;
    out.height = cropH;
    const octx = out.getContext('2d');
    if (!octx) {
      return source;
    }
    octx.drawImage(source, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
    return out;
  }

  private static async preparePdfCloneForCapture(
    documentClone: Document,
  ): Promise<void> {
    const bundle = await CatalogPage.getPrimeIconsFontForPdf();
    if (bundle) {
      CatalogPage.injectPrimeIconsFontIntoClone(documentClone, bundle);
      if (documentClone.fonts) {
        try {
          await documentClone.fonts.load('1em primeicons');
        } catch {
          /* el clon puede no registrar la fuente hasta el pintado */
        }
      }
    }
    await CatalogPage.inlineRemoteImagesInDocument(documentClone);
  }

  private static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Quita el nonce `?t=` / `&t=` usado en <img> para agrupar y pedir una sola vez la misma foto.
   */
  private static stripPdfCacheNonceFromUrl(url: string): string {
    try {
      const u = new URL(url);
      const t = u.searchParams.get('t');
      if (t !== null && /^\d+$/.test(t)) {
        u.searchParams.delete('t');
      }
      const out = u.toString();
      return out.endsWith('?') ? out.slice(0, -1) : out;
    } catch {
      return url;
    }
  }

  /**
   * URL que realmente pide `fetch`: en local, mismo origen vía proxy (ver proxy.conf.json +
   * environment.catalogPdfMediaProxy). En producción debe poder leerse con CORS desde el dominio de la app.
   */
  private static resolvePdfImageFetchUrl(canonicalAbsoluteUrl: string): string {
    const cfg = environment.catalogPdfMediaProxy;
    if (
      cfg &&
      !environment.production &&
      typeof globalThis.location !== 'undefined' &&
      canonicalAbsoluteUrl.startsWith(cfg.s3OriginPrefix)
    ) {
      const path = canonicalAbsoluteUrl.slice(cfg.s3OriginPrefix.length);
      return `${globalThis.location.origin}${cfg.localPathPrefix}${path}`;
    }
    return canonicalAbsoluteUrl;
  }

  /**
   * Sustituye src de <img> por data URLs para que foreignObject+canvas incluya las fotos.
   * El `fetch` exige CORS en el origen remoto salvo en dev con `catalogPdfMediaProxy` + proxy de Angular.
   */
  private static async inlineRemoteImagesInDocument(
    doc: Document,
  ): Promise<void> {
    const images = doc.querySelectorAll<HTMLImageElement>('img[src]');
    const byCanonical = new Map<string, HTMLImageElement[]>();

    for (const img of Array.from(images)) {
      const url = img.src?.trim() ?? '';
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        continue;
      }
      const canonical = CatalogPage.stripPdfCacheNonceFromUrl(url);
      const list = byCanonical.get(canonical) ?? [];
      list.push(img);
      byCanonical.set(canonical, list);
    }

    const fetchCache = new Map<string, Promise<string | null>>();

    const fetchAsDataUrl = (fetchUrl: string): Promise<string | null> => {
      const cached = fetchCache.get(fetchUrl);
      if (cached) {
        return cached;
      }
      const task = (async (): Promise<string | null> => {
        try {
          const res = await fetch(fetchUrl, {
            mode: 'cors',
            credentials: 'omit',
            cache: 'default',
          });
          if (!res.ok) {
            return null;
          }
          const blob = await res.blob();
          if (!blob.type.startsWith('image/')) {
            return null;
          }
          return await CatalogPage.blobToDataUrl(blob);
        } catch {
          return null;
        }
      })();
      fetchCache.set(fetchUrl, task);
      return task;
    };

    await Promise.all(
      [...byCanonical.entries()].map(async ([canonical, imgs]) => {
        const fetchUrl = CatalogPage.resolvePdfImageFetchUrl(canonical);
        const dataUrl = await fetchAsDataUrl(fetchUrl);
        if (!dataUrl) {
          return;
        }
        await Promise.all(
          imgs.map(async (img) => {
            img.setAttribute('src', dataUrl);
            img.removeAttribute('srcset');
            try {
              await img.decode();
            } catch {
              await new Promise<void>((resolve) => {
                if (img.complete) {
                  resolve();
                  return;
                }
                img.onload = () => resolve();
                img.onerror = () => resolve();
              });
            }
          }),
        );
      }),
    );
  }

  private static slugifyFilename(name: string): string {
    const s = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
    return s || 'catalogo';
  }

  share() {
    this.ref = this._dialogService.open(ShareModal, {
      header: this._translate.instant('general.share'),
      width: '500px',
      style: { maxHeight: '80vh' },
      breakpoints: {
        '640px': '450px',
        '500px': '80vw',
        '400px': '90vw',
      },
      data: {
        url: location.href,
      },
      modal: true,
      closable: true,
    });
  }

  saveColor(): void {
    console.log('saveColor');
    this.attemptColor = true;
    this._subscription.add(
      this._catalogService
        .updateCatalog({
          idCatalog: this.catalog.id,
          hexColor: this.color,
          title: this.catalog.title,
        })
        .subscribe({
          next: (response) => {
            console.log(response);
            this.attemptColor = false;
            this._messageService.add({
              severity: 'success',
              summary: this._translate.instant('general.success'),
              detail: this._translate.instant('toast.catalogUpdated'),
            });
          },
          error: (error) => {
            console.error(error);
            this.attemptColor = false;
          },
          complete: () => {
            console.log('complete');
            this.attemptColor = false;
          },
        }),
    );
  }
}
