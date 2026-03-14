import { ColorNameEnum, ColorValueEnum } from '../enums';

export interface Color {
  name: ColorNameEnum;
  value: ColorValueEnum;
  hex: string;
}

export const BASIC_COLORS: readonly Color[] = [
  {
    name: ColorNameEnum.BLACK,
    value: ColorValueEnum.BLACK,
    hex: '#000000',
  },
  {
    name: ColorNameEnum.WHITE,
    value: ColorValueEnum.WHITE,
    hex: '#FFFFFF',
  },
  {
    name: ColorNameEnum.RED,
    value: ColorValueEnum.RED,
    hex: '#FF0000',
  },
  {
    name: ColorNameEnum.GREEN,
    value: ColorValueEnum.GREEN,
    hex: '#008000',
  },
  {
    name: ColorNameEnum.BLUE,
    value: ColorValueEnum.BLUE,
    hex: '#0000FF',
  },
  {
    name: ColorNameEnum.YELLOW,
    value: ColorValueEnum.YELLOW,
    hex: '#FFFF00',
  },
  {
    name: ColorNameEnum.ORANGE,
    value: ColorValueEnum.ORANGE,
    hex: '#FFA500',
  },
  {
    name: ColorNameEnum.PURPLE,
    value: ColorValueEnum.PURPLE,
    hex: '#800080',
  },
  {
    name: ColorNameEnum.PINK,
    value: ColorValueEnum.PINK,
    hex: '#FFC0CB',
  },
  {
    name: ColorNameEnum.GRAY,
    value: ColorValueEnum.GRAY,
    hex: '#808080',
  },
  {
    name: ColorNameEnum.BROWN,
    value: ColorValueEnum.BROWN,
    hex: '#A52A2A',
  },
  {
    name: ColorNameEnum.BEIGE,
    value: ColorValueEnum.BEIGE,
    hex: '#F5F5DC',
  },
  {
    name: ColorNameEnum.LIGHT_BLUE,
    value: ColorValueEnum.LIGHT_BLUE,
    hex: '#ADD8E6',
  },
  {
    name: ColorNameEnum.LIGHT_GREEN,
    value: ColorValueEnum.LIGHT_GREEN,
    hex: '#90EE90',
  },
  {
    name: ColorNameEnum.LIGHT_PINK,
    value: ColorValueEnum.LIGHT_PINK,
    hex: '#FFB6C1',
  },
  {
    name: ColorNameEnum.LIGHT_YELLOW,
    value: ColorValueEnum.LIGHT_YELLOW,
    hex: '#FFF9C4',
  },
  {
    name: ColorNameEnum.LAVENDER,
    value: ColorValueEnum.LAVENDER,
    hex: '#E6E6FA',
  },
  {
    name: ColorNameEnum.MINT,
    value: ColorValueEnum.MINT,
    hex: '#F5FFFA',
  },
  {
    name: ColorNameEnum.PEACH,
    value: ColorValueEnum.PEACH,
    hex: '#FFDAB9',
  },
  {
    name: ColorNameEnum.CORAL,
    value: ColorValueEnum.CORAL,
    hex: '#F08080',
  },
  {
    name: ColorNameEnum.TURQUOISE,
    value: ColorValueEnum.TURQUOISE,
    hex: '#40E0D0',
  },
] as const;

