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
import { ActivatedRoute } from '@angular/router';
import {
  BusinessPublicService,
  BusinessSchema,
  CatalogPublicService,
  CatalogSchema,
  ProductPublicService,
  ProductSchema,
} from '@lineup/core';
import { environment } from '@lineup/envs';
import { ProductCard, ProductExpandedItem } from '@lineup/ui';
import { QRCodeComponent } from 'angularx-qrcode';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { firstValueFrom } from 'rxjs';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-catalog-download-page',
  imports: [CommonModule, ProductCard, ProductExpandedItem, ProgressSpinner, QRCodeComponent],
  templateUrl: './catalog-download-page.html',
  styleUrl: './catalog-download-page.scss',
})
export class CatalogDownloadPage implements OnInit {
  business: BusinessSchema | null = null;
  catalog: CatalogSchema | null = null;
  products: ProductSchema[] = [];
  pdfExportAttempt = false;
  layoutMode: 'Grid' | 'List' = 'Grid';
  pageBackgroundGradient = '';
  isDarkBackground = false;
  isGenerating = false;
  isDone = false;
  hasError = false;
  catalogUrl = '';

  private static readonly _GRADIENT_TOP_LIGHTEN = 0.25;
  private static readonly _GRADIENT_BOTTOM_LIGHTEN = 0.6;
  private static readonly _LUMINANCE_THRESHOLD = 0.45;

  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _businessPublicService = inject(BusinessPublicService);
  private readonly _catalogPublicService = inject(CatalogPublicService);
  private readonly _productPublicService = inject(ProductPublicService);
  private readonly _cdr = inject(ChangeDetectorRef);

  private readonly _catalogPdfRoot =
    viewChild<ElementRef<HTMLElement>>('catalogPdfRoot');
  private readonly _pdfPages = viewChildren<ElementRef<HTMLElement>>('pdfPage');

  private _businessPath = '';
  private _catalogPath = '';

  private getTailwindBreakpoint(): 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' {
    const w = document.documentElement.clientWidth;
    if (w >= 1536) return 'xxl';
    if (w >= 1280) return 'xl';
    if (w >= 1024) return 'lg';
    if (w >= 768) return 'md';
    if (w >= 640) return 'sm';
    return 'xs';
  }

  private getPdfProductsPerPage(): number {
    const bp = this.getTailwindBreakpoint();
    if (this.layoutMode === 'Grid') {
      switch (bp) {
        case 'xxl':
          return 10;
        case 'xl':
          return 8;
        case 'lg':
          return 6;
        case 'md':
        case 'sm':
          return 4;
        default:
          return 2;
      }
    } else {
      if (bp === 'xs') return 1;
      if (bp === 'xxl' || bp === 'xl') return 3;
      return 2;
    }
  }

  get pdfProductPageChunks(): ProductSchema[][] {
    const perPage = this.getPdfProductsPerPage();
    if (this.products.length === 0) return [[]];
    const chunks: ProductSchema[][] = [];
    for (let i = 0; i < this.products.length; i += perPage) {
      chunks.push(this.products.slice(i, i + perPage));
    }
    return chunks;
  }

  get pdfCardHeight(): string {
    return 'h-100';
  }

  get pdfPageMinHeight(): string {
    const bp = this.getTailwindBreakpoint();
    const isLandscape =
      this.layoutMode === 'Grid' && (bp === 'xxl' || bp === 'xl');
    const w = document.documentElement.clientWidth;
    const ratio = isLandscape ? 210 / 297 : 297 / 210;
    return `${Math.round(w * ratio)}px`;
  }

  get brandToneLight(): boolean {
    return !!this.pageBackgroundGradient && this.isDarkBackground;
  }

  ngOnInit(): void {
    this._businessPath = this._activatedRoute.snapshot.params['business'];
    this._catalogPath = this._activatedRoute.snapshot.params['catalogPath'];
    const layout = this._activatedRoute.snapshot.queryParams['layout'];
    if (layout === 'List') {
      this.layoutMode = 'List';
    }
    if (isPlatformBrowser(this._platformId) && typeof window !== 'undefined') {
      this.catalogUrl = window.location.href.replace(/\/download(\?.*)?$/, '');
    }
    this.loadAndDownload();
  }

  private setColor(raw: string): void {
    const rgb = CatalogDownloadPage.parseColorToRgb(raw);
    if (!rgb) return;
    const top = CatalogDownloadPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      CatalogDownloadPage._GRADIENT_TOP_LIGHTEN,
    );
    const bottom = CatalogDownloadPage.lightenRgb(
      rgb.r,
      rgb.g,
      rgb.b,
      CatalogDownloadPage._GRADIENT_BOTTOM_LIGHTEN,
    );
    this.pageBackgroundGradient = `linear-gradient(to bottom, rgba(${top.r}, ${top.g}, ${top.b}, 1), rgba(${bottom.r}, ${bottom.g}, ${bottom.b}, 1))`;
    const luminance = CatalogDownloadPage.relativeLuminance(top.r, top.g, top.b);
    this.isDarkBackground = luminance < CatalogDownloadPage._LUMINANCE_THRESHOLD;
  }

  private async loadAndDownload(): Promise<void> {
    if (!isPlatformBrowser(this._platformId)) return;
    this.isGenerating = true;
    this._cdr.detectChanges();

    try {
      const [business, catalog] = await Promise.all([
        firstValueFrom(
          this._businessPublicService.findBusinessByPath(this._businessPath),
        ),
        firstValueFrom(
          this._catalogPublicService.findOneCatalogByPath(this._catalogPath),
        ),
      ]);
      this.business = business;
      this.catalog = catalog;

      if (catalog.hexColor) {
        this.setColor(catalog.hexColor);
      } else if (business.hexColor) {
        this.setColor(business.hexColor);
      }

      const allProducts = await firstValueFrom(
        this._productPublicService.getAllByCatalog(this.catalog.id, null),
      );
      this.products = allProducts;

      this.pdfExportAttempt = true;
      this._cdr.detectChanges();
      await CatalogDownloadPage.waitNextPaint();

      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      const host = this._catalogPdfRoot()?.nativeElement;
      if (!host) return;

      host.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' });

      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {
          /* fuentes ya cargadas o API no disponible */
        }
      }
      await CatalogDownloadPage.waitNextPaint();

      const pdfPageEls = this._pdfPages();
      if (pdfPageEls.length === 0) return;

      await CatalogDownloadPage.waitForImages(host);
      await CatalogDownloadPage.waitNextPaint();

      const layoutViewportW = document.documentElement.clientWidth;
      const layoutViewportH = document.documentElement.clientHeight;
      const captureH = Math.ceil(
        Math.max(host.scrollHeight, host.getBoundingClientRect().height),
      );
      const captureScale = 1.5;

      const sectionRect = host.getBoundingClientRect();
      const pageSlices = pdfPageEls.map((el) => {
        const r = el.nativeElement.getBoundingClientRect();
        return {
          top: Math.round((r.top - sectionRect.top) * captureScale),
          height: Math.round(r.height * captureScale),
        };
      });

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
          CatalogDownloadPage.preparePdfCloneDocument(
            documentClone,
            layoutViewportW,
          );
          return CatalogDownloadPage.preparePdfCloneForCapture(documentClone);
        }) as (document: Document, element: HTMLElement) => void,
      });

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

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = fullCanvas.width;
        sliceCanvas.height = height;
        const sliceCtx = sliceCanvas.getContext('2d');
        if (!sliceCtx) continue;
        sliceCtx.drawImage(fullCanvas, 0, -top);

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
        const trimmed = CatalogDownloadPage.trimCanvasPdfMargins(outCanvas);
        const imgData = trimmed.toDataURL('image/jpeg', 0.82);

        const imgWidth = pageWidth;
        const imgHeight = (trimmed.height * imgWidth) / trimmed.width;

        if (i > 0) pdf.addPage();

        if (imgHeight <= pageHeight * 1.08) {
          pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        } else {
          const scaledH = pageHeight;
          const scaledW = (trimmed.width * scaledH) / trimmed.height;
          const xOffset = (pageWidth - scaledW) / 2;
          pdf.addImage(imgData, 'JPEG', xOffset, 0, scaledW, scaledH);
        }
      }

      const baseName = CatalogDownloadPage.slugifyFilename(
        this.catalog.title || 'catalogo',
      );
      pdf.save(`${baseName}.pdf`);
      this.isDone = true;
    } catch (err) {
      console.error(err);
      this.hasError = true;
    } finally {
      this.isGenerating = false;
      this._cdr.detectChanges();
    }
  }

  // ── Métodos estáticos de utilería (migrados desde CatalogPage) ─────────────

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

  private static waitNextPaint(): Promise<void> {
    return new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  }

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

  private static primeIconsFontCache:
    | { dataUrl: string; format: string }
    | null
    | undefined = undefined;

  private static async getPrimeIconsFontForPdf(): Promise<{
    dataUrl: string;
    format: string;
  } | null> {
    if (CatalogDownloadPage.primeIconsFontCache !== undefined) {
      return CatalogDownloadPage.primeIconsFontCache;
    }
    const bundle = await CatalogDownloadPage.resolvePrimeIconsFontBundle();
    CatalogDownloadPage.primeIconsFontCache = bundle;
    return bundle;
  }

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
    if (f === 'woff2') return 'font/woff2';
    if (f === 'woff') return 'font/woff';
    if (f === 'truetype' || f === 'opentype') return 'font/ttf';
    return 'application/octet-stream';
  }

  private static collectPrimeIconsFontCandidates(): {
    url: string;
    format: string;
  }[] {
    const candidates: { url: string; format: string }[] = [];
    const seen = new Set<string>();
    const add = (url: string, format: string) => {
      if (seen.has(url)) return;
      seen.add(url);
      candidates.push({ url, format });
    };
    if (typeof document !== 'undefined' && typeof performance !== 'undefined') {
      const entries = performance.getEntriesByType(
        'resource',
      ) as PerformanceResourceTiming[];
      for (const e of entries) {
        const u = e.name;
        if (!/primeicons/i.test(u)) continue;
        const lower = u.toLowerCase();
        if (lower.endsWith('.woff2')) add(u, 'woff2');
        else if (lower.endsWith('.woff')) add(u, 'woff');
        else if (/\.(ttf|otf)(\?|$)/i.test(u)) add(u, 'truetype');
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
    if (typeof document === 'undefined') return out;
    const links = Array.from(
      document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    );
    for (const link of links) {
      const href = link.href;
      if (!href) continue;
      try {
        const res = await fetch(href, { credentials: 'same-origin' });
        if (!res.ok) continue;
        const text = await res.text();
        if (!/primeicons/i.test(text)) continue;
        const faceRe = /@font-face\s*\{([^}]*)\}/gi;
        let fm: RegExpExecArray | null;
        while ((fm = faceRe.exec(text)) !== null) {
          if (!/primeicons/i.test(fm[1])) continue;
          out.push(
            ...CatalogDownloadPage.extractUrlsFromFontFaceBlock(fm[1], href),
          );
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
    if (typeof document === 'undefined') return out;
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList | undefined;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      if (!rules || !sheet.href) continue;
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (!(rule instanceof CSSFontFaceRule)) continue;
        const family = rule.style.getPropertyValue('font-family').toLowerCase();
        if (!family.includes('primeicons')) continue;
        out.push(
          ...CatalogDownloadPage.extractUrlsFromFontFaceBlock(
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
          const dataUrl = await CatalogDownloadPage.binaryBlobToDataUrl(
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
      ...CatalogDownloadPage.collectPrimeIconsFontCandidates(),
      ...(await CatalogDownloadPage.collectPrimeIconsUrlsFromLinkedCss()),
      ...CatalogDownloadPage.collectPrimeIconsUrlsFromCssRules(),
    ];
    merged.sort((a, b) => rank(a.format) - rank(b.format));

    for (const c of merged) {
      if (c.url.startsWith('data:')) continue;
      try {
        const res = await fetch(c.url, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'force-cache',
        });
        if (!res.ok) continue;
        const blob = await res.blob();
        const mime = CatalogDownloadPage.mimeForFontFormat(c.format);
        const dataUrl = await CatalogDownloadPage.binaryBlobToDataUrl(
          blob,
          mime,
        );
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

  private static trimCanvasPdfMargins(
    source: HTMLCanvasElement,
  ): HTMLCanvasElement {
    const ctx = source.getContext('2d');
    if (!ctx || source.width < 2 || source.height < 2) return source;
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
      if (!allMargin) break;
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
      if (!allMargin) break;
      cropH--;
    }

    if (cropW === w0 && cropH === h0) return source;
    const out = document.createElement('canvas');
    out.width = cropW;
    out.height = cropH;
    const octx = out.getContext('2d');
    if (!octx) return source;
    octx.drawImage(source, 0, 0, cropW, cropH, 0, 0, cropW, cropH);
    return out;
  }

  private static async preparePdfCloneForCapture(
    documentClone: Document,
  ): Promise<void> {
    const bundle = await CatalogDownloadPage.getPrimeIconsFontForPdf();
    if (bundle) {
      CatalogDownloadPage.injectPrimeIconsFontIntoClone(documentClone, bundle);
      if (documentClone.fonts) {
        try {
          await documentClone.fonts.load('1em primeicons');
        } catch {
          /* el clon puede no registrar la fuente hasta el pintado */
        }
      }
    }
    await CatalogDownloadPage.inlineRemoteImagesInDocument(documentClone);
  }

  private static blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }

  private static stripPdfCacheNonceFromUrl(url: string): string {
    try {
      const u = new URL(url);
      const t = u.searchParams.get('t');
      if (t !== null && /^\d+$/.test(t)) u.searchParams.delete('t');
      const out = u.toString();
      return out.endsWith('?') ? out.slice(0, -1) : out;
    } catch {
      return url;
    }
  }

  private static resolvePdfImageFetchUrl(
    canonicalAbsoluteUrl: string,
  ): string {
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

  private static async inlineRemoteImagesInDocument(
    doc: Document,
  ): Promise<void> {
    const images = doc.querySelectorAll<HTMLImageElement>('img[src]');
    const byCanonical = new Map<string, HTMLImageElement[]>();

    for (const img of Array.from(images)) {
      const url = img.src?.trim() ?? '';
      if (!url || url.startsWith('data:') || url.startsWith('blob:')) continue;
      const canonical = CatalogDownloadPage.stripPdfCacheNonceFromUrl(url);
      const list = byCanonical.get(canonical) ?? [];
      list.push(img);
      byCanonical.set(canonical, list);
    }

    const fetchCache = new Map<string, Promise<string | null>>();
    const fetchAsDataUrl = (fetchUrl: string): Promise<string | null> => {
      const cached = fetchCache.get(fetchUrl);
      if (cached) return cached;
      const task = (async (): Promise<string | null> => {
        try {
          const res = await fetch(fetchUrl, {
            mode: 'cors',
            credentials: 'omit',
            cache: 'default',
          });
          if (!res.ok) return null;
          const blob = await res.blob();
          if (!blob.type.startsWith('image/')) return null;
          return await CatalogDownloadPage.blobToDataUrl(blob);
        } catch {
          return null;
        }
      })();
      fetchCache.set(fetchUrl, task);
      return task;
    };

    await Promise.all(
      [...byCanonical.entries()].map(async ([canonical, imgs]) => {
        const fetchUrl =
          CatalogDownloadPage.resolvePdfImageFetchUrl(canonical);
        const dataUrl = await fetchAsDataUrl(fetchUrl);
        if (!dataUrl) return;
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

  private static clampByte(n: number): number {
    return Math.max(0, Math.min(255, Math.round(n)));
  }

  private static parseColorToRgb(
    input: string,
  ): { r: number; g: number; b: number } | null {
    const s = input?.trim();
    if (!s) return null;
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
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    const rgb = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(s);
    if (rgb) {
      return {
        r: CatalogDownloadPage.clampByte(Number(rgb[1])),
        g: CatalogDownloadPage.clampByte(Number(rgb[2])),
        b: CatalogDownloadPage.clampByte(Number(rgb[3])),
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
      r: CatalogDownloadPage.clampByte(r + (255 - r) * t),
      g: CatalogDownloadPage.clampByte(g + (255 - g) * t),
      b: CatalogDownloadPage.clampByte(b + (255 - b) * t),
    };
  }

  private static relativeLuminance(r: number, g: number, b: number): number {
    const linear = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }
}
