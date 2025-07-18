import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductInfo } from './product-info';

describe('ProductInfo', () => {
  let component: ProductInfo;
  let fixture: ComponentFixture<ProductInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
