import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { BusinessApiFileService, UtilsService } from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { BusinessService } from 'libs/shared/core/src/lib/services/business.service';
import { of } from 'rxjs';
import { EditBusinessPage } from './edit-business-page';

describe('EditBusinessPage', () => {
  let component: EditBusinessPage;
  let fixture: ComponentFixture<EditBusinessPage>;

  beforeEach(async () => {
    const businessServiceMock: Pick<BusinessService, 'myBusiness'> = {
      myBusiness: () =>
        of({
          name: 'Test Business',
          email: 'test@business.com',
          path: 'test-business',
          telephone: '+58 (499) 999-9999',
        } as any),
    };

    const utilsServiceMock: Partial<UtilsService> = {
      blobToFile: (blob: Blob, fileName: string) =>
        new File([blob], fileName, {
          type: (blob as any)?.type ?? 'image/png',
        }),
      getExtensionFile: () => 'png',
      compressImage: (base64: string) => of(base64),
    };

    const businessApiFileServiceMock: Partial<BusinessApiFileService> = {
      post: () => of({ type: 0 } as any),
    };

    await TestBed.configureTestingModule({
      imports: [EditBusinessPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        provideNoopAnimations(),
        { provide: BusinessService, useValue: businessServiceMock },
        { provide: UtilsService, useValue: utilsServiceMock },
        {
          provide: BusinessApiFileService,
          useValue: businessApiFileServiceMock,
        },
      ],
    })
      .overrideComponent(EditBusinessPage, {
        set: { template: '' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditBusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
