import { faker } from '@faker-js/faker';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export function generateRandomProduct(): Product {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price({ min: 5, max: 200, dec: 2 })),
    image: faker.image.urlLoremFlickr({ category: 'product' }),
  };
}

export function generateRandomProducts(count: number): Product[] {
  return Array.from({ length: count }, () => generateRandomProduct());
}