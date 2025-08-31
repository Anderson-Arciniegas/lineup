export interface IVariation {
    id?: number;
    name: string;
    variations: IVariationOption[];
}

export interface IVariationOption {
    id?: number;
    name: string;
    primary: boolean;
}
