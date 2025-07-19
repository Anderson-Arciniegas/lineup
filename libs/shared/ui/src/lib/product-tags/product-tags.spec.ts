import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductTags } from './product-tags';

describe('ProductTags', () => {
  let component: ProductTags;
  let fixture: ComponentFixture<ProductTags>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTags],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTags);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
