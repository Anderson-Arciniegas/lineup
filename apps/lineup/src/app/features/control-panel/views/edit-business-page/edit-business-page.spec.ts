import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import {
  BusinessApiFilePrivateService,
  BusinessPrivateService,
  UtilsService,
} from '@lineup/core';
import {
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { EditBusinessPage } from './edit-business-page';

describe('EditBusinessPage', () => {
  let component: EditBusinessPage;
  let fixture: ComponentFixture<EditBusinessPage>;

  beforeEach(async () => {
    const businessServiceMock: Pick<BusinessPrivateService, 'myBusiness'> = {
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

    const businessApiFileServiceMock: Partial<BusinessApiFilePrivateService> = {
      post: () => of({ type: 0 } as any),
    };

    await TestBed.configureTestingModule({
      imports: [EditBusinessPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore,
        provideNoopAnimations(),
        {
          provide: Apollo,
          useValue: { use: () => ({ query: () => of({ data: {} }), mutate: () => of({ data: {} }) }) },
        },
        MessageService,
        DialogService,
        { provide: BusinessPrivateService, useValue: businessServiceMock },
        { provide: UtilsService, useValue: utilsServiceMock },
        {
          provide: BusinessApiFilePrivateService,
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
