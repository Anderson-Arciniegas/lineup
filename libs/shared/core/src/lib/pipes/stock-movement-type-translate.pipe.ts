import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StockMovementTypeEnum } from '../enums';

const stockMovementTypeKeyMap: Record<StockMovementTypeEnum, string> = {
  [StockMovementTypeEnum.PURCHASE]: 'stockMovement.purchase',
  [StockMovementTypeEnum.ADJUSTMENT_IN]: 'stockMovement.adjustmentIn',
  [StockMovementTypeEnum.ADJUSTMENT_OUT]: 'stockMovement.adjustmentOut',
  [StockMovementTypeEnum.SALE]: 'stockMovement.sale',
  [StockMovementTypeEnum.REMOVAL]: 'stockMovement.removal',
};

@Pipe({
  name: 'stockMovementType',
  standalone: true,
})
export class StockMovementTypeTranslatePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(value: StockMovementTypeEnum | null | undefined): string {
    if (value == null) {
      return '';
    }

    return this.translate.instant(stockMovementTypeKeyMap[value]);
  }
}
