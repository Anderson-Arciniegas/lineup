import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductBreadcrumb } from './product-breadcrumb';

describe('ProductBreadcrumb', () => {
  let component: ProductBreadcrumb;
  let fixture: ComponentFixture<ProductBreadcrumb>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductBreadcrumb],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductBreadcrumb);
    component = fixture.componentInstance;
    
    component.business = {
      name: 'Tu Punto vShop',
      image: { url: 'assets/images/vShop.jpg', name: '', directory: '', extension: '', idCreationUser: 0 },
    } as any;
    fixture.detectChanges();
  });
  
  

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
