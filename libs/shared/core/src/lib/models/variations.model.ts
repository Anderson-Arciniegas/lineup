export type VariationKey = 'color' | 'size';

export interface VariationDefinition {
  key: VariationKey;
  name: string;
}

export const PREDEFINED_VARIATIONS: readonly VariationDefinition[] = [
  {
    key: 'color',
    name: 'variations.color',
  },
  {
    key: 'size',
    name: 'variations.size',
  },
] as const;
