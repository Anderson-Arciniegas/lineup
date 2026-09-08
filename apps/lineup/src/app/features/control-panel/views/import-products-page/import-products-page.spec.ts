import { HttpResponse } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BusinessApiFilePrivateService,
  ProductPrivateService,
  ProductSchema,
  StatusEnum,
  UtilsService,
} from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ImportProductsPage } from './import-products-page';

describe('ImportProductsPage', () => {
  let component: ImportProductsPage;
  let fixture: ComponentFixture<ImportProductsPage>;
  let getAllDraftProducts: jest.Mock;
  let uploadImportDocument: jest.Mock;
  let messageAdd: jest.Mock;
  let navigate: jest.Mock;

  const draftProduct = {
    description: 'Imported product description',
    hasVariations: false,
    id: 10,
    idCatalog: null,
    idCreationBusiness: 1,
    isPrimary: false,
    likes: 0,
    ratingAverage: 0,
    status: StatusEnum.PENDING,
    title: 'Imported product',
    visits: 0,
  } as ProductSchema;

  beforeEach(async () => {
    getAllDraftProducts = jest.fn(() =>
      of({
        items: [draftProduct],
        limit: 50,
        page: 1,
        total: 1,
      }),
    );
    uploadImportDocument = jest.fn(() =>
      of(
        new HttpResponse({
          body: { code: 710100, status: true },
          status: 201,
        }),
      ),
    );
    messageAdd = jest.fn();
    navigate = jest.fn();

    await TestBed.configureTestingModule({
      imports: [ImportProductsPage, TranslateModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        {
          provide: BusinessApiFilePrivateService,
          useValue: { uploadImportDocument },
        },
        {
          provide: ProductPrivateService,
          useValue: { getAllDraftProducts },
        },
        { provide: UtilsService, useValue: { navigate } },
        { provide: MessageService, useValue: { add: messageAdd } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('carga los productos pendientes al iniciar', () => {
    expect(getAllDraftProducts).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
    });
    expect(component.draftProducts()).toEqual([draftProduct]);
  });

  it('rechaza extensiones no permitidas', () => {
    const file = new File(['data'], 'products.exe');

    component.onFileSelected({
      target: { files: [file] },
    } as unknown as Event);

    expect(component.fileValidationKey()).toBe(
      'importProductsPage.invalidExtension',
    );
    expect(uploadImportDocument).not.toHaveBeenCalled();
  });

  it('rechaza archivos mayores de 100 MB', () => {
    const file = new File(['data'], 'products.csv');
    Object.defineProperty(file, 'size', { value: 100 * 1024 * 1024 + 1 });

    component.onFileSelected({
      target: { files: [file] },
    } as unknown as Event);

    expect(component.fileValidationKey()).toBe(
      'importProductsPage.fileTooLarge',
    );
  });

  it('sube un documento válido y notifica que fue encolado', () => {
    const file = new File(['title,description'], 'products.csv', {
      type: 'text/csv',
    });
    component.selectedFile.set(file);

    component.uploadDocument();

    expect(uploadImportDocument).toHaveBeenCalledWith(file);
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' }),
    );
    expect(component.selectedFile()).toBeNull();
  });

  it('mantiene el archivo seleccionado cuando falla la carga', () => {
    const file = new File(['data'], 'products.json', {
      type: 'application/json',
    });
    uploadImportDocument.mockReturnValueOnce(
      throwError(() => new Error('upload failed')),
    );
    component.selectedFile.set(file);

    component.uploadDocument();

    expect(component.selectedFile()).toBe(file);
    expect(component.isUploading()).toBe(false);
    expect(messageAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  it('navega al editor al agregar un producto pendiente a un catálogo', () => {
    component.editProduct(draftProduct);

    expect(navigate).toHaveBeenCalledWith([
      'dashboard',
      'import-products',
      draftProduct.id,
      'edit',
    ]);
  });
});
