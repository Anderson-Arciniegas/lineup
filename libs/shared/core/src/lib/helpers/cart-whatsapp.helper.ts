import { BASIC_COLORS } from '../models/color.model';
import { BASIC_SIZES } from '../models/size.model';
import type { CartItemSchema, CartSchema } from '../schemas';

export function parseVariationOptions(
  raw:
    | CartItemSchema['variationOptions']
    | Record<string, unknown>
    | null
    | undefined,
): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, String(v)]),
      );
    } catch {
      return {};
    }
  }
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, String(v)]),
  );
}

function resolveVariationValueLabel(
  value: string,
  translate: (key: string) => string,
): string {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return '';
  const colorMeta = BASIC_COLORS.find((c) => c.value === trimmed);
  if (colorMeta) {
    return translate(colorMeta.name);
  }
  const sizeMeta = BASIC_SIZES.find((s) => s.value === trimmed);
  if (sizeMeta) {
    return translate(sizeMeta.name);
  }
  const translated = translate(trimmed);
  return translated || trimmed;
}

function resolveVariationNameLabel(
  key: string,
  translate: (key: string) => string,
): string {
  const trimmed = String(key ?? '').trim();
  if (!trimmed) return '';
  const direct = translate(trimmed);
  if (direct && direct !== trimmed) {
    return direct;
  }
  if (!trimmed.startsWith('variations.')) {
    const prefixed = translate(`variations.${trimmed}`);
    if (prefixed && prefixed !== `variations.${trimmed}`) {
      return prefixed;
    }
  }
  return direct || trimmed;
}

/**
 * Texto corto de variaciones del ítem (debajo del título en UI de carrito).
 * Ejemplo: "Color: Azul · Talla: M".
 */
export function formatCartItemVariationSummary(
  item: CartItemSchema,
  translate: (key: string) => string = (key) => key,
): string {
  const fromItem = parseVariationOptions(item.variationOptions);
  const fromSku = parseVariationOptions(
    item.productSku?.variationOptions as CartItemSchema['variationOptions'],
  );
  const options = Object.keys(fromItem).length > 0 ? fromItem : fromSku;
  return Object.entries(options)
    .map(([key, value]) => {
      const valueLabel = resolveVariationValueLabel(value, translate);
      if (!valueLabel) return '';
      const nameLabel = resolveVariationNameLabel(key, translate);
      return `${nameLabel}: ${valueLabel}`;
    })
    .filter(Boolean)
    .join(' · ');
}

function formatMoney(amount: number, currencyCode = 'USD'): string {
  try {
    return new Intl.NumberFormat('es', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currencyCode}`;
  }
}

/**
 * Arma el texto del mensaje WhatsApp con el listado completo del carrito (RF44).
 */
export function buildCartWhatsappMessage(
  cart: CartSchema,
  intro: string,
  totalLabel: string,
  translate: (key: string) => string = (key) => key,
): string {
  const items = cart.items ?? [];
  const bullets = items
    .map((item) => {
      const title = (item.product?.title ?? '').trim() || `#${item.idProduct}`;
      const summary = formatCartItemVariationSummary(item, translate);
      const varSuffix = summary ? ` (${summary})` : '';
      const currencyCode =
        item.productSku?.currency?.code ??
        item.product?.currency?.code ??
        'USD';
      const lineAmount =
        item.subtotal != null
          ? Number(item.subtotal)
          : (Number(item.unitPrice) || 0) * (item.quantity ?? 1);
      const priceStr = formatMoney(lineAmount, currencyCode);
      const qty = item.quantity ?? 1;
      return `* ${title}${varSuffix} × ${qty} - ${priceStr}`;
    })
    .join('\n');
  const currencyCode =
    items[0]?.productSku?.currency?.code ??
    items[0]?.product?.currency?.code ??
    'USD';
  const totalLine = `${totalLabel}: ${formatMoney(Number(cart.total) || 0, currencyCode)}`;
  return `${intro}\n\n${bullets}\n\n${totalLine}`.trim();
}

export function resolveCartWhatsappPhone(
  socialNetworks: Array<{ phone?: string | null }>,
): string | null {
  const withPhone = socialNetworks.find((sn) => sn.phone?.trim());
  return withPhone?.phone?.trim() ?? null;
}
