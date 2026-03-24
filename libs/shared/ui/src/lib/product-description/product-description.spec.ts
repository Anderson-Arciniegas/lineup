import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ProductDescription } from './product-description';

describe('ProductDescription', () => {
  let component: ProductDescription;
  let fixture: ComponentFixture<ProductDescription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDescription, TranslateModule.forRoot()],
      providers: [
        DialogService,
        TranslateService,
        TranslateStore,
      ],
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
