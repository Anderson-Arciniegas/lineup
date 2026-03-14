import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDescription } from './product-description';

describe('ProductDescription', () => {
  let component: ProductDescription;
  let fixture: ComponentFixture<ProductDescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDescription],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDescription);
    component = fixture.componentInstance;
    component.product = {
      productTags: [{ tag: { name: 'Tag1' } }],
      description: '<p>Test</p>',
    } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
