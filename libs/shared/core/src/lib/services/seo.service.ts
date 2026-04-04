import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import type { BusinessSchema, CatalogSchema, ProductSchema } from '../schemas';

/** Opciones para título, descripción, imagen y meta tags sociales (Open Graph / Twitter). */
export interface SeoMetaOptions {
  title: string;
  description?: string;
  imageUrl?: string;
  keywords?: string | string[];
  /** Ruta absoluta o relativa (p. ej. `/mi-negocio/cat/1`); se convierte a URL absoluta con el origen actual. */
  canonicalPathOrUrl?: string;
  ogType?: 'website' | 'product';
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Actualiza `document.title`, meta description/keywords y etiquetas og:* / twitter:*.
   */
  setMetaTags(options: SeoMetaOptions): void {
    const origin = this.getOrigin();
    const description = options.description
      ? this.truncatePlainText(
          SeoService.stripHtml(options.description),
          320,
        )
      : undefined;
    const absImage = options.imageUrl
      ? this.toAbsoluteUrl(options.imageUrl.trim(), origin)
      : undefined;
    const canonical = options.canonicalPathOrUrl
      ? this.toAbsoluteUrl(options.canonicalPathOrUrl.trim(), origin)
      : undefined;

    this.title.setTitle(options.title);

    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
    }

    const keywordsStr = SeoService.normalizeKeywords(options.keywords);
    if (keywordsStr) {
      this.meta.updateTag({ name: 'keywords', content: keywordsStr });
    }

    this.meta.updateTag({ property: 'og:title', content: options.title });
    if (description) {
      this.meta.updateTag({ property: 'og:description', content: description });
    }
    if (absImage) {
      this.meta.updateTag({ property: 'og:image', content: absImage });
    }
    if (canonical) {
      this.meta.updateTag({ property: 'og:url', content: canonical });
    }
    this.meta.updateTag({
      property: 'og:type',
      content: options.ogType ?? 'website',
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: absImage ? 'summary_large_image' : 'summary',
    });
    this.meta.updateTag({ name: 'twitter:title', content: options.title });
    if (description) {
      this.meta.updateTag({
        name: 'twitter:description',
        content: this.truncatePlainText(description, 200),
      });
    }
    if (absImage) {
      this.meta.updateTag({ name: 'twitter:image', content: absImage });
    }
  }

  /** SEO para ficha de producto (compartir enlace con nombre e imagen del producto). */
  setProductPage(product: ProductSchema, businessPath: string): void {
    const firstImage = product.productFiles
      ?.slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.file?.url;
    const keywordParts: string[] = [
      product.title,
      product.business?.name,
      product.catalog?.title,
      ...(product.productTags?.map((pt) => pt.tag?.name).filter(Boolean) as
        | string[]
        | undefined) ?? [],
    ].filter((x): x is string => !!x?.trim());

    const catalogPath = product.catalog?.path?.trim() ?? '';
    const path =
      catalogPath.length > 0
        ? `/${businessPath}/${catalogPath}/${product.id}`
        : `/${businessPath}/${product.id}`;

    const desc =
      product.description?.trim() ||
      product.subtitle?.trim() ||
      product.title;
    const businessName = product.business?.name?.trim() ?? '';
    const pageTitle = businessName
      ? `${product.title} | ${businessName}`
      : product.title;

    this.setMetaTags({
      title: pageTitle,
      description: desc,
      imageUrl: firstImage,
      keywords: keywordParts,
      canonicalPathOrUrl: path,
      ogType: 'product',
    });
  }

  /** SEO para página del negocio. */
  setBusinessPage(business: BusinessSchema): void {
    const imageUrl = business.image?.url;
    const keywords: string[] = [
      business.name,
      ...(business.tags?.filter(Boolean) ?? []),
    ];
    const desc =
      business.description?.trim() ||
      `${business.name}`;

    this.setMetaTags({
      title: business.name,
      description: desc,
      imageUrl,
      keywords,
      canonicalPathOrUrl: `/${business.path}`,
      ogType: 'website',
    });
  }

  /** SEO para página de catálogo (negocio + catálogo + imagen del catálogo). */
  setCatalogPage(business: BusinessSchema, catalog: CatalogSchema): void {
    const imageUrl = catalog.image?.url ?? business.image?.url;
    const keywords: string[] = [
      business.name,
      catalog.title,
      ...(catalog.tags?.filter(Boolean) ?? []),
    ];
    const desc =
      `${catalog.title} — ${business.name}`.trim();

    this.setMetaTags({
      title: `${catalog.title} | ${business.name}`,
      description: desc,
      imageUrl,
      keywords,
      canonicalPathOrUrl: `/${business.path}/${catalog.path}`,
      ogType: 'website',
    });
  }

  private getOrigin(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    return this.document.defaultView?.location?.origin ?? '';
  }

  private toAbsoluteUrl(urlOrPath: string, origin: string): string {
    if (!urlOrPath) {
      return urlOrPath;
    }
    if (/^https?:\/\//i.test(urlOrPath)) {
      return urlOrPath;
    }
    if (!origin) {
      return urlOrPath;
    }
    const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
    return `${origin}${path}`;
  }

  private truncatePlainText(text: string, maxLen: number): string {
    const t = text.replace(/\s+/g, ' ').trim();
    if (t.length <= maxLen) {
      return t;
    }
    return `${t.slice(0, maxLen - 1).trim()}…`;
  }

  private static stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ');
  }

  private static normalizeKeywords(
    keywords: string | string[] | undefined,
  ): string | undefined {
    if (keywords == null) {
      return undefined;
    }
    const raw = Array.isArray(keywords) ? keywords.join(', ') : keywords;
    const s = raw.replace(/\s*,\s*/g, ', ').trim();
    return s.length > 0 ? s : undefined;
  }
}
