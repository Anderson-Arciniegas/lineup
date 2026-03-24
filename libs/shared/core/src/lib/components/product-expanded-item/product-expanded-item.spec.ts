import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusEnum } from '../../enums';
import { ProductExpandedItem } from './product-expanded-item';

describe('ProductExpandedItem', () => {
  let fixture: ComponentFixture<ProductExpandedItem>;
  let component: ProductExpandedItem;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductExpandedItem],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductExpandedItem);
    component = fixture.componentInstance;
    component.product = {
      description: 'Desc',
      id: 1,
      idCatalog: 1,
      idCreationBusiness: 1,
      likes: 0,
      ratingAverage: 0,
      status: StatusEnum.ACTIVE,
      title: 'Test product',
      visits: 0,
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Test product');
  });
});
