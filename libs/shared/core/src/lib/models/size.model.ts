import { SizeValueEnum } from '../enums';

export interface Size {
  name: string;
  value: SizeValueEnum;
}

export const BASIC_SIZES: readonly Size[] = [
  {
    name: 'XS',
    value: SizeValueEnum.XS,
  },
  {
    name: 'S',
    value: SizeValueEnum.S,
  },
  {
    name: 'M',
    value: SizeValueEnum.M,
  },
  {
    name: 'L',
    value: SizeValueEnum.L,
  },
  {
    name: 'XL',
    value: SizeValueEnum.XL,
  },
  {
    name: '2XL',
    value: SizeValueEnum.XXL,
  },
  {
    name: '3XL',
    value: SizeValueEnum.XXXL,
  },
] as const;

