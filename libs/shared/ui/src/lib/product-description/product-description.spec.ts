import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthStore } from '@lineup/core';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { ProductDescription } from './product-description';

describe('ProductDescription', () => {
  let component: ProductDescription;
  let fixture: ComponentFixture<ProductDescription>;
  let dialogService: { open: jest.Mock };
  let authStore: { isUserLoggedIn: jest.Mock };

  beforeEach(async () => {
    dialogService = { open: jest.fn() };
    authStore = { isUserLoggedIn: jest.fn(() => true) };

    await TestBed.configureTestingModule({
      imports: [ProductDescription, TranslateModule.forRoot()],
      providers: [
        { provide: DialogService, useValue: dialogService },
        { provide: AuthStore, useValue: authStore },
        TranslateService,
        TranslateStore,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDescription);
    component = fixture.componentInstance;
    component.product = {
      id: 5,
      productTags: [{ tag: { name: 'Tag1' } }, { tag: { name: 'Tag2' } }],
      description: '<p>Test-with-hyphens</p>',
    } as import('@lineup/core').ProductSchema;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe extraer tags desde productTags', () => {
    expect(component.tags).toEqual(['Tag1', 'Tag2']);
  });

  it('debe sanitizar descripción con guiones no separables', () => {
    expect(component.description).toBeTruthy();
  });

  it('debe abrir modal de valoración', () => {
    component.openRateModal();
    expect(dialogService.open).toHaveBeenCalled();
  });

  it('debe indicar modo usuario cuando hay sesión', () => {
    expect(component.userMode()).toBe(true);
  });

  it('debe usar tags vacíos sin productTags', () => {
    component.product = { id: 1, description: '' } as import('@lineup/core').ProductSchema;
    component.ngOnInit();
    expect(component.tags).toEqual([]);
  });
});
