import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ProductVariations } from './product-variations';

describe('ProductVariations', () => {
  let component: ProductVariations;
  let fixture: ComponentFixture<ProductVariations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariations, TranslateModule.forRoot()],
      providers: [TranslateService, TranslateStore],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductVariations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
