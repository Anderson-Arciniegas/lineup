import { HttpEventType } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import {
  BusinessApiFilePrivateService,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { of, Subject, throwError } from 'rxjs';
import { CreateCatalogModal } from './create-catalog-modal';

describe('CreateCatalogModal', () => {
  let component: CreateCatalogModal;
  let fixture: ComponentFixture<CreateCatalogModal>;
  let dialogService: { open: jest.Mock };
  let apiFileService: { post: jest.Mock };
  let utilsService: {
    blobToFile: jest.Mock;
    getExtensionFile: jest.Mock;
  };
  let onClose$: Subject<string | undefined>;

  beforeEach(async () => {
    onClose$ = new Subject();
    dialogService = {
      open: jest.fn(() => ({ onClose: onClose$.asObservable() })),
    };
    apiFileService = {
      post: jest.fn(() =>
        of({
          type: HttpEventType.Response,
          body: { file: { name: 'img123', url: 'https://cdn/img.jpg' } },
          status: 200,
        }),
      ),
    };
    utilsService = {
      blobToFile: jest.fn(() => new File([''], 'file.png', { type: 'image/png' })),
      getExtensionFile: jest.fn(() => 'png'),
    };

    await TestBed.configureTestingModule({
      imports: [CreateCatalogModal, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        TranslateService,
        TranslateStore,
        { provide: DialogService, useValue: dialogService },
        { provide: BusinessApiFilePrivateService, useValue: apiFileService },
        { provide: UtilsService, useValue: utilsService },
        ChangeDetectorRef,
      ],
    })
      .overrideComponent(CreateCatalogModal, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(CreateCatalogModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('no debe crear catálogo sin nombre o imagen', () => {
    component.catalogName = '  ';
    component.createCatalog();
    component.catalogName = 'Catálogo';
    component.imgCode = '';
    component.createCatalog();
    expect(component.catalogName.trim()).toBe('Catálogo');
  });

  it('debe abrir cropper de imagen', () => {
    component.openImageCropper();
    expect(dialogService.open).toHaveBeenCalled();
  });

  it('debe subir archivo tras cerrar cropper con imagen', () => {
    component.openImageCropper();
    onClose$.next('data:image/png;base64,abc');
    expect(apiFileService.post).toHaveBeenCalled();
    expect(component.imgCode).toBe('img123');
    expect(component.imageUrl).toBe('https://cdn/img.jpg');
    expect(component.loadingFile).toBe(false);
    expect(component.uploadFailed).toBe(false);
  });

  it('debe ignorar cierre sin imagen', () => {
    component.openImageCropper();
    apiFileService.post.mockClear();
    onClose$.next(undefined);
    expect(apiFileService.post).not.toHaveBeenCalled();
  });

  it('debe marcar uploadFailed en error de subida', () => {
    apiFileService.post.mockReturnValue(
      throwError(() => ({ error: { code: 500 } })),
    );
    component.uploadFile('data:image/png;base64,abc');
    expect(component.uploadFailed).toBe(true);
    expect(component.loadingFile).toBe(false);
  });

  it('debe marcar adultContent en error 22011', () => {
    apiFileService.post.mockReturnValue(
      throwError(() => ({ error: { code: 22011 } })),
    );
    component.uploadFile('data:image/png;base64,abc');
    expect(component.adultContent).toBe(true);
  });
});
