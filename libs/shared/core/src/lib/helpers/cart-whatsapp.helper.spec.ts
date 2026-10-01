import {
  buildCartWhatsappMessage,
  formatCartItemVariationSummary,
  resolveCartWhatsappPhone,
} from './cart-whatsapp.helper';
import type { CartSchema } from '../schemas';

describe('cart-whatsapp.helper', () => {
  const cart: CartSchema = {
    id: 1,
    idCreationUser: 2,
    idBusiness: 3,
    total: 45,
    itemsCount: 2,
    items: [
      {
        id: 10,
        idCart: 1,
        idProduct: 100,
        quantity: 2,
        unitPrice: 10,
        subtotal: 20,
        variationOptions: { color: 'black' },
        product: {
          id: 100,
          title: 'Camisa',
        } as never,
        productSku: {
          id: 200,
          currency: { code: 'USD' },
        } as never,
      },
      {
        id: 11,
        idCart: 1,
        idProduct: 101,
        quantity: 1,
        unitPrice: 25,
        subtotal: 25,
        variationOptions: '{"size":"M"}',
        product: {
          id: 101,
          title: 'Pantalón',
        } as never,
      },
    ],
  };

  it('buildCartWhatsappMessage incluye intro, bullets y total', () => {
    const message = buildCartWhatsappMessage(
      cart,
      'Hola! vengo de LineUp, y me interesan los siguientes productos:',
      'Total',
    );
    expect(message).toContain(
      'Hola! vengo de LineUp, y me interesan los siguientes productos:',
    );
    expect(message).toContain('* Camisa');
    expect(message).toContain('Pantalón');
    expect(message).toContain('× 2');
    expect(message).toContain('Total');
  });

  it('formatCartItemVariationSummary une nombre y valor de variación', () => {
    expect(
      formatCartItemVariationSummary(cart.items![0], (key) => {
        if (key === 'color' || key === 'variations.color') return 'Color';
        if (key === 'colors.black') return 'Negro';
        return key;
      }),
    ).toBe('Color: Negro');
    expect(
      formatCartItemVariationSummary(cart.items![1], (key) => {
        if (key === 'size' || key === 'variations.size') return 'Talla';
        return key;
      }),
    ).toBe('Talla: M');
  });

  it('resolveCartWhatsappPhone toma el primer teléfono', () => {
    expect(
      resolveCartWhatsappPhone([
        { phone: null },
        { phone: ' 584121234567 ' },
      ]),
    ).toBe('584121234567');
  });

  it('resolveCartWhatsappPhone retorna null si no hay teléfono', () => {
    expect(resolveCartWhatsappPhone([{ phone: '' }])).toBeNull();
  });
});
