import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StockMovementTypeEnum } from '../enums';
import { StockMovementTypeTranslatePipe } from './stock-movement-type-translate.pipe';

describe('StockMovementTypeTranslatePipe', () => {
  let pipe: StockMovementTypeTranslatePipe;
  let translate: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [StockMovementTypeTranslatePipe],
    });
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      'stockMovement.sale': 'Sale',
      'stockMovement.purchase': 'Purchase',
      'stockMovement.adjustmentIn': 'Adjustment in',
      'stockMovement.adjustmentOut': 'Adjustment out',
      'stockMovement.removal': 'Removal',
    });
    translate.use('en');
    pipe = TestBed.inject(StockMovementTypeTranslatePipe);
  });

  it('returns empty string for nullish values', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('translates stock movement type', () => {
    expect(pipe.transform(StockMovementTypeEnum.SALE)).toBe('Sale');
    expect(pipe.transform(StockMovementTypeEnum.PURCHASE)).toBe('Purchase');
  });
});
